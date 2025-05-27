import React, { useState } from "react";
import SingleLable from "./singleLable/SingleLable";
import styles from "./lables.module.css";

export default function Lables() {
  const [labels, setLabels] = useState([
    { name: "CLEANING", color: "#e0e0e0" },
    { name: "WORK", color: "#d5d5ff" },
    { name: "SHOPPING", color: "#ffe0e0" },
    { name: "COOKING", color: "#e0ffe0" },
    { name: "FRIENDS", color: "#fff0cc" },
  ]);

  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#dddddd");

  const handleAdd = () => {
    const trimmed = newLabelName.trim();
    if (!trimmed) return;
    if (labels.some((l) => l.name.toLowerCase() === trimmed.toLowerCase()))
      return;

    setLabels([...labels, { name: trimmed, color: newLabelColor }]);
    setNewLabelName("");
    setNewLabelColor("#dddddd");
  };

  const handleDelete = (labelName) => {
    setLabels(labels.filter((l) => l.name !== labelName));
  };

  const handleEdit = (labelName) => {
    const newName = prompt("Enter new name:", labelName);
    if (!newName) return;
    setLabels(
      labels.map((l) => (l.name === labelName ? { ...l, name: newName } : l))
    );
  };

  const handleColorChange = (labelName, newColor) => {
    setLabels(
      labels.map((l) => (l.name === labelName ? { ...l, color: newColor } : l))
    );
  };

  return (
    <div className={styles.wrapper}>
      <ul className={styles.labelList}>
        {labels.map((label, index) => (
          <SingleLable
            key={index}
            name={label.name}
            color={label.color}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onColorChange={handleColorChange}
          />
        ))}
      </ul>

      <div className={styles.addForm}>
        <input
          type="text"
          placeholder="Add new label"
          value={newLabelName}
          onChange={(e) => setNewLabelName(e.target.value)}
        />
        <input
          type="color"
          value={newLabelColor}
          onChange={(e) => setNewLabelColor(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}
