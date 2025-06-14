import React from "react";
import { PlaceAutocompleteElement } from "@vis.gl/react-google-maps";

export default function AddressInput({
  value,
  onChange,
  placeholder = "הכנס כתובת",
}) {
  const handlePlaceSelect = (place) => {
    if (place?.formatted_address) {
      onChange(place.formatted_address);
    } else if (place?.name) {
      onChange(place.name);
    }
  };

  return (
    <PlaceAutocompleteElement
      onPlaceSelect={handlePlaceSelect}
      inputProps={{
        value: value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        style: { width: "100%", padding: "10px", direction: "rtl" },
      }}
    />
  );
}
