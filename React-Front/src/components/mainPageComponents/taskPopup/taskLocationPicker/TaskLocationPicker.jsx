// TaskLocationPicker.jsx
import React, { useState, useEffect } from "react";
import AddressInput from "../../sidebar/locations/AddressInput";
import styles from "./taskLocationPicker.module.css";

export default function TaskLocationPicker({
  locations = [],
  initialLocationId = null,
  initialCustomAddress = "",
  onChange,
}) {
  // Mode: either picking from saved locations or entering a custom address
  const [mode, setMode] = useState(initialCustomAddress ? "custom" : "saved");

  // Selected saved location ID
  const [selectedLocationId, setSelectedLocationId] =
    useState(initialLocationId);

  // Custom address for one-time location
  const [customAddress, setCustomAddress] = useState(initialCustomAddress);

  // Notify parent when the selection changes
  useEffect(() => {
    if (mode === "saved") {
      // Find the selected saved location by ID
      const location = locations.find(
        (loc) => loc.location_id === Number(selectedLocationId)
      );
      if (location) {
        onChange({
          type: "saved",
          location_id: location.location_id,
          location_name: location.location_name,
          location_address: location.location_address,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    } else if (mode === "custom" && customAddress) {
      // Pass only the address for one-time location
      onChange({
        type: "custom",
        address: customAddress,
      });
    }
    // eslint-disable-next-line
  }, [mode, selectedLocationId, customAddress, locations]);

  return (
    <div className={styles.locationPicker}>
      {/* Radio buttons to select mode */}
      <div className={styles.modeSelector}>
        <label>
          <input
            type="radio"
            name="location_mode"
            value="saved"
            checked={mode === "saved"}
            onChange={() => setMode("saved")}
          />
          Select from saved locations
        </label>
        <label style={{ marginLeft: 16 }}>
          <input
            type="radio"
            name="location_mode"
            value="custom"
            checked={mode === "custom"}
            onChange={() => setMode("custom")}
          />
          Enter a new address (one-time)
        </label>
      </div>

      {/* Saved locations dropdown */}
      {mode === "saved" && (
        <div className={styles.savedLocations}>
          <select
            value={selectedLocationId || ""}
            onChange={(e) => {
              setSelectedLocationId(e.target.value);
              setCustomAddress("");
            }}
            className={styles.locationSelect}
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.icon ? loc.icon + " " : ""}
                {loc.location_name}
                {loc.location_address ? ` (${loc.location_address})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* One-time address input */}
      {mode === "custom" && (
        <div className={styles.customAddress}>
          <AddressInput
            value={customAddress}
            onChange={setCustomAddress}
            placeholder="Enter address"
          />
        </div>
      )}
    </div>
  );
}
