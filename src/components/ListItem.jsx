import React from "react";

export default function ListItem({ icon, text, onClick, style = {} }) {
  return (
    <li
      onClick={onClick}
      style={{
        backgroundColor: "white",
        padding: "10px 15px",
        marginBottom: "8px",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        transition: "background-color 0.2s",
        ...style,
      }}
    >
      {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
      <span>{text}</span>
    </li>
  );
}
