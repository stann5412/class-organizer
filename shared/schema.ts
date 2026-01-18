import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  code: text("code").notNull(),
  location: text("location"),
  schedule: text("schedule"), // e.g. "Mon/Wed 10:00 AM"
  color: text("color").default("blue"), // for UI styling
  createdAt: timestamp("created_at").defaultNow(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  type: text("type").notNull(), // Homework, Lab, Exam, Project
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false),
  description: text("description"),
  priority: text("priority").default("medium"), // Low, Medium, High
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const coursesRelations = relations(courses, ({ one, many }) => ({
  user: one(users, {
    fields: [courses.userId],
    references: [users.id],
  }),
  assignments: many(assignments),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, userId: true, createdAt: true });
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

// Request types
export type CreateCourseRequest = InsertCourse;
export type UpdateCourseRequest = Partial<InsertCourse>;

export type CreateAssignmentRequest = InsertAssignment;
export type UpdateAssignmentRequest = Partial<InsertAssignment>;

// Response types
export type CourseResponse = Course & { assignmentCount?: number };
export type AssignmentResponse = Assignment & { courseName?: string, courseColor?: string };

// Query/filter types
export interface AssignmentsQueryParams {
  courseId?: number;
  completed?: boolean;
  sortBy?: 'dueDate' | 'priority';
}
