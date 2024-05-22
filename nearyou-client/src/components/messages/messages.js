import React, { useState } from "react";
import "./messages.css";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "../helper_components/GeolocationProvider";

const Create = () => {
  const navigate = useNavigate();

  return (
    <div className="create-container">
      <div className="create-left-column">
        <div className="create-header">
          <div className="create-header-text">
            <h3>Start to</h3>
            <h1>CHAT</h1>
            <h3>Fühle den Puls deiner Umgebung</h3>
          </div>
          <img className="create-logo" src="/NearYouLogo.png" alt="Logo" />
        </div>
        <div className="create-flavor-text">
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
        <div className="create-nav-buttons">
          <button
            className="create-styled-button"
            onClick={() => navigate("/discoveries")}
          >
            DISCOVER
          </button>
          <button
            className="create-styled-button"
            onClick={() => navigate("/create")}
          >
            CREATE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Create;
