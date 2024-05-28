import React, { useState, useEffect, useCallback } from "react";
import "./discoveries.css";
import Coupons from "./coupons";
import { useGeolocation } from "../helper_components/GeolocationProvider";
import { useNavigate } from "react-router-dom";
import DistanceDropdown from "../drop_downs/DistanceDropdown";
import CategoryDropdown from "../drop_downs/CategoryDropdown";

const Discoveries = () => {
  //setting the states for the coupons, distance, selected categories, and the dropdowns. We use these for interaction with the user
  const [coupons, setCoupons] = useState([]); //keeping track of the coupons
  const [distance, setDistance] = useState(3000); //setting the distance to 3000 meters as default, can be changed by the user via the dropdown
  const [selectedCategories, setSelectedCategories] = useState([]); //setting the selected categories to an empty array, can be changed by the user via the dropdown
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false); //dont show the distance dropdown by default
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false); //dont show the category dropdown by default
  const location = useGeolocation(); //using the geolocation hook to get the location of the user
  const navigate = useNavigate(); //using the navigate hook to navigate between the different pages

  //fetching the coupons from the backend via the API
  const fetchCoupons = useCallback(async () => {
    //using the useCallback hook to memoize the function and only call it when the dependencies change (dependencies are distance, location.latitude and location.longitude)
    try {
      const response = await fetch(
        //Using a GET request to fetch the coupons from the backend with distance, longitude and latitude as parameters
        `http://localhost:3000/api/coupons/nearby/?distance=${distance}&latitude=${location.latitude}&longitude=${location.longitude}`
      );
      const data = await response.json(); //data now contains all nearby coupons send from the server

      const baseURL = "http://localhost:3000/"; //currently on localhost, change to the actual URL when deploying
      //getting the stored coupons from the local storage or an empty array if there are none
      const storedCoupons = JSON.parse(localStorage.getItem("coupons")) || [];
      const currentTime = Date.now();
      //mapping over all the coupons in data and adding the base URL to the company logo and product photo, since the db right now only sotres the relative path
      const updatedCoupons = data.map((coupon) => ({
        ...coupon,
        companyLogo: `${baseURL}${coupon.companyLogo}`,
        productPhoto: `${baseURL}${coupon.productPhoto}`,
      }));

      //filtering out the valid claimed coupons and adding the remaining validity to them
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

      //merging the updated coupons with the stored coupons and the valid claimed coupons
      const mergedCoupons = [
        ...updatedCoupons.map((coupon) => {
          //mapping over the updated coupons and adding the quantity, claimed, validity, remaining validity and claimed at to them
          const storedCoupon = storedCoupons.find((c) => c.id === coupon.id);
          //if the stored coupon exists, return the updated coupon with the quantity, claimed, validity, remaining validity and claimed at from the stored coupon
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
          //if the stored coupon does not exist, return the coupon with the remaining validity added
          return {
            ...coupon,
            remainingValidity: coupon.validity * 60000,
          };
        }),
        //filtering out the valid claimed coupons that are not in the updated coupons to then also merge them, since claimed coupons should always be shown, even if they are out of the specified distance
        ...validClaimedCoupons.filter(
          (claimedCoupon) =>
            !updatedCoupons.some((coupon) => coupon.id === claimedCoupon.id) //if the updated coupons do not contain the claimed coupon, return the claimed coupon
        ),
      ];

      setCoupons(mergedCoupons); //setting a new state for the coupons with the merged coupons
      localStorage.setItem("coupons", JSON.stringify(mergedCoupons)); //storing the merged coupons in the local storage
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  }, [distance, location.latitude, location.longitude]);

  const claimCoupon = async (id) => {
    try {
      //using a PATCH request to claim the coupon with the specified id
      const response = await fetch(`http://localhost:3000/api/coupons/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimed: true }),
      });
      const data = await response.json();
      const currentTime = Date.now();
      //mapping over the coupons (in the state) and updating the patched coupon with the specified id (the patched coupon is the one being claimed)
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

      //getting the claimed coupon from the updated coupons
      const claimedCoupon = updatedCoupons.find((coupon) => coupon.id === id);

      //if the claimed coupon exists and the location of the user is known, open the route service with the location of the user and the location of the claimed coupon
      if (claimedCoupon && location.latitude && location.longitude) {
        const { latitude: userLat, longitude: userLng } = location;
        const [couponLng, couponLat] = claimedCoupon.location.coordinates;
        const openRouteServiceUrl = `https://maps.openrouteservice.org/directions?n1=${userLat}&n2=${userLng}&n3=14&a=${userLat},${userLng},${couponLat},${couponLng}&b=0&c=0&k1=en-US&k2=km`;
        window.open(openRouteServiceUrl, "_blank"); //open the route service in a new tab
      }
    } catch (error) {
      console.error("Error claiming coupon:", error);
    }
  };

  //using the useEffect hook to fetch the coupons when the location of the user is known
  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchCoupons();
    }
  }, [location, distance, selectedCategories, fetchCoupons]); //dependencies are location, distance, selected categories and fetch coupons

  //using the useEffect hook to fetch the coupons when the component is mounted (on page load)
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  //functions to toggle the dropdowns and apply the filters
  const toggleDistanceDropdown = () => {
    setShowDistanceDropdown(!showDistanceDropdown);
    setShowCategoryDropdown(false);
  };

  //function to toggle the category dropdown
  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowDistanceDropdown(false);
  };

  //function to apply the distance filter
  const applyDistanceFilter = (newDistance) => {
    setDistance(newDistance);
    setShowDistanceDropdown(false);
  };

  //function to apply the category filter
  const applyCategoryFilter = (categories) => {
    setSelectedCategories(categories);
    setShowCategoryDropdown(false);
  };

  //filtering the coupons based on the selected categories
  //if the selected categories are empty, return all coupons, else return the coupons that have the product category included in the selected categories
  const filteredCoupons = selectedCategories.length
    ? coupons.filter(
        (coupon) => selectedCategories.includes(coupon.productCategory) //if the selected categories include the product category of the coupon, return the coupon
      )
    : coupons;

  //returning the JSX for the discoveries component
  return (
    <div className="discover-container">
      <div className="left-column">
        <div className="header">
          <div className="header-text">
            <h3>Start to</h3>
            <h1>DISCOVER</h1>
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
