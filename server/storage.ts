import { entries, type Entry, type InsertEntry, type DaySummary, type HourSummary } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  createEntry(entry: InsertEntry): Promise<Entry>;
  getEntriesByDate(date: string): Promise<HourSummary[]>;
  getAllDays(): Promise<DaySummary[]>;
  clearDay(date: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createEntry(entry: InsertEntry): Promise<Entry> {
    const [newEntry] = await db.insert(entries).values(entry).returning();
    return newEntry;
  }

  async getEntriesByDate(date: string): Promise<HourSummary[]> {
    // Group by hour and sum amounts
    const result = await db
      .select({
        hour: entries.hour,
        totalAmount: sql<number>`sum(${entries.amount})::int`,
      })
      .from(entries)
      .where(eq(entries.date, date))
      .groupBy(entries.hour);
    
    return result;
  }

  async getAllDays(): Promise<DaySummary[]> {
    const result = await db
      .select({
        date: entries.date,
        totalAmount: sql<number>`sum(${entries.amount})::int`,
      })
      .from(entries)
      .groupBy(entries.date)
      .orderBy(desc(entries.date));
      
    return result;
  }

  async clearDay(date: string): Promise<void> {
    await db.delete(entries).where(eq(entries.date, date));
  }
}

export const storage = new DatabaseStorage();
