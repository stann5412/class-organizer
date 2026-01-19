import { useState } from "react";
import Layout from "@/components/Layout";
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CourseForm } from "@/components/CourseForm";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, MapPin, Clock, MoreVertical, Edit2, Trash2, CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { type Course } from "@shared/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Courses() {
  const { data: courses, isLoading } = useCourses();
  const { data: semesters } = useQuery<any[]>({ queryKey: ["/api/semesters"] });
  
  const { mutate: createCourse, isPending: isCreating } = useCreateCourse();
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();
  const { mutate: deleteCourse } = useDeleteCourse();

  const createSemester = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/semesters", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/semesters"] }),
  });

  const deleteSemesterMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/semesters/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/semesters"] }),
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [newSemester, setNewSemester] = useState({ name: "", startDate: "", endDate: "" });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Academic Setup</h1>
          <p className="text-muted-foreground">Manage semesters, courses, and schedules</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsSemesterOpen(true)}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Manage Semesters
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>
                  Setup your course and recurring weekly schedule.
                </DialogDescription>
              </DialogHeader>
              <CourseForm 
                isPending={isCreating} 
                onSubmit={(data) => {
                  createCourse(data, { onSuccess: () => setIsCreateOpen(false) });
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isSemesterOpen} onOpenChange={setIsSemesterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Academic Semesters</DialogTitle>
            <DialogDescription>Define your semester start and end dates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 p-4 border rounded-xl bg-muted/20">
              <Label className="text-xs font-bold uppercase">New Semester</Label>
              <Input placeholder="e.g. Winter 2026" value={newSemester.name} onChange={e => setNewSemester({...newSemester, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Start Date</Label>
                  <Input type="date" value={newSemester.startDate} onChange={e => setNewSemester({...newSemester, startDate: e.target.value})} />
                </div>
                <div>
                  <Label className="text-[10px]">End Date</Label>
                  <Input type="date" value={newSemester.endDate} onChange={e => setNewSemester({...newSemester, endDate: e.target.value})} />
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => createSemester.mutate(newSemester)} 
                disabled={!newSemester.name || !newSemester.startDate || !newSemester.endDate || createSemester.isPending}
              >
                Add Semester
              </Button>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Active Semesters</Label>
              {semesters?.map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                  <div>
                    <p className="font-bold text-sm">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.startDate} to {s.endDate}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSemesterMutation.mutate(s.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {courses?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/20">
          <div className="bg-background p-4 rounded-full inline-block shadow-sm mb-4">
            <CalendarDays className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold font-display">No courses yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
            Add your first course to start tracking assignments and schedules.
          </p>
          <Button onClick={() => setIsCreateOpen(true)} variant="outline">
            Add Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Card key={course.id} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className={cn("h-2 w-full", course.color || "bg-blue-500")} />
              <CardHeader className="pb-2 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full text-white mb-2 inline-block", course.color || "bg-blue-500")}>
                      {course.code}
                    </span>
                    <CardTitle className="font-display text-xl leading-tight">
                      {course.name}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingCourse(course)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingId(course.id)} 
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2 text-primary/60" />
                  {course.weeklySchedule?.length ? `${course.weeklySchedule.length} slots scheduled` : "No schedule"}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-primary/60" />
                  {course.location || "TBA"}
                </div>
                {course.semesterId && semesters && (
                  <div className="flex items-center text-xs text-primary font-medium mt-2 bg-primary/5 px-2 py-1 rounded w-fit">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {semesters.find(s => s.id === course.semesterId)?.name}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Link href={`/assignments?courseId=${course.id}`} className="w-full">
                  <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View Assignments
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <CourseForm 
              defaultValues={editingCourse}
              isPending={isUpdating}
              onSubmit={(data) => {
                updateCourse({ id: editingCourse.id, ...data }, { 
                  onSuccess: () => setEditingCourse(null) 
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this course
              and ALL associated assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingId && deleteCourse(deletingId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Layout>
  );
}
