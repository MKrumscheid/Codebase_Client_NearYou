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

  const [formState, setFormFate] = useState({
    content: "",
    longitude: location.longitude || "",
    latitude: location.latitude || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addMessageToLocalStorage = (message) => {
    const messages = JSON.parse(localStorage.getItem("myMessages")) || [];
    const updatedMessages = [
      ...messages,
      { ...message, createdAt: new Date().getTime() },
    ];
    localStorage.setItem("myMessages", JSON.stringify(updatedMessages));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bodyContent = JSON.stringify({
      content: formState.content,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    try {
      const response = await fetch("http://localhost:3000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: bodyContent,
      });

      if (response.ok) {
        const createdMessage = await response.json();
        addMessageToLocalStorage({ ...createdMessage, isMyMessage: true });
        fetchMessages(); // Nach dem Senden erneut Nachrichten abrufen
        setFormFate({
          content: "",
          longitude: location.longitude || "",
          latitude: location.latitude || "",
        });
        scrollToBottom(); // Scroll to the bottom after sending a message
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form.");
    }
  };

  const fetchMessages = useCallback(async () => {
    const localMessages = JSON.parse(localStorage.getItem("myMessages")) || [];
    try {
      const response = await fetch(
        `http://localhost:3000/api/messages/nearby?latitude=${location.latitude}&longitude=${location.longitude}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      const allMessages = [...localMessages, ...data];
      const uniqueMessages = allMessages.reduce((acc, current) => {
        const x = acc.find((item) => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      uniqueMessages.forEach((msg) => {
        msg.distance = calculateDistance(
          location.latitude,
          location.longitude,
          msg.location.coordinates[1], // Latitude
          msg.location.coordinates[0] // Longitude
        );
      });

      uniqueMessages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      localStorage.setItem("myMessages", JSON.stringify(uniqueMessages));
      setMessages(uniqueMessages);
      scrollToBottom(); // Scroll to the bottom after fetching messages
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [location.latitude, location.longitude]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
            onClick={() => navigate("/discoveries")}
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
