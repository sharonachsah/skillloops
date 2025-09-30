import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

export default function Challenges(){
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    API.get("/challenges").then(res=>{
      setChallenges(res.data || []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Challenges</h2>
        <Link to="/create-challenge" className="px-3 py-2 bg-primary text-white rounded">Create</Link>
      </div>

      {loading ? <div>Loading...</div> : (
        <ul className="space-y-3">
          {challenges.map(c=>(
            <li key={c._id} className="p-3 border rounded">
              <div className="font-medium">{c.title}</div>
              <div className="text-sm text-gray-600">{c.description}</div>
              <div className="mt-2">
                <Link to={`/challenges/${c._id}`} className="text-sm text-primary">View</Link>
              </div>
            </li>
          ))}
          {challenges.length === 0 && <li className="text-sm text-gray-600">No challenges yet.</li>}
        </ul>
      )}
    </div>
  );
}