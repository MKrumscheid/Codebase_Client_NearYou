import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./coupon.css";

const Coupons = ({ coupons, onClaim, fetchCoupons }) => {
  // State to store the remaining validity of each coupon using a timer
  const [timers, setTimers] = useState({});

  // Update the timers when the coupons change
  useEffect(() => {
    const intervalIds = {};
    // Clear all intervals when the component unmounts
    coupons.forEach((coupon) => {
      if (coupon.claimed && coupon.remainingValidity > 0) {
        const endTime = new Date(
          new Date().getTime() + coupon.remainingValidity
        );
        // Update the timer every second based on the remaining validity
        intervalIds[coupon.id] = setInterval(() => {
          const now = new Date();
          const timeLeft = Math.max(0, endTime - now);
          setTimers((prevTimers) => ({
            ...prevTimers,
            [coupon.id]: timeLeft,
          }));
          updateLocalStorage(coupon.id, timeLeft);
          if (timeLeft <= 0) {
            fetchCoupons();
          }
        }, 1000);
      }
    });

    return () => {
      Object.values(intervalIds).forEach(clearInterval); // Clear all intervals when the component unmounts to prevent memory leaks
    };
  }, [coupons, fetchCoupons]);

  // Format the time in milliseconds to HH:MM:SS
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle the click event on a coupon by calling the onClaim function in the discovery component
  const handleCouponClick = (id) => {
    onClaim(id);
  };

  // Update the local storage when the remaining validity of a coupon changes
  const updateLocalStorage = (id, timeLeft) => {
    const storedCoupons = JSON.parse(localStorage.getItem("coupons")) || [];
    // Update the remaining validity of the coupon in the local storage
    const updatedCoupons = storedCoupons
      .map((coupon) =>
        coupon.id === id ? { ...coupon, remainingValidity: timeLeft } : coupon
      )
      .filter((coupon) => coupon.remainingValidity > 0); // Remove the coupon from the local storage if the remaining validity is 0

    localStorage.setItem("coupons", JSON.stringify(updatedCoupons));
  };

  // Render the list of coupons
  return (
    <div className="coupons">
      {coupons.map((coupon) => (
        <div
          key={coupon.id}
          className={`coupon ${coupon.claimed ? "claimed" : ""}`}
          onClick={() => handleCouponClick(coupon.id)}
        >
          <div className="coupon-image-container">
            <img src={coupon.productPhoto} alt={coupon.product} />
            <div className="coupon-labels">
              <div className="label discount">Rabatt {coupon.discount}%</div>
              <div className="label validity">
                {coupon.claimed
                  ? formatTime(timers[coupon.id] || coupon.remainingValidity)
                  : `${Math.floor(coupon.validity / 60)}:${(
                      coupon.validity % 60
                    )
                      .toString()
                      .padStart(2, "0")}`}
              </div>
              <div className="label quantity">
                Noch {coupon.quantity} verfügbar
              </div>
            </div>
          </div>
          <div className="coupon-details">
            <img src={coupon.companyLogo} alt="Company Logo" />
            <div className="coupon-info">
              <p className="product-name">{coupon.product}</p>
              <p className="product-info">{coupon.productInfo}</p>
            </div>
            <div className="price-container">
              <p className="old-price">{coupon.price.toFixed(2)}€</p>
              <p className="new-price">{coupon.new_price.toFixed(2)}€</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Define the prop types for the component for type checking
Coupons.propTypes = {
  coupons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      productPhoto: PropTypes.string.isRequired,
      companyLogo: PropTypes.string.isRequired,
      product: PropTypes.string.isRequired,
      productInfo: PropTypes.string,
      price: PropTypes.number.isRequired,
      new_price: PropTypes.number,
      discount: PropTypes.number,
      validity: PropTypes.number.isRequired,
      expiration: PropTypes.string.isRequired,
      remainingValidity: PropTypes.number,
      claimed: PropTypes.bool,
    })
  ).isRequired,
  onClaim: PropTypes.func.isRequired,
  fetchCoupons: PropTypes.func.isRequired,
};

export default Coupons;
