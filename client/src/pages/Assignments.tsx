import { useState } from "react";
import Layout from "@/components/Layout";
import { useAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from "@/hooks/use-assignments";
import { useCourses } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AssignmentForm } from "@/components/AssignmentForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Loader2, Plus, Calendar, Flag, Book, Filter, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { type Assignment } from "@shared/schema";

export default function Assignments() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCourseId = searchParams.get("courseId") ? Number(searchParams.get("courseId")) : undefined;

  const [filterCourseId, setFilterCourseId] = useState<number | undefined>(initialCourseId);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("active");
  
  // Pass correct filter to hook
  const completedFilter = filterStatus === "all" ? undefined : filterStatus === "completed";
  const { data: assignments, isLoading } = useAssignments({ 
    courseId: filterCourseId,
    completed: completedFilter 
  });
  
  const { data: courses } = useCourses();
  const { mutate: createAssignment, isPending: isCreating } = useCreateAssignment();
  const { mutate: updateAssignment } = useUpdateAssignment();
  const { mutate: deleteAssignment } = useDeleteAssignment();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Helper to get course details
  const getCourse = (id: number) => courses?.find(c => c.id === id);

  const priorityColor = (p: string | null) => {
    switch(p?.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-amber-500 bg-amber-50';
      case 'low': return 'text-blue-500 bg-blue-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Assignments</h1>
          <p className="text-muted-foreground">Stay on top of your tasks</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 mr-2" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Assignment</DialogTitle>
            </DialogHeader>
            <AssignmentForm 
              isPending={isCreating} 
              preselectedCourseId={filterCourseId}
              onSubmit={(data) => {
                createAssignment(data, { onSuccess: () => setIsCreateOpen(false) });
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select 
          value={filterCourseId?.toString() || "all"} 
          onValueChange={(val) => setFilterCourseId(val === "all" ? undefined : Number(val))}
        >
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses?.map(course => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filterStatus} 
          onValueChange={(val: any) => setFilterStatus(val)}
        >
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">To Do</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignment List */}
      <div className="space-y-3">
        {assignments?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No assignments found matching your filters.
          </div>
        ) : (
          assignments?.map((assignment) => {
            const course = getCourse(assignment.courseId);
            const isOverdue = !assignment.completed && isPast(new Date(assignment.dueDate)) && !isToday(new Date(assignment.dueDate));
            
            return (
              <div 
                key={assignment.id} 
                className={cn(
                  "group flex items-center gap-4 p-4 rounded-xl border bg-card transition-all duration-200 hover:shadow-md",
                  assignment.completed && "opacity-60 bg-muted/20"
                )}
              >
                <Checkbox 
                  checked={assignment.completed}
                  onCheckedChange={(checked) => 
                    updateAssignment({ id: assignment.id, completed: !!checked })
                  }
                  className="h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary rounded-md"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider",
                      course?.color || "bg-gray-500"
                    )}>
                      {course?.code}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-red-600 bg-red-100 uppercase tracking-wider">
                        Overdue
                      </span>
                    )}
                  </div>
                  <h3 className={cn(
                    "font-medium text-lg truncate",
                    assignment.completed && "line-through text-muted-foreground"
                  )}>
                    {assignment.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Book className="w-3.5 h-3.5" />
                      {assignment.type}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1",
                      isOverdue ? "text-red-500 font-medium" : ""
                    )}>
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateLabel(new Date(assignment.dueDate))}
                    </span>
                  </div>
                </div>

                {/* Right side status/actions */}
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-full capitalize whitespace-nowrap hidden sm:inline-block",
                    priorityColor(assignment.priority || "medium")
                  )}>
                    {assignment.priority}
                  </span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => setEditingAssignment(assignment)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this assignment?")) {
                          deleteAssignment(assignment.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAssignment} onOpenChange={(open) => !open && setEditingAssignment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>
          {editingAssignment && (
            <AssignmentForm 
              defaultValues={{
                ...editingAssignment,
                dueDate: new Date(editingAssignment.dueDate)
              }}
              isPending={false}
              onSubmit={(data) => {
                updateAssignment({ id: editingAssignment.id, ...data }, { 
                  onSuccess: () => setEditingAssignment(null) 
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
