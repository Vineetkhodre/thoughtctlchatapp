import React, { useEffect, useState } from "react";
import Card from "./Card";

/**
 * Chatroom Component
 * @param {Object} userLoginInfo - User login information
 */
function Chatroom({ userLoginInfo }) {
  // State to manage users, selected member, conversation data, messages, and input
  const [users, setUsers] = useState([]);
  const [member, setMember] = useState();
  const [conversationData, setConversationData] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(null);

  /**
   * Function to create a new conversation
   * @param {Object} val - Selected user data
   * @param {Object} userLoginInfo - User login information
   */
  const createConversation = async (val, userLoginInfo) => {
    setMessages([]);
    try {
      const conv = await userLoginInfo.sessionData.newConversation();
      conv.on("text", onMessage);
      await conv.join();

      setConversationData({
        conversation: conv,
      });

      createMember(val.id, conv.id, userLoginInfo.token);
    } catch (err) {
      console.error("Error in create Conversation:", err);
    }
  };

  /**
   * Function to create a new member in the conversation
   * @param {string} USER_ID - User ID
   * @param {string} conversationId - Conversation ID
   * @param {string} JWT - JSON Web Token
   */
  const createMember = async (userId, conversationId, JWT) => {
    try {
      const response = await fetch(
        `https://api.nexmo.com/v0.3/conversations/${conversationId}/members`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${JWT}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            action: "invite",
            channel: {
              type: "app",
            },
          }),
        }
      );
      const data = await response.json();
    } catch (error) {
      console.error("Error creating member:", error);
    }
  };

  /**
   * Event handler for incoming messages
   * @param {Object} sender - Sender information
   * @param {Object} message - Incoming message
   */
  const onMessage = (sender, message) => {
    let newMessage = {
      key: message.id,
      sender: message._embedded.from_user.display_name,
      text: message.body.text,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  /**
   * Event handler for sending input
   * @param {Object} evt - Event object
   */
  const sendInput = (evt) => {
    conversationData.conversation.sendText(input).then(() => {
      setInput(null);
    });
    evt.target.previousSibling.value = "";
  };

  /**
   * Creates a Card component for each user
   * @param {Object} val - User data
   * @returns {JSX.Element} - Card component
   */
  const ncard = (val) => {
    return (
      <Card
        username={val.name}
        onClick={() => {
          setMember(val);
        }}
      />
    );
  };

  // Effect to create a conversation when a member is selected
  useEffect(() => {
    if (member) createConversation(member, userLoginInfo);
  }, [member]);

  // Effect to get the list of all users when the component mounts
  useEffect(() => {
    getUsers();
  }, []);

  /**
   * Function to get a list of all users from the Nexmo application
   */
  const getUsers = async () => {
    try {
      const response = await fetch("/getUsers", {
        method: "GET",
      })
        .then((results) => results.json())
        .then((data) => {
          setUsers(data.users._embedded.data.users);
        });
    } catch (error) {
      console.error("Error in getUsers:", error);
    }
  };

  // JSX structure for the Chatroom component
  return (
    <div className="chatroom flexrow">
      <div className="leftroom flexcol">
        <div className="header flexcolcenteralign">
          {userLoginInfo.user.username}
        </div>
        <div className="leftcontainer flexcol">{users.map(ncard)}</div>
      </div>
      <div className="rightcontainer flexcol">
        {member ? (
          <>
            <div className="header flexcolcenteralign">{member?.name}</div>
            <div className="chatcontainer flexcol">
              <div className="messagecontainer flexcol">
                {messages.map((msg, index) => (
                  <div className="messagebox flexcol" key={index}>
                    <div className="sender">{msg.sender}</div>
                    <div className="message flexrowcenteralign">{msg.text}</div>
                  </div>
                ))}
              </div>
              <div className="inputcontainer flexrowcenteralign">
                <input
                  className="messageinput"
                  onBlur={(evt) => setInput(evt.target.value)}
                />
                <button
                  className="messagesendbutton flexrowcenteralign"
                  onClick={(evt) => sendInput(evt)}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="conmessage flexrowcenteralign">
            Please select a user to start a conversation
          </div>
        )}
      </div>
    </div>
  );
}

export default Chatroom;
