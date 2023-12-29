import React, { useState } from "react";

/**
 * User Component
 * @param {Object} openChatUpdate - Function to update chat upon opening
 */
const User = ({ openChatUpdate }) => {
  // State for user data and error flag
  const [user, setUser] = useState({});
  const [err, setErr] = useState(false);

  /**
   * Function to create a new user in the Nexmo application
   * @param {string} userName - User name
   */
  const createUser = async (userName) => {
    try {
      const response = await fetch("/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      });

      const data = await response.json();

      // Update user state with the created user ID
      setUser((prevUser) => ({
        ...prevUser,
        userId: data.id,
      }));
    } catch (err) {
      // Set error flag if an error occurs during user creation
      setErr(true);
    }
  };

  /**
   * Event handler for form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userName = e.target[0].value;

    // Update user state with the entered username
    setUser(() => ({
      username: userName,
    }));

    // Call function to create the user
    createUser(userName);
  };

  // JSX structure based on user state
  if (user.userId) {
    return (
      <div className="btnnamecontainer flexcolcenteralign">
        <div className="username">{`User : ${user.username}`}</div>
        <button
          id="btn2"
          className="button"
          onClick={() => openChatUpdate(user)}
        >
          Create conversation
        </button>
      </div>
    );
  } else {
    return (
      <div className="userinfo flexcolcenteralign">
        <form onSubmit={handleSubmit}>
          <input
            id="username"
            className="userinput"
            placeholder="Enter your username"
            type="text"
          />
          <button id="btn" className="button">
            Create user
          </button>
          {err && <div className="error">Something went wrong</div>}
        </form>
      </div>
    );
  }
};

export default User;
