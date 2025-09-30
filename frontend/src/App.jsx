import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Course from "./pages/Course";
import Practice from "./pages/Practice";
import Room from "./pages/Room";
import Challenges from "./pages/Challenges"
import Header from "./components/Header";
import RoomsList from "./pages/RoomsList";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-4">
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/courses/:id" element={<Course />} />
          <Route path="/practice/:challengeId" element={<Practice />} />
          <Route path="/rooms" element={<RoomsList />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/rooms/:code" element={<Room />} />
        </Routes>
      </main>
    </div>
  );
}
