import React, { createContext, useState, useEffect, useContext } from "react";

// Create a context to store the geolocation data
const GeolocationContext = createContext();
// Creating a custom hook to use the geolocation data
export const useGeolocation = () => useContext(GeolocationContext);

// Provider component to fetch and store the geolocation data using the Geolocation API from Mozilla
const GeolocationProvider = ({ children }) => {
  // State to store the geolocation data
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  // Function to fetch the geolocation data
  const getLocation = () => {
    if (navigator.geolocation) {
      // Check if geolocation is supported by the browser
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got location:", position.coords); // for debugging
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Fetch the geolocation data when the component mounts
  useEffect(() => {
    getLocation();
  }, []);

  // Provide the geolocation data to the children components
  return (
    <GeolocationContext.Provider value={location}>
      {children}
    </GeolocationContext.Provider>
  );
};

export default GeolocationProvider;
