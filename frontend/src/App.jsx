import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Course from "./pages/Course";
import Practice from "./pages/Practice";
import Room from "./pages/Room";
import Header from "./components/Header";

export default function App(){
  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-4">
        <Routes>
          <Route index element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/courses/:id" element={<Course />} />
          <Route path="/practice/:challengeId" element={<Practice />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </main>
    </div>
  );
}
