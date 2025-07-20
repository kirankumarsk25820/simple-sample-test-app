import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  currentSection: text("current_section").default("mcq"),
  mcqStartTime: timestamp("mcq_start_time"),
  codingStartTime: timestamp("coding_start_time"),
  mcqEndTime: timestamp("mcq_end_time"),
  codingEndTime: timestamp("coding_end_time"),
  isCompleted: boolean("is_completed").default(false),
});

export const mcqQuestions = pgTable("mcq_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
});

export const codingProblems = pgTable("coding_problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  tags: jsonb("tags").notNull(),
  testCases: jsonb("test_cases").notNull(),
  templateCode: jsonb("template_code").notNull(),
  constraints: text("constraints"),
});

export const mcqAnswers = pgTable("mcq_answers", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedAnswer: text("selected_answer"),
  isCorrect: boolean("is_correct"),
  timeSpent: integer("time_spent"),
});

export const codingSubmissions = pgTable("coding_submissions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  problemId: integer("problem_id").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  status: text("status").notNull(),
  testResults: jsonb("test_results"),
  score: integer("score").default(0),
  executionTime: integer("execution_time"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const assessmentResults = pgTable("assessment_results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  mcqScore: integer("mcq_score").default(0),
  codingScore: integer("coding_score").default(0),
  totalScore: integer("total_score").default(0),
  mcqTimeSpent: integer("mcq_time_spent").default(0),
  codingTimeSpent: integer("coding_time_spent").default(0),
  completedAt: timestamp("completed_at"),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  email: true,
});

export const insertMCQQuestionSchema = createInsertSchema(mcqQuestions).pick({
  question: true,
  options: true,
  correctAnswer: true,
  category: true,
  difficulty: true,
});

export const insertCodingProblemSchema = createInsertSchema(codingProblems).pick({
  title: true,
  description: true,
  difficulty: true,
  tags: true,
  testCases: true,
  templateCode: true,
  constraints: true,
});

export const insertMCQAnswerSchema = createInsertSchema(mcqAnswers).pick({
  studentId: true,
  questionId: true,
  selectedAnswer: true,
});

export const insertCodingSubmissionSchema = createInsertSchema(codingSubmissions).pick({
  studentId: true,
  problemId: true,
  code: true,
  language: true,
});

export const insertAdminSchema = createInsertSchema(admins).pick({
  email: true,
  password: true,
  name: true,
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type MCQQuestion = typeof mcqQuestions.$inferSelect;
export type InsertMCQQuestion = z.infer<typeof insertMCQQuestionSchema>;
export type CodingProblem = typeof codingProblems.$inferSelect;
export type InsertCodingProblem = z.infer<typeof insertCodingProblemSchema>;
export type MCQAnswer = typeof mcqAnswers.$inferSelect;
export type InsertMCQAnswer = z.infer<typeof insertMCQAnswerSchema>;
export type CodingSubmission = typeof codingSubmissions.$inferSelect;
export type InsertCodingSubmission = z.infer<typeof insertCodingSubmissionSchema>;
export type AssessmentResult = typeof assessmentResults.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
