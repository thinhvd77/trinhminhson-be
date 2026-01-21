/**
 * Comment Vote DTOs
 * Zod schemas for input validation
 */

const { z } = require("zod");
const { VOTE_TYPES } = require("./commentVote.model");

const toggleVoteDto = z.object({
    voteType: z.enum(VOTE_TYPES, {
        errorMap: () => ({ message: `Invalid vote type. Allowed: ${VOTE_TYPES.join(", ")}` }),
    }),
    guestToken: z.string().max(64).optional(),
});

const commentIdParam = z.object({
    commentId: z.coerce.number().int().positive(),
});

module.exports = {
    toggleVoteDto,
    commentIdParam,
};
