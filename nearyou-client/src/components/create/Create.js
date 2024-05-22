import React, { useState } from "react";
import "./create.css";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "../helper_components/GeolocationProvider";

const Create = () => {
  const navigate = useNavigate();
  const location = useGeolocation();
  const [formState, setFormState] = useState({
    product: "",
    productInfo: "",
    price: "",
    discount: "",
    productCategory: "",
    validity: "",
    quantity: 1,
    productPhoto: null,
    companyLogo: null,
    longitude: location.longitude || "",
    latitude: location.latitude || "",
    productPhotoPreview: null,
    companyLogoPreview: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    setFormState((prev) => ({
      ...prev,
      [name]: file,
      [`${name}Preview`]: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in formState) {
      formData.append(key, formState[key]);
    }

    try {
      const response = await fetch("http://localhost:3000/api/coupons", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        // Handle successful submission
        alert("Coupon created successfully!");
        setFormState({
          product: "",
          productInfo: "",
          price: "",
          discount: "",
          productCategory: "",
          validity: "",
          quantity: 1,
          productPhoto: null,
          companyLogo: null,
          longitude: location.longitude || "",
          latitude: location.latitude || "",
          productPhotoPreview: null,
          companyLogoPreview: null,
        });
      } else {
        // Handle error
        alert("Failed to create coupon.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form.");
    }
  };

  const handleCurrentPosition = () => {
    setFormState((prev) => ({
      ...prev,
      longitude: location.longitude,
      latitude: location.latitude,
    }));
  };

  return (
    <div className="create-container">
      <div className="create-left-column">
        <div className="create-header">
          <div className="create-header-text">
            <h3>Start to</h3>
            <h1>CREATE</h1>
            <h3>Deine Ideen, unser Spotlight!</h3>
          </div>
          <img className="create-logo" src="/NearYouLogo.png" alt="Logo" />
        </div>
        <div className="create-flavor-text">
          <p>
            Du wolltest schon immer zeigen, was du zu bieten hast? Dann ist das
            der richtige Ort für dich! Hier kannst du einfach und schnell
            Gutscheine, Aktionen und Eyecatcher erstellen, um neue Kunden
            anzulocken.
          </p>
          <p>
            Die Stadt ist deine Bühne, und mit NearYou wird dein Geschäft zum
            Hauptdarsteller – mach dich bereit für den Applaus!
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
            onClick={() => navigate("/messages")}
          >
            CHAT
          </button>
        </div>
      </div>
      <div className="create-form-wrapper">
        <form className="create-form" onSubmit={handleSubmit}>
          <div className="create-location">
            <div className="create-location-input">
              <label htmlFor="longitude">Längengrad</label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                value={formState.longitude}
                onChange={handleInputChange}
              />
            </div>
            <button
              type="button"
              className="create-current-position-button"
              onClick={handleCurrentPosition}
            >
              Aktuelle Position
            </button>
            <div className="create-location-input">
              <label htmlFor="latitude">Breitengrad</label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                value={formState.latitude}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="create-upload-section">
            <div className="create-upload">
              <input
                type="file"
                id="productPhoto"
                name="productPhoto"
                onChange={handleFileChange}
              />
              <label htmlFor="productPhoto">Produktbild</label>
              {formState.productPhotoPreview && (
                <img
                  src={formState.productPhotoPreview}
                  alt="Product Preview"
                  className="create-preview-image"
                />
              )}
            </div>
            <div className="create-upload">
              <input
                type="file"
                id="companyLogo"
                name="companyLogo"
                onChange={handleFileChange}
              />
              <label htmlFor="companyLogo">Logo</label>
              {formState.companyLogoPreview && (
                <img
                  src={formState.companyLogoPreview}
                  alt="Logo Preview"
                  className="create-preview-image"
                />
              )}
            </div>
          </div>
          <input
            type="text"
            name="product"
            placeholder="Produktname (max 30 Zeichen)"
            maxLength="30"
            value={formState.product}
            onChange={handleInputChange}
          />
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Preis (vorher)"
            value={formState.price}
            onChange={handleInputChange}
          />
          <input
            type="number"
            step="0.01"
            name="discount"
            placeholder="Rabatt (in %)"
            value={formState.discount}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="productInfo"
            placeholder="Produktbeschreibung (max 150 Zeichen)"
            maxLength="150"
            value={formState.productInfo}
            onChange={handleInputChange}
          />
          <select
            name="productCategory"
            value={formState.productCategory}
            onChange={handleInputChange}
          >
            <option value="">Produktkategorie</option>
            <option value="tech">Technik</option>
            <option value="food">Essen und Trinken</option>
            <option value="clothing">Kleidung</option>
            <option value="activities">Aktivitäten</option>
            <option value="beauty">Beauty & Wellness</option>
          </select>
          <input
            type="number"
            name="validity"
            placeholder="Gültigkeit (in min, max 1440)"
            min="1"
            max="1440"
            value={formState.validity}
            onChange={handleInputChange}
          />
          <div className="create-quantity">
            <label htmlFor="quantity">Anzahl (max 999)</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max="999"
              value={formState.quantity}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" className="create-submit-button">
            CREATE
          </button>
        </form>
      </div>
    </div>
  );
};

export default Create;
