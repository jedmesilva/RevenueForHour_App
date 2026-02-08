import { z } from "zod";
import { insertEntrySchema, entries } from "./schema";

export const api = {
  entries: {
    create: {
      method: "POST" as const,
      path: "/api/entries" as const,
      input: insertEntrySchema,
      responses: {
        201: z.custom<typeof entries.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    listDays: {
      method: "GET" as const,
      path: "/api/days" as const,
      responses: {
        200: z.array(z.object({
          date: z.string(),
          totalAmount: z.number(),
        })),
      },
    },
    getDayDetails: {
      method: "GET" as const,
      path: "/api/days/:date" as const,
      responses: {
        200: z.array(z.object({
          hour: z.number(),
          totalAmount: z.number(),
        })),
        404: z.object({ message: z.string() }),
      },
    },
    clearDay: {
      method: "DELETE" as const,
      path: "/api/days/:date" as const,
      responses: {
        204: z.void(),
        404: z.object({ message: z.string() }),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
