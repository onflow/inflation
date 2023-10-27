import React, { useState, useEffect } from "react";
import CurrentUserContext from "./currentUserContext";
import magic from "../magic";

const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userStatusLoading, setUserStatusLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserStatusLoading(true);
        const magicIsLoggedIn = await magic.user.isLoggedIn();
        if (magicIsLoggedIn) {
          const metaData = await magic.user.getMetadata();
          setCurrentUser(metaData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setUserStatusLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, setCurrentUser, userStatusLoading }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export default CurrentUserProvider;
