import { db } from "./db";
import {
  courses, assignments, semesters,
  type Course, type Assignment, type AssignmentsQueryParams, type Semester
} from "@shared/schema";
import { eq } from "drizzle-orm";

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
    // FORCE LE FORMAT TABLEAU (JSON ARRAY)
    let finalSchedule = [];
    
    if (course.weeklySchedule) {
      if (Array.isArray(course.weeklySchedule)) {
        finalSchedule = course.weeklySchedule;
      } else if (typeof course.weeklySchedule === 'string') {
        try {
          const parsed = JSON.parse(course.weeklySchedule);
          finalSchedule = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          finalSchedule = [];
        }
      }
    }

    const [newCourse] = await db.insert(courses)
      .values({
        userId: course.userId || "uottawa_student_demo",
        semesterId: course.semesterId ? Number(course.semesterId) : null,
        name: course.name,
        code: course.code,
        location: course.location || "",
        schedule: course.schedule || "",
        weeklySchedule: finalSchedule, // Envoie [] au lieu de {}
        color: course.color || "bg-blue-500",
      })
      .returning();

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