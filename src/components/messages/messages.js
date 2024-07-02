import React, { useState, useEffect, useCallback, useRef } from "react";
import "./messages.css";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "../helper_components/GeolocationProvider";
import { calculateDistance } from "../helper_components/DistanceCalculator";
import SpeechBubble from "./speechBubbles";

const Messages = () => {
  const navigate = useNavigate();
  const location = useGeolocation();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null); // Reference to the end of messages

  // Function to remove messages older than 12 hours from local storage
  const removeOldMessages = (messages) => {
    const currentTime = new Date().getTime();
    const filteredMessages = messages.filter(
      (message) => currentTime - message.createdAt < 12 * 60 * 60 * 1000
    );
    localStorage.setItem("myMessages", JSON.stringify(filteredMessages));
    return filteredMessages;
  };

  // A message is considered a form with content, latitude and longitude
  const [formState, setFormState] = useState({
    content: "",
    longitude: location.longitude || "",
    latitude: location.latitude || "",
  });

  // Update the form state with the input values
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Adds a message that was sent by the user to the local storage
  const addMessageToLocalStorage = (message) => {
    const messages = JSON.parse(localStorage.getItem("myMessages")) || [];
    const updatedMessages = [
      ...messages,
      { ...message, createdAt: new Date().getTime() },
    ];
    localStorage.setItem("myMessages", JSON.stringify(updatedMessages));
  };

  // What to do when the send button is clicked
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    const bodyContent = JSON.stringify({
      content: formState.content,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    console.log("Sending message:", bodyContent); // Log the message content

    // POST the message to the server
    try {
      const response = await fetch(
        "https://nearyou-server-28246f0c9e39.herokuapp.com/api/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: bodyContent,
        }
      );

      if (response.ok) {
        const createdMessage = await response.json();
        console.log("Message sent successfully:", createdMessage); // Log the response from the server
        // Add the message to the local storage
        addMessageToLocalStorage({ ...createdMessage, isMyMessage: true });
        // Fetch the messages again to update the list
        fetchMessages();
        // Reset the form state
        setFormState({
          content: "",
          longitude: location.longitude || "",
          latitude: location.latitude || "",
        });
        // Scroll to the bottom after sending a message and every time new messages are fetched
        scrollToBottom();
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form.");
    }
  };

  // Fetches the messages from the server and updates the local storage
  const fetchMessages = useCallback(async () => {
    const localMessages = JSON.parse(localStorage.getItem("myMessages")) || [];
    console.log("Fetching messages...");
    try {
      const response = await fetch(
        `https://nearyou-server-28246f0c9e39.herokuapp.com/api/messages/nearby?latitude=${location.latitude}&longitude=${location.longitude}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch messages:", response.statusText);
        return;
      }

      const data = await response.json();
      console.log("Fetched messages:", data); // Log the fetched messages

      const allMessages = [...localMessages, ...data];
      // Remove duplicate messages, since the server might return messages that are already in the local storage
      const uniqueMessages = allMessages.reduce((acc, current) => {
        const x = acc.find((item) => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      // Calculate the distance of each message from the user's location
      uniqueMessages.forEach((msg) => {
        msg.distance = calculateDistance(
          location.latitude,
          location.longitude,
          msg.location.coordinates[1], // Latitude
          msg.location.coordinates[0] // Longitude
        );
      });
      // Sort the messages by creation date to show them in the correct order
      uniqueMessages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      // Update the local storage and state with the unique messages
      const updatedMessages = removeOldMessages(uniqueMessages);
      setMessages(updatedMessages);
      localStorage.setItem("myMessages", JSON.stringify(updatedMessages));
      scrollToBottom(); // Scroll to the bottom after fetching messages
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [location.latitude, location.longitude]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch the messages when the component is mounted and every 5 seconds
  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [fetchMessages]);

  return (
    <div className="messages-container">
      <div className="messages-left-column">
        <div className="messages-header">
          <div className="messages-header-text">
            <h3>Start to</h3>
            <h1>CHAT</h1>
            <h3>Fühle den Puls deiner Umgebung</h3>
          </div>
          <img className="messages-logo" src="/NearYouLogo.png" alt="Logo" />
        </div>
        <div className="messages-flavor-text">
          <p>
            Deine Community, deine Stimme. Mit NearYou Chat, bist du im
            Handumdrehen Teil deiner lokalen Szene.
          </p>
          <p>
            Egal, ob du Tipps für die besten Cafés benötigst, die Zugfahrt
            überbrücken willst oder mit Fans beim Spiel eurer Mannschaft
            mitfiebern willst – beginne Gespräche, die zählen.
          </p>
        </div>
        <div className="messages-nav-buttons">
          <button
            className="messages-styled-button"
            onClick={() => navigate("/")}
          >
            DISCOVER
          </button>
          <button
            className="messages-styled-button"
            onClick={() => navigate("/create")}
          >
            CREATE
          </button>
        </div>
      </div>
      <div className="messages-content-wrapper">
        <div className="chat-wrapper">
          <div className="chat-container">
            {messages.map((m) => (
              <SpeechBubble
                key={m.id}
                message={m}
                isMyMessage={m.isMyMessage}
                distance={m.distance}
              />
            ))}
            <div ref={messagesEndRef} />{" "}
            {/* Reference to the end of messages */}
          </div>
          <form className="messages-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="content"
              placeholder="Message"
              value={formState.content}
              onChange={handleInputChange}
            />
            <button type="submit" className="messages-submit-button">
              SEND
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
