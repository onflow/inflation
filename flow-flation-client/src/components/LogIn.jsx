import React, { useState, useContext } from "react";
import { Typography, Box } from "@mui/material";
import PhoneNumberInput from "./PhoneNumberInput";
import CurrentUserContext from "../context/currentUserContext";
import Button from "./Button";
import magic from "../magic";

export default function LogIn() {
  const [phoneNumber, setPhoneNumber] = useState("");

  const { setCurrentUser } = useContext(CurrentUserContext);

  const login = async () => {
    await magic.auth.loginWithMagicLink({
      email: "bilal.shahid+3@dapperlabs.com",
    });
    const metaData = await magic.user.getMetadata();
    setCurrentUser(metaData);
    //await magic.auth.loginWithSMS({ phoneNumber });
  };

  return (
    <Box mt={4}>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Please sign up or login
        </Typography>
        <PhoneNumberInput
          value={phoneNumber}
          onChange={(value) => setPhoneNumber(value)}
        />
      </Box>
      <Box mt={4}>
        <Button label="Send" onClick={login} />
      </Box>
    </Box>
  );
}
