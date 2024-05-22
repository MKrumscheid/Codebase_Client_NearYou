import React, { useState, useEffect, useCallback } from "react";
import "./discoveries.css";
import Coupons from "./coupons";
import { useGeolocation } from "../helper_components/GeolocationProvider";
import { useNavigate } from "react-router-dom";
import DistanceDropdown from "../drop_downs/DistanceDropdown";
import CategoryDropdown from "../drop_downs/CategoryDropdown";

const Discoveries = () => {
  const [coupons, setCoupons] = useState([]);
  const [distance, setDistance] = useState(3000);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const location = useGeolocation();
  const navigate = useNavigate();

  const fetchCoupons = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/coupons/nearby/?distance=${distance}&latitude=${location.latitude}&longitude=${location.longitude}`
      );
      const data = await response.json();

      const baseURL = "http://localhost:3000/";
      const storedCoupons = JSON.parse(localStorage.getItem("coupons")) || [];
      const currentTime = Date.now();

      const updatedCoupons = data.map((coupon) => ({
        ...coupon,
        companyLogo: `${baseURL}${coupon.companyLogo}`,
        productPhoto: `${baseURL}${coupon.productPhoto}`,
      }));

      const validClaimedCoupons = storedCoupons
        .filter((coupon) => coupon.claimed)
        .map((coupon) => {
          const elapsedTime = currentTime - coupon.claimedAt;
          const remainingValidity = coupon.validity * 60000 - elapsedTime;
          return {
            ...coupon,
            remainingValidity,
          };
        })
        .filter((coupon) => coupon.remainingValidity > 0);

      const mergedCoupons = [
        ...updatedCoupons.map((coupon) => {
          const storedCoupon = storedCoupons.find((c) => c.id === coupon.id);
          if (storedCoupon) {
            return {
              ...coupon,
              quantity: storedCoupon.quantity,
              claimed: storedCoupon.claimed,
              validity: storedCoupon.validity,
              remainingValidity: storedCoupon.claimed
                ? coupon.validity * 60000 -
                  (currentTime - storedCoupon.claimedAt)
                : coupon.validity * 60000,
              claimedAt: storedCoupon.claimedAt,
            };
          }
          return {
            ...coupon,
            remainingValidity: coupon.validity * 60000,
          };
        }),
        ...validClaimedCoupons.filter(
          (claimedCoupon) =>
            !updatedCoupons.some((coupon) => coupon.id === claimedCoupon.id)
        ),
      ];

      setCoupons(mergedCoupons);
      localStorage.setItem("coupons", JSON.stringify(mergedCoupons));
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  }, [distance, location.latitude, location.longitude]);

  const claimCoupon = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/coupons/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimed: true }),
      });
      const data = await response.json();
      const currentTime = Date.now();
      const updatedCoupons = coupons.map((coupon) =>
        coupon.id === id
          ? {
              ...coupon,
              quantity: data.quantity,
              claimed: true,
              remainingValidity: coupon.validity * 60000,
              claimedAt: currentTime,
            }
          : coupon
      );

      setCoupons(updatedCoupons);
      localStorage.setItem("coupons", JSON.stringify(updatedCoupons));

      const claimedCoupon = updatedCoupons.find((coupon) => coupon.id === id);

      if (claimedCoupon && location.latitude && location.longitude) {
        const { latitude: userLat, longitude: userLng } = location;
        const [couponLng, couponLat] = claimedCoupon.location.coordinates;
        const openRouteServiceUrl = `https://maps.openrouteservice.org/directions?n1=${userLat}&n2=${userLng}&n3=14&a=${userLat},${userLng},${couponLat},${couponLng}&b=0&c=0&k1=en-US&k2=km`;
        window.open(openRouteServiceUrl, "_blank");
      }
    } catch (error) {
      console.error("Error claiming coupon:", error);
    }
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchCoupons();
    }
  }, [location, distance, selectedCategories, fetchCoupons]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDiscoverClick = () => {
    fetchCoupons();
    navigate("/");
  };

  const toggleDistanceDropdown = () => {
    setShowDistanceDropdown(!showDistanceDropdown);
    setShowCategoryDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowDistanceDropdown(false);
  };

  const applyDistanceFilter = (newDistance) => {
    setDistance(newDistance);
    setShowDistanceDropdown(false);
  };

  const applyCategoryFilter = (categories) => {
    setSelectedCategories(categories);
    setShowCategoryDropdown(false);
  };

  const filteredCoupons = selectedCategories.length
    ? coupons.filter((coupon) =>
        selectedCategories.includes(coupon.productCategory)
      )
    : coupons;

  return (
    <div className="discover-container">
      <div className="left-column">
        <div className="header">
          <div className="header-text">
            <h3>Start to</h3>
            <h1>Discover</h1>
            <h3>Bereit für ein kleines Abenteuer?</h3>
          </div>
          <img className="logo" src="/NearYouLogo.png" alt="Logo" />
        </div>
        <div className="filters">
          <button className="filter-button" onClick={toggleDistanceDropdown}>
            Umkreis
          </button>
          <button className="filter-button" onClick={toggleCategoryDropdown}>
            Produktkategorie
          </button>
        </div>
        {showDistanceDropdown && (
          <DistanceDropdown distance={distance} onApply={applyDistanceFilter} />
        )}
        {showCategoryDropdown && (
          <CategoryDropdown
            selectedCategories={selectedCategories}
            onApply={applyCategoryFilter}
          />
        )}
        <div className="flavor-text">
          <p>
            Egal ob neu in der Stadt oder alter Hase. Mit NearYou findest du
            garantiert neue Aktivitäten, exklusive Deals und kulinarische
            Höhepunkte. Immer in deiner Nähe!
          </p>
          <p>
            Entdecke Restaurants, Events und Sonderaktionen, die deine Stadt zu
            bieten hat - Was gefunden? Mit der Chat-Funktion kannst du es gleich
            weiter erzählen!
          </p>
        </div>
        <div className="nav-buttons">
          <button className="styled-button" onClick={() => navigate("/create")}>
            CREATE
          </button>
          <button
            className="styled-button"
            onClick={() => navigate("/messages")}
          >
            CHAT
          </button>
        </div>
      </div>
      <div className="content-wrapper">
        <Coupons
          coupons={filteredCoupons}
          onClaim={claimCoupon}
          fetchCoupons={fetchCoupons}
        />
      </div>
    </div>
  );
};

export default Discoveries;
