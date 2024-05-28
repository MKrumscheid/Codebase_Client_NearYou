import React, { useState } from "react";
import "./DistanceDropdown.css";

const DistanceDropdown = ({ distance, onApply }) => {
  // State to store the selected distance
  const [selectedDistance, setSelectedDistance] = useState(distance);
  // Function to handle the range input change event

  const handleDistanceChange = (event) => {
    setSelectedDistance(event.target.value);
  };
  // Return the dropdown component with a range input for selecting the distance
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
