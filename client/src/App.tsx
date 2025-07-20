import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Assessment from "@/pages/assessment";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";

function Router() {
  const [adminSession, setAdminSession] = useState<any>(null);

  return (
    <Switch>
      <Route path="/" component={Assessment} />
      <Route path="/admin-login">
        <AdminLogin onLogin={setAdminSession} />
      </Route>
      <Route path="/admin">
        {adminSession ? <Admin /> : <AdminLogin onLogin={setAdminSession} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
