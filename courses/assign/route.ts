import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ClassModel from "@/models/Class"; // Import the ClassModel correctly

// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

// GET handler to fetch classes
export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all classes, excluding the `students` field
    const classes = await ClassModel.find({}, { students: 0 }).exec();

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// POST handler to update courses
export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const updateData = Array.isArray(body) ? body : [body];

    const updateOperations = updateData.map(async (classData) => {
      // Validate required fields
      if (
        !classData.classLevel ||
        !classData.className ||
        !classData.stream ||
        !classData.courses
      ) {
        throw new Error(`Invalid class data: Missing required fields for ${classData.className}`);
      }

      // Update using the compound key
      const result = await ClassModel.findOneAndUpdate(
        {
          classLevel: classData.classLevel,
          className: classData.className,
          stream: classData.stream,
        },
        { $set: { courses: classData.courses } }, // Update the courses field
        { new: true, runValidators: true }
      );

      if (!result) {
        throw new Error(`Class ${classData.className} not found`);
      }

      return result;
    });

    const updatedClasses = await Promise.all(updateOperations);

    return NextResponse.json(
      {
        success: true,
        message:
          updatedClasses.length > 1
            ? "Courses updated for multiple classes!"
            : "Courses updated successfully!",
        updatedClasses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}