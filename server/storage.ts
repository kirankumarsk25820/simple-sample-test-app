import {
  students,
  mcqQuestions,
  codingProblems,
  mcqAnswers,
  codingSubmissions,
  assessmentResults,
  admins,
  type Student,
  type InsertStudent,
  type MCQQuestion,
  type InsertMCQQuestion,
  type CodingProblem,
  type InsertCodingProblem,
  type MCQAnswer,
  type InsertMCQAnswer,
  type CodingSubmission,
  type InsertCodingSubmission,
  type AssessmentResult,
  type Admin,
  type InsertAdmin,
} from "@shared/schema";

export interface IStorage {
  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;

  // MCQ Question operations
  getMCQQuestion(id: number): Promise<MCQQuestion | undefined>;
  getAllMCQQuestions(): Promise<MCQQuestion[]>;
  createMCQQuestion(question: InsertMCQQuestion): Promise<MCQQuestion>;
  updateMCQQuestion(id: number, updates: Partial<MCQQuestion>): Promise<MCQQuestion | undefined>;
  deleteMCQQuestion(id: number): Promise<boolean>;

  // Coding Problem operations
  getCodingProblem(id: number): Promise<CodingProblem | undefined>;
  getAllCodingProblems(): Promise<CodingProblem[]>;
  createCodingProblem(problem: InsertCodingProblem): Promise<CodingProblem>;
  updateCodingProblem(id: number, updates: Partial<CodingProblem>): Promise<CodingProblem | undefined>;
  deleteCodingProblem(id: number): Promise<boolean>;

  // MCQ Answer operations
  createMCQAnswer(answer: InsertMCQAnswer): Promise<MCQAnswer>;
  getMCQAnswersByStudent(studentId: number): Promise<MCQAnswer[]>;
  updateMCQAnswer(studentId: number, questionId: number, updates: Partial<MCQAnswer>): Promise<MCQAnswer | undefined>;

  // Coding Submission operations
  createCodingSubmission(submission: InsertCodingSubmission): Promise<CodingSubmission>;
  getCodingSubmissionsByStudent(studentId: number): Promise<CodingSubmission[]>;
  getAllCodingSubmissions(): Promise<CodingSubmission[]>;
  updateCodingSubmission(id: number, updates: Partial<CodingSubmission>): Promise<CodingSubmission | undefined>;

  // Assessment Result operations
  getAssessmentResult(studentId: number): Promise<AssessmentResult | undefined>;
  createAssessmentResult(result: Partial<AssessmentResult>): Promise<AssessmentResult>;
  updateAssessmentResult(studentId: number, updates: Partial<AssessmentResult>): Promise<AssessmentResult | undefined>;
  getAllAssessmentResults(): Promise<AssessmentResult[]>;

  // Admin operations
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAllAdmins(): Promise<Admin[]>;
}

export class MemStorage implements IStorage {
  private students: Map<number, Student>;
  private mcqQuestions: Map<number, MCQQuestion>;
  private codingProblems: Map<number, CodingProblem>;
  private mcqAnswers: Map<string, MCQAnswer>;
  private codingSubmissions: Map<number, CodingSubmission>;
  private assessmentResults: Map<number, AssessmentResult>;
  private admins: Map<number, Admin>;
  private currentStudentId: number;
  private currentMCQQuestionId: number;
  private currentCodingProblemId: number;
  private currentMCQAnswerId: number;
  private currentCodingSubmissionId: number;
  private currentAssessmentResultId: number;
  private currentAdminId: number;

  constructor() {
    this.students = new Map();
    this.mcqQuestions = new Map();
    this.codingProblems = new Map();
    this.mcqAnswers = new Map();
    this.codingSubmissions = new Map();
    this.assessmentResults = new Map();
    this.admins = new Map();
    this.currentStudentId = 1;
    this.currentMCQQuestionId = 1;
    this.currentCodingProblemId = 1;
    this.currentMCQAnswerId = 1;
    this.currentCodingSubmissionId = 1;
    this.currentAssessmentResultId = 1;
    this.currentAdminId = 1;

    this.seedData();
  }

  private seedData() {
    // Seed MCQ Questions
    const sampleMCQs: InsertMCQQuestion[] = [
      {
        question: "What is the time complexity of binary search?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: "O(log n)",
        category: "Algorithms",
        difficulty: "Medium"
      },
      {
        question: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: "Stack",
        category: "Data Structures",
        difficulty: "Easy"
      }
    ];

    sampleMCQs.forEach(mcq => this.createMCQQuestion(mcq));

    // Seed Coding Problems
    const sampleProblems: InsertCodingProblem[] = [
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        tags: ["Array", "Hash Table"],
        testCases: [
          {
            input: { nums: [2, 7, 11, 15], target: 9 },
            output: [0, 1]
          },
          {
            input: { nums: [3, 2, 4], target: 6 },
            output: [1, 2]
          }
        ],
        templateCode: {
          python: "def two_sum(nums, target):\n    # Write your solution here\n    pass",
          java: "public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n    return new int[0];\n}",
          cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}",
          c: "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your solution here\n    *returnSize = 0;\n    return NULL;\n}",
          javascript: "function twoSum(nums, target) {\n    // Write your solution here\n}"
        },
        constraints: "2 <= nums.length <= 10^4"
      }
    ];

    sampleProblems.forEach(problem => this.createCodingProblem(problem));

    // Seed admin user
    this.createAdmin({
      email: "admin@codeassess.com",
      password: "admin123", // In production, this should be hashed
      name: "Administrator"
    });
  }

  // Student operations
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.email === email);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = {
      ...insertStudent,
      id,
      currentSection: "mcq",
      mcqStartTime: null,
      codingStartTime: null,
      mcqEndTime: null,
      codingEndTime: null,
      isCompleted: false,
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  // MCQ Question operations
  async getMCQQuestion(id: number): Promise<MCQQuestion | undefined> {
    return this.mcqQuestions.get(id);
  }

  async getAllMCQQuestions(): Promise<MCQQuestion[]> {
    return Array.from(this.mcqQuestions.values());
  }

  async createMCQQuestion(insertQuestion: InsertMCQQuestion): Promise<MCQQuestion> {
    const id = this.currentMCQQuestionId++;
    const question: MCQQuestion = { ...insertQuestion, id };
    this.mcqQuestions.set(id, question);
    return question;
  }

  async updateMCQQuestion(id: number, updates: Partial<MCQQuestion>): Promise<MCQQuestion | undefined> {
    const question = this.mcqQuestions.get(id);
    if (!question) return undefined;
    
    const updatedQuestion = { ...question, ...updates };
    this.mcqQuestions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteMCQQuestion(id: number): Promise<boolean> {
    return this.mcqQuestions.delete(id);
  }

  // Coding Problem operations
  async getCodingProblem(id: number): Promise<CodingProblem | undefined> {
    return this.codingProblems.get(id);
  }

  async getAllCodingProblems(): Promise<CodingProblem[]> {
    return Array.from(this.codingProblems.values());
  }

  async createCodingProblem(insertProblem: InsertCodingProblem): Promise<CodingProblem> {
    const id = this.currentCodingProblemId++;
    const problem: CodingProblem = { ...insertProblem, id };
    this.codingProblems.set(id, problem);
    return problem;
  }

  async updateCodingProblem(id: number, updates: Partial<CodingProblem>): Promise<CodingProblem | undefined> {
    const problem = this.codingProblems.get(id);
    if (!problem) return undefined;
    
    const updatedProblem = { ...problem, ...updates };
    this.codingProblems.set(id, updatedProblem);
    return updatedProblem;
  }

  async deleteCodingProblem(id: number): Promise<boolean> {
    return this.codingProblems.delete(id);
  }

  // MCQ Answer operations
  async createMCQAnswer(insertAnswer: InsertMCQAnswer): Promise<MCQAnswer> {
    const id = this.currentMCQAnswerId++;
    const answer: MCQAnswer = {
      ...insertAnswer,
      id,
      isCorrect: null,
      timeSpent: null,
    };
    const key = `${insertAnswer.studentId}-${insertAnswer.questionId}`;
    this.mcqAnswers.set(key, answer);
    return answer;
  }

  async getMCQAnswersByStudent(studentId: number): Promise<MCQAnswer[]> {
    return Array.from(this.mcqAnswers.values()).filter(answer => answer.studentId === studentId);
  }

  async updateMCQAnswer(studentId: number, questionId: number, updates: Partial<MCQAnswer>): Promise<MCQAnswer | undefined> {
    const key = `${studentId}-${questionId}`;
    const answer = this.mcqAnswers.get(key);
    if (!answer) return undefined;
    
    const updatedAnswer = { ...answer, ...updates };
    this.mcqAnswers.set(key, updatedAnswer);
    return updatedAnswer;
  }

  // Coding Submission operations
  async createCodingSubmission(insertSubmission: InsertCodingSubmission): Promise<CodingSubmission> {
    const id = this.currentCodingSubmissionId++;
    const submission: CodingSubmission = {
      ...insertSubmission,
      id,
      status: "pending",
      testResults: null,
      score: 0,
      executionTime: null,
      submittedAt: new Date(),
    };
    this.codingSubmissions.set(id, submission);
    return submission;
  }

  async getCodingSubmissionsByStudent(studentId: number): Promise<CodingSubmission[]> {
    return Array.from(this.codingSubmissions.values()).filter(submission => submission.studentId === studentId);
  }

  async getAllCodingSubmissions(): Promise<CodingSubmission[]> {
    return Array.from(this.codingSubmissions.values());
  }

  async updateCodingSubmission(id: number, updates: Partial<CodingSubmission>): Promise<CodingSubmission | undefined> {
    const submission = this.codingSubmissions.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission = { ...submission, ...updates };
    this.codingSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Assessment Result operations
  async getAssessmentResult(studentId: number): Promise<AssessmentResult | undefined> {
    return this.assessmentResults.get(studentId);
  }

  async createAssessmentResult(insertResult: Partial<AssessmentResult>): Promise<AssessmentResult> {
    const id = this.currentAssessmentResultId++;
    const result: AssessmentResult = {
      id,
      studentId: insertResult.studentId!,
      mcqScore: insertResult.mcqScore || 0,
      codingScore: insertResult.codingScore || 0,
      totalScore: insertResult.totalScore || 0,
      mcqTimeSpent: insertResult.mcqTimeSpent || 0,
      codingTimeSpent: insertResult.codingTimeSpent || 0,
      completedAt: insertResult.completedAt || null,
    };
    this.assessmentResults.set(result.studentId, result);
    return result;
  }

  async updateAssessmentResult(studentId: number, updates: Partial<AssessmentResult>): Promise<AssessmentResult | undefined> {
    const result = this.assessmentResults.get(studentId);
    if (!result) return undefined;
    
    const updatedResult = { ...result, ...updates };
    this.assessmentResults.set(studentId, updatedResult);
    return updatedResult;
  }

  async getAllAssessmentResults(): Promise<AssessmentResult[]> {
    return Array.from(this.assessmentResults.values());
  }

  // Admin operations
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.email === email);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.currentAdminId++;
    const admin: Admin = {
      ...insertAdmin,
      id,
      createdAt: new Date(),
    };
    this.admins.set(id, admin);
    return admin;
  }

  async getAllAdmins(): Promise<Admin[]> {
    return Array.from(this.admins.values());
  }
}

export const storage = new MemStorage();
