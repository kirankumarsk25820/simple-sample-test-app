import { storage } from "../storage";
import type { MCQAnswer, CodingSubmission, TestResult } from "@shared/schema";

export class GradingService {
  async gradeMCQAnswers(studentId: number): Promise<{ score: number; total: number }> {
    const answers = await storage.getMCQAnswersByStudent(studentId);
    const questions = await storage.getAllMCQQuestions();
    
    let correct = 0;
    const total = questions.length;

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && answer.selectedAnswer === question.correctAnswer) {
        correct++;
        await storage.updateMCQAnswer(studentId, answer.questionId, { isCorrect: true });
      } else {
        await storage.updateMCQAnswer(studentId, answer.questionId, { isCorrect: false });
      }
    }

    return { score: correct, total };
  }

  async gradeCodingSubmission(submission: CodingSubmission): Promise<{ score: number; total: number }> {
    if (!submission.testResults) {
      return { score: 0, total: 0 };
    }

    const testResults = submission.testResults as TestResult[];
    const passed = testResults.filter(result => result.passed).length;
    const total = testResults.length;
    
    const score = Math.round((passed / total) * 100);
    
    await storage.updateCodingSubmission(submission.id, { 
      score,
      status: passed === total ? 'accepted' : 'partial'
    });

    return { score, total };
  }

  async calculateFinalScore(studentId: number): Promise<{
    mcqScore: number;
    codingScore: number;
    totalScore: number;
    mcqPercentage: number;
    codingPercentage: number;
  }> {
    // Grade MCQ section
    const mcqResult = await this.gradeMCQAnswers(studentId);
    const mcqPercentage = mcqResult.total > 0 ? (mcqResult.score / mcqResult.total) * 100 : 0;

    // Grade coding section
    const codingSubmissions = await storage.getCodingSubmissionsByStudent(studentId);
    let bestCodingScore = 0;
    
    for (const submission of codingSubmissions) {
      const codingResult = await this.gradeCodingSubmission(submission);
      if (submission.score && submission.score > bestCodingScore) {
        bestCodingScore = submission.score;
      }
    }

    const codingPercentage = bestCodingScore;

    // Calculate total score (MCQ: 40%, Coding: 60%)
    const totalScore = Math.round(mcqPercentage * 0.4 + codingPercentage * 0.6);

    // Update or create assessment result
    const existingResult = await storage.getAssessmentResult(studentId);
    const resultData = {
      studentId,
      mcqScore: mcqResult.score,
      codingScore: bestCodingScore,
      totalScore,
      completedAt: new Date()
    };

    if (existingResult) {
      await storage.updateAssessmentResult(studentId, resultData);
    } else {
      await storage.createAssessmentResult(resultData);
    }

    return {
      mcqScore: mcqResult.score,
      codingScore: bestCodingScore,
      totalScore,
      mcqPercentage,
      codingPercentage
    };
  }
}

export const gradingService = new GradingService();
