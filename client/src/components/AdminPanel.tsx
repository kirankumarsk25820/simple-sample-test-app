import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, CheckCircle, Clock, BarChart3, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertMCQQuestionSchema, insertCodingProblemSchema } from "@shared/schema";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: students = [] } = useQuery({
    queryKey: ['/api/students'],
  });

  const { data: assessmentResults = [] } = useQuery({
    queryKey: ['/api/assessment-results'],
  });

  const { data: mcqQuestions = [] } = useQuery({
    queryKey: ['/api/mcq-questions'],
  });

  const { data: codingProblems = [] } = useQuery({
    queryKey: ['/api/coding-problems'],
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['/api/coding-submissions'],
  });

  const completedStudents = students.filter((s: any) => s.isCompleted).length;
  const inProgressStudents = students.filter((s: any) => !s.isCompleted && (s.mcqStartTime || s.codingStartTime)).length;
  const avgScore = assessmentResults.length > 0 
    ? Math.round(assessmentResults.reduce((sum: number, result: any) => sum + result.totalScore, 0) / assessmentResults.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-800">Assessment Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="questions">Manage Questions</TabsTrigger>
              <TabsTrigger value="coding">Coding Problems</TabsTrigger>
              <TabsTrigger value="students">Student Results</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <DashboardContent 
                totalStudents={students.length}
                completedStudents={completedStudents}
                inProgressStudents={inProgressStudents}
                avgScore={avgScore}
                assessmentResults={assessmentResults}
                students={students}
              />
            </TabsContent>

            <TabsContent value="questions" className="mt-6">
              <QuestionManagement questions={mcqQuestions} />
            </TabsContent>

            <TabsContent value="coding" className="mt-6">
              <CodingProblemManagement problems={codingProblems} />
            </TabsContent>

            <TabsContent value="students" className="mt-6">
              <StudentResults 
                students={students}
                assessmentResults={assessmentResults}
                submissions={submissions}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent({ totalStudents, completedStudents, inProgressStudents, avgScore, assessmentResults, students }: any) {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Students</p>
                <p className="text-2xl font-semibold text-slate-900">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-semibold text-slate-900">{completedStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-semibold text-slate-900">{inProgressStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-slate-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Avg Score</p>
                <p className="text-2xl font-semibold text-slate-900">{avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>MCQ Score</TableHead>
                <TableHead>Coding Score</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessmentResults.slice(0, 10).map((result: any) => {
                const student = students.find((s: any) => s.id === result.studentId);
                return (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student?.name || 'Unknown'}</div>
                        <div className="text-sm text-slate-500">{student?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{result.mcqScore || 0}</TableCell>
                    <TableCell>{result.codingScore || 0}</TableCell>
                    <TableCell className="font-medium">{result.totalScore}%</TableCell>
                    <TableCell>
                      <Badge variant={result.completedAt ? "default" : "secondary"}>
                        {result.completedAt ? 'Completed' : 'In Progress'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {result.completedAt ? new Date(result.completedAt).toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionManagement({ questions }: any) {
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertMCQQuestionSchema.extend({
      options: z.array(z.string()).length(4, "Must have exactly 4 options"),
    })),
    defaultValues: {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      category: "",
      difficulty: "",
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/mcq-questions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mcq-questions'] });
      setIsCreating(false);
      form.reset();
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/mcq-questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mcq-questions'] });
    },
  });

  const onSubmit = (data: any) => {
    createQuestionMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Manage MCQ Questions</h3>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter your question here..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Data Structures">Data Structures</SelectItem>
                            <SelectItem value="Algorithms">Algorithms</SelectItem>
                            <SelectItem value="Object-Oriented Programming">Object-Oriented Programming</SelectItem>
                            <SelectItem value="Database Systems">Database Systems</SelectItem>
                            <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Answer Options</Label>
                  {[0, 1, 2, 3].map((index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`options.${index}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder={`Option ${String.fromCharCode(65 + index)}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {form.watch("options").map((option: string, index: number) => (
                            option && (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`}>{String.fromCharCode(65 + index)}) {option}</Label>
                              </div>
                            )
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-3">
                  <Button type="submit" disabled={createQuestionMutation.isPending}>
                    {createQuestionMutation.isPending ? 'Saving...' : 'Save Question'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question: any) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 mb-2">{question.question}</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="secondary">{question.category}</Badge>
                      <Badge variant="outline">{question.difficulty}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {(question.options as string[]).map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`p-2 rounded ${
                            option === question.correctAnswer
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}) {option}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteQuestionMutation.mutate(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CodingProblemManagement({ problems }: any) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(insertCodingProblemSchema.extend({
      tags: z.array(z.string()).min(1, "Must have at least one tag"),
      testCases: z.array(z.object({
        input: z.string(),
        expectedOutput: z.string(),
        explanation: z.string().optional()
      })).min(1, "Must have at least one test case"),
      templateCode: z.object({
        python: z.string().optional(),
        javascript: z.string().optional(),
        java: z.string().optional(),
        cpp: z.string().optional(),
        c: z.string().optional()
      })
    })),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "",
      tags: [],
      testCases: [{ input: "", expectedOutput: "", explanation: "" }],
      templateCode: {
        python: "def solution():\n    # Your solution here\n    pass",
        javascript: "function solution() {\n    // Your solution here\n}",
        java: "public class Solution {\n    public void solution() {\n        // Your solution here\n    }\n}",
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    return 0;\n}",
        c: "#include <stdio.h>\n\nint main() {\n    // Your solution here\n    return 0;\n}"
      },
      constraints: ""
    },
  });

  const createProblemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/coding-problems', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coding-problems'] });
      setIsCreating(false);
      form.reset();
    },
  });

  const deleteProblemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/coding-problems/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coding-problems'] });
    },
  });

  const updateProblemMutation = useMutation({
    mutationFn: async (data: { id: number, updates: any }) => {
      const response = await apiRequest('PUT', `/api/coding-problems/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coding-problems'] });
      setEditingProblem(null);
      form.reset();
    },
  });

  const onSubmit = (data: any) => {
    if (editingProblem) {
      updateProblemMutation.mutate({ id: editingProblem.id, updates: data });
    } else {
      createProblemMutation.mutate(data);
    }
  };

  const handleEdit = (problem: any) => {
    setEditingProblem(problem);
    form.reset({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags,
      testCases: problem.testCases,
      templateCode: problem.templateCode,
      constraints: problem.constraints || ""
    });
    setIsCreating(true);
  };

  const handleCancelEdit = () => {
    setEditingProblem(null);
    setIsCreating(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Manage Coding Problems</h3>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Add Problem
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProblem ? 'Edit Coding Problem' : 'Create New Coding Problem'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter problem title..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe the problem..." className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="constraints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Constraints (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 1 ≤ n ≤ 10^5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" disabled={createProblemMutation.isPending || updateProblemMutation.isPending}>
                    {(createProblemMutation.isPending || updateProblemMutation.isPending) ? 'Saving...' : (editingProblem ? 'Update Problem' : 'Save Problem')}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Problems ({problems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {problems.map((problem: any) => (
              <div key={problem.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800 mb-2">{problem.title}</h4>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{problem.description}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{problem.difficulty}</Badge>
                      {(problem.tags as string[]).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(problem)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProblemMutation.mutate(problem.id)}
                      disabled={deleteProblemMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentResults({ students, assessmentResults, submissions }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-800">Student Results</h3>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>MCQ Score</TableHead>
                <TableHead>Coding Score</TableHead>
                <TableHead>Total Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completion Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => {
                const result = assessmentResults.find((r: any) => r.studentId === student.id);
                const studentSubmissions = submissions.filter((s: any) => s.studentId === student.id);
                
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-slate-500">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {result ? `${result.mcqScore || 0}` : '-'}
                    </TableCell>
                    <TableCell>
                      {result ? `${result.codingScore || 0}` : '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {result ? `${result.totalScore}%` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.isCompleted ? "default" : "secondary"}>
                        {student.isCompleted ? 'Completed' : student.currentSection ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {result?.completedAt ? new Date(result.completedAt).toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
