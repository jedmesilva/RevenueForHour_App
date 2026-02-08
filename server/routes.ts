import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.entries.create.path, async (req, res) => {
    try {
      const input = api.entries.create.input.parse(req.body);
      const entry = await storage.createEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.entries.listDays.path, async (req, res) => {
    try {
      const days = await storage.getAllDays();
      res.json(days);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.entries.getDayDetails.path, async (req, res) => {
    try {
      const { date } = req.params;
      const hours = await storage.getEntriesByDate(date);
      // Map to full 24 hours structure if needed, or frontend handles it?
      // Frontend (from my generate_frontend prompt) expects "vertical list of hours (00:00 to 23:00)".
      // The DB returns only hours with data. The frontend logic (createDayStructure) handles filling the gaps.
      // But let's return just the data we have, it's cleaner.
      res.json(hours);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.entries.clearDay.path, async (req, res) => {
    try {
      const { date } = req.params;
      await storage.clearDay(date);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
