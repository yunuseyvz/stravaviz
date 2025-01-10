// context/UserContext.tsx

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the User type based on your current data structure
type User = {
  username: string;
  StravaId: string;
};

// Define the shape of the context
type UserContextType = {
  selectedUser: User | null;
  selectUser: (user: User) => void;
  deselectUser: () => void;
};

// Create the context with default undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const selectUser = (user: User) => setSelectedUser(user);
  const deselectUser = () => setSelectedUser(null);

  return (
    <UserContext.Provider value={{ selectedUser, selectUser, deselectUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
