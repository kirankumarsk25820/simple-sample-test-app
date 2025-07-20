import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Check, CheckCircle, XCircle, Clock } from "lucide-react";
import CodeEditor from "./CodeEditor";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CodingProblem } from "@shared/schema";

interface CodingSectionProps {
  studentId: number;
  onSectionComplete: () => void;
}

export default function CodingSection({ studentId, onSectionComplete }: CodingSectionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  const { data: problems = [], isLoading } = useQuery<CodingProblem[]>({
    queryKey: ['/api/coding-problems'],
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['/api/coding-submissions/student', studentId],
  });

  const executeCodeMutation = useMutation({
    mutationFn: async (data: { code: string; language: string; problemId: number; isSubmission?: boolean }) => {
      const response = await apiRequest('POST', '/api/execute-code', {
        code: data.code,
        language: data.language,
        problemId: data.problemId,
        studentId: data.isSubmission ? studentId : undefined,
      });
      return response.json();
    },
    onMutate: () => {
      setIsRunning(true);
    },
    onSuccess: (result) => {
      setTestResults(result.testResults || []);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/coding-submissions/student', studentId] });
      }
    },
    onSettled: () => {
      setIsRunning(false);
    },
  });

  useEffect(() => {
    if (problems.length > 0) {
      const currentProblem = problems[currentProblemIndex];
      const templateCode = currentProblem.templateCode as Record<string, string>;
      setCode(templateCode[selectedLanguage] || "");
    }
  }, [problems, currentProblemIndex, selectedLanguage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-slate-600">Loading coding problems...</p>
        </div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No coding problems available</p>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];
  const problemSubmissions = submissions.filter((s: any) => s.problemId === currentProblem.id);
  const bestSubmission = problemSubmissions.reduce((best: any, current: any) => {
    return (!best || current.score > best.score) ? current : best;
  }, null);

  const handleRunCode = () => {
    executeCodeMutation.mutate({
      code,
      language: selectedLanguage,
      problemId: currentProblem.id,
      isSubmission: false,
    });
  };

  const handleSubmitCode = () => {
    executeCodeMutation.mutate({
      code,
      language: selectedLanguage,
      problemId: currentProblem.id,
      isSubmission: true,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-slate-800">Coding Challenge</h2>
            <Badge className={getDifficultyColor(currentProblem.difficulty)}>
              {currentProblem.difficulty}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleRunCode}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </>
              )}
            </Button>
            
            <Button onClick={handleSubmitCode} disabled={isRunning}>
              <Check className="h-4 w-4 mr-2" />
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Problem Description */}
        <div className="w-1/2 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{currentProblem.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              {(currentProblem.tags as string[]).map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="prose max-w-none">
              <div className="text-slate-700 mb-4 whitespace-pre-wrap">
                {currentProblem.description}
              </div>
              
              {currentProblem.constraints && (
                <div className="mt-6">
                  <h4 className="text-slate-800 font-semibold mb-3">Constraints:</h4>
                  <div className="text-slate-700 whitespace-pre-wrap">
                    {currentProblem.constraints}
                  </div>
                </div>
              )}

              {/* Test Cases Examples */}
              <div className="mt-6">
                <h4 className="text-slate-800 font-semibold mb-3">Examples:</h4>
                {((currentProblem.testCases as any[]) || []).slice(0, 2).map((testCase, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                    <div className="font-mono text-sm">
                      <div><strong>Input:</strong> {JSON.stringify(testCase.input)}</div>
                      <div><strong>Output:</strong> {JSON.stringify(testCase.output)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor and Results */}
        <div className="w-1/2 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
            />
          </div>

          {/* Test Results Panel */}
          <div className="h-64 bg-white border-t border-slate-200">
            <Tabs defaultValue="results" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Test Results</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="results" className="p-4 h-full overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    Run your code to see test results
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.passed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {result.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`font-medium ${
                              result.passed ? 'text-green-800' : 'text-red-800'
                            }`}>
                              Test Case {index + 1}
                            </span>
                          </div>
                          <span className={`text-sm ${
                            result.passed ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {!result.passed && result.error && (
                          <div className="mt-2 text-sm text-red-700">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="submissions" className="p-4 h-full overflow-y-auto">
                {problemSubmissions.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    No submissions yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {problemSubmissions.map((submission: any, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={submission.status === 'accepted' ? 'default' : 'destructive'}>
                              {submission.status}
                            </Badge>
                            <span className="text-sm text-slate-600">{submission.language}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(submission.submittedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        {submission.score !== undefined && (
                          <div className="mt-2 text-sm">
                            Score: <span className="font-semibold">{submission.score}/100</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
