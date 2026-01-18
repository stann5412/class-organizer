import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/Layout";
import { useAssignments, useUpdateAssignment } from "@/hooks/use-assignments";
import { useCourses } from "@/hooks/use-courses";
import { format, isSameDay, addDays, isAfter } from "date-fns";
import { Loader2, Calendar as CalendarIcon, CheckCircle2, Circle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: assignments, isLoading: loadingAssignments } = useAssignments({ completed: false });
  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { mutate: updateAssignment } = useUpdateAssignment();

  // Simple stats
  const pendingCount = assignments?.filter(a => !a.completed).length || 0;
  const dueThisWeek = assignments?.filter(a => {
    const due = new Date(a.dueDate);
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return isAfter(due, today) && isAfter(nextWeek, due);
  }).length || 0;

  if (loadingAssignments || loadingCourses) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get today's assignments
  const dueToday = assignments?.filter(a => isSameDay(new Date(a.dueDate), new Date())) || [];

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
          Welcome back, {user?.firstName || "Student"}!
        </h1>
        <p className="text-muted-foreground text-lg">
          You have {pendingCount} pending assignments, {dueThisWeek} due this week.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Assignments Pending</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks to complete</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due This Week</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{dueThisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">Keep up the pace!</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
            <BookIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{courses?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently enrolled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Focus */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <div className="h-6 w-1 bg-primary rounded-full" />
            Due Today
          </h2>
          
          {dueToday.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <div className="bg-muted p-3 rounded-full mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <p>No assignments due today!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dueToday.map((assignment) => {
                const course = courses?.find(c => c.id === assignment.courseId);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={assignment.id}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Checkbox 
                          checked={!!assignment.completed}
                          onCheckedChange={(checked) => 
                            updateAssignment({ id: assignment.id, completed: !!checked })
                          }
                          className="h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary"
                        />
                        <div className="flex-1">
                          <h3 className={cn("font-medium", assignment.completed && "line-through text-muted-foreground")}>
                            {assignment.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full text-white", course?.color || "bg-gray-500")}>
                              {course?.code}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                              {assignment.type}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Schedule / Upcoming */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <div className="h-6 w-1 bg-amber-400 rounded-full" />
            Class Schedule
          </h2>
          
          <div className="grid gap-3">
            {courses?.length === 0 ? (
              <p className="text-muted-foreground">No courses added yet.</p>
            ) : (
              courses?.map(course => (
                <div key={course.id} className="bg-card p-4 rounded-xl border flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-12 rounded-full", course.color)} />
                    <div>
                      <h4 className="font-bold font-display">{course.code}</h4>
                      <p className="text-sm font-medium">{course.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.location || "Location TBD"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                      {course.schedule || "No Schedule"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function BookIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
