import { db } from "./db";
import {
  courses, assignments,
  type InsertCourse, type InsertAssignment, type UpdateCourseRequest, type UpdateAssignmentRequest,
  type Course, type Assignment, type AssignmentsQueryParams
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Courses
  getCourses(userId: string): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, updates: UpdateCourseRequest): Promise<Course>;
  deleteCourse(id: number): Promise<void>;

  // Assignments
  getAssignments(userId: string, params?: AssignmentsQueryParams): Promise<(Assignment & { course?: Course })[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, updates: UpdateAssignmentRequest): Promise<Assignment>;
  deleteAssignment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Courses
  async getCourses(userId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.userId, userId));
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: any): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: number, updates: UpdateCourseRequest): Promise<Course> {
    const [updated] = await db.update(courses).set(updates).where(eq(courses.id, id)).returning();
    return updated;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Assignments
  async getAssignments(userId: string, params?: AssignmentsQueryParams): Promise<(Assignment & { course?: Course })[]> {
    const results = await db.select({
      assignment: assignments,
      course: courses
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(eq(courses.userId, userId));

    let filtered = results.map(r => ({ ...r.assignment, course: r.course }));

    if (params?.courseId) {
      filtered = filtered.filter(a => a.courseId === params.courseId);
    }
    if (params?.completed !== undefined) {
      filtered = filtered.filter(a => a.completed === params.completed);
    }
    if (params?.sortBy === 'dueDate') {
      filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    return filtered;
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }

  async updateAssignment(id: number, updates: UpdateAssignmentRequest): Promise<Assignment> {
    const [updated] = await db.update(assignments).set(updates).where(eq(assignments.id, id)).returning();
    return updated;
  }

  async deleteAssignment(id: number): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }
}

export const storage = new DatabaseStorage();
