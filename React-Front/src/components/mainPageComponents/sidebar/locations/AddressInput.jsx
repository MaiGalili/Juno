import React, { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

export default function AddressInput({ onChange }) {
  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.formatted_address) {
      onChange(place.formatted_address);
    }
  };

  return (
    <Autocomplete
      onLoad={(ref) => (autocompleteRef.current = ref)}
      onPlaceChanged={handlePlaceChanged}
    >
      <input
        type="text"
        placeholder="הכנס כתובת"
        style={{ width: "100%", padding: "10px", direction: "rtl" }}
      />
    </Autocomplete>
  );
}
