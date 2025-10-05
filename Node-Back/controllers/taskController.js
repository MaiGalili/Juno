// taskController.js
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const taskRepo = require("../repositories/taskRepo");

// Normilize to HH:MM:SS
function toHHMMSS(s) {
  if (s == null || s === "") return null;
  const parts = String(s).split(":");
  if (parts.length === 2) parts.push("00"); // HH:MM -> HH:MM:00
  if (parts.length !== 3) return null;
  let [h, m, sec] = parts;
  if (!/^\d+$/.test(h) || !/^\d+$/.test(m) || !/^\d+$/.test(sec)) return null;
  h = h.padStart(2, "0");
  m = m.padStart(2, "0");
  sec = sec.padStart(2, "0"); // HH:MM:SS
  return `${h}:${m}:${sec}`;
}

// Normalize to YYYY-MM-DD
function toYMD(val) {
  if (!val) return null;
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = toUTCDate(val);
  return d ? d.toISOString().slice(0, 10) : null;
}

// Parse a Date-like into a UTC date-only Date (midnight UTC), avoiding TZ drift
function toUTCDate(dateLike) {
  if (!dateLike) return null;
  if (dateLike instanceof Date) {
    // keep only the date part in UTC
    return new Date(
      Date.UTC(
        dateLike.getUTCFullYear(),
        dateLike.getUTCMonth(),
        dateLike.getUTCDate()
      )
    );
  }
  if (typeof dateLike === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)) {
    const [y, m, d] = dateLike.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

// Generate the next N dates from a base date according to repeatType
function getNextNDates(baseDate, count, repeatType) {
  const out = [];
  let d = toUTCDate(baseDate);
  for (let i = 0; i < count; i++) {
    out.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
    switch (repeatType) {
      case "daily":
        d.setUTCDate(d.getUTCDate() + 1);
        break;
      case "weekly":
        d.setUTCDate(d.getUTCDate() + 7);
        break;
      case "monthly":
        d.setUTCMonth(d.getUTCMonth() + 1);
        break;
      case "yearly":
        d.setUTCFullYear(d.getUTCFullYear() + 1);
        break;
      default:
        return out; // 'none'- stop after first push
    }
  }
  return out;
}

//Generate dates from startDate until repeatUntil (inclusive) according to repeatType
function getRepeatDates(startDate, repeatUntil, repeatType) {
  const dates = [];
  let curr = toUTCDate(startDate);
  const until = toUTCDate(repeatUntil);
  while (curr && until && curr <= until) {
    dates.push(curr.toISOString().slice(0, 10)); // YYYY-MM-DD
    switch (repeatType) {
      case "daily":
        curr.setUTCDate(curr.getUTCDate() + 1);
        break;
      case "weekly":
        curr.setUTCDate(curr.getUTCDate() + 7);
        break;
      case "monthly":
        curr.setUTCMonth(curr.getUTCMonth() + 1);
        break;
      case "yearly":
        curr.setUTCFullYear(curr.getUTCFullYear() + 1);
        break;
      default:
        curr = new Date(until.getTime() + 86400000);
        break;
    }
  }
  return dates;
}

//  Create one or more assigned tasks. Supports repetition via task_repeat + repeat_until.Insets into task and assigned tables (and task_category table).
async function createAssignedTask(req, res) {
  const {
    title,
    all_day,
    start_date,
    end_date,
    start_time,
    end_time,
    duration,
    note,
    location_id,
    buffer_time,
    category_ids,
    custom_location_address,
    custom_location_latitude,
    custom_location_longitude,
    task_repeat,
    repeat_until,
  } = req.body;

  const email = req.session.userEmail;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    let series_id = null;
    let repeatDates = [start_date];

    // Build the series if repetition requested
    if (task_repeat && task_repeat !== "none" && repeat_until) {
      series_id = uuidv4();
      repeatDates = getRepeatDates(start_date, repeat_until, task_repeat);
    }

    const final_location_id = location_id ?? null;

    const insertedTasks = [];

    // Insert each occurrence (task + assigned + categories)
    for (const date of repeatDates) {
      const [result] = await db
        .promise()
        .query(
          "INSERT INTO task (" +
            "task_title, task_duration, task_note, task_buffertime, location_id," +
            "custom_location_address, custom_location_latitude, custom_location_longitude, task_all_day," +
            "task_repeat, repeat_until, email, series_id" +
            ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            title || "Untitled Task",
            duration,
            note,
            toHHMMSS(buffer_time),
            final_location_id,
            custom_location_address || null,
            custom_location_latitude || null,
            custom_location_longitude || null,
            all_day ? 1 : 0,
            task_repeat || "none",
            toYMD(repeat_until) || null,
            email,
            series_id,
          ]
        );
      const task_id = result.insertId;
      insertedTasks.push(task_id);

      await db
        .promise()
        .query(
          "INSERT INTO assigned (task_id, task_start_date, task_end_date, task_start_time, task_end_time) VALUES (?, ?, ?, ?, ?)",
          [
            task_id,
            toYMD(date),
            toYMD(date),
            toHHMMSS(start_time),
            toHHMMSS(end_time),
          ]
        );

      if (Array.isArray(category_ids)) {
        for (const category_id of category_ids) {
          await db
            .promise()
            .query(
              "INSERT INTO task_category (task_id, category_id) VALUES (?, ?)",
              [task_id, category_id]
            );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Assigned task(s) created",
      series_id,
      task_ids: insertedTasks,
    });
  } catch (err) {
    console.error("Create Assigned Task Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

//Create a waiting task (task + waiting_list + optional categories)
async function createWaitingTask(req, res) {
  const {
    title,
    duration,
    note,
    location_id,
    due_date,
    due_time,
    buffer_time,
    category_ids,
    custom_location_address,
    custom_location_latitude,
    custom_location_longitude,
  } = req.body;

  const email = req.session.userEmail;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    // Fetch user's waiting list limit
    const [[userRow]] = await db
      .promise()
      .query(`SELECT waiting_list_max FROM users WHERE email = ?`, [email]);
    const waitingListMax = userRow?.waiting_list_max;

    console.log("waitingListMax from DB:", waitingListMax);

    // Count current waiting tasks
    const [[{ waiting_count }]] = await db.promise().query(
      `SELECT COUNT(*) as waiting_count
       FROM task
       JOIN waiting_list ON task.task_id = waiting_list.task_id
       WHERE task.email = ?`,
      [email]
    );

    // Enforce max
    if (waiting_count >= waitingListMax) {
      return res.status(400).json({
        success: false,
        message: "Waiting list is full. Cannot add new waiting task.",
        errorType: "WAITING_LIST_FULL",
      });
    }

    const final_location_id = location_id ?? null;

    //Insert input into to the task table
    const [result] = await db.promise().query(
      `INSERT INTO task (
        task_title,
        task_duration,
        task_note,
        task_buffertime,
        location_id,
        custom_location_address,
        custom_location_latitude,
        custom_location_longitude,
        email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || "Untitled Task",
        duration,
        note,
        toHHMMSS(buffer_time),
        final_location_id,
        custom_location_address || null,
        custom_location_latitude || null,
        custom_location_longitude || null,
        email,
      ]
    );

    const task_id = result.insertId;

    // Insert waiting_list row
    await db.promise().query(
      `INSERT INTO waiting_list (
    task_id,
    task_duedate,
    task_duetime
  ) VALUES (?, ?, ?)`,
      [task_id, toYMD(due_date), toHHMMSS(due_time)]
    );

    // Assign categories
    if (Array.isArray(category_ids)) {
      for (const category_id of category_ids) {
        await db
          .promise()
          .query(
            `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
            [task_id, category_id]
          );
      }
    }

    // If this addition hit the max
    if (waiting_count + 1 === waitingListMax) {
      return res.status(201).json({
        success: true,
        message: "Waiting task created. Waiting list is now full.",
        task_id,
        waitingListFull: true,
      });
    }

    res.status(201).json({
      success: true,
      message: "Waiting task created",
      task_id,
    });
  } catch (err) {
    console.error("Create Waiting Task Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Fetch assigned tasks for calendar view (joins categories & favorite location data). Groups multiple category rows into a single task with categories[]
async function getAssignedTasks(req, res) {
  const userEmail = req.session.userEmail;
  if (!userEmail) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const taskQuery = `SELECT 
       t.task_id, t.task_title, t.task_note, t.task_buffertime,
    t.task_duration, t.task_all_day, t.task_repeat, t.series_id, t.repeat_until,
    t.location_id, 
    t.custom_location_address, t.custom_location_latitude, t.custom_location_longitude,

    -- dates and times
    DATE_FORMAT(a.task_start_date, '%Y-%m-%d') AS task_start_date,
    DATE_FORMAT(a.task_end_date,   '%Y-%m-%d') AS task_end_date,
    TIME_FORMAT(a.task_start_time, '%H:%i')    AS task_start_time,
    TIME_FORMAT(a.task_end_time,   '%H:%i')    AS task_end_time,

    -- category 
      c.category_id, c.category_name, c.category_color,

    -- favorite location
    l.location_name   AS loc_name,
    l.location_address AS loc_address,
    l.latitude  AS loc_latitude,
    l.longitude AS loc_longitude
      FROM task t
  JOIN assigned a       ON t.task_id = a.task_id
  LEFT JOIN task_category tc ON tc.task_id = t.task_id
  LEFT JOIN category c       ON tc.category_id = c.category_id
  LEFT JOIN location l  ON t.location_id = l.location_id
  WHERE t.email = ?`;

    db.query(taskQuery, [userEmail], (error, results) => {
      if (error) {
        console.error("MySQL error:", error.message);
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: error.message,
        });
      }

      const taskMap = {};
      results.forEach((row) => {
        const taskKey = `${row.task_id}-${row.task_start_date}-${row.task_start_time}`;
        if (!taskMap[taskKey]) {
          taskMap[taskKey] = {
            task_id: row.task_id,
            task_title: row.task_title,
            task_note: row.task_note,
            task_buffertime: row.task_buffertime,
            task_all_day: row.task_all_day,
            location_id: row.location_id,
            custom_location_address: row.custom_location_address,
            custom_location_latitude: row.custom_location_latitude,
            custom_location_longitude: row.custom_location_longitude,
            task_duration: row.task_duration,
            task_start_date: row.task_start_date,
            task_end_date: row.task_end_date,
            task_start_time: row.task_start_time,
            task_end_time: row.task_end_time,
            series_id: row.series_id,
            task_repeat: row.task_repeat,
            repeat_until: row.repeat_until,
            categories: [],
            raw: {
              location_name: row.loc_name,
              location_address: row.loc_address,
              location_latitude: row.loc_latitude,
              location_longitude: row.loc_longitude,
              task_all_day: row.task_all_day,
            },
          };
        }

        if (row.category_id) {
          taskMap[taskKey].categories.push({
            category_id: row.category_id,
            category_name: row.category_name,
            color: row.category_color,
          });
        }
      });

      const tasks = Object.values(taskMap);
      return res.status(200).json({ success: true, data: tasks });
    });
  } catch (err) {
    console.error("getAssignedTasks Error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// Update assigned task(s) with scope support
async function updateAssignedTask(req, res) {
  const { task_id } = req.params;
  const scope = req.query.scope || "ONE";
  const {
    title,
    all_day,
    start_date,
    end_date,
    start_time,
    end_time,
    duration,
    note,
    location_id,
    buffer_time,
    category_ids,
    custom_location_address,
    custom_location_latitude,
    custom_location_longitude,
    task_repeat: reqTaskRepeat,
    repeat_until: reqRepeatUntil,
  } = req.body;

  try {
    // 1) Load the current state 
    const [rows] = await db.promise().query(
      `SELECT
  t.series_id, t.task_repeat, t.repeat_until, t.email,
  t.task_all_day, t.task_duration, t.task_note, t.task_buffertime,
  t.location_id, t.custom_location_address, t.custom_location_latitude, t.custom_location_longitude,
  DATE_FORMAT(a.task_start_date, '%Y-%m-%d') AS task_start_date,
  DATE_FORMAT(a.task_end_date,   '%Y-%m-%d') AS task_end_date,
  TIME_FORMAT(a.task_start_time, '%H:%i:%s')  AS task_start_time,
  TIME_FORMAT(a.task_end_time,   '%H:%i:%s')  AS task_end_time
FROM task t
JOIN assigned a ON t.task_id = a.task_id
WHERE t.task_id = ?
`,
      [task_id]
    );
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const row = rows[0];
    const {
      series_id,
      task_repeat,
      repeat_until,
      task_start_date,
      task_start_time,
      email,
    } = row;

// Load existing categories for fallback when category_ids not sent
    const [catRows] = await db
      .promise()
      .query(`SELECT category_id FROM task_category WHERE task_id = ?`, [task_id]);
    const existingCatIds = catRows.map(r => r.category_id);
    const catsToApply = Array.isArray(category_ids) ? category_ids : existingCatIds;


    // 2) Defaults: preserve existing if client didn't send new values
    const newStartDate = start_date ?? row.task_start_date;
    const newEndDate = end_date ?? row.task_end_date ?? newStartDate;
    const newStartTime = start_time ?? row.task_start_time;
    const newEndTime = end_time ?? row.task_end_time;

    const newStartDateStr = toYMD(newStartDate);
    const newEndDateStr = toYMD(newEndDate);
    const newStartTimeStr = toHHMMSS(newStartTime);
    const newEndTimeStr = toHHMMSS(newEndTime);

    const newAllDay =
      all_day === undefined || all_day === null
        ? row.task_all_day
        : all_day
        ? 1
        : 0;
    const newDuration = toHHMMSS(duration ?? row.task_duration);
    const newNote = note ?? row.task_note;
    const newBuffer = toHHMMSS(buffer_time ?? row.task_buffertime);
    const newLocId = location_id ?? row.location_id ?? null;
    const newCustAddr =
      custom_location_address ?? row.custom_location_address ?? null;
    const newCustLat =
      custom_location_latitude ?? row.custom_location_latitude ?? null;
    const newCustLng =
      custom_location_longitude ?? row.custom_location_longitude ?? null;

    // Basic validation for repeat_until vs start_date
    if (
      reqRepeatUntil &&
      toUTCDate(reqRepeatUntil) < toUTCDate(newStartDateStr)
    ) {
      return res.status(400).json({
        success: false,
        message: "repeat_until must be on/after start_date",
      });
    }

    // 3) SQL templates
    const updateTaskSqlCore = `UPDATE task SET
      task_title = ?,
      task_all_day = ?,
      task_duration = ?,
      task_note = ?,
      task_buffertime = ?,
      location_id = ?,
      custom_location_address = ?,
      custom_location_latitude = ?,
      custom_location_longitude = ?`;

    const updateTaskSqlWithRepeat =
      updateTaskSqlCore +
      `,
      task_repeat = ?,
      repeat_until = ?`;

      const updateTaskSqlWithRepeatAndSeries =
        updateTaskSqlCore +
        `,
      task_repeat = ?,
      repeat_until = ?,
      series_id = ?`;

    const updateAssignedSql = `UPDATE assigned SET
      task_start_date = ?,
      task_end_date = ?,
      task_start_time = ?,
      task_end_time = ?`;

    // Helper: reset and reassign categories for given task IDs
    async function updateCategories(taskIds, conn = null) {
      const client = conn || db.promise();
      for (const tid of taskIds) {
        await client.query(`DELETE FROM task_category WHERE task_id = ?`, [
          tid,
        ]);
        if (Array.isArray(category_ids)) {
          for (const cid of category_ids) {
            await client.query(
              `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
              [tid, cid]
            );
          }
        }
      }
    }

    // Helper: build date list by count or until
    function buildDatesArray(baseDate, count, repeatType, explicitUntil) {
      const rt = repeatType || "none";
      if (explicitUntil) return getRepeatDates(baseDate, explicitUntil, rt);
      return getNextNDates(baseDate, count, rt);
    }

    // ---------- 3.5) CONVERT single -> series ----------
    const wantsConvertToSeries =
      (!series_id || task_repeat === "none") &&
      reqTaskRepeat &&
      reqTaskRepeat !== "none" &&
      reqRepeatUntil;

    if (wantsConvertToSeries) {
      const newSeriesId = uuidv4();
      const dates = getRepeatDates(newStartDateStr, toYMD(reqRepeatUntil), reqTaskRepeat);

      try {
        await db.promise().query("START TRANSACTION");

        // Update current task to become first in the new series
        await db.promise().query(updateTaskSqlWithRepeatAndSeries + ` WHERE task_id = ?`, [
          title || "Untitled Task",
          newAllDay,
          newDuration,
          newNote,
          newBuffer,
          newLocId,
          newCustAddr,
          newCustLat,
          newCustLng,
          reqTaskRepeat,
          toYMD(reqRepeatUntil),
          newSeriesId,
          task_id,
        ]);

        await db.promise().query(updateAssignedSql + ` WHERE task_id = ?`, [
          newStartDateStr,
          newEndDateStr,
          newStartTimeStr,
          newEndTimeStr,
          task_id,
        ]);

        // Reset & reassign categories on current task
        await db.promise().query(`DELETE FROM task_category WHERE task_id = ?`, [task_id]);
        for (const cid of catsToApply) {
          await db.promise().query(
            `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
            [task_id, cid]
          );
        }

        // Insert the remaining occurrences
        for (let i = 1; i < dates.length; i++) {
          const d = dates[i];
          const [ins] = await db.promise().query(
            `INSERT INTO task (
              task_title, task_duration, task_note, task_buffertime, location_id,
              custom_location_address, custom_location_latitude, custom_location_longitude,
              task_all_day, task_repeat, repeat_until, email, series_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              title || "Untitled Task",
              newDuration,
              newNote,
              newBuffer,
              newLocId,
              newCustAddr,
              newCustLat,
              newCustLng,
              newAllDay ? 1 : 0,
              reqTaskRepeat,
              toYMD(reqRepeatUntil),
              email,
              newSeriesId,
            ]
          );
          const newTid = ins.insertId;
          await db.promise().query(
            `INSERT INTO assigned (task_id, task_start_date, task_end_date, task_start_time, task_end_time)
             VALUES (?, ?, ?, ?, ?)`,
            [newTid, d, d, newStartTimeStr, newEndTimeStr]
          );
          // copy categories
          for (const cid of catsToApply) {
            await db.promise().query(
              `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
              [newTid, cid]
            );
          }
        }

        await db.promise().query("COMMIT");
        return res.json({
          success: true,
          message: "Task converted to series and updated",
          series_id: newSeriesId,
          occurrences: dates.length,
        });
      } catch (e) {
        try { await db.promise().query("ROLLBACK"); } catch (_) {}
        console.error("Convert single -> series error:", e?.sqlMessage || e.message);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
    // ---------- end conversion block ----------


    // 4) Scope: ONE - update only this occurrence
    if (!series_id || task_repeat === "none" || scope === "ONE") {
      await db
        .promise()
        .query(updateTaskSqlCore + ` WHERE task_id = ?`, [
          title || "Untitled Task",
          newAllDay,
          newDuration,
          newNote,
          newBuffer,
          newLocId,
          newCustAddr,
          newCustLat,
          newCustLng,
          task_id,
        ]);

      await db
        .promise()
        .query(updateAssignedSql + ` WHERE task_id = ?`, [
          newStartDateStr,
          newEndDateStr,
          newStartTimeStr,
          newEndTimeStr,
          task_id,
        ]);

      // categories
      await db.promise().query(`DELETE FROM task_category WHERE task_id = ?`, [task_id]);
      for (const cid of catsToApply) {
        await db.promise().query(
          `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
          [task_id, cid]
       );
    }
      return res.json({ success: true, message: "Assigned task updated" });
    }

    // 5) Scope: FUTURE- update this and all future occurrences in the same series
    if (scope === "FUTURE") {
      try {
        await db.promise().query("START TRANSACTION");

        // Find future occurrences (>= this start date+time)
        const [futureRows] = await db.promise().query(
          `SELECT t.task_id, a.task_start_date, a.task_start_time
         FROM task t
         JOIN assigned a ON t.task_id = a.task_id
        WHERE t.series_id = ? AND t.email = ?
          AND (a.task_start_date > ?
               OR (a.task_start_date = ? AND a.task_start_time >= ?))
        ORDER BY a.task_start_date, a.task_start_time`,
          [series_id, email, task_start_date, task_start_date, task_start_time]
        );

        const tids = futureRows.map((r) => r.task_id);
        const newRepeatType = (reqTaskRepeat ?? task_repeat) || "none";
        const dates = buildDatesArray(
          newStartDate,
          tids.length,
          newRepeatType,
          reqRepeatUntil
        );
        const newRepeatUntil = dates.length
          ? dates[dates.length - 1]
          : reqRepeatUntil || newStartDate;

        // Update all future tasks with new dates/times/attrs
        const limit = Math.min(tids.length, dates.length);
        for (let i = 0; i < limit; i++) {
          const tid = tids[i];
          const d = dates[i];

          await db
            .promise()
            .query(updateTaskSqlWithRepeat + ` WHERE task_id = ?`, [
              title || "Untitled Task",
              newAllDay,
              newDuration,
              newNote,
              newBuffer,
              newLocId,
              newCustAddr,
              newCustLat,
              newCustLng,
              newRepeatType,
              newRepeatUntil,
              tid,
            ]);

          await db
            .promise()
            .query(updateAssignedSql + ` WHERE task_id = ?`, [
              d,
              d,
              newStartTimeStr,
              newEndTimeStr,
              tid,
            ]);
        }

        await updateCategories(tids.slice(0, limit));
        await db.promise().query("COMMIT");

        return res.json({
          success: true,
          message: "Future assigned tasks updated",
        });
      } catch (e) {
        try {
          await db.promise().query("ROLLBACK");
        } catch (_) {}
        console.error(
          "Update FUTURE series error:",
          e?.sqlMessage || e.message
        );
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
    }

    // 6) Scope: ALL - update the entire series (from the first occurrence)
    if (scope === "ALL") {
      try {
        await db.promise().query("START TRANSACTION");

        // Fetch all occurrences ordered chronologically
        const [allRows] = await db.promise().query(
          `SELECT t.task_id,
              DATE_FORMAT(a.task_start_date, '%Y-%m-%d') AS d_start,
              DATE_FORMAT(a.task_end_date,   '%Y-%m-%d') AS d_end
         FROM task t
         JOIN assigned a ON t.task_id = a.task_id
        WHERE t.series_id = ? AND t.email = ?
        ORDER BY a.task_start_date, a.task_start_time`,
          [series_id, email]
        );

        const tids = allRows.map((r) => r.task_id);
        const firstSeriesDate = allRows.length
          ? allRows[0].d_start
          : toYMD(newStartDate);

        // Decide whether to rebuild dates/repetition (when client changed relevant fields)
        const wantsDateRebuild =
          start_date != null ||
          end_date != null ||
          reqTaskRepeat != null ||
          reqRepeatUntil != null;

        let dates = null,
          newRepeatUntil = repeat_until;

        if (wantsDateRebuild) {
          const newRepeatType = (reqTaskRepeat ?? task_repeat) || "none";
          // Rebuild dates starting from the first occurrence of the series
          dates = buildDatesArray(
            toYMD(firstSeriesDate),
            tids.length,
            newRepeatType,
            reqRepeatUntil
          );
          newRepeatUntil = dates.length
            ? dates[dates.length - 1]
            : reqRepeatUntil || firstSeriesDate;
        }

        // Apply updates across all occurrences
        for (let i = 0; i < tids.length; i++) {
          const tid = tids[i];

          // Use original dates per occurrence unless rebuilding
          const rowDateStart = allRows[i].d_start;
          const rowDateEnd = allRows[i].d_end || allRows[i].d_start;

          const d = wantsDateRebuild ? dates[i] : rowDateStart;
          const dEnd = wantsDateRebuild ? dates[i] : rowDateEnd;

          // Update task (with/without repeat fields)
          if (wantsDateRebuild) {
            await db
              .promise()
              .query(updateTaskSqlWithRepeat + ` WHERE task_id = ?`, [
                title || "Untitled Task",
                newAllDay,
                newDuration,
                newNote,
                newBuffer,
                newLocId,
                newCustAddr,
                newCustLat,
                newCustLng,
                (reqTaskRepeat ?? task_repeat) || "none",
                newRepeatUntil,
                tid,
              ]);
          } else {
            await db
              .promise()
              .query(updateTaskSqlCore + ` WHERE task_id = ?`, [
                title || "Untitled Task",
                newAllDay,
                newDuration,
                newNote,
                newBuffer,
                newLocId,
                newCustAddr,
                newCustLat,
                newCustLng,
                tid,
              ]);
          }

          // Update assigned (if date unchanged, only time fields change)
          await db
            .promise()
            .query(updateAssignedSql + ` WHERE task_id = ?`, [
              d,
              dEnd,
              newStartTimeStr,
              newEndTimeStr,
              tid,
            ]);
        }

        await updateCategories(tids);
        await db.promise().query("COMMIT");

        return res.json({
          success: true,
          message: "All assigned tasks in series updated",
        });
      } catch (e) {
        try {
          await db.promise().query("ROLLBACK");
        } catch (_) {}
        console.error("Update ALL series error:", e?.sqlMessage || e.message);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
    }

    return res
      .status(400)
      .json({ success: false, message: "Invalid update scope" });
  } catch (err) {
    console.error(
      "Update Assigned Task Error:",
      err?.sqlMessage || err.message
    );
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

//Update a waiting task (task + waiting_list + categories)
async function updateWaitingTask(req, res) {
  const { task_id } = req.params;
  const {
    title,
    duration,
    note,
    location_id,
    due_date,
    due_time,
    buffer_time,
    category_ids,
    custom_location_address,
    custom_location_latitude,
    custom_location_longitude,
  } = req.body;

  //Update task
  try {
    await db.promise().query(
      `UPDATE task
       SET task_title = ?,
           task_duration = ?,
           task_note = ?,
           task_buffertime = ?,
           location_id = ?,
           custom_location_address = ?,
           custom_location_latitude = ?,
           custom_location_longitude = ?
       WHERE task_id = ?`,
      [
        title || "Untitled Task",
        toHHMMSS(duration),
        note,
        toHHMMSS(buffer_time),
        location_id || null,
        custom_location_address || null,
        custom_location_latitude || null,
        custom_location_longitude || null,
        task_id,
      ]
    );

    // Update waiting_list fields
    await db.promise().query(
      `UPDATE waiting_list
         SET task_duedate = ?,
             task_duetime = ?
       WHERE task_id = ?`,
      [toYMD(due_date), toHHMMSS(due_time), task_id]
    );

    //Reset and reassign categories
    await db
      .promise()
      .query(`DELETE FROM task_category WHERE task_id = ?`, [task_id]);

    if (Array.isArray(category_ids)) {
      for (const category_id of category_ids) {
        await db
          .promise()
          .query(
            `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
            [task_id, category_id]
          );
      }
    }

    res.json({ success: true, message: "Waiting task updated" });
  } catch (err) {
    console.error("Update Waiting Task Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Delete an assigned (or waiting) task respecting scope for series
async function deleteTask(req, res) {
  const { task_id } = req.params;
  const scope = req.query.scope || "ONE";
  const email = req.session.userEmail;

  if (!email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // Check assigned case first
    const [assignedRows] = await db.promise().query(
      `SELECT 
         t.series_id, 
         t.task_repeat, 
         DATE_FORMAT(a.task_start_date, '%Y-%m-%d') AS task_start_date,
         TIME_FORMAT(a.task_start_time, '%H:%i:%s')  AS task_start_time
       FROM task t
       JOIN assigned a ON t.task_id = a.task_id
       WHERE t.task_id = ? AND t.email = ?`,
      [task_id, email]
    );

    if (assignedRows.length) {
      const { series_id, task_repeat, task_start_date, task_start_time } =
        assignedRows[0];

      // ONE - delete only this occurrence
      if (!series_id || task_repeat === "none" || scope === "ONE") {
        const [result] = await db
          .promise()
          .query(`DELETE FROM task WHERE task_id = ? AND email = ?`, [
            task_id,
            email,
          ]);
        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Task not found or access denied",
          });
        }
        return res.json({
          success: true,
          message: "Task deleted successfully",
        });
      }

      // FUTURE - delete from this occurrence (inclusive) forward
      if (scope === "FUTURE") {
        const startDateYMD = toYMD(task_start_date);
        const startTimeHMS = toHHMMSS(task_start_time);

        const [delResult] = await db.promise().query(
          `DELETE t FROM task t
             JOIN assigned a ON t.task_id = a.task_id
           WHERE t.series_id = ? AND t.email = ?
             AND (
                   a.task_start_date > ?
                OR (a.task_start_date = ? AND a.task_start_time >= ?)
             )`,
          [series_id, email, startDateYMD, startDateYMD, startTimeHMS]
        );

        return res.json({
          success: true,
          message: "Future tasks deleted",
          affectedRows: delResult.affectedRows,
        });
      }

      // ALL - delete entire series
      if (scope === "ALL") {
        const [delResult] = await db
          .promise()
          .query(`DELETE FROM task WHERE series_id = ? AND email = ?`, [
            series_id,
            email,
          ]);
        return res.json({
          success: true,
          message: "All tasks in series deleted",
          affectedRows: delResult.affectedRows,
        });
      }

      return res
        .status(400)
        .json({ success: false, message: "Invalid delete scope" });
    }

    // Not assigned? Check waiting
    const [waitingRows] = await db.promise().query(
      `SELECT t.task_id
         FROM task t
         JOIN waiting_list w ON t.task_id = w.task_id
        WHERE t.task_id = ? AND t.email = ?`,
      [task_id, email]
    );

    if (waitingRows.length) {
      const [result] = await db
        .promise()
        .query(`DELETE FROM task WHERE task_id = ? AND email = ?`, [
          task_id,
          email,
        ]);
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Task not found or access denied" });
      }
      return res.json({
        success: true,
        message: "Waiting task deleted successfully",
      });
    }

    // Not found at all
    return res
      .status(404)
      .json({ success: false, message: "Task not found or access denied" });
  } catch (err) {
    console.error("Delete Task Error:", err?.sqlMessage || err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// Return all waiting tasks for the user
async function getWaitingTasks(req, res) {
  const email = req.session.userEmail;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        t.task_id, t.task_title, t.task_note, t.task_buffertime,
     t.task_duration, t.location_id, t.custom_location_address, 
     t.custom_location_latitude, t.custom_location_longitude,
     w.task_duedate, w.task_duetime,
     c.category_id, c.category_name, c.category_color,
     l.location_name      AS loc_name,
    l.location_address   AS loc_address,
    l.latitude                   AS loc_latitude,
    l.longitude                 AS loc_longitude
   FROM task t
   JOIN waiting_list w    ON t.task_id = w.task_id
   LEFT JOIN task_category tc ON tc.task_id = t.task_id
   LEFT JOIN category c       ON tc.category_id = c.category_id
   LEFT JOIN location l ON t.location_id = l.location_id
   WHERE t.email = ?
   ORDER BY w.task_duedate ASC, w.task_duetime ASC`,
      [email]
    );

    // Fold rows by task_id; aggregate categories per task
    const taskMap = {};
    rows.forEach((row) => {
      if (!taskMap[row.task_id]) {
        taskMap[row.task_id] = {
          task_id: row.task_id,
          task_title: row.task_title,
          task_note: row.task_note,
          task_buffertime: row.task_buffertime,
          task_duration: row.task_duration,
          location_id: row.location_id,
          custom_location_address: row.custom_location_address,
          custom_location_latitude: row.custom_location_latitude,
          custom_location_longitude: row.custom_location_longitude,
          task_duedate: row.task_duedate,
          task_duetime: row.task_duetime,
          categories: [],
          raw: {
            location_name: row.loc_name,
            location_address: row.loc_address,
            location_latitude: row.loc_latitude,
            location_longitude: row.loc_longitude,
          },
        };
      }
      // Aggregate category row if present
      if (row.category_id) {
        taskMap[row.task_id].categories.push({
          category_id: row.category_id,
          category_name: row.category_name,
          color: row.category_color,
        });
      }
    });

    const tasks = Object.values(taskMap);
    return res.json({ success: true, data: tasks });
  } catch (err) {
    console.error("getWaitingTasks Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Waiting task -> Assigned task
async function assignFromWaiting(req, res) {
  try {
    const userEmail = req.session?.userEmail;
    if (!userEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const waitingId = req.params.id;

    const {
      start_date,
      end_date,
      start_time,
      end_time,
      duration,
      buffer_time,
      title,
      note,
      category_ids,
      location_id,
      custom_location_address,
      custom_location_latitude,
      custom_location_longitude,
    } = req.body || {};

    console.log("assignFromWaiting.body:", req.body);

    // Required fields to promote to assigned
    if (!start_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message:
          "start_date, start_time and end_time are required to assign a waiting task",
      });
    }

    // 1) Load waiting task & verify ownership
    const wt = await taskRepo.getWaitingById(waitingId, userEmail);
    if (!wt) {
      return res
        .status(404)
        .json({ success: false, message: "Waiting task not found" });
    }

    // 2) Build assigned payload (inherit original values, allow overrides)
    const assignedPayload = {
      title: title ?? wt.task_title,
      note: note ?? wt.task_note ?? "",
      start_date: toYMD(start_date),
      end_date: toYMD(end_date || start_date),
      start_time: toHHMMSS(start_time),
      end_time: toHHMMSS(end_time),
      duration: toHHMMSS(duration || wt.task_duration),
      buffer_time: toHHMMSS(buffer_time || wt.task_buffertime || "00:10:00"),
      category_ids:
        category_ids ??
        wt.category_ids ??
        (wt.category_id ? [wt.category_id] : []),
      location_id: location_id ?? wt.location_id ?? null,
      custom_location_address:
        custom_location_address ?? wt.custom_location_address ?? null,
      custom_location_latitude:
        custom_location_latitude ?? wt.custom_location_latitude ?? null,
      custom_location_longitude:
        custom_location_longitude ?? wt.custom_location_longitude ?? null,
      user_email: userEmail,
    };

    // 3) Promote in a single transaction
    const created = await taskRepo.promoteWaitingToAssigned(
      waitingId,
      assignedPayload
    );

    return res.json({ success: true, data: created });
  } catch (err) {
    console.error(
      "assignFromWaiting error:",
      err?.sqlMessage || err?.message,
      err
    );
    return res
      .status(500)
      .json({ success: false, message: err?.sqlMessage || "Server error" });
  }
}

// Assigned task -> Waiting task
async function moveAssignedToWaiting(req, res) {
  try {
    const userEmail = req.session?.userEmail;
    if (!userEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const assignedId = req.params.id;

    // Only waiting-related + shared fields (no start/end)
    const {
      title,
      duration,
      note,
      category_ids,
      location_id,
      custom_location_address,
      custom_location_latitude,
      custom_location_longitude,
      buffer_time,
      due_date,
      due_time,
    } = req.body || {};

    // 1) Verify the task exists and belongs to this user
    const at = await taskRepo.getAssignedById(assignedId, userEmail);
    if (!at) {
      return res
        .status(404)
        .json({ success: false, message: "Assigned task not found" });
    }

    // 2) Build waiting payload (inherit + overrides)
    const waitingPayload = {
      title: title ?? at.task_title,
      note: note ?? at.task_note ?? "",
      duration: toHHMMSS(duration ?? at.task_duration),
      buffer_time: toHHMMSS(buffer_time ?? at.task_buffertime ?? "00:10:00"),
      due_date: toYMD(due_date) || null,
      due_time: toHHMMSS(due_time) || null,
      category_ids:
        category_ids ??
        at.category_ids ??
        (at.category_id ? [at.category_id] : []),
      location_id: location_id ?? at.location_id ?? null,
      custom_location_address:
        custom_location_address ?? at.custom_location_address ?? null,
      custom_location_latitude:
        custom_location_latitude ?? at.custom_location_latitude ?? null,
      custom_location_longitude:
        custom_location_longitude ?? at.custom_location_longitude ?? null,
      user_email: userEmail,
    };

    // Waiting tasks must have a due_date
    if (!waitingPayload.due_date) {
      return res.status(400).json({
        success: false,
        message: "due_date is required to convert an assigned task to waiting",
      });
    }

    // 3) Demote in a single transaction
    const created = await taskRepo.demoteAssignedToWaiting(
      assignedId,
      waitingPayload
    );

    return res.json({ success: true, data: created });
  } catch (err) {
    console.error(
      "moveAssignedToWaiting error:",
      err?.sqlMessage || err?.message,
      err
    );
    return res
      .status(500)
      .json({ success: false, message: err?.sqlMessage || "Server error" });
  }
}

module.exports = {
  createAssignedTask,
  createWaitingTask,
  getAssignedTasks,
  updateAssignedTask,
  updateWaitingTask,
  deleteTask,
  getWaitingTasks,
  assignFromWaiting,
  moveAssignedToWaiting,
};
