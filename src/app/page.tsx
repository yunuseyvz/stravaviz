"use client";

import Image from "next/image";
import D3Graph from "../components/graph";
import BlurFade from "../components/ui/blur-fade";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext"; // Adjust the path as necessary
import classNames from "classnames"; // Optional: For conditional class handling

// Define the User type based on your current data structure
type User = {
  username: string;
  StravaId: string;
};

export default function Home() {
  // State to hold the list of users
  const [users, setUsers] = useState<User[]>([]);
  // State to handle loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Access global user state
  const { selectedUser, selectUser, deselectUser } = useUser();

  // Fetch users from the API when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", {
          // Ensure fresh data is fetched on each request
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

  // Handler for clicking on a user
  const handleUserClick = (user: User) => {
    if (selectedUser?.StravaId === user.StravaId) {
      deselectUser();
    } else {
      selectUser(user);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Header Section */}
      <header className="row-start-1 flex flex-col items-center gap-4 mt-8">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <p className="text-lg text-center max-w-2xl">
          Explore insightful visualizations of Strava data, created as part of our university project for InfoVis.
        </p>
      </header>

      {/* Users Display Section */}
      <section className="row-start-2 w-full flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4">Current Users</h2>

        {/* Display Loading or Error Messages */}
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {/* Display Each User */}
            {users.length > 0 ? (
              users.map((user) => {
                const isSelected = selectedUser?.StravaId === user.StravaId;

                return (
                  <div
                    key={user.StravaId}
                    className="flex flex-col items-center cursor-pointer transition-transform transform hover:scale-105"
                    onClick={() => handleUserClick(user)}
                  >
                    <div
                      className={classNames(
                        "w-24 h-24 rounded-full overflow-hidden border-2 transition-all",
                        {
                          "border-blue-500 border-4": isSelected, // Apply outline only to the image
                          "border-gray-300": !isSelected, // Default border
                        }
                      )}
                    >
                      <Image
                        src={`/api/images?userId=${user.StravaId}`}
                        alt={`${user.username}'s profile`}
                        width={96}
                        height={96}
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL="/default-profile.jpg" // Optional placeholder image
                        onError={(e) => {
                          e.currentTarget.src = "/default-profile.jpg"; // Fallback image
                        }}
                      />
                    </div>
                    <span className="mt-2 text-center">{user.username}</span>
                  </div>

                );
              })
            ) : (
              <p>No users available. Add a new user!</p>
            )}

            {/* Add User Button */}
            <div className="flex flex-col items-center">
              <button
                className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-400 hover:bg-gray-300 transition-colors duration-300"
                onClick={() => alert("Add User functionality coming soon!")}
              >
                <span className="text-3xl text-gray-600">+</span>
              </button>
              <span className="mt-2 text-center">Add User</span>
            </div>
          </div>
        )}
      </section>

      {/* Footer Section */}
      <footer className="row-start-3 flex justify-between w-full px-6">
        <span>IV Gruppe 07 WS 2024/2025</span>
        {selectedUser && (
          <div className="flex items-center">
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
            <span>Selected: {selectedUser.username}</span>
          </div>
        )}
      </footer>
    </div>
  );
}
