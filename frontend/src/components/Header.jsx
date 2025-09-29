import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header(){
  const { user, logout } = useAuth();
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">SkillLoops</Link>
        <div className="flex items-center gap-4">
          <Link to="/onboarding" className="text-sm text-gray-600">Onboarding</Link>
          {user ? (
            <>
              <span className="text-sm text-gray-700">{user.email}</span>
              <button className="px-3 py-1 bg-primary text-white rounded" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/onboarding" className="px-3 py-1 bg-primary text-white rounded">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
