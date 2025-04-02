import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStopwatchRecordSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stopwatch Records API
  
  // Get all stopwatch records
  app.get("/api/stopwatch-records", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const records = await storage.getStopwatchRecords(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching stopwatch records:", error);
      res.status(500).json({ error: "Failed to fetch stopwatch records" });
    }
  });

  // Get a specific stopwatch record
  app.get("/api/stopwatch-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const record = await storage.getStopwatchRecord(id);
      if (!record) {
        return res.status(404).json({ error: "Record not found" });
      }
      
      res.json(record);
    } catch (error) {
      console.error("Error fetching stopwatch record:", error);
      res.status(500).json({ error: "Failed to fetch stopwatch record" });
    }
  });

  // Create a new stopwatch record
  app.post("/api/stopwatch-records", async (req, res) => {
    try {
      const validationResult = insertStopwatchRecordSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid record data", 
          details: validationResult.error.format()
        });
      }
      
      const record = await storage.createStopwatchRecord(validationResult.data);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating stopwatch record:", error);
      res.status(500).json({ error: "Failed to create stopwatch record" });
    }
  });

  // Delete a stopwatch record
  app.delete("/api/stopwatch-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const success = await storage.deleteStopwatchRecord(id);
      if (!success) {
        return res.status(404).json({ error: "Record not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting stopwatch record:", error);
      res.status(500).json({ error: "Failed to delete stopwatch record" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
