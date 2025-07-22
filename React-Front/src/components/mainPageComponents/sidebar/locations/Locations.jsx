// Locations.jsx
import React, { useState, useEffect } from "react";
import SingleLocation from "./singleLocation/SingleLocation";
import AddressInput from "./AddressInput";
import EditLocationModal from "./EditLocationModal";
import styles from "./locations.module.css";

export default function Locations({ userLocations = [], fetchLocations }) {
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationIcon, setNewLocationIcon] = useState("📍");
  const [newLocationAddress, setNewLocationAddress] = useState("");
  const [editingLocation, setEditingLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);


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
            location_address: trimmedAddress,
            icon: newLocationIcon,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        await fetchLocations();
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
      const res = await fetch(
        `http://localhost:8801/api/locations/${locationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to delete location");
        return;
      }

      await fetchLocations();

    } catch (err) {
      console.error("Error deleting location:", err);
      alert("Error communicating with server.");
    }
  };

  const handleEdit = (locationId) => {
    const current = userLocations.find((loc) => loc.location_id === locationId);
    if (current) {
      setEditingLocation(current);
      setShowModal(true);
    }
  };

  const handleLocationUpdate = () => {
    setShowModal(false);
    setEditingLocation(null);
    fetchLocations();
  };

  const handleIconChange = async (locationId, newIcon) => {
    try {
      const res = await fetch(
        "http://localhost:8801/api/locations/update-location",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            location_id: locationId,
            new_icon: newIcon,
          }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update icon");
        return;
      }

      await fetchLocations();

    } catch (err) {
      console.error("Error updating icon:", err);
      alert("Error communicating with server.");
    }
  };

  const handleColorChange = async (locationId, newColor) => {
    try {
      const res = await fetch(
        "http://localhost:8801/api/locations/update-location",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            location_id: locationId,
            new_color: newColor,
          }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update color");
        return;
      }

      await fetchLocations();
      
    } catch (err) {
      console.error("Error updating color:", err);
      alert("Error communicating with server.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <ul className={styles.locationList}>
        {userLocations.map((loc) => (
          <SingleLocation
            key={loc.location_id}
            id={loc.location_id}
            name={loc.location_name}
            icon={loc.icon}
            color={loc.color}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onIconChange={handleIconChange}
            onColorChange={handleColorChange}
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
          <AddressInput
            value={newLocationAddress}
            onChange={setNewLocationAddress}
            placeholder="e.g. 100 HaTishbi St, Haifa, Israel"
          />
        </label>

        <label>
          Icon:
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
        </label>

        <button onClick={handleAdd}>Add</button>
      </div>

      {showModal && editingLocation && (
        <EditLocationModal
          location={editingLocation}
          onClose={() => {
            setShowModal(false);
            setEditingLocation(null);
          }}
          onSave={handleLocationUpdate}
        />
      )}
    </div>
  );
}
