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
      return response.json();
    },
    onSuccess: (data) => {
      setStudent(data);
      setShowLoginDialog(false);
      setCurrentSection('mcq');
      startTimer('mcq');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register for assessment",
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

  if (currentSection === 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Assessment Completed!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for completing the coding assessment. Your results will be reviewed and you'll be contacted soon.
            </p>
            <Link href="/admin">
              <Button variant="outline">View Admin Panel</Button>
            </Link>
          </CardContent>
        </Card>
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
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">Admin Panel</Button>
                  </Link>
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
