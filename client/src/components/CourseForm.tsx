import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Colors for the course badge
const COURSE_COLORS = [
  { value: "bg-blue-500", label: "Blue", preview: "bg-blue-500" },
  { value: "bg-indigo-500", label: "Indigo", preview: "bg-indigo-500" },
  { value: "bg-purple-500", label: "Purple", preview: "bg-purple-500" },
  { value: "bg-pink-500", label: "Pink", preview: "bg-pink-500" },
  { value: "bg-red-500", label: "Red", preview: "bg-red-500" },
  { value: "bg-orange-500", label: "Orange", preview: "bg-orange-500" },
  { value: "bg-amber-500", label: "Amber", preview: "bg-amber-500" },
  { value: "bg-green-500", label: "Green", preview: "bg-green-500" },
  { value: "bg-teal-500", label: "Teal", preview: "bg-teal-500" },
  { value: "bg-cyan-500", label: "Cyan", preview: "bg-cyan-500" },
];

type FormData = z.infer<typeof insertCourseSchema>;

interface CourseFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isPending: boolean;
}

export function CourseForm({ defaultValues, onSubmit, isPending }: CourseFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "",
      schedule: "",
      color: "bg-blue-500",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Code</FormLabel>
                <FormControl>
                  <Input placeholder="CS101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "bg-blue-500"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COURSE_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.preview}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input placeholder="Introduction to Computer Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule</FormLabel>
                <FormControl>
                  <Input placeholder="Mon/Wed 10:00 AM" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Room 304" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {defaultValues ? "Update Course" : "Create Course"}
        </Button>
      </form>
    </Form>
  );
}
