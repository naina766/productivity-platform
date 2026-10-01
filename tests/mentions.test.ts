import {
  extractMentionStrings,
  parseMentionTokens,
} from '@/lib/comments/mentions';

describe('Comment Mentions', () => {
  describe('extractMentionStrings', () => {
    it('extracts standard word mentions', () => {
      const text = 'Hey @alex and @sarah, please review this PR!';
      const extracted = extractMentionStrings(text);
      expect(extracted).toContain('alex');
      expect(extracted).toContain('sarah');
      expect(extracted).toHaveLength(2);
    });

    it('extracts quoted multi-word mentions', () => {
      const text = 'Cc @"John Doe" and @\'Jane Smith\' for confirmation.';
      const extracted = extractMentionStrings(text);
      expect(extracted).toContain('john doe');
      expect(extracted).toContain('jane smith');
    });

    it('extracts email address mentions', () => {
      const text = 'Assigning to @teammate@example.com for triage.';
      const extracted = extractMentionStrings(text);
      expect(extracted).toContain('teammate@example.com');
    });

    it('returns empty array when text has no mentions', () => {
      const text = 'Just an ordinary comment with no symbols.';
      expect(extractMentionStrings(text)).toEqual([]);
    });

    it('deduplicates identical mentions', () => {
      const text = '@alice please check with @Alice or @ALICE';
      const extracted = extractMentionStrings(text);
      expect(extracted).toEqual(['alice']);
    });
  });

  describe('parseMentionTokens', () => {
    it('splits message into text and mention segments', () => {
      const text = 'Hello @alex, check @"Feature X" please!';
      const tokens = parseMentionTokens(text);

      expect(tokens).toEqual([
        { type: 'text', content: 'Hello ' },
        { type: 'mention', content: '@alex' },
        { type: 'text', content: ', check ' },
        { type: 'mention', content: '@Feature X' },
        { type: 'text', content: ' please!' },
      ]);
    });

    it('handles message starting with a mention', () => {
      const text = '@lead please approve';
      const tokens = parseMentionTokens(text);

      expect(tokens).toEqual([
        { type: 'mention', content: '@lead' },
        { type: 'text', content: ' please approve' },
      ]);
    });

    it('handles message ending with a mention', () => {
      const text = 'Contact @support';
      const tokens = parseMentionTokens(text);

      expect(tokens).toEqual([
        { type: 'text', content: 'Contact ' },
        { type: 'mention', content: '@support' },
      ]);
    });

    it('returns empty array for empty string', () => {
      expect(parseMentionTokens('')).toEqual([]);
    });
  });
});
