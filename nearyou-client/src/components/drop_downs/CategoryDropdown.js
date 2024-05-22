import React, { useState } from "react";
import "./CategoryDropdown.css";

const categories = [
  { value: "tech", label: "Technik" },
  { value: "food", label: "Essen und Trinken" },
  { value: "clothing", label: "Kleidung" },
  { value: "activities", label: "Aktivitäten" },
  { value: "beauty", label: "Beauty & Wellness" },
];

const CategoryDropdown = ({ selectedCategories, onApply }) => {
  const [selected, setSelected] = useState(selectedCategories);

  const handleCheckboxChange = (category) => {
    setSelected((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((c) => c !== category)
        : [...prevSelected, category]
    );
  };

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
