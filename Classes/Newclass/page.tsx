"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Newclass() {
    const [formData, setFormData] = useState({
      classLevel: "",
      className: "",
      stream: "General",
      students: [] as string[],
    });
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [selectedClassLevel, setSelectedClassLevel] = useState("");
  const [selectedStream, setSelectedStream] = useState("General");
  const [selectedTray, setSelectedTray] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const classLevels = Array.from({length: 10}, (_, i) => `Class ${i + 1}`);

  const validateClassName = (name: string) => {
    return /^[A-Za-z\s]{1,15}$/.test(name);
  };
  const handleClassLevelChange = (level: string) => {
    const isUpperClass = ["Class 9", "Class 10"].includes(level);
    setFormData({
      ...formData,
      classLevel: level,
      stream: isUpperClass ? formData.stream : "General"
    });
  };
  const toggleSelectAll = () => {
    if (!selectAll) {
      const allRollNos = studentsList.map(student => student.rollNo);
      setFormData(prev => ({ ...prev, students: allRollNos }));
    } else {
      setFormData(prev => ({ ...prev, students: [] }));
    }
    setSelectAll(!selectAll);
  };
  
  // Update addToTray function
const addToTray = () => {
    // Get selected roll numbers from formData
    const selectedRollNos = formData.students;
    
    // Find full student objects from studentsList
    const selectedStudents = studentsList.filter(student => 
      selectedRollNos.includes(student.rollNo)
    );
  
    // Filter out duplicates
    const uniqueStudents = selectedStudents.filter(student => 
      !selectedTray.some(s => s.rollNo === student.rollNo)
    );
  
    setSelectedTray(prev => [...prev, ...uniqueStudents]);
  };
  
  // Update removeFromTray function
  const removeFromTray = (rollNo: string) => {
    setSelectedTray(prev => prev.filter(student => student.rollNo !== rollNo));
    setFormData(prev => ({
      ...prev,
      students: prev.students.filter(r => r !== rollNo)
    }));
  }


  const fetchStudents = async () => {
    try {
      console.log("Fetching students with:", { 
        selectedClassLevel, 
        selectedStream 
      });
  
      // Validate class level selection
      if (!selectedClassLevel) {
        alert("Please select class level first");
        return;
      }
  
      const classLevel = parseInt(selectedClassLevel.split(" ")[1]);
      const params = new URLSearchParams({
        classLevel: classLevel.toString(),
        stream: selectedStream
      });
  
      console.log("Final API URL:", `/api/Component/A/classes/newclass?${params}`);
  
      const response = await fetch(`/api/Component/A/classes/newclass?${params}`);
      console.log("Response status:", response.status);
  
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch students");
      }
  
      const data = await response.json();
      console.log("Received data:", data);
  
      // Ensure we always set an array
      setStudentsList(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error("Full error details:", error);
      setStudentsList([]); // Reset to empty array on error
      
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate class name format
    if (!validateClassName(formData.className)) {
      alert("Class name must contain only letters (max 15 characters)");
      return;
    }
  
    // Validate student selection
    if (selectedTray.length === 0) {
      alert("Please select at least one student");
      return;
    }
  
    // Validate student roll numbers
    if (selectedTray.some(student => !student.rollNo)) {
      alert("Invalid student selection detected");
      return;
    }
  
    try {
      const response = await fetch("/api/Component/A/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel: formData.classLevel,
          className: formData.className,
          stream: formData.stream,
          students: selectedTray.map(student => student.rollNo) // Changed from ._id to .rollNo
        })
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || "Failed to create class");
      }
  
      // Reset form on success
      setFormData({
        classLevel: "",
        className: "",
        stream: "General",
        students: []
      });
      setSelectedTray([]);
      
      alert("Class created successfully!");
      window.location.href = "/Components/A/Classes";
  
    } catch (error) {
      console.error("Class creation failed:", error);
      
      let errorMessage = "Failed to create class";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Handle specific error cases
        if (errorMessage.includes("duplicate")) {
          errorMessage = "Class name already exists";
        } else if (errorMessage.includes("student")) {
          errorMessage = "Invalid student selection";
        }
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };
  // Add these rendering functions before the return statement
const renderStudentsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Roll No</th>
          </tr>
        </thead>
        <tbody>
          {studentsList.map((student) => (
            <tr key={student._id} className="border-t hover:bg-gray-50">
              <td className="p-2">
            
<input
  type="checkbox"
  checked={formData.students.includes(student.rollNo)}
  onChange={(e) => {
    const students = e.target.checked
      ? [...formData.students, student.rollNo]
      : formData.students.filter(r => r !== student.rollNo);
    setFormData(prev => ({ ...prev, students }));
  }}
/>
              </td>
              <td className="p-2">{student.firstName} {student.lastName}</td>
              <td className="p-2">{student.email}</td>
              <td className="p-2">{student.rollNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="mt-4 bg-[#0F6466] text-white px-4 py-2 rounded hover:bg-[#0D4B4C]"
        onClick={addToTray}
      >
        Add Selected Students
      </button>
    </div>
  );
  
  const renderTrayTable = () => (
    <div className="mt-8">
      <h4 className="text-lg font-semibold text-[#0F6466] mb-4">Selected Students</h4>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Roll No</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
          
{selectedTray.map((student) => (
  <tr key={student.rollNo} className="border-t hover:bg-gray-50">
    <td className="p-2">{student.rollNo}</td>
    <td className="p-2">{student.firstName} {student.lastName}</td>
    <td className="p-2">{student.email}</td>
    <td className="p-2">
      <button
        type="button"
        className="text-red-600 hover:text-red-800"
        onClick={() => removeFromTray(student.rollNo)}
      >
        Drop
      </button>
    </td>
  </tr>
))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0F6466] text-center mb-8">Create New Class</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Class Level</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.classLevel}
              onChange={(e) => setFormData({...formData, classLevel: e.target.value})}
              required
            >
              <option value="">Select Class Level</option>
              {classLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Class Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.className}
              onChange={(e) => setFormData({...formData, className: e.target.value})}
              required
            />
            {!validateClassName(formData.className) && (
              <p className="text-red-500 text-sm mt-1">
                Must contain only letters (max 15 characters)
              </p>
            )}
          </div>

          {["Class 9", "Class 10"].includes(formData.classLevel) && (
            <div>
              <label className="block text-gray-700 mb-2">Stream</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.stream}
                onChange={(e) => setFormData({...formData, stream: e.target.value})}
                required
              >
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Computer">Computer</option>
              </select>
            </div>
          )}
        </div>

        
      {/* Students Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#0F6466]">Add Students</h3>
        <button
          type="button"
          className="bg-[#0F6466] text-white px-4 py-2 rounded hover:bg-[#0D4B4C]"
          onClick={() => setShowStudentSelector(true)}
        >
          Add Students
        </button>

        {showStudentSelector && (
          <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student selection filters */}
              <div>
                <label className="block text-gray-700 mb-2">Class Level</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedClassLevel}
                  onChange={(e) => setSelectedClassLevel(e.target.value)}
                  required
                >
                  <option value="">Select Class Level</option>
                  {classLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {["Class 9", "Class 10"].includes(selectedClassLevel) && (
                <div>
                  <label className="block text-gray-700 mb-2">Stream</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    required
                  >
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                    <option value="Computer">Computer</option>
                  </select>
                </div>
              )}
            </div>

            <button
              type="button"
              className="bg-[#0F6466] text-white px-4 py-2 rounded hover:bg-[#0D4B4C]"
              onClick={fetchStudents}
            >
              Fetch Students
            </button>

            {/* Updated students table with selection features */}
            {studentsList.length > 0 ? (
              renderStudentsTable()
            ) : (
              <p className="text-gray-500">No students found for selected criteria</p>
            )}

            {/* Selected students tray */}
            {selectedTray.length > 0 && renderTrayTable()}
          </div>
        )}
      </div>
      

        <div className="flex justify-end gap-4 mt-8">
          <Link
            href="/Components/A/Classes"
            className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-[#0F6466] text-white px-6 py-2 rounded hover:bg-[#0D4B4C]"
          >
            Create Class
          </button>
        </div>
      </form>
    </div>
  );
}