import React from "react";
import styles from "./about.module.css";
import junoImage from "../../assets/juno-image.png"; // שימי לב למיקום בפועל של התמונה

export default function About() {
  return (
    <section className={styles.container}>
      <div className={styles.textContent}>
        <h1>About Juno</h1>

        <p>
          <strong>Juno</strong> is a smart calendar that plans your tasks by
          time, location, and flow—helping you stay organized and make your day
          run smoother.
        </p>
        <p>
          It’s more than just a scheduling tool; Juno acts like a personal
          assistant that understands your context and helps you build a day that
          feels natural, productive, and balanced.
        </p>
        <p>
          By combining intelligent planning with a clean and intuitive
          interface, Juno empowers you to take control of your time and focus on
          what truly matters. Whether you're managing work, errands, or personal
          goals, Juno supports you every step of the way.
        </p>

        <h2>With Juno, you can:</h2>

        <div className={styles.feature}>
          <h3>🕓 Schedule smarter</h3>
          <p>
            Automatically fit tasks into your day based on how long they take,
            where they are, and how long it takes to get there.
            <br />
            Juno takes into account your buffer preferences and personal pace.
            <br />
            It prevents overload by respecting your existing commitments.
            <br />
            You can trust it to suggest realistic, stress-free timelines.
          </p>
        </div>

        <div className={styles.feature}>
          <h3>🔗 Connect the dots</h3>
          <p>
            Juno identifies opportunities to group similar or nearby tasks,
            saving you time and energy.
            <br />
            It helps you build efficient routes and reduce unnecessary
            back-and-forth.
            <br />
            You’ll discover natural task clusters that make your day feel more
            cohesive.
            <br />
            The system adapts to your patterns and improves suggestions over
            time.
          </p>
        </div>

        <div className={styles.feature}>
          <h3>📊 Gain insights</h3>
          <p>
            Track how you spend your time, discover patterns, and fine-tune your
            routine.
            <br />
            Juno visualizes your data so you can spot inefficiencies and wins.
            <br />
            Compare productivity across categories, days, or time slots.
            <br />
            Use this knowledge to make smarter decisions and build better
            habits.
          </p>
        </div>
      </div>

      <div className={styles.imageWrapper}>
        <img
          src={junoImage}
          alt="Illustration of Juno"
          className={styles.image}
        />
      </div>
    </section>
  );
}
