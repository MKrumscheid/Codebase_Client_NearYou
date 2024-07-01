import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Discoveries from "./components/discoveries/discoveries";
import Create from "./components/create/Create";
import Messages from "./components/messages/messages";
import GeolocationProvider from "./components/helper_components/GeolocationProvider";

function App() {
  return (
    //its importan that GeoloactionProvider and Router are parents of the other components
    <GeolocationProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Discoveries />} />
            <Route path="/create" element={<Create />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </div>
      </Router>
    </GeolocationProvider>
  );
}

export default App;
