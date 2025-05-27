import React, { useState } from "react";
import SingleLocation from "./singleLocation/SingleLocation";
import styles from "./locations.module.css";

export default function Locations() {
  const [locations, setLocations] = useState([
    { icon: "🖥️", name: "OFFICE" },
    { icon: "🚗", name: "CAR" },
    { icon: "🏠", name: "HOME" },
  ]);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationIcon, setNewLocationIcon] = useState("📍");

  const handleAdd = () => {
    const trimmed = newLocationName.trim();
    if (!trimmed) return;
    if (
      locations.some((loc) => loc.name.toLowerCase() === trimmed.toLowerCase())
    )
      return;

    setLocations([...locations, { icon: newLocationIcon, name: trimmed }]);
    setNewLocationName("");
    setNewLocationIcon("📍");
  };

  const handleDelete = (locationName) => {
    setLocations(locations.filter((loc) => loc.name !== locationName));
  };

  const handleEdit = (locationName) => {
    const newName = prompt("Enter new name:", locationName);
    if (!newName) return;
    setLocations(
      locations.map((loc) =>
        loc.name === locationName ? { ...loc, name: newName } : loc
      )
    );
  };

  return (
    <div className={styles.wrapper}>
      <ul className={styles.locationList}>
        {locations.map((loc, index) => (
          <SingleLocation
            key={index}
            icon={loc.icon}
            name={loc.name}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </ul>

      <div className={styles.addForm}>
        <input
          type="text"
          placeholder="Add new location"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
        />
        <select
          value={newLocationIcon}
          onChange={(e) => setNewLocationIcon(e.target.value)}
        >
          <option value="📍">📍</option>
          <option value="🏠">🏠</option>
          <option value="🚗">🚗</option>
          <option value="🖥️">🖥️</option>
          <option value="🏢">🏢</option>
        </select>
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}
