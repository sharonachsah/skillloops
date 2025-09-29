import React, {useEffect, useState} from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

export default function Home(){
  const [courses, setCourses] = useState([]);
  useEffect(()=>{ API.get("/courses").then(r=>setCourses(r.data)).catch(()=>{}); }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Browse micro-courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map(c=>(
          <Link to={`/courses/${c._id}`} key={c._id} className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-sm text-gray-500">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
