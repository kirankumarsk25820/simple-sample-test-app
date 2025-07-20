import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Timer from "@/components/Timer";
import MCQSection from "@/components/MCQSection";
import CodingSection from "@/components/CodingSection";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { StudentSession } from "@/lib/types";

const MCQ_TIME_LIMIT = 90 * 60; // 1.5 hours in seconds
const CODING_TIME_LIMIT = 180 * 60; // 3 hours in seconds

export default function Assessment() {
  const [currentSection, setCurrentSection] = useState<'login' | 'mcq' | 'coding' | 'completed'>('login');
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(true);
  const [loginForm, setLoginForm] = useState({ name: '', email: '' });
  const { toast } = useToast();

  const createStudentMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await apiRequest('POST', '/api/students', data);
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    },
    onSuccess: (data) => {
      setStudent(data);
      setShowLoginDialog(false);
      setCurrentSection('mcq');
      startTimer('mcq');
    },
    onError: (error: any) => {
      let description = "Failed to register for assessment";
      
      if (error?.code === "EMAIL_EXISTS") {
        description = error.message;
        // Clear email field so user can enter a different one
        setLoginForm(prev => ({ ...prev, email: '' }));
      } else if (error?.code === "VALIDATION_ERROR") {
        description = error.message;
      } else if (error?.message) {
        description = error.message;
      }
      
      toast({
        title: "Registration Error",
        description,
        variant: "destructive"
      });
    }
  });

  const startTimerMutation = useMutation({
    mutationFn: async ({ studentId, section }: { studentId: number; section: string }) => {
      const response = await apiRequest('POST', `/api/timer/start/${studentId}/${section}`);
      return response.json();
    }
  });

  const endTimerMutation = useMutation({
    mutationFn: async ({ studentId, section }: { studentId: number; section: string }) => {
      const response = await apiRequest('POST', `/api/timer/end/${studentId}/${section}`);
      return response.json();
    }
  });

  const startTimer = (section: string) => {
    if (student) {
      startTimerMutation.mutate({ studentId: student.id, section });
    }
  };

  const endTimer = (section: string) => {
    if (student) {
      endTimerMutation.mutate({ studentId: student.id, section });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.name && loginForm.email) {
      createStudentMutation.mutate(loginForm);
    }
  };

  const handleMCQComplete = () => {
    endTimer('mcq');
    setCurrentSection('coding');
    startTimer('coding');
    toast({
      title: "MCQ Section Completed",
      description: "Now proceeding to coding challenge",
    });
  };

  const handleCodingComplete = () => {
    endTimer('coding');
    setCurrentSection('completed');
    toast({
      title: "Assessment Completed",
      description: "Thank you for completing the assessment!",
    });
  };

  const handleTimeUp = () => {
    if (currentSection === 'mcq') {
      handleMCQComplete();
    } else if (currentSection === 'coding') {
      handleCodingComplete();
    }
    toast({
      title: "Time's Up!",
      description: `${currentSection.toUpperCase()} section time has ended`,
      variant: "destructive"
    });
  };

  // Fetch assessment results if completed
  const { data: assessmentResult } = useQuery({
    queryKey: ['/api/assessment-results/student', student?.id],
    enabled: currentSection === 'completed' && !!student?.id,
  });

  const { data: mcqAnswers } = useQuery({
    queryKey: ['/api/mcq-answers/student', student?.id],
    enabled: currentSection === 'completed' && !!student?.id,
  });

  const { data: codingSubmissions } = useQuery({
    queryKey: ['/api/coding-submissions/student', student?.id],
    enabled: currentSection === 'completed' && !!student?.id,
  });

  if (currentSection === 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Assessment Completed!</h1>
              <p className="text-slate-600 mb-4">
                Congratulations {student?.name}! You have successfully completed the coding assessment.
              </p>
              
              {assessmentResult && (
                <div className="bg-slate-50 rounded-lg p-6 mt-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {assessmentResult.mcqScore}%
                      </div>
                      <div className="text-sm text-slate-600">MCQ Score</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {mcqAnswers?.length || 0} questions answered
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {assessmentResult.codingScore}%
                      </div>
                      <div className="text-sm text-slate-600">Coding Score</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {codingSubmissions?.length || 0} problems attempted
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {assessmentResult.totalScore}%
                      </div>
                      <div className="text-sm text-slate-600">Overall Score</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Total time: {Math.round((assessmentResult.mcqTimeSpent + assessmentResult.codingTimeSpent) / 60)} minutes
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <p className="text-slate-600 mb-4">
                  Your detailed results have been saved. Our team will review your submission and get back to you soon.
                </p>
                <Link href="/admin-login">
                  <Button variant="outline" className="mr-4">
                    Admin Panel
                  </Button>
                </Link>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="default"
                >
                  Take Another Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Welcome to CodeAssess</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={loginForm.name}
                onChange={(e) => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={createStudentMutation.isPending}
            >
              {createStudentMutation.isPending ? 'Starting Assessment...' : 'Start Assessment'}
            </Button>
          </form>
          
          {/* Admin Login Link */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600 mb-2">Administrator?</p>
            <Link href="/admin-login">
              <Button variant="ghost" size="sm" className="text-slate-600">
                Admin Login
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      {student && (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-slate-800">CodeAssess</h1>
                <div className="hidden md:flex items-center space-x-4">
                  <Button
                    variant={currentSection === 'mcq' ? 'default' : 'ghost'}
                    disabled={currentSection === 'login' || currentSection === 'completed'}
                    size="sm"
                  >
                    MCQ Section
                  </Button>
                  <Button
                    variant={currentSection === 'coding' ? 'default' : 'ghost'}
                    disabled={currentSection === 'login' || currentSection === 'mcq'}
                    size="sm"
                  >
                    Coding Challenge
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {currentSection !== 'login' && currentSection !== 'completed' && (
                  <Timer
                    initialTime={currentSection === 'mcq' ? MCQ_TIME_LIMIT : CODING_TIME_LIMIT}
                    section={currentSection === 'mcq' ? 'MCQ Section' : 'Coding Challenge'}
                    onTimeUp={handleTimeUp}
                    isActive={true}
                  />
                )}
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">{student.name}</span>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      {currentSection === 'mcq' && student && (
        <MCQSection 
          studentId={student.id}
          onSectionComplete={handleMCQComplete}
        />
      )}

      {currentSection === 'coding' && student && (
        <CodingSection 
          studentId={student.id}
          onSectionComplete={handleCodingComplete}
        />
      )}
    </div>
  );
}
