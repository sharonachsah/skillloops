// frontend/components/CourseCard.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * CourseCard
 * props:
 *  - course: { _id, title, description, tags, creatorUid, lessons }
 *  - compact: boolean (optional)
 */

export default function CourseCard({ course, compact = false }) {
  if (!course) return null;

  const lessonCount = Array.isArray(course.lessons) ? course.lessons.length : 0;
  const tags = course.tags || [];

  return (
    <Link to={`/courses/${course._id}`} className={`block group ${compact ? "" : "p-4"} bg-white rounded shadow hover:shadow-md transition`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">{course.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description || "No description provided."}</p>
          <div className="flex gap-2 flex-wrap mt-3">
            {tags.slice(0,3).map(t=>(
              <span key={t} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{t}</span>
            ))}
            {tags.length > 3 && <span className="text-xs text-slate-400">+{tags.length-3}</span>}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</div>
          <div className="mt-3">
            <span className="inline-block px-2 py-1 bg-primary text-white text-xs rounded">Open</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
