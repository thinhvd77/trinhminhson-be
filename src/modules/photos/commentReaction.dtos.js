/**
 * Comment Reaction DTOs
 * Zod schemas for input validation
 */

const { z } = require("zod");
const { ALLOWED_REACTIONS } = require("./commentReaction.model");

const toggleReactionDto = z.object({
    emoji: z.string().refine((val) => ALLOWED_REACTIONS.includes(val), {
        message: `Invalid reaction. Allowed: ${ALLOWED_REACTIONS.join(", ")}`,
    }),
    guestToken: z.string().max(64).optional(),
});

const commentIdParam = z.object({
    commentId: z.coerce.number().int().positive(),
});

const photoIdParam = z.object({
    photoId: z.coerce.number().int().positive(),
});

module.exports = {
    toggleReactionDto,
    commentIdParam,
    photoIdParam,
};
