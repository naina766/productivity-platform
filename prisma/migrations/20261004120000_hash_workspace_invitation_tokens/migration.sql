-- AlterTable: Safely hash existing raw tokens (if any exist) and rename token to tokenHash
UPDATE "WorkspaceInvitation"
SET "token" = encode(sha256("token"::bytea), 'hex')
WHERE length("token") != 64;

-- Rename column "token" to "tokenHash"
ALTER TABLE "WorkspaceInvitation" RENAME COLUMN "token" TO "tokenHash";

-- Rename unique index
ALTER INDEX "WorkspaceInvitation_token_key" RENAME TO "WorkspaceInvitation_tokenHash_key";

-- Rename lookup index
ALTER INDEX "WorkspaceInvitation_token_idx" RENAME TO "WorkspaceInvitation_tokenHash_idx";
