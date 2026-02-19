import { db } from "./db";
import {
  courses, assignments, semesters,
  type Course, type Assignment, type AssignmentsQueryParams, type Semester
} from "@shared/schema";
import { eq } from "drizzle-orm";

// Interface pour le typage TypeScript
interface InsertSemester {
  name: string;
  userId: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export class DatabaseStorage {
  // --- SEMESTRES ---
  async getSemesters(userId: string): Promise<Semester[]> {
    return await db.select().from(semesters).where(eq(semesters.userId, userId));
  }

 async createSemester(semester: any): Promise<Semester> {
  const formatDate = (d: any) => {
    if (!d) return new Date().toISOString().split('T')[0];
    const date = new Date(d);
    return date.toISOString().split('T')[0]; 
  };

  // On extrait les valeurs SANS l'id pour laisser le SERIAL de Postgres s'en charger
  const valuesToInsert = {
    user_id: semester.userId,
    name: semester.name,
    start_date: formatDate(semester.startDate),
    end_date: formatDate(semester.endDate),
  };

  // Utilise db.execute pour contourner les problèmes de mapping de Drizzle si nécessaire
  // OU utilise le format standard mais vérifie bien les clés :
  const [newSemester] = await db.insert(semesters)
    .values({
      userId: semester.userId,
      name: semester.name,
      startDate: formatDate(semester.startDate),
      endDate: formatDate(semester.endDate),
    })
    .returning();
    
  return newSemester;
}

  // --- COURS ---
  async getCourses(userId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.userId, userId));
  }

  async createCourse(course: any): Promise<Course> {
    // On s'assure que l'ID du semestre est bien un nombre et que l'utilisateur est défini
    const formattedCourse = {
      ...course,
      semesterId: course.semesterId ? Number(course.semesterId) : null,
      userId: course.userId || "uottawa_student_demo"
    };

    const [newCourse] = await db.insert(courses).values(formattedCourse).returning();
    return newCourse;
  }

  // --- DEVOIRS (ASSIGNMENTS) ---
  async getAssignments(userId: string, params?: AssignmentsQueryParams): Promise<(Assignment & { course?: Course })[]> {
    const results = await db.select({
      assignment: assignments,
      course: courses
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(eq(courses.userId, userId));

    return results.map(r => ({ ...r.assignment, course: r.course }));
  }
}

export const storage = new DatabaseStorage();