import React, { useEffect, useState } from "react";
import Card from "./Card";

interface UserData {
  id: string;
  name: string;
}

interface Message {
  key: string;
  sender: string;
  text: string;
}

interface UserLoginInfo {
  sessionData: {
    newConversation: () => Promise<any>;
  };
  token: string;
  user: {
    username: string;
  };
}

interface ChatroomProps {
  userLoginInfo: UserLoginInfo;
}

/**
 * Chatroom Component
 * @param {Object} userLoginInfo - User login information
 */
function Chatroom({ userLoginInfo }: ChatroomProps) {
  // State to manage users, selected member, conversation data, messages, and input
  const [users, setUsers] = useState<UserData[]>([]);
  const [member, setMember] = useState<UserData | undefined>();
  const [conversationData, setConversationData] = useState<any>({});
  const [messages, setMessages] = useState<Message[]>([]);  
  const [input, setInput] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  // ...


  /**
   * Function to create a new conversation
   * @param {Object} val - Selected user data
   * @param {Object} userLoginInfo - User login information
   */
  const createConversation = async (val: UserData, userLoginInfo: UserLoginInfo) => {
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
   * @param {string} conversationId - Conversation ID
   * @param {string} JWT - JSON Web Token
   */
  const createMember = async (userId: string, conversationId: string, JWT: string) => {
    try {
      await fetch(
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
    } catch (error) {
      console.error("Error creating member:", error);
    }
  };

  /**
   * Event handler for incoming messages
   * @param {Object} sender - Sender information
   * @param {Object} message - Incoming message
   */
  const onMessage = (sender: any, message: any) => {
    let newMessage: Message = {
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
const sendInput = (evt: React.MouseEvent<HTMLButtonElement>) => {
  conversationData.conversation.sendText(input!).then(() => {
    setInput(null);
  });

  const inputElement = evt.currentTarget.previousSibling as HTMLInputElement;
  if (inputElement) {
    inputElement.value = "";
  }
};


  /**
   * Creates a Card component for each user
   * @param {Object} val - User data
   * @returns {JSX.Element} - Card component
   */
  const ncard = (val: UserData): JSX.Element => {
    return (
      <Card
        username={val.name}
        onClick={() => {
          setMember(val);
        }}
        key={val.id}
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
      // Make the fetch call directly without assigning it to a variable
      await fetch("/getUsers", {
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
                value={inputValue}
                onChange={(evt) => setInputValue(evt.target.value)}
                onBlur={() => setInput(inputValue)}
              />

              <button
                className="messagesendbutton flexrowcenteralign"
                onClick={(evt) => sendInput(evt)}
                disabled={!inputValue.trim()} // Disable if input is empty or contains only whitespaces
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
