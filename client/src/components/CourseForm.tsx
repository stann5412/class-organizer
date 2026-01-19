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
import { useQuery } from "@tanstack/react-query";

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
const SLOT_TYPES = ["Lecture", "DGD", "Lab", "Tutorial", "Seminar"];
const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly-even", label: "Bi-Weekly (Even weeks)" },
  { value: "bi-weekly-odd", label: "Bi-Weekly (Odd weeks)" },
];

type FormData = z.infer<typeof insertCourseSchema>;

interface CourseFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isPending: boolean;
}

export function CourseForm({ defaultValues, onSubmit, isPending }: CourseFormProps) {
  const { data: semesters } = useQuery<any[]>({ queryKey: ["/api/semesters"] });

  const form = useForm<FormData>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "",
      schedule: "",
      semesterId: null,
      weeklySchedule: [],
      color: "bg-blue-500",
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "weeklySchedule" as any,
  });

  const handleSlotChange = (index: number, field: string, value: string) => {
    const current = form.getValues(`weeklySchedule.${index}` as any) || JSON.stringify({ day: "MON", time: "09:00-10:00", type: "Lecture", freq: "weekly" });
    const data = typeof current === 'string' ? JSON.parse(current) : current;
    data[field] = value;
    form.setValue(`weeklySchedule.${index}` as any, JSON.stringify(data));
  };

  const getSlotData = (index: number) => {
    const current = form.getValues(`weeklySchedule.${index}` as any);
    if (!current) return { day: "MON", time: "09:00-10:00", type: "Lecture", freq: "weekly" };
    return typeof current === 'string' ? JSON.parse(current) : current;
  };

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
            name="semesterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select 
                  onValueChange={(val) => field.onChange(val === "none" ? null : Number(val))} 
                  value={field.value?.toString() || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No Semester</SelectItem>
                    {semesters?.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input placeholder="Introduction to CS" {...field} />
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
                      <SelectValue />
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
              </FormItem>
            )}
          />
        </div>

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
              onClick={() => append(JSON.stringify({ day: "MON", time: "09:00-10:00", type: "Lecture", freq: "weekly" }))}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Slot
            </Button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => {
              const data = getSlotData(index);
              return (
                <div key={field.id} className="p-3 border rounded-lg bg-muted/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Slot #{index + 1}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select onValueChange={(v) => handleSlotChange(index, "day", v)} value={data.day}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="09:00-10:00" defaultValue={data.time} onChange={(e) => handleSlotChange(index, "time", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select onValueChange={(v) => handleSlotChange(index, "type", v)} value={data.type}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SLOT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select onValueChange={(v) => handleSlotChange(index, "freq", v)} value={data.freq}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {defaultValues ? "Update Course" : "Create Course"}
        </Button>
      </form>
    </Form>
  );
}
