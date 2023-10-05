import React from 'react';

const Alert = ({ title, message, onCancel, onConfirm, visible }) => {
  if (!visible) return null;

  return (
    <div className="ios-alert">
      <div className="ios-alert-header">{title}</div>
      <div className="ios-alert-body">{message}</div>
      <div className="ios-alert-buttons">
        <button className="ios-alert-button confirm" onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  );
};

export default Alert;
