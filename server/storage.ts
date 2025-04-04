import { users, type User, type InsertUser, stopwatchRecords, type StopwatchRecord, type InsertStopwatchRecord } from "@shared/schema";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Stopwatch record methods
  getStopwatchRecords(userId?: number): Promise<StopwatchRecord[]>;
  getStopwatchRecord(id: number): Promise<StopwatchRecord | undefined>;
  createStopwatchRecord(record: InsertStopwatchRecord): Promise<StopwatchRecord>;
  deleteStopwatchRecord(id: number): Promise<boolean>;
}

// Create database connection
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please configure it in your deployment settings.');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export class DBStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getStopwatchRecords(userId?: number): Promise<StopwatchRecord[]> {
    if (userId) {
      return await db.select().from(stopwatchRecords).where(eq(stopwatchRecords.userId, userId));
    }
    return await db.select().from(stopwatchRecords);
  }

  async getStopwatchRecord(id: number): Promise<StopwatchRecord | undefined> {
    const result = await db.select().from(stopwatchRecords).where(eq(stopwatchRecords.id, id));
    return result[0];
  }

  async createStopwatchRecord(record: InsertStopwatchRecord): Promise<StopwatchRecord> {
    const result = await db.insert(stopwatchRecords).values(record).returning();
    return result[0];
  }

  async deleteStopwatchRecord(id: number): Promise<boolean> {
    const result = await db.delete(stopwatchRecords).where(eq(stopwatchRecords.id, id)).returning();
    return result.length > 0;
  }
}

// For memory storage fallback (not needed now but kept for reference)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stopwatchRecords: Map<number, StopwatchRecord>;
  currentUserId: number;
  currentRecordId: number;

  constructor() {
    this.users = new Map();
    this.stopwatchRecords = new Map();
    this.currentUserId = 1;
    this.currentRecordId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStopwatchRecords(userId?: number): Promise<StopwatchRecord[]> {
    const records = Array.from(this.stopwatchRecords.values());
    if (userId) {
      return records.filter(record => record.userId === userId);
    }
    return records;
  }

  async getStopwatchRecord(id: number): Promise<StopwatchRecord | undefined> {
    return this.stopwatchRecords.get(id);
  }

  async createStopwatchRecord(insertRecord: InsertStopwatchRecord): Promise<StopwatchRecord> {
    const id = this.currentRecordId++;
    const now = new Date();
    const record: StopwatchRecord = { 
      id, 
      userId: insertRecord.userId ?? null,
      title: insertRecord.title ?? null,
      duration: insertRecord.duration,
      createdAt: now 
    };
    this.stopwatchRecords.set(id, record);
    return record;
  }

  async deleteStopwatchRecord(id: number): Promise<boolean> {
    return this.stopwatchRecords.delete(id);
  }
}

// Use database storage
export const storage = new DBStorage();
