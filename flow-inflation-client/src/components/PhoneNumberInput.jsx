import React from "react";
import { MuiTelInput } from "mui-tel-input";

function PhoneNumberInput({ value, onChange }) {
  return (
    <div>
      <MuiTelInput defaultCountry="US" value={value} onChange={onChange} />
    </div>
  );
}

export default PhoneNumberInput;
