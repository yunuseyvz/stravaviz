// components/HomeContent.tsx

"use client";

import Image from "next/image";
import D3Graph from "../components/graph";
import BlurFade from "../components/ui/blur-fade";
import BentoGrid from "../components/BentoGrid"; // Import BentoGrid component
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext"; // Adjust the path as necessary
import classNames from "classnames"; 

// Define the User type based on your current data structure
type User = {
  username: string;
  StravaId: string;
};

export default function HomeContent() {
  // State to hold the list of users
  const [users, setUsers] = useState<User[]>([]);
  // State to handle loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Access global user state
  const { selectedUser, userSelected, selectUser, deselectUser } = useUser();

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

  const SkeletonUser = () => (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
      <div className="mt-2 h-4 w-20 bg-gray-200 rounded animate-pulse" />
    </div>
  );

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {userSelected ? (
        <BentoGrid />
      ) : (
        <section className="w-full flex flex-col items-center my-auto pt-36">
          <h2 className="text-2xl font-semibold mb-4">Select a Strava Dataset</h2>
          <p className="text-gray-600 text-center mb-6">You can select a user to view their data or upload a new Strava Dataset.</p>
          {loading ? (
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              {[...Array(6)].map((_, index) => (
                <SkeletonUser key={index} />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 mb-6">
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
                          "w-28 h-28 rounded-full overflow-hidden border-2 transition-all",
                          {
                            "border-blue-500 border-4": isSelected, // Apply outline only to the image
                            "border-gray-300": !isSelected, // Default border
                          }
                        )}
                      >
                        <Image
                          src={`/api/images?userId=${user.StravaId}`}
                          alt={`${user.username}'s profile`}
                          width={112}
                          height={112}
                          className="object-cover"
                          placeholder="blur"
                          blurDataURL="/default-profile.jpg" 
                          onError={(e) => {
                            e.currentTarget.src = "/default-profile.jpg";
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

              <div className="flex flex-col items-center">
                <button
                  className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-400 hover:bg-gray-300 transition-colors duration-300"
                  onClick={() => alert("Add User functionality coming soon!")}
                >
                  <span className="text-3xl text-gray-600">+</span>
                </button>
                <span className="mt-2 text-center">Add User</span>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}