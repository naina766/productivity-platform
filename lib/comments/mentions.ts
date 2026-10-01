/**
 * Extract mention candidate handles or names from text.
 * Matches:
 *  - @"Full Name" or @'Full Name'
 *  - @username, @name, @email.com
 */
export function extractMentionStrings(text: string): string[] {
  const mentions = new Set<string>();

  // 1. Quoted mentions: @"Alice Smith" or @'Bob Jones'
  const quotedRegex = /@["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = quotedRegex.exec(text)) !== null) {
    if (match[1]?.trim()) {
      mentions.add(match[1].trim().toLowerCase());
    }
  }

  // 2. Standard single-token mentions: @alice, @bob.smith, @alex@domain.com
  const singleRegex = /@([a-zA-Z0-9_\.\-]+(?:@[a-zA-Z0-9_\.\-]+)?)/g;
  while ((match = singleRegex.exec(text)) !== null) {
    if (match[1]?.trim()) {
      mentions.add(match[1].trim().toLowerCase());
    }
  }

  return Array.from(mentions);
}

export interface MentionToken {
  type: 'text' | 'mention';
  content: string;
}

/**
 * Split text into regular text and @mention tokens for UI rendering.
 */
export function parseMentionTokens(text: string): MentionToken[] {
  if (!text) return [];

  // Match @"..." or @'...' or @word (including email addresses)
  const regex = /(@["'][^"']+["']|@[a-zA-Z0-9_\.\-]+(?:@[a-zA-Z0-9_\.\-]+)?)/g;
  const parts: MentionToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text preceding the mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add mention token (remove quotes if present)
    const rawMention = match[0];
    const cleaned = rawMention.startsWith('@"') || rawMention.startsWith("@'")
      ? `@${rawMention.slice(2, -1)}`
      : rawMention;

    parts.push({
      type: 'mention',
      content: cleaned,
    });

    lastIndex = regex.lastIndex;
  }

  // Add trailing text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return parts;
}
