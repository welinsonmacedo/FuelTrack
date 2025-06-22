
import React from "react";

export default function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        padding: "8px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        flex: 1,
        minWidth: "200px",
      }}
    />
  );
}
