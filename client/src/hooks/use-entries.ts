import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertEntry, type DaySummary, type HourSummary } from "@shared/schema";

// Helper to format currency consistently
export const formatCurrency = (amountInCents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountInCents / 100);
};

// GET /api/days - List of days with totals
export function useDays() {
  return useQuery({
    queryKey: [api.entries.listDays.path],
    queryFn: async () => {
      const res = await fetch(api.entries.listDays.path);
      if (!res.ok) throw new Error("Failed to fetch days");
      return api.entries.listDays.responses[200].parse(await res.json());
    },
  });
}

// GET /api/days/:date - Details for a specific day
export function useDayDetails(date: string) {
  return useQuery({
    queryKey: [api.entries.getDayDetails.path, date],
    queryFn: async () => {
      const url = buildUrl(api.entries.getDayDetails.path, { date });
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch day details");
      
      return api.entries.getDayDetails.responses[200].parse(await res.json());
    },
    enabled: !!date,
  });
}

// POST /api/entries - Add new revenue entry
export function useAddEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEntry) => {
      const res = await fetch(api.entries.create.path, {
        method: api.entries.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add entry");
      }
      
      return api.entries.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate both the days list and the specific day detail if it's open
      queryClient.invalidateQueries({ queryKey: [api.entries.listDays.path] });
      queryClient.invalidateQueries({ queryKey: [api.entries.getDayDetails.path, variables.date] });
    },
  });
}

// DELETE /api/days/:date - Clear all entries for a day
export function useClearDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      const url = buildUrl(api.entries.clearDay.path, { date });
      const res = await fetch(url, { method: api.entries.clearDay.method });
      
      if (!res.ok) {
        throw new Error("Failed to clear day");
      }
    },
    onSuccess: (_, date) => {
      queryClient.invalidateQueries({ queryKey: [api.entries.listDays.path] });
      queryClient.invalidateQueries({ queryKey: [api.entries.getDayDetails.path, date] });
    },
  });
}
