"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CourseData {
  educationLevel: string;
  classLevel: string;
  courses: string[];
}

export default function ViewCourses() {
  const router = useRouter();
  const [coursesData, setCoursesData] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("PrimaryLevel");

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/Component/A/courses?action=fetchCourses");
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCoursesData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses by selected education level
  const filteredCourses = coursesData.filter(
    (course) => course.educationLevel === selectedLevel
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-[#0F6466] mb-8 text-center">
        School Course Catalog
      </h1>

      {/* Assign Courses Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => router.push("/Components/A/Courses/Assign")}
          className="bg-[#0F6466] text-white px-6 py-2 rounded-md hover:bg-[#0a4a4c] transition-colors"
        >
          Assign Courses
        </button>
      </div>

      {/* Level Selection Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setSelectedLevel("PrimaryLevel")}
          className={`px-6 py-2 rounded-md ${
            selectedLevel === "PrimaryLevel"
              ? "bg-[#0F6466] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Primary Level
        </button>
        <button
          onClick={() => setSelectedLevel("MiddleLevel")}
          className={`px-6 py-2 rounded-md ${
            selectedLevel === "MiddleLevel"
              ? "bg-[#0F6466] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Middle Level
        </button>
        <button
          onClick={() => setSelectedLevel("SecondaryLevel")}
          className={`px-6 py-2 rounded-md ${
            selectedLevel === "SecondaryLevel"
              ? "bg-[#0F6466] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Secondary Level
        </button>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center text-gray-600">Loading courses...</div>
      )}
      {error && (
        <div className="text-center text-red-600">Error: {error}</div>
      )}

      {/* Courses Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">
            {selectedLevel.replace("Level", " Level")} Courses
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F6466] text-white">
                <tr>
                  <th className="p-3 text-left min-w-[150px]">Class Level</th>
                  <th className="p-3 text-left">Courses</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((cls) => (
                  <tr
                    key={cls.classLevel}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">
                      {cls.classLevel.replace("_", " ")}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {cls.courses.map((course) => (
                          <span
                            key={course}
                            className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}