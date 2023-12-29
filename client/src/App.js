import React, { useState, useEffect } from "react";
import nexmoClient from "nexmo-client";
import "./App.scss";
import User from "./components/User";
import Chatroom from "./components/Chatroom";

const App = () => {
  // State to manage the visibility of login/signup forms and the chatroom
  const [show, setShow] = useState(false);
  const [openConv, setOpenConv] = useState(false);
  const [userLoginInfo, setUserLoginInfo] = useState({});

  // Function to create a session for the user
  const login = async () => {
    try {
      // Create a Nexmo client instance and initialize a session
      let nexmo = new nexmoClient({
        debug: true,
        log_reporter: { enabled: true },
      });
      const sessionData = await nexmo.createSession(userLoginInfo.token);

      // Update userLoginInfo with the sessionData
      setUserLoginInfo((prevState) => ({
        ...prevState,
        sessionData: sessionData,
      }));
    } catch (error) {
      console.error("Error in login:", error);
    }
  };

  // Function to get a JWT token
  const getJWT = async (user) => {
    try {
      const response = await fetch("/getJWT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.username }),
      });
      const data = await response.json();

      // Update userLoginInfo with the JWT token
      setUserLoginInfo((prevState) => ({
        ...prevState,
        token: data.jwt,
      }));
    } catch (error) {
      console.error("Error in getJWT:", error);
    }
  };

  // Function to open the chat when a user is selected
  const openChat = (user) => {
    setUserLoginInfo((prevState) => ({
      ...prevState,
      user: user,
    }));
    getJWT(user);
    setOpenConv(true);
  };

  // Event handlers for login and signup buttons
  const handleLoginClick = () => {
    setShow("login");
  };
  const handleSignupClick = () => {
    setShow("signup");
  };

  // Effect to trigger the login function when a token is available
  useEffect(() => {
    if (userLoginInfo.token) {
      login();
    }
  }, [userLoginInfo.token]);

  // Render the Chatroom or Login/Signup form based on the state
  if (openConv) {
    return <Chatroom userLoginInfo={userLoginInfo} />;
  } else {
    return (
      <div className="nexmoapplication flexcolcenteralign">
        <div className="nexmocontainer flexcol">
          <div className="flexrow btncontainer">
            <button className="button" onClick={handleLoginClick}>
              Login
            </button>
            <button className="button" onClick={handleSignupClick}>
              Signup
            </button>
          </div>
          {show === "signup" ? (
            <div className="signup flexcolcenteralign">
              <User openChatUpdate={openChat} />
            </div>
          ) : (
            <div className="login">
              <h2>Coming soon</h2>
              <p>Login Component</p>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default App;
