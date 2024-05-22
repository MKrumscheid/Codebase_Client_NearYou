import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Discoveries from "./components/discoveries/discoveries";
import Create from "./components/create/Create";
import Messages from "./components/messages/messages";
import GeolocationProvider from "./components/helper_components/GeolocationProvider";

function App() {
  return (
    <GeolocationProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/discoveries" element={<Discoveries />} />
            <Route path="/create" element={<Create />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </div>
      </Router>
    </GeolocationProvider>
  );
}

export default App;
