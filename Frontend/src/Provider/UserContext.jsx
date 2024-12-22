import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedToken = localStorage.getItem('userToken');
    if (storedUsername) setUsername(storedUsername);
    if (storedToken) setToken(storedToken);
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};
