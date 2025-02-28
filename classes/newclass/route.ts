import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import mongoose from 'mongoose';

const mongoUri = "mongodb://localhost:27017/myschool";

export async function GET(request: Request) {
  const client = new MongoClient(mongoUri);
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("classLevel");
    const stream = searchParams.get("stream");

    // Validate class level
    if (!classLevel || isNaN(Number(classLevel))) {
      return NextResponse.json(
        { message: "Valid class level parameter required" },
        { status: 400 }
      );
    }

    const parsedClassLevel = parseInt(classLevel);
    const isUpperClass = parsedClassLevel >= 9 && parsedClassLevel <= 10;
    let classType = "General";

    if (isUpperClass) {
      if (!stream || !["Arts", "Science", "Computer"].includes(stream)) {
        return NextResponse.json(
          { message: "Valid stream required for classes 9-10" },
          { status: 400 }
        );
      }
      classType = stream;
    }

    await client.connect();
    const db = client.db();

    const query = { 
      classLevel: parsedClassLevel,
      classType: classType
    };

    const students = await db.collection("students")
      .find(query)
      .project({ password: 0, _id: 0 })
      .toArray();

    if (!Array.isArray(students)) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(students);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Database error:", message);
    return NextResponse.json(
      { message: "Server error: " + message },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
    const client = new MongoClient(mongoUri);
    try {
        const { classLevel, className, stream, students } = await request.json();

        // Validate required fields
        if (!classLevel || !className) {
            return NextResponse.json(
                { message: "Class level and name are required" },
                { status: 400 }
            );
        }

        // Validate students format
        if (!Array.isArray(students) || students.some(rollNo => typeof rollNo !== 'string')) {
            return NextResponse.json(
                { message: "Invalid students format" },
                { status: 400 }
            );
        }

        await client.connect();
        const db = client.db();

        // Verify students exist by rollNo
        const existingStudents = await db.collection('students').countDocuments({
            rollNo: { $in: students }
        });

        if (existingStudents !== students.length) {
            return NextResponse.json(
                { message: "One or more students don't exist" },
                { status: 400 }
            );
        }

        // Generate new class-specific student IDs
        const classStudents = students; // Directly use the array of roll numbers

        // Create class document
        const newClass = {
            classLevel,
            className,
            stream: ["Class 9", "Class 10"].includes(classLevel) ? stream : "General",
            students: classStudents, // Now stores raw roll numbers
            createdAt: new Date(),
            updatedAt: new Date()
          };
        // Check for existing class
        const existingClass = await db.collection('classes').findOne({ className });
        if (existingClass) {
            return NextResponse.json(
                { message: "Class name already exists" },
                { status: 400 }
            );
        }

        // Insert new class
        const result = await db.collection('classes').insertOne(newClass);

        return NextResponse.json({
            message: "Class created successfully",
            classId: result.insertedId,
            className: className,
            students: classStudents
        }, { status: 201 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Class creation error:", message);
        return NextResponse.json(
            { message: "Server error: " + message },
            { status: 500 }
        );
    } finally {
        await client.close();
    }
}