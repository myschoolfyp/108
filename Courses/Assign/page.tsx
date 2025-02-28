"use client";
import { useState, useEffect } from "react";

interface ClassData {
  classLevel: string;
  className: string;
  stream: string;
}

interface CourseData {
  educationLevel: string;
  classLevel: string;
  courses: string[];
}

export default function AssignCourse() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("PrimaryLevel");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [finalizedData, setFinalizedData] = useState<
    { classLevel: string; className: string; stream: string; courses: string[] }[]
  >([]);

  // Fetch classes from the API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/Component/A/courses/assign");
        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/Component/A/courses?action=fetchCourses");
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setAllCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load courses");
      }
    };

    fetchCourses();
  }, []);

  // Filter courses by selected education level
  const filteredCourses = allCourses.filter(
    (course) => course.educationLevel === selectedLevel
  );

  // Handle class selection
  const handleSelectClass = (className: string) => {
    setSelectedClass(className);
  };

  // Handle course selection
  const handleSelectCourse = (course: string) => {
    setSelectedCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course]
    );
  };

  // Handle select all courses for a specific class level
  const handleSelectAll = (classCourses: string[]) => {
    if (selectedCourses.length === classCourses.length) {
      setSelectedCourses((prev) =>
        prev.filter((c) => !classCourses.includes(c))
      );
    } else {
      setSelectedCourses((prev) =>
        Array.from(new Set([...prev, ...classCourses])) // Fixed: Convert Set to Array
      );
    }
  };

  // Update finalized data dynamically
  useEffect(() => {
    if (selectedClass && selectedCourses.length > 0) {
      const classInfo = classes.find((cls) => cls.className === selectedClass);
      if (classInfo) {
        const updatedData = [
          {
            classLevel: classInfo.classLevel,
            className: selectedClass,
            stream: classInfo.stream,
            courses: selectedCourses,
          },
        ];
        setFinalizedData(updatedData);
      } else {
        setFinalizedData([]);
      }
    } else {
      setFinalizedData([]);
    }
  }, [selectedClass, selectedCourses, classes]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/Component/A/courses/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalizedData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmissionStatus({ success: true, message: result.message });
        // Clear selections after successful submission
        setSelectedClass("");
        setSelectedCourses([]);
        setFinalizedData([]);
      } else {
        setSubmissionStatus({ success: false, message: result.error });
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmissionStatus({
        success: false,
        message: "Failed to submit courses. Please try again.",
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-[#0F6466] mb-8 text-center">
        Course Assigning
      </h1>

      {/* Class Selection Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Select Class</h2>
        {isLoading && (
          <div className="text-center text-gray-600">Loading classes...</div>
        )}
        {error && (
          <div className="text-center text-red-600">Error: {error}</div>
        )}
        {!isLoading && !error && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a Class:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleSelectClass(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option
                  key={cls.className}
                  value={cls.className}
                >{`${cls.classLevel} - ${cls.className} - ${cls.stream}`}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Course Selection Section */}
      {selectedClass && (
        <div>
          <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Select Courses</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
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

            {/* Courses Table */}
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
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={cls.courses.every((c) =>
                                selectedCourses.includes(c)
                              )}
                              onChange={() => handleSelectAll(cls.courses)}
                              className="mr-2"
                            />
                            <span className="font-medium">Select All</span>
                          </label>
                          {cls.courses.map((course) => (
                            <label
                              key={course}
                              className="flex items-center"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCourses.includes(course)}
                                onChange={() => handleSelectCourse(course)}
                                className="mr-1"
                              />
                              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                {course}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Finalized Tray */}
      {finalizedData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Finalized Assignments</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0F6466] text-white">
                  <th className="p-2 text-left">Class Level</th>
                  <th className="p-2 text-left">Class Name</th>
                  <th className="p-2 text-left">Stream</th>
                  <th className="p-2 text-left">Assigned Courses</th>
                </tr>
              </thead>
              <tbody>
                {finalizedData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2">{data.classLevel}</td>
                    <td className="p-2">{data.className}</td>
                    <td className="p-2">{data.stream}</td>
                    <td className="p-2">
                      <ul className="list-disc pl-4">
                        {data.courses.map((course, idx) => (
                          <li key={idx}>{course}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submission Section */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {finalizedData.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={finalizedData.length === 0}
            className="bg-[#0F6466] text-white px-6 py-2 rounded-md hover:bg-[#0a4a4c] transition-colors disabled:opacity-50"
          >
            Confirm Submission
          </button>
        )}

        {submissionStatus && (
          <div
            className={`p-4 rounded-md ${
              submissionStatus.success
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {submissionStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}