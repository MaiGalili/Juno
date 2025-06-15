import React, { useState, useRef } from "react";
import { StandaloneSearchBox } from "@react-google-maps/api";

export default function AddressInput({
  value,
  onChange,
  placeholder = "Enter an address",
}) {
  const searchBoxRef = useRef(null);
  const [inputValue, setInputValue] = useState(value || "");
  const [isValid, setIsValid] = useState(true); // 🟡 חדש: האם נבחר מקום תקף

  const handlePlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places.length > 0) {
      const address = places[0].formatted_address || places[0].name;
      setInputValue(address);
      onChange(address);
      setIsValid(true); // ✅ מקום תקף נבחר
    } else {
      console.warn("No place selected");
      setIsValid(false); // ❌ לא נבחר מקום
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value); // עדיין שולחים למעלה כדי לשמור סנכרון
    setIsValid(false); // 🟡 ברגע שמקלידים ידנית, מבטלים את התוקף
  };

  return (
    <div style={{ width: "100%" }}>
      <StandaloneSearchBox
        onLoad={(ref) => (searchBoxRef.current = ref)}
        onPlacesChanged={handlePlacesChanged}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "10px",
            direction: "rtl",
            border: isValid ? "1px solid #ccc" : "1px solid red",
            borderRadius: "5px",
          }}
        />
      </StandaloneSearchBox>
      {!isValid && (
        <p style={{ color: "red", fontSize: "0.85em", marginTop: "5px" }}>
          Please select a valid address
        </p>
      )}
    </div>
  );
}
