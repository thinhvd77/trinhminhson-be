const { pgTable, serial, text, varchar, integer, doublePrecision, boolean, timestamp } = require("drizzle-orm/pg-core");

const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  color: varchar("color", { length: 20 }).notNull().default("#FEF3C7"),
  textColor: varchar("text_color", { length: 20 }).notNull().default("#1F2937"),
  fontFamily: varchar("font_family", { length: 100 }).notNull().default("'Work Sans', sans-serif"),
  fontWeight: varchar("font_weight", { length: 10 }).notNull().default("400"),
  fontSize: varchar("font_size", { length: 10 }).notNull().default("14px"),
  x: doublePrecision("x").notNull().default(100),
  y: doublePrecision("y").notNull().default(100),
  rotation: doublePrecision("rotation").notNull().default(0),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

module.exports = { notes };
