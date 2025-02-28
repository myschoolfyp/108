"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Classes() {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const response = await fetch("/api/Component/A/classes");
    const data = await response.json();
    setClasses(data);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#0F6466]">Class Management</h1>
        <div className="flex gap-4">
          <Link
            href="/Components/A/Classes/Newclass"
            className="flex items-center bg-[#0F6466] text-white px-6 py-2 rounded-lg hover:bg-[#0D4B4C] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Class
          </Link>
          <Link
            href="/Components/A/Classes/Newclass/Assignteachers"
            className="flex items-center bg-[#0F6466] text-white px-6 py-2 rounded-lg hover:bg-[#0D4B4C] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            Assign Teachers
          </Link>
          <Link
            href="/Components/A/Courses/Assign"
            className="flex items-center bg-[#0F6466] text-white px-6 py-2 rounded-lg hover:bg-[#0D4B4C] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Assign Courses
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#0F6466]"
          >
            <h3 className="text-xl font-bold text-[#0F6466] mb-2">
              {cls.className}
            </h3>
            <p className="text-gray-600">Level: {cls.classLevel}</p>
            {cls.stream && (
              <p className="text-gray-600">Stream: {cls.stream}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}