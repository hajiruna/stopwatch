import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Stopwatch records table
export const stopwatchRecords = pgTable("stopwatch_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title"),
  duration: integer("duration").notNull(), // in milliseconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStopwatchRecordSchema = createInsertSchema(stopwatchRecords).pick({
  userId: true,
  title: true,
  duration: true,
});

export type InsertStopwatchRecord = z.infer<typeof insertStopwatchRecordSchema>;
export type StopwatchRecord = typeof stopwatchRecords.$inferSelect;
