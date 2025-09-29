// frontend/src/pages/Onboarding.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Onboarding(){
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login or signup
  const navigate = useNavigate();

  // onboarding profile fields for logged-in users
  const [avatar, setAvatar] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    // If user is already logged in, fetch profile to prefill fields
    if (!loading && user) {
      (async ()=> {
        try {
          const res = await API.get("/auth/me");
          if (res.data) {
            setAvatar(res.data.avatar || "");
            setSkills((res.data.skills || []).join(", "));
          }
        } catch (err) {
          // ignore
        }
      })();
    }
  }, [loading, user]);

  // show loader while auth state resolving
  if (loading) return <div className="p-8">Loading...</div>;

  // If user is logged in, show onboarding/profile editor rather than login form
  if (user) {
    async function saveProfile(e) {
      e.preventDefault();
      setSaving(true);
      try {
        const skillsArr = skills.split(",").map(s=>s.trim()).filter(Boolean);
        const res = await API.post("/auth/profile", { avatar, skills: skillsArr });
        setSaving(false);
        // after saving, navigate to home
        navigate("/");
      } catch (err) {
        setSaving(false);
        alert("Failed to save profile");
      }
    }

    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.email}</h2>
        <form onSubmit={saveProfile} className="space-y-3">
          <label className="block">
            <div className="text-sm text-gray-600">Avatar URL</div>
            <input className="w-full p-2 border rounded" value={avatar} onChange={(e)=>setAvatar(e.target.value)} placeholder="https://..." />
          </label>

          <label className="block">
            <div className="text-sm text-gray-600">Skills (comma separated)</div>
            <input className="w-full p-2 border rounded" value={skills} onChange={(e)=>setSkills(e.target.value)} placeholder="react, js, css" />
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-2 rounded">{saving ? "Saving..." : "Save & Continue"}</button>
            <button type="button" onClick={()=>navigate("/")} className="px-3 py-2 border rounded">Skip</button>
          </div>
        </form>
      </div>
    );
  }

  // Guest: show sign in / sign up UI
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // automatically backend sync will happen once auth state changes (use API.post('/auth/sync') if desired)
      // give auth state handler time to process — but don't force redirect here; let onAuthStateChanged manage.
      navigate("/");
    } catch (err) {
      alert(err.message || "Auth failed");
    }
  }

  async function handleGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
      // once auth state updates, the app interceptor will add authorisation header for API
      navigate("/");
    } catch (err) {
      alert(err.message || "Google sign-in failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">{mode === "signup" ? "Create account" : "Sign in"}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" className="w-full p-2 border rounded" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-primary text-white py-2 rounded">{mode==="signup" ? "Sign up" : "Sign in"}</button>
          <button type="button" onClick={()=>setMode(mode==="signup"?"login":"signup")} className="px-3 py-2 border rounded">
            {mode==="signup" ? "Have an account?" : "Create"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <button onClick={handleGoogle} className="w-full py-2 rounded border">Continue with Google</button>
      </div>
    </div>
  );
}
