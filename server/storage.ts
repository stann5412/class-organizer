import { db } from "./db";
import {
  courses, assignments, semesters,
  type Course, type Assignment, type AssignmentsQueryParams, type Semester
} from "@shared/schema";
import { eq } from "drizzle-orm";

// Interface pour éviter les erreurs "name does not exist on type any"
interface InsertSemester {
  name: string;
  userId: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export class DatabaseStorage {
  // Semestres
  async getSemesters(userId: string): Promise<Semester[]> {
    return await db.select().from(semesters).where(eq(semesters.userId, userId));
  }

  async createSemester(semester: InsertSemester): Promise<Semester> {
    // Conversion sécurisée des dates pour PostgreSQL
    const startDate = semester.startDate ? new Date(semester.startDate) : new Date();
    const endDate = semester.endDate ? new Date(semester.endDate) : new Date();

    const [newSemester] = await db.insert(semesters)
      .values({
        name: semester.name,
        userId: semester.userId,
        startDate: startDate,
        endDate: endDate,
      } as any)
      .returning();
    
    return newSemester;
  }

  // Cours
  async getCourses(userId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.userId, userId));
  }

  async createCourse(course: any): Promise<Course> {
    // On s'assure que l'ID du semestre est bien un nombre (clé étrangère)
    const formattedCourse = {
      ...course,
      semesterId: course.semesterId ? Number(course.semesterId) : null,
      userId: course.userId || "uottawa_student_demo"
    };

    const [newCourse] = await db.insert(courses).values(formattedCourse).returning();
    return newCourse;
  }

  // Devoirs (Assignments)
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