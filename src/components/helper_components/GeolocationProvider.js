import React, { createContext, useState, useEffect, useContext } from "react";

// Create a context to store the geolocation data
const GeolocationContext = createContext();

// Creating a custom hook to use the geolocation data
export const useGeolocation = () => useContext(GeolocationContext);

// Provider component to fetch and store the geolocation data using the Geolocation API from Mozilla
const GeolocationProvider = ({ children }) => {
  // State to store the geolocation data
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    let watchId;

    // Function to update the geolocation data
    const updateLocation = (position) => {
      console.log("Updated location:", position.coords); // for debugging
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    const handleError = (error) => {
      console.error("Error fetching location:", error);
    };

    if (navigator.geolocation) {
      // Start watching the geolocation
      watchId = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: true, // Optional: for more accurate results
          timeout: 10000, // Optional: set maximum time allowed to return a result
          maximumAge: 0, // Optional: set to 0 to ensure fresh results
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    // Clean up the watch when the component is unmounted
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Provide the geolocation data to the children components
  return (
    <GeolocationContext.Provider value={location}>
      {children}
    </GeolocationContext.Provider>
  );
};

export default GeolocationProvider;
