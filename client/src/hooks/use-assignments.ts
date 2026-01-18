import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Manual type definitions based on schema to satisfy TS until shared types are fully inferred
type InsertAssignment = {
  courseId: number;
  title: string;
  type: string;
  dueDate: string | Date; // Zod handles coercion
  description?: string | null;
  priority?: string | null;
  completed?: boolean;
};

export function useAssignments(filters?: { courseId?: number; completed?: boolean }) {
  // Convert boolean to string for URL search params if needed, but strict matches api schema
  const queryKey = [api.assignments.list.path, filters?.courseId, filters?.completed];

  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.assignments.list.path;
      const params = new URLSearchParams();
      if (filters?.courseId) params.append("courseId", filters.courseId.toString());
      if (filters?.completed !== undefined) params.append("completed", String(filters.completed));
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch assignments");
      // Coerce dates in response
      const data = await res.json();
      return api.assignments.list.responses[200].parse(data);
    },
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAssignment) => {
      // Ensure numeric/date coercion happens if needed
      const payload = {
        ...data,
        dueDate: new Date(data.dueDate), // Ensure Date object for serialization
      };
      const validated = api.assignments.create.input.parse(payload);
      
      const res = await fetch(api.assignments.create.path, {
        method: api.assignments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.assignments.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create assignment");
      }
      return api.assignments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assignments.list.path] });
      toast({ title: "Success", description: "Assignment added" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertAssignment>) => {
      // Helper to ensure dates are Dates
      const payload = { ...data };
      if (payload.dueDate) payload.dueDate = new Date(payload.dueDate);

      const validated = api.assignments.update.input.parse(payload);
      const url = buildUrl(api.assignments.update.path, { id });
      
      const res = await fetch(url, {
        method: api.assignments.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update assignment");
      return api.assignments.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assignments.list.path] });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.assignments.delete.path, { id });
      const res = await fetch(url, { method: api.assignments.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assignments.list.path] });
      toast({ title: "Deleted", description: "Assignment removed" });
    },
  });
}
