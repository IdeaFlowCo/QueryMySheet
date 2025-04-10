import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping it from original template)
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

// Sheet query schema
export const sheetQueries = pgTable("sheet_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  sheetUrl: text("sheet_url"),
  fileName: text("file_name"),
  model: text("model").notNull(),
  temperature: text("temperature").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertSheetQuerySchema = createInsertSchema(sheetQueries).pick({
  query: true,
  sheetUrl: true,
  fileName: true,
  model: true,
  temperature: true,
  createdAt: true,
});

export type InsertSheetQuery = z.infer<typeof insertSheetQuerySchema>;
export type SheetQuery = typeof sheetQueries.$inferSelect;

// Query Results schema - not stored in DB but used for typing
export const queryResultSchema = z.object({
  rowNumber: z.number().optional(),
  cells: z.record(z.string(), z.string().optional()),
  highlighted: z.boolean().optional(),
  matchReason: z.string().optional(),
});

export type QueryResult = z.infer<typeof queryResultSchema>;

// OpenAI query response schema
export const openAiResponseSchema = z.object({
  results: z.array(queryResultSchema),
  explanation: z.string().optional(),
});

export type OpenAiResponse = z.infer<typeof openAiResponseSchema>;
