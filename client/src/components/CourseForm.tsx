import { useForm, useFieldArray } from "react-hook-form";
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
import { Loader2, Plus, Trash2, Clock } from "lucide-react";

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

const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

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
      weeklySchedule: [],
      color: "bg-blue-500",
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "weeklySchedule" as any,
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Weekly Schedule
            </FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append("")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Slot
            </Button>
          </div>
          
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-2 gap-2">
                   <Select 
                    onValueChange={(val) => {
                      const current = form.getValues(`weeklySchedule.${index}` as any) || "MON 09:00-10:00";
                      const [_, time] = (current as string).includes(" ") ? (current as string).split(" ") : ["MON", "09:00-10:00"];
                      form.setValue(`weeklySchedule.${index}` as any, `${val} ${time}`);
                    }}
                    defaultValue={(form.getValues(`weeklySchedule.${index}` as any) as string)?.split(" ")[0] || "MON"}
                   >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                   </Select>
                   <Input 
                    placeholder="HH:MM-HH:MM" 
                    defaultValue={(form.getValues(`weeklySchedule.${index}` as any) as string)?.split(" ")[1] || "09:00-10:00"}
                    onChange={(e) => {
                      const current = form.getValues(`weeklySchedule.${index}` as any) || "MON 09:00-10:00";
                      const [day, _] = (current as string).includes(" ") ? (current as string).split(" ") : ["MON", "09:00-10:00"];
                      form.setValue(`weeklySchedule.${index}` as any, `${day} ${e.target.value}`);
                    }}
                   />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No weekly slots added. Use "Add Slot" to schedule recurring classes.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
           <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legacy Notes</FormLabel>
                <FormControl>
                  <Input placeholder="Extra schedule info" {...field} value={field.value || ""} />
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
