import React, { useState } from "react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  size = "medium", // small, medium, large
  style = {},
  ...props
}) {
  const [hover, setHover] = useState(false);

  const colors = {
    primary: {
      default: "#3498db",
      hover: "#75ee99",
      color: "white",
      disabledBg: "#a0c4e3",
      disabledColor: "#eee",
    },
    danger: {
      default: "#e74c3c",
      hover: "#464432",
      color: "white",
      disabledBg: "#e6a0a0",
      disabledColor: "#eee",
    },
    cancel: {
      default: "#7f8c8d",
      hover: "#606c70",
      color: "white",
      disabledBg: "#b0b6b8",
      disabledColor: "#eee",
    },
     cloose: {
      default: "#aa9904",
      hover: "#606c70",
      color: "white",
      disabledBg: "#b0b6b8",
      disabledColor: "#eee",
    },

  };

  const sizes = {
    small: {
      fontSize: "12px",
      padding: "6px 12px",
    },
    medium: {
      fontSize: "14px",
      padding: "10px 16px",
    },
    large: {
      fontSize: "16px",
      padding: "14px 20px",
    },
  };

  const current = colors[variant] || colors.primary;
  const currentSize = sizes[size] || sizes.medium;

  const baseStyle = {
    backgroundColor:
      disabled || loading
        ? current.disabledBg
        : hover
        ? current.hover
        : current.default,
    color: disabled || loading ? current.disabledColor : current.color,
    border: "none",
    borderRadius: "5px",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    fontWeight: "bold",
    fontSize: currentSize.fontSize,
    padding: currentSize.padding,
    transition: "background-color 0.2s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    opacity: disabled ? 0.7 : 1,
    userSelect: "none",
    ...style,
  };

  return (
    <button
      style={baseStyle}
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => {
        if (!disabled && !loading) setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      {...props}
    >
      {loading && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginRight: 6 }}
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="spinner"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            strokeOpacity="0.25"
            strokeWidth="3"
            fill="none"
          />
          <path d="M22 12a10 10 0 0 1-10 10" />
          <style>
            {`
              .spinner path {
                transform-origin: center;
                animation: spinner-rotate 1s linear infinite;
              }
              @keyframes spinner-rotate {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </svg>
      )}
      {children}
    </button>
  );
}
