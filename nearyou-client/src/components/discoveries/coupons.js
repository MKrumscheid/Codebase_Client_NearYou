import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./coupon.css";

const Coupons = ({ coupons, onClaim, fetchCoupons }) => {
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const intervalIds = {};

    coupons.forEach((coupon) => {
      if (coupon.claimed && coupon.remainingValidity > 0) {
        const endTime = new Date(
          new Date().getTime() + coupon.remainingValidity
        );
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
      Object.values(intervalIds).forEach(clearInterval);
    };
  }, [coupons, fetchCoupons]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCouponClick = (id) => {
    onClaim(id);
  };

  const updateLocalStorage = (id, timeLeft) => {
    const storedCoupons = JSON.parse(localStorage.getItem("coupons")) || [];
    const updatedCoupons = storedCoupons
      .map((coupon) =>
        coupon.id === id ? { ...coupon, remainingValidity: timeLeft } : coupon
      )
      .filter((coupon) => coupon.remainingValidity > 0);

    localStorage.setItem("coupons", JSON.stringify(updatedCoupons));
  };

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
