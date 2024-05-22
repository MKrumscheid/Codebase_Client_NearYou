import React, { useState } from "react";
import "./DistanceDropdown.css";

const DistanceDropdown = ({ distance, onApply }) => {
  const [selectedDistance, setSelectedDistance] = useState(distance);

  const handleDistanceChange = (event) => {
    setSelectedDistance(event.target.value);
  };

  return (
    <div className="dropdown">
      <label>Umkreis:</label>
      <input
        type="range"
        min="100"
        max="5000"
        value={selectedDistance}
        onChange={handleDistanceChange}
      />
      <p>{(selectedDistance / 1000).toFixed(1)} km</p>
      <button onClick={() => onApply(selectedDistance)}>Anwenden</button>
    </div>
  );
};

export default DistanceDropdown;
