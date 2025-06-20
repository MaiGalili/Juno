// EditLocationModal.jsx
import React, { useState, useEffect } from "react";
import AddressInput from "./AddressInput";
import { Dialog } from "@headlessui/react";

export default function EditLocationModal({
  isOpen,
  onClose,
  location,
  onSave,
}) {
  const [name, setName] = useState(location.location_name);
  const [address, setAddress] = useState(location.location_address);
  const [icon, setIcon] = useState(location.icon);

  useEffect(() => {
    setName(location.location_name);
    setAddress(location.location_address);
    setIcon(location.icon);
  }, [location]);

  const handleSave = () => {
    onSave({
      ...location,
      location_name: name,
      location_address: address,
      icon,
    });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
          <Dialog.Title className="text-xl font-bold mb-4">
            Edit Location
          </Dialog.Title>

          <label className="block font-medium mb-1">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
          />

          <label className="block font-medium mb-1">Address:</label>
          <AddressInput
            value={address}
            onChange={setAddress}
            placeholder="Enter address"
          />

          <label className="block font-medium mb-1 mt-3">Icon:</label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          >
            <option value="📍">📍</option>
            <option value="🏠">🏠</option>
            <option value="🚗">🚗</option>
            <option value="🖥️">🖥️</option>
            <option value="🏢">🏢</option>
          </select>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
