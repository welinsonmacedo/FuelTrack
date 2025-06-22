// ActionMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import "./style.css";

export default function ActionMenu({ onEditar, onConfirmar, onImprimir }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="action-menu-wrapper" ref={menuRef}>
      <button className="menu-trigger" onClick={() => setOpen((prev) => !prev)}>
        ⋮
      </button>
      {open && (
        <div className="action-menu">
          <button className="menu-item" onClick={onEditar}>
            Editar
          </button>
          <button className="menu-item" onClick={onConfirmar}>
            Confirmar
          </button>
          <button className="menu-item" onClick={onImprimir}>
            OS
          </button>
        </div>
      )}
    </div>
  );
}
