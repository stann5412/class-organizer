import { useState, useMemo } from "react";
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
  parseISO,
  startOfToday,
  addWeeks,
  subWeeks,
  isSameWeek,
  setHours,
  setMinutes
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

export default function CalendarPage() {
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: assignments } = useAssignments({ completed: false });
  const { data: courses } = useCourses();

  const next = () => setCurrentDate(view === "month" ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  const prev = () => setCurrentDate(view === "month" ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const weekStart = startOfWeek(currentDate);
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getAssignmentsForDay = (day: Date) => {
    return assignments?.filter(assignment => 
      isSameDay(parseISO(assignment.dueDate.toString()), day)
    ) || [];
  };

  const getClassesForDay = (day: Date) => {
    const dayName = format(day, "EEE").toUpperCase();
    const dayClasses: any[] = [];
    
    courses?.forEach(course => {
      course.weeklySchedule?.forEach((slot: string) => {
        if (slot.startsWith(dayName)) {
          const [_, timeRange] = slot.split(" ");
          const [start, end] = timeRange.split("-");
          dayClasses.push({ course, start, end, slot });
        }
      });
    });
    
    return dayClasses;
  };

  const getCourseColor = (color?: string | null) => {
    return color || "bg-slate-500";
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          {view === "month" ? format(currentDate, "MMMM yyyy") : `Week of ${format(weekStart, "MMM d, yyyy")}`}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={next}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div className="bg-card rounded-2xl p-6 border shadow-sm">
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center font-bold text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border border rounded-xl overflow-hidden shadow-sm">
        {calendarDays.map((day, idx) => {
          const dayAssignments = getAssignmentsForDay(day);
          const dayClasses = getClassesForDay(day);
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
                {dayClasses.map((cls, cIdx) => (
                  <div key={cIdx} className={cn(
                    "text-[9px] px-1 py-0.5 rounded border border-transparent truncate flex items-center gap-1 opacity-70",
                    getCourseColor(cls.course.color),
                    "text-white"
                  )}>
                    <span className="truncate font-medium">{cls.course.code}</span>
                  </div>
                ))}
                {dayAssignments.map(assignment => (
                  <TooltipProvider key={assignment.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "text-[9px] px-1 py-0.5 rounded border border-transparent cursor-default truncate flex items-center gap-1",
                          getCourseColor(assignment.courseColor),
                          "text-white"
                        )}>
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate font-bold">{assignment.title}</span>
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
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
      <div className="grid grid-cols-8 border-b">
        <div className="p-4 border-r bg-muted/20 text-xs font-bold text-muted-foreground flex items-end justify-center">Time</div>
        {weekDays.map(day => (
          <div key={day.toString()} className={cn(
            "p-4 text-center border-r last:border-r-0",
            isSameDay(day, new Date()) && "bg-primary/5"
          )}>
            <p className="text-xs font-bold text-muted-foreground uppercase">{format(day, "EEE")}</p>
            <p className={cn(
              "text-lg font-display font-bold",
              isSameDay(day, new Date()) && "text-primary"
            )}>{format(day, "d")}</p>
          </div>
        ))}
      </div>
      <div className="relative h-[900px] overflow-y-auto">
        <div className="grid grid-cols-8 h-full">
          <div className="border-r bg-muted/10">
            {HOURS.map(hour => (
              <div key={hour} className="h-[60px] border-b text-[10px] text-muted-foreground flex items-start justify-center pt-1 font-medium">
                {hour}:00
              </div>
            ))}
          </div>
          {weekDays.map(day => {
            const dayClasses = getClassesForDay(day);
            return (
              <div key={day.toString()} className="border-r last:border-r-0 relative bg-background/50">
                {HOURS.map(hour => (
                  <div key={hour} className="h-[60px] border-b border-dashed border-border/50" />
                ))}
                {dayClasses.map((cls, idx) => {
                  const [startH, startM] = cls.start.split(":").map(Number);
                  const [endH, endM] = cls.end.split(":").map(Number);
                  const top = (startH - 8) * 60 + startM;
                  const height = (endH * 60 + endM) - (startH * 60 + startM);
                  
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "absolute left-1 right-1 rounded-md p-2 text-white overflow-hidden shadow-sm border border-white/20",
                        getCourseColor(cls.course.color)
                      )}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <p className="text-[10px] font-bold truncate leading-tight">{cls.course.code}</p>
                      <p className="text-[9px] opacity-90 truncate leading-tight">{cls.course.name}</p>
                      <p className="text-[8px] mt-1 opacity-80 font-mono">{cls.start} - {cls.end}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {renderHeader()}
      {view === "month" ? renderMonthView() : renderWeekView()}
    </Layout>
  );
}
