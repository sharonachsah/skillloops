// frontend/src/pages/Course.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function Course(){
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(()=>{
    if(!id) return;
    API.get(`/courses/${id}`).then(r=>setCourse(r.data)).catch(()=>{/*handle*/});
  }, [id]);

  if(!course) return <div>Loading...</div>;
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
      <p className="mb-4 text-gray-600">{course.description}</p>

      <div className="space-y-4">
        {course.lessons?.map((lesson, idx)=>(
          <div key={idx} className="p-4 bg-white rounded shadow">
            <h3 className="font-medium">{lesson.title}</h3>
            <p className="text-sm text-gray-500">{lesson.content}</p>
            {lesson.code && <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-x-auto">{lesson.code}</pre>}
          </div>
        ))}
      </div>
    </div>
  );
}