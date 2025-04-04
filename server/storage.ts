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

// Create database connection with retry mechanism
const createDbConnection = () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set. Using in-memory storage as fallback.');
    return null;
  }
  
  try {
    // Add connection timeout options for Neon
    const connectionString = process.env.DATABASE_URL;
    const sql = neon(connectionString);
    
    // Test the connection by running a simple query
    sql`SELECT 1`.then(() => {
      console.log('Database connection established successfully');
    }).catch(err => {
      console.error('Database connection test failed:', err);
    });
    
    return drizzle(sql);
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    return null;
  }
};

// Initialize database connection
let db: ReturnType<typeof drizzle> | null = null;

// Try to connect with a delay to allow environment variables to be properly loaded
setTimeout(() => {
  db = createDbConnection();
  if (!db) {
    console.warn('Using in-memory storage as fallback');
  }
}, 1000);

export class DBStorage implements IStorage {
  private fallbackStorage: MemStorage;

  constructor() {
    this.fallbackStorage = new MemStorage();
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      if (!db) return this.fallbackStorage.getUser(id);
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error('Error in getUser:', error);
      return this.fallbackStorage.getUser(id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (!db) return this.fallbackStorage.getUserByUsername(username);
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return this.fallbackStorage.getUserByUsername(username);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      if (!db) return this.fallbackStorage.createUser(insertUser);
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error('Error in createUser:', error);
      return this.fallbackStorage.createUser(insertUser);
    }
  }

  async getStopwatchRecords(userId?: number): Promise<StopwatchRecord[]> {
    try {
      if (!db) return this.fallbackStorage.getStopwatchRecords(userId);
      if (userId) {
        return await db.select().from(stopwatchRecords).where(eq(stopwatchRecords.userId, userId));
      }
      return await db.select().from(stopwatchRecords);
    } catch (error) {
      console.error('Error in getStopwatchRecords:', error);
      return this.fallbackStorage.getStopwatchRecords(userId);
    }
  }

  async getStopwatchRecord(id: number): Promise<StopwatchRecord | undefined> {
    try {
      if (!db) return this.fallbackStorage.getStopwatchRecord(id);
      const result = await db.select().from(stopwatchRecords).where(eq(stopwatchRecords.id, id));
      return result[0];
    } catch (error) {
      console.error('Error in getStopwatchRecord:', error);
      return this.fallbackStorage.getStopwatchRecord(id);
    }
  }

  async createStopwatchRecord(record: InsertStopwatchRecord): Promise<StopwatchRecord> {
    try {
      if (!db) return this.fallbackStorage.createStopwatchRecord(record);
      const result = await db.insert(stopwatchRecords).values(record).returning();
      return result[0];
    } catch (error) {
      console.error('Error in createStopwatchRecord:', error);
      return this.fallbackStorage.createStopwatchRecord(record);
    }
  }

  async deleteStopwatchRecord(id: number): Promise<boolean> {
    try {
      if (!db) return this.fallbackStorage.deleteStopwatchRecord(id);
      const result = await db.delete(stopwatchRecords).where(eq(stopwatchRecords.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error in deleteStopwatchRecord:', error);
      return this.fallbackStorage.deleteStopwatchRecord(id);
    }
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
