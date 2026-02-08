import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  hour: integer("hour").notNull(), // 0-23
  amount: integer("amount").notNull(), // Stored in cents
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEntrySchema = createInsertSchema(entries).pick({
  date: true,
  hour: true,
  amount: true,
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entries.$inferSelect;

export type DaySummary = {
  date: string;
  totalAmount: number; // In cents
};

export type HourSummary = {
  hour: number;
  totalAmount: number; // In cents
};
