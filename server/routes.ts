import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { codeExecutionService } from "./services/codeExecution";
import { gradingService } from "./services/grading";
import {
  insertStudentSchema,
  insertMCQQuestionSchema,
  insertCodingProblemSchema,
  insertMCQAnswerSchema,
  insertCodingSubmissionSchema,
  adminLoginSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Student routes
  app.post("/api/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error: any) {
      // Check for unique constraint violation (email already exists)
      if (error?.code === '23505' && error?.constraint === 'students_email_unique') {
        return res.status(400).json({ 
          message: "This email is already registered. Please use a different email address or contact support if this is your email.",
          code: "EMAIL_EXISTS"
        });
      }
      
      // Check for Zod validation errors
      if (error?.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Please check your name and email format.",
          code: "VALIDATION_ERROR",
          details: error.issues
        });
      }
      
      console.error("Student registration error:", error);
      res.status(500).json({ 
        message: "An error occurred during registration. Please try again.",
        code: "REGISTRATION_ERROR"
      });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student", error });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const student = await storage.updateStudent(id, updates);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to update student", error });
    }
  });

  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students", error });
    }
  });

  // MCQ Questions routes
  app.get("/api/mcq-questions", async (req, res) => {
    try {
      const questions = await storage.getAllMCQQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch MCQ questions", error });
    }
  });

  app.post("/api/mcq-questions", async (req, res) => {
    try {
      const questionData = insertMCQQuestionSchema.parse(req.body);
      const question = await storage.createMCQQuestion(questionData);
      res.json(question);
    } catch (error) {
      res.status(400).json({ message: "Invalid question data", error });
    }
  });

  app.put("/api/mcq-questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const question = await storage.updateMCQQuestion(id, updates);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to update question", error });
    }
  });

  app.delete("/api/mcq-questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMCQQuestion(id);
      if (!deleted) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete question", error });
    }
  });

  // Coding Problems routes
  app.get("/api/coding-problems", async (req, res) => {
    try {
      const problems = await storage.getAllCodingProblems();
      res.json(problems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coding problems", error });
    }
  });

  app.post("/api/coding-problems", async (req, res) => {
    try {
      const problemData = insertCodingProblemSchema.parse(req.body);
      const problem = await storage.createCodingProblem(problemData);
      res.json(problem);
    } catch (error) {
      res.status(400).json({ message: "Invalid problem data", error });
    }
  });

  app.put("/api/coding-problems/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const problem = await storage.updateCodingProblem(id, updates);
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      res.json(problem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update problem", error });
    }
  });

  app.delete("/api/coding-problems/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCodingProblem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Problem not found" });
      }
      res.json({ message: "Problem deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete problem", error });
    }
  });

  // MCQ Answers routes
  app.post("/api/mcq-answers", async (req, res) => {
    try {
      const answerData = insertMCQAnswerSchema.parse(req.body);
      const answer = await storage.createMCQAnswer(answerData);
      res.json(answer);
    } catch (error) {
      res.status(400).json({ message: "Invalid answer data", error });
    }
  });

  app.get("/api/mcq-answers/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const answers = await storage.getMCQAnswersByStudent(studentId);
      res.json(answers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch answers", error });
    }
  });

  app.put("/api/mcq-answers/:studentId/:questionId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const questionId = parseInt(req.params.questionId);
      const updates = req.body;
      const answer = await storage.updateMCQAnswer(studentId, questionId, updates);
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      res.json(answer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update answer", error });
    }
  });

  // Coding Submissions routes
  app.post("/api/coding-submissions", async (req, res) => {
    try {
      const submissionData = insertCodingSubmissionSchema.parse(req.body);
      const submission = await storage.createCodingSubmission(submissionData);
      res.json(submission);
    } catch (error) {
      res.status(400).json({ message: "Invalid submission data", error });
    }
  });

  app.get("/api/coding-submissions/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const submissions = await storage.getCodingSubmissionsByStudent(studentId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions", error });
    }
  });

  app.get("/api/coding-submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllCodingSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions", error });
    }
  });

  // Code execution routes
  app.post("/api/execute-code", async (req, res) => {
    try {
      const { code, language, problemId, studentId } = req.body;
      
      if (!code || !language || !problemId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const problem = await storage.getCodingProblem(problemId);
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }

      const testCases = problem.testCases as any[];
      const result = await codeExecutionService.executeCode(code, language, testCases);

      // If this is a submission (studentId provided), save it
      if (studentId) {
        // Calculate score based on passed test cases
        const passedTests = result.testResults?.filter(t => t.passed).length || 0;
        const totalTests = result.testResults?.length || 0;
        const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

        const submission = await storage.createCodingSubmission({
          studentId,
          problemId,
          code,
          language
        });

        await storage.updateCodingSubmission(submission.id, {
          status: result.success ? 'accepted' : (score > 0 ? 'partial' : 'failed'),
          testResults: result.testResults,
          score: score,
          executionTime: result.executionTime
        });

        // Also include score in response for UI feedback
        result.score = score;
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Code execution failed", error });
    }
  });

  // Assessment Results routes
  app.get("/api/assessment-results", async (req, res) => {
    try {
      const results = await storage.getAllAssessmentResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessment results", error });
    }
  });

  app.get("/api/assessment-results/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const result = await storage.getAssessmentResult(studentId);
      if (!result) {
        return res.status(404).json({ message: "Assessment result not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessment result", error });
    }
  });

  app.post("/api/assessment-results/calculate/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const result = await gradingService.calculateFinalScore(studentId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate final score", error });
    }
  });

  // Timer management routes
  app.post("/api/timer/start/:studentId/:section", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const section = req.params.section;
      
      const updates: any = { currentSection: section };
      if (section === 'mcq') {
        updates.mcqStartTime = new Date();
      } else if (section === 'coding') {
        updates.codingStartTime = new Date();
      }

      const student = await storage.updateStudent(studentId, updates);
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to start timer", error });
    }
  });

  app.post("/api/timer/end/:studentId/:section", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const section = req.params.section;
      
      const updates: any = {};
      if (section === 'mcq') {
        updates.mcqEndTime = new Date();
      } else if (section === 'coding') {
        updates.codingEndTime = new Date();
        updates.isCompleted = true;
      }

      const student = await storage.updateStudent(studentId, updates);
      
      // Calculate final score when assessment is completed
      if (updates.isCompleted) {
        await gradingService.calculateFinalScore(studentId);
      }

      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to end timer", error });
    }
  });

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const loginData = adminLoginSchema.parse(req.body);
      const admin = await storage.getAdminByEmail(loginData.email);
      
      if (!admin || admin.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // In production, you would use proper session management
      res.json({ 
        id: admin.id, 
        email: admin.email, 
        name: admin.name,
        success: true 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
