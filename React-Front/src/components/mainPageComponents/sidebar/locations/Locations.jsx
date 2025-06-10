import React, { useState, useEffect } from "react";
import SingleLocation from "./singleLocation/SingleLocation";
import styles from "./locations.module.css";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationIcon, setNewLocationIcon] = useState("📍");
  const [newLocationAddress, setNewLocationAddress] = useState("");

  useEffect(() => {
    fetch("http://localhost:8801/api/locations", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLocations(data);
        } else {
          setLocations([]);
          console.error("Unexpected response for locations:", data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch locations:", err);
        setLocations([]);
      });
  }, []);

  const handleAdd = async () => {
    const trimmedName = newLocationName.trim();
    const trimmedAddress = newLocationAddress.trim();
    if (!trimmedName || !trimmedAddress) return;

    try {
      const res = await fetch(
        "http://localhost:8801/api/locations/add-location",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            location_name: trimmedName,
            address: trimmedAddress,
            icon: newLocationIcon,
          }),
        }
      );

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

  const handleIconChange = async (locationId, newIcon) => {
    try {
      await fetch("http://localhost:8801/api/locations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          location_id: locationId,
          new_icon: newIcon,
        }),
      });

      setLocations(
        locations.map((loc) =>
          loc.location_id === locationId ? { ...loc, icon: newIcon } : loc
        )
      );
    } catch (err) {
      console.error("Error updating icon:", err);
    }
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
            onIconChange={handleIconChange}
          />
        ))}
      </ul>

      <div className={styles.addForm}>
        <label>
          Location name:
          <input
            type="text"
            placeholder="Home, Work, Gym..."
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
          />
        </label>

        <label>
          Address:
          <input
            type="text"
            placeholder="e.g., 12 Herzl St, Tel Aviv"
            value={newLocationAddress}
            onChange={(e) => setNewLocationAddress(e.target.value)}
          />
        </label>

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
