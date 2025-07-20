import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onLogin: (admin: any) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [, setLocation] = useLocation();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/admin/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        onLogin(data);
        setLocation('/admin');
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.name}!`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.email && loginForm.password) {
      loginMutation.mutate(loginForm);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Assessment Link */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Student Assessment
            </Button>
          </Link>
        </div>

        {/* Admin Login Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-800">
              Admin Login
            </CardTitle>
            <p className="text-slate-600">
              Access the assessment administration panel
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@codeassess.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            
            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-100 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-2">Demo Credentials:</p>
              <p className="text-sm text-slate-600">Email: admin@codeassess.com</p>
              <p className="text-sm text-slate-600">Password: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}