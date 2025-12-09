const { z } = require("zod");

const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required").max(200, "Content cannot exceed 200 characters"),
  color: z.string().default("#FEF3C7"),
  textColor: z.string().default("#1F2937"),
  fontFamily: z.string().default("'Work Sans', sans-serif"),
  fontWeight: z.string().default("400"),
  fontSize: z.string().default("14px"),
  x: z.number().default(100),
  y: z.number().default(100),
  rotation: z.number().default(0),
  isLocked: z.boolean().default(false),
});

const updateNoteSchema = z.object({
  content: z.string().min(1).max(200).optional(),
  color: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  fontSize: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  rotation: z.number().optional(),
  isLocked: z.boolean().optional(),
});

const noteIdSchema = z.object({
  id: z.string().transform(Number),
});

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
};
