import crypto from 'crypto';

interface SSETicketRecord {
  tokenHash: string;
  userId: string;
  workspaceId: string;
  expiresAt: number;
}

const TICKET_TTL_MS = 60 * 1000; // 60 seconds lifetime

/**
 * Process-local ticket cache for short-lived, single-use SSE connection tickets.
 *
 * NOTE ON PRODUCTION LIMITATIONS:
 * In-memory storage is process-local and therefore intended for a single application
 * instance. When scaling horizontally across multiple container instances, ticket
 * issuance and consumption should use a shared distributed store (such as Redis or Upstash).
 */
const ticketStore = new Map<string, SSETicketRecord>();

function hashTicket(ticket: string): string {
  return crypto.createHash('sha256').update(ticket).digest('hex');
}

function pruneExpired(): void {
  const now = Date.now();
  for (const [hash, record] of ticketStore.entries()) {
    if (record.expiresAt < now) {
      ticketStore.delete(hash);
    }
  }
}

let cleanupInterval: NodeJS.Timeout | null = null;
function ensureCleanupTimer(): void {
  if (process.env.NODE_ENV === 'test' || cleanupInterval) return;
  cleanupInterval = setInterval(pruneExpired, 60 * 1000);
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

/**
 * Creates a short-lived (60s), single-use SSE connection ticket.
 * Stores ONLY the SHA-256 hash in memory.
 * Returns the raw random opaque ticket to the caller.
 */
export function createSSETicket(
  userId: string,
  workspaceId: string
): { ticket: string; expiresIn: number } {
  ensureCleanupTimer();
  const ticket = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashTicket(ticket);

  ticketStore.set(tokenHash, {
    tokenHash,
    userId,
    workspaceId,
    expiresAt: Date.now() + TICKET_TTL_MS,
  });

  return {
    ticket,
    expiresIn: Math.floor(TICKET_TTL_MS / 1000),
  };
}

/**
 * Consumes a single-use ticket for the specified workspace.
 *
 * 1. Hashes the raw ticket using SHA-256
 * 2. Checks existence in store
 * 3. Immediately deletes the ticket (enforcing single-use)
 * 4. Verifies expiration (<= 60s)
 * 5. Verifies workspace matching (strict workspace isolation)
 *
 * Returns userId on success, or null if invalid, expired, or wrong workspace.
 */
export function consumeSSETicket(rawTicket: string, workspaceId: string): string | null {
  if (!rawTicket || typeof rawTicket !== 'string') return null;

  const tokenHash = hashTicket(rawTicket);
  const record = ticketStore.get(tokenHash);

  if (!record) return null;

  // Single-use: delete immediately regardless of subsequent checks
  ticketStore.delete(tokenHash);

  if (Date.now() > record.expiresAt) {
    return null;
  }

  if (record.workspaceId !== workspaceId) {
    return null;
  }

  return record.userId;
}

/**
 * For testing and test isolation only.
 */
export function _clearSSETickets(): void {
  ticketStore.clear();
}
