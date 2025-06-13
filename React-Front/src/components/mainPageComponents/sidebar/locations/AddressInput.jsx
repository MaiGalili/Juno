import React, { useRef, useEffect } from "react";

export default function AddressInput({
  value,
  onChange,
  placeholder = "Enter address...",
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps script not loaded");
      return;
    }

    if (inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "il" },
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address) {
          onChange(place.formatted_address);
        } else if (place.name) {
          onChange(place.name);
        }
      });
    }
  }, [onChange]);

  return (
    <input
      type="text"
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", padding: "8px", fontSize: "1rem" }}
    />
  );
}
