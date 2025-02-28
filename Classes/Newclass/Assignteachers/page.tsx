"use client";
import { useState, useEffect } from "react";

interface ClassData {
  classLevel: string;
  className: string;
  stream: string;
  courses: string[];
  teachers?: { course: string; teacher: string }[]; // New field for teachers
}

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  department: string;
}

export default function TeacherAssignment() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [assignments, setAssignments] = useState<{ course: string; teacher: string; teacherId: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch classes from the API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/Component/A/classes/newclass/assignteachers?action=fetchClasses");
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch teachers when department is selected
  useEffect(() => {
    const fetchTeachers = async () => {
      if (selectedDepartment) {
        try {
          const response = await fetch(
            `/api/Component/A/classes/newclass/assignteachers?action=fetchTeachers&department=${selectedDepartment}`
          );
          const data = await response.json();
          setTeachers(data);
        } catch (err) {
          console.error("Error fetching teachers:", err);
        }
      }
    };
    fetchTeachers();
  }, [selectedDepartment]);

  // Handle teacher assignment to a course
  const handleAssignment = (course: string, teacherId: string) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    if (teacher) {
      setAssignments((prev) => [
        ...prev.filter((a) => a.course !== course),
        { 
          course, 
          teacher: `${teacher.firstName} ${teacher.lastName}`, 
          teacherId: teacher._id, // Add teacherId
        },
      ]);
    }
  };
  // Handle assigning one teacher to all courses
  const handleAssignToAll = (teacherId: string) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    if (teacher && selectedClass) {
      const classCourses = classes.find((cls) => cls.className === selectedClass)?.courses || [];
      const newAssignments = classCourses.map((course) => ({
        course,
        teacher: `${teacher.firstName} ${teacher.lastName}`,
        teacherId: teacher._id, // Add teacherId
      }));
      setAssignments(newAssignments);
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!selectedClass || assignments.length === 0) return;
  
    setIsSubmitting(true);
    setSubmissionStatus(null);
  
    try {
      const response = await fetch("/api/Component/A/classes/newclass/assignteachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className: selectedClass,
          teachers: assignments.map((a) => ({
            course: a.course,
            teacher: a.teacher,
            teacherId: a.teacherId, // Include teacherId
          })),
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit assignments");
      }
  
      const result = await response.json();
      setSubmissionStatus({ success: true, message: result.message });
  
      // Update local state with the new teachers data
      setClasses((prev) =>
        prev.map((cls) =>
          cls.className === selectedClass
            ? { ...cls, teachers: assignments }
            : cls
        )
      );
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to submit assignments. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-[#0F6466] mb-8 text-center">Teacher Assignment</h1>

      {/* Class Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Select Class</h2>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full p-3 border-2 border-[#0F6466] rounded-lg"
        >
          <option value="">Select a Class</option>
          {classes.map((cls) => (
            <option key={cls.className} value={cls.className}>
              {`${cls.classLevel} - ${cls.stream} - ${cls.className}`}
            </option>
          ))}
        </select>
      </div>

      {/* Show Courses and Department Selection */}
      {selectedClass && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Enrolled Courses</h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <ul className="list-disc pl-6">
                {classes
                  .find((cls) => cls.className === selectedClass)
                  ?.courses.map((course, index) => (
                    <li key={index} className="text-gray-700">
                      {course}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Department Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Select Department for Teachers</h2>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-3 border-2 border-[#0F6466] rounded-lg"
            >
              <option value="">Select Department</option>
              {['Arts', 'Maths', 'Chem', 'Physics', 'English', 'Urdu', 'Islamiat', 'History'].map(
                (dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                )
              )}
            </select>
          </div>
        </>
      )}

      {/* Teacher Assignment Section */}
      {selectedDepartment && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Assign Teachers</h2>

          {/* Assign to All Courses */}
          <div className="mb-6">
  <h3 className="text-md font-medium text-[#0F6466] mb-2">Assign One Teacher to All Courses</h3>
  <select
    onChange={(e) => handleAssignToAll(e.target.value)}
    className="w-full p-2 border rounded-md text-sm"
  >
    <option value="">Select Teacher</option>
    {teachers.map((teacher) => (
      <option key={teacher._id} value={teacher._id}>
        {`${teacher.firstName} ${teacher.lastName}`}
      </option>
    ))}
  </select>
</div>

          {/* Assign Teachers to Individual Courses */}
          <div className="space-y-4">
            {classes
              .find((cls) => cls.className === selectedClass)
              ?.courses.map((course) => (
                <div key={course} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
                  <span className="flex-1 font-medium text-gray-700">{course}</span>
                  <select
  onChange={(e) => handleAssignment(course, e.target.value)}
  value={assignments.find((a) => a.course === course)?.teacherId || ""}
  className="p-2 border rounded-md flex-1"
>
  <option value="">Select Teacher</option>
  {teachers.map((teacher) => (
    <option key={teacher._id} value={teacher._id}>
      {`${teacher.firstName} ${teacher.lastName}`}
    </option>
  ))}
</select>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Confirm Submission Button */}
      {assignments.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#2D9596] text-white px-6 py-2 rounded-md hover:bg-[#1d7879] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Confirm Submission"}
          </button>
        </div>
      )}

      {/* Submission Status */}
      {submissionStatus && (
        <div
          className={`mt-4 p-4 rounded-md text-center ${
            submissionStatus.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {submissionStatus.message}
        </div>
      )}
    </div>
  );
}