import React, { useState } from "react";
import "./speechBubbles.css";

function SpeechBubble({ message, isMyMessage, distance }) {
  return (
    <div className={"message " + (isMyMessage ? "sent" : "recieved")}>
      <p className="content">{message.content}</p>
      <p className="distance">Entfernung: {distance.toFixed(0)} Meter</p>
    </div>
  );
}

export default SpeechBubble;
