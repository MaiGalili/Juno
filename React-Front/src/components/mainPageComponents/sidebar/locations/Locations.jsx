import React, { useState, useEffect } from "react";
import SingleLocation from "./singleLocation/SingleLocation";
import styles from "./locations.module.css";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationIcon, setNewLocationIcon] = useState("📍");
  const [newLocationAddress, setNewLocationAddress] = useState("");

  useEffect(() => {
    // 🚀 Load locations from server
    fetch("http://localhost:8801/api/locations", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error("Error loading locations:", err));
  }, []);

  const handleAdd = async () => {
    const trimmedName = newLocationName.trim();
    const trimmedAddress = newLocationAddress.trim();
    if (!trimmedName || !trimmedAddress) return;

    try {
      const res = await fetch("http://localhost:8801/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          location_name: trimmedName,
          address: trimmedAddress,
          icon: newLocationIcon,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLocations([...locations, { ...data.location }]);
        setNewLocationName("");
        setNewLocationAddress("");
        setNewLocationIcon("📍");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Failed to add location:", err);
    }
  };

  const handleDelete = async (locationId) => {
    try {
      await fetch(`http://localhost:8801/api/locations/${locationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      setLocations(locations.filter((loc) => loc.location_id !== locationId));
    } catch (err) {
      console.error("Error deleting location:", err);
    }
  };

  const handleEdit = async (locationId) => {
    const current = locations.find((loc) => loc.location_id === locationId);
    const newName = prompt("Enter new name:", current.location_name);
    if (!newName) return;

    // שליחת בקשה לעדכון (אם תבחרי לממש)
  };

  return (
    <div className={styles.wrapper}>
      <ul className={styles.locationList}>
        {locations.map((loc) => (
          <SingleLocation
            key={loc.location_id}
            id={loc.location_id}
            name={loc.location_name}
            icon={loc.icon}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </ul>

      <div className={styles.addForm}>
        <input
          type="text"
          placeholder="Location name"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Address"
          value={newLocationAddress}
          onChange={(e) => setNewLocationAddress(e.target.value)}
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
