import { db } from "./db";
import {
  courses, assignments, semesters,
  type Course, type Assignment, type AssignmentsQueryParams, type Semester
} from "@shared/schema";
import { eq } from "drizzle-orm";

export class DatabaseStorage {
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

  async getCourses(userId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.userId, userId));
  }

  async createCourse(course: any): Promise<Course> {
    // NETTOYAGE CRUCIAL : On s'assure d'envoyer un vrai objet JSON, pas une string
    let cleanSchedule = course.weeklySchedule;
    
    if (Array.isArray(cleanSchedule) && typeof cleanSchedule[0] === 'string') {
      try {
        // On extrait le JSON caché dans le tableau de texte
        cleanSchedule = JSON.parse(cleanSchedule[0]);
      } catch (e) {
        cleanSchedule = [];
      }
    }
    
    // Si c'est encore un objet seul, on le met dans un tableau
    if (cleanSchedule && !Array.isArray(cleanSchedule)) {
      cleanSchedule = [cleanSchedule];
    }

    const [newCourse] = await db.insert(courses)
      .values({
        userId: course.userId || "uottawa_student_demo",
        semesterId: course.semesterId ? Number(course.semesterId) : null,
        name: course.name,
        code: course.code,
        location: course.location || "",
        schedule: course.schedule || "",
        weeklySchedule: cleanSchedule || [],
        color: course.color || "bg-blue-500",
      })
      .returning();

    return newCourse;
  }

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