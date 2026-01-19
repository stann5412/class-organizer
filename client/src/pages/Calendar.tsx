import { useState } from "react";
import Layout from "@/components/Layout";
import { useAssignments } from "@/hooks/use-assignments";
import { useCourses } from "@/hooks/use-courses";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: assignments } = useAssignments({ completed: false });
  const { data: courses } = useCourses();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getAssignmentsForDay = (day: Date) => {
    return assignments?.filter(assignment => 
      isSameDay(parseISO(assignment.dueDate.toString()), day)
    ) || [];
  };

  const getCourseColor = (courseId: number) => {
    const course = courses?.find(c => c.id === courseId);
    return course?.color || "bg-slate-500";
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Calendar</h1>
        <p className="text-muted-foreground">{format(currentDate, "MMMM yyyy")}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center font-bold text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    return (
      <div className="grid grid-cols-7 gap-px bg-border border rounded-xl overflow-hidden shadow-sm">
        {calendarDays.map((day, idx) => {
          const dayAssignments = getAssignmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[120px] bg-card p-2 transition-colors hover:bg-muted/50",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                  isToday && "bg-primary text-primary-foreground font-bold"
                )}>
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-1">
                {dayAssignments.map(assignment => (
                  <TooltipProvider key={assignment.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded border border-transparent cursor-default truncate flex items-center gap-1",
                          getCourseColor(assignment.courseId),
                          "text-white"
                        )}>
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{assignment.title}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-bold">{assignment.title}</p>
                          <p>{assignment.type}</p>
                          <p className="opacity-70">{format(parseISO(assignment.dueDate.toString()), "p")}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      {renderHeader()}
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        {renderDays()}
        {renderCells()}
      </div>
    </Layout>
  );
}
