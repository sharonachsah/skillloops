// frontend/src/components/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header(){
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-primary">SkillLoops</Link>
          <Link to="/" className="text-sm text-gray-600 hover:underline">Courses</Link>
          <Link to="/rooms" className="text-sm text-gray-600 hover:underline">Rooms</Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => nav("/rooms")}
            className="text-sm px-3 py-1 border rounded hover:bg-slate-50"
          >
            Browse rooms
          </button>

          <button
            onClick={() => nav("/rooms")}
            className="text-sm px-3 py-1 bg-primary text-white rounded"
          >
            Create room
          </button>

          {user ? (
            <>
              <span className="text-sm text-gray-700">{user.email}</span>
              <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/onboarding" className="px-3 py-1 bg-primary text-white rounded">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
