import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import Assignments from "@/pages/Assignments";
import CalendarPage from "@/pages/Calendar";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      <Route path="/courses">
        <ProtectedRoute component={Courses} />
      </Route>
      
      <Route path="/assignments">
        <ProtectedRoute component={Assignments} />
      </Route>

      <Route path="/calendar">
        <ProtectedRoute component={CalendarPage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="uniplan-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
