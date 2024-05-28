import React, { useState } from "react";
import "./CategoryDropdown.css";

// Defining the available categories
const categories = [
  { value: "tech", label: "Technik" },
  { value: "food", label: "Essen und Trinken" },
  { value: "clothing", label: "Kleidung" },
  { value: "activities", label: "Aktivitäten" },
  { value: "beauty", label: "Beauty & Wellness" },
];

// Dropdown component for selecting categories
const CategoryDropdown = ({ selectedCategories, onApply }) => {
  // State to store the selected categories
  const [selected, setSelected] = useState(selectedCategories);

  // Function to handle the checkbox change event
  const handleCheckboxChange = (category) => {
    setSelected(
      (prevSelected) =>
        prevSelected.includes(category)
          ? prevSelected.filter((c) => c !== category) // Remove the category if it is already selected
          : [...prevSelected, category] // Add the category if it is not selected
    );
  };
  // Return the dropdown component with checkboxes for each category
  return (
    <div className="dropdown">
      <label>Produktkategorie:</label>
      {categories.map((category) => (
        <div key={category.value} className="checkbox-container">
          <input
            type="checkbox"
            checked={selected.includes(category.value)}
            onChange={() => handleCheckboxChange(category.value)}
          />
          <label>{category.label}</label>
        </div>
      ))}
      <button onClick={() => onApply(selected)}>Anwenden</button>
    </div>
  );
};

export default CategoryDropdown;
