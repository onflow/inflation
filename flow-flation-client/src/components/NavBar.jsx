import React, { useContext } from "react";
import { AppBar, Toolbar, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout"; // You can change this to a relevant icon
import { useNavigate } from "react-router-dom";
import CurrentUserContext from "../context/currentUserContext";
import magic from "../magic";

export default function NavBar() {
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  const navigate = useNavigate();

  const handleLoginLogout = async () => {
    if (currentUser != null) {
      await magic.user.logout();
      setCurrentUser(null);
    }
  };

  return (
    <AppBar
      position="fixed"
      style={{
        top: "auto",
        bottom: 0,
        backgroundColor: "white",
        color: "black",
        borderTop: "1px solid black",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}
    >
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton onClick={() => navigate("/")} edge="start">
          <img
            src="flow_logo.png"
            alt="Flow Logo"
            style={{ height: "42px", width: "42px" }}
          />
        </IconButton>

        <>
          <IconButton onClick={() => navigate("/my_balloons")}>
            <img
              src="my_balloons.png"
              alt="My Balloons"
              style={{ height: "42px", width: "42px" }}
            />
          </IconButton>
          {currentUser != null && (
            <IconButton onClick={handleLoginLogout}>
              <LogoutIcon style={{ fontSize: 38, color: "#49EF8B" }} />
            </IconButton>
          )}
        </>
      </Toolbar>
    </AppBar>
  );
}
