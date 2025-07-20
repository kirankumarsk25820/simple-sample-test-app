import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MCQQuestion } from "@shared/schema";

interface MCQSectionProps {
  studentId: number;
  onSectionComplete: () => void;
}

export default function MCQSection({ studentId, onSectionComplete }: MCQSectionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  const { data: questions = [], isLoading } = useQuery<MCQQuestion[]>({
    queryKey: ['/api/mcq-questions'],
  });

  const { data: existingAnswers = [] } = useQuery({
    queryKey: ['/api/mcq-answers/student', studentId],
  });

  const saveAnswerMutation = useMutation({
    mutationFn: async (data: { questionId: number; selectedAnswer: string }) => {
      const response = await apiRequest('POST', '/api/mcq-answers', {
        studentId,
        questionId: data.questionId,
        selectedAnswer: data.selectedAnswer,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mcq-answers/student', studentId] });
    },
  });

  const updateAnswerMutation = useMutation({
    mutationFn: async (data: { questionId: number; selectedAnswer: string }) => {
      const response = await apiRequest('PUT', `/api/mcq-answers/${studentId}/${data.questionId}`, {
        selectedAnswer: data.selectedAnswer,
      });
      return response.json();
    },
  });

  useEffect(() => {
    if (existingAnswers.length > 0) {
      const answersMap: Record<number, string> = {};
      existingAnswers.forEach((answer: any) => {
        answersMap[answer.questionId] = answer.selectedAnswer;
      });
      setAnswers(answersMap);
    }
  }, [existingAnswers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-slate-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No questions available</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const completedCount = Object.keys(answers).length;
  const progress = (completedCount / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    const questionId = currentQuestion.id;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Check if this is a new answer or update
    const existingAnswer = existingAnswers.find((a: any) => a.questionId === questionId);
    if (existingAnswer) {
      updateAnswerMutation.mutate({ questionId, selectedAnswer: answer });
    } else {
      saveAnswerMutation.mutate({ questionId, selectedAnswer: answer });
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
    setVisited(prev => new Set([...prev, index]));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      handleQuestionNavigation(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      handleQuestionNavigation(currentQuestionIndex - 1);
    }
  };

  const handleFlag = () => {
    const questionIndex = currentQuestionIndex;
    setFlagged(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionIndex)) {
        newFlagged.delete(questionIndex);
      } else {
        newFlagged.add(questionIndex);
      }
      return newFlagged;
    });
  };

  const getQuestionStatus = (index: number) => {
    const questionId = questions[index]?.id;
    if (answers[questionId]) return 'answered';
    if (visited.has(index)) return 'visited';
    return 'unvisited';
  };

  const handleSubmit = () => {
    if (completedCount === questions.length) {
      onSectionComplete();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-slate-800">Multiple Choice Questions</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Progress:</span>
              <div className="flex items-center space-x-2">
                <Progress value={progress} className="w-48" />
                <span className="text-sm font-medium text-slate-700">
                  {completedCount}/{questions.length}
                </span>
              </div>
            </div>
          </div>
          
          {/* Question Navigation */}
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => {
              const status = getQuestionStatus(index);
              return (
                <Button
                  key={index}
                  variant={currentQuestionIndex === index ? "default" : "outline"}
                  size="sm"
                  className={`w-10 h-10 ${
                    status === 'answered' ? 'bg-green-500 text-white border-green-500' :
                    status === 'visited' ? 'bg-yellow-100 border-yellow-300' :
                    'bg-white border-slate-300'
                  } ${flagged.has(index) ? 'ring-2 ring-red-400' : ''}`}
                  onClick={() => handleQuestionNavigation(index)}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-800">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                {currentQuestion.category}
              </span>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-slate-700 leading-relaxed mb-4">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {(currentQuestion.options as string[]).map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = answers[currentQuestion.id] === option;
              
              return (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-primary bg-blue-50' 
                      : 'border-slate-200 hover:border-primary hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question${currentQuestion.id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswerSelect(option)}
                    className="mr-3 text-primary"
                  />
                  <span className="text-slate-700">
                    {optionLetter}) {option}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleFlag}
                className={flagged.has(currentQuestionIndex) ? 'text-red-600 border-red-300' : ''}
              >
                <Flag className="h-4 w-4 mr-2" />
                {flagged.has(currentQuestionIndex) ? 'Unflag' : 'Flag for Review'}
              </Button>
              
              {currentQuestionIndex === questions.length - 1 && completedCount === questions.length ? (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  Submit MCQ Section
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
