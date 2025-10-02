"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext"; // Adjust the path as necessary
import classNames from "classnames";

// Define the User type based on your current data structure
type User = {
  username: string;
  StravaId: string;
};

const ProfileSelector = () => {
  const { selectedUser, selectUser, deselectUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch users from the API when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data: User[] = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setError(err.message || "Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handler for selecting a user
  const handleSelectUser = (user: User) => {
    selectUser(user);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300 dark:bg-gray-700 dark:hover:bg-gray-800"
      >
        {selectedUser ? (
          <>
            <Image
              src={`/api/images?userId=${selectedUser.StravaId}`}
              alt={`${selectedUser.username}'s profile`}
              width={32}
              height={32}
              className="rounded-full mr-2"
              placeholder="blur"
              blurDataURL="/default-profile.jpg"
              onError={(e) => {
                e.currentTarget.src = "/default-profile.jpg";
              }}
            />
            <span>{selectedUser.username}</span>
          </>
        ) : (
            <>
            <Image
              src="/default-profile.jpg"
              alt="Default profile"
              width={32}
              height={32}
              className="rounded-full mr-2"
            />
            <span>Select User</span>
          </>
        )}
        <svg
          className={`ml-2 w-4 h-4 transition-transform ${
            isDropdownOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute top-12 right-0 w-48 bg-white border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-10 dark:bg-gray-800">
          <ul className="py-1">
            {loading ? (
              <li className="px-4 py-2 text-gray-700">Loading...</li>
            ) : error ? (
              <li className="px-4 py-2 text-red-500">Error: {error}</li>
            ) : users.length > 0 ? (
              users.map((user) => (
                <li
                  key={user.StravaId}
                  onClick={() => handleSelectUser(user)}
                  className={classNames(
                    "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                    {
                      "bg-gray-100 dark:bg-gray-700": selectedUser?.StravaId === user.StravaId,
                    }
                  )}
                >
                  <Image
                    src={`/api/images?userId=${user.StravaId}`}
                    alt={`${user.username}'s profile`}
                    width={24}
                    height={24}
                    className="rounded-full mr-2"
                    placeholder="blur"
                    blurDataURL="/default-profile.jpg"
                    onError={(e) => {
                      e.currentTarget.src = "/default-profile.jpg";
                    }}
                  />
                  <span>{user.username}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-700">No users available.</li>
            )}
            <li
              onClick={() => {
                alert("Add User functionality coming soon!");
                setIsDropdownOpen(false);
              }}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-700"
            >
              <span className="text-2xl mr-2">+</span>
              <span>Add User</span>
            </li>
            {selectedUser && (
              <li
                onClick={() => {
                  deselectUser();
                  setIsDropdownOpen(false);
                  window.location.reload();
                }}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
              >
                <svg 
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;