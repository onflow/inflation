import React from "react";
import { Button as MaterialButton } from "@mui/material";

function Button({ label, onClick, disabled=false }) {
  return (
    <div>
      <MaterialButton
        variant="contained"
        disabled={disabled}
        sx={{
          background: "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
          boxShadow: "0 3px 5px 2px rgba(139, 195, 74, .3)",
          color: "white",
          padding: "0 30px",
          fontSize: "1.2rem",
          fontFamily: "'Patrick Hand', cursive, sans-serif",
          transition: "0.3s",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 4px 6px 2px rgba(139, 195, 74, .6)",
            background: "linear-gradient(45deg, #3A8E3A 30%, #6AAE6A 90%)",
            fontSize: "1.25rem",
          },
        }}
        onClick={onClick}
      >
        {label}
      </MaterialButton>
    </div>
  );
}

export default Button;
