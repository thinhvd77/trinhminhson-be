const { pgTable, serial, varchar, text, timestamp, integer } = require("drizzle-orm/pg-core");
const { users } = require("../users/user.model");

const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(), // Short description for preview
  content: text("content").notNull(),
  image: text("image").notNull(), // Cover image URL
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tags: text("tags").notNull(), // Comma-separated tags
  readTime: varchar("read_time", { length: 50 }).notNull().default("5 phút đọc"), // Estimated reading time
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

module.exports = { posts };
