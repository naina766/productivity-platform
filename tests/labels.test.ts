import { createLabelSchema, updateLabelSchema } from '../lib/validations/label';

describe('Validations — Label Schemas', () => {
  describe('createLabelSchema', () => {
    it('accepts valid name and color, trimming whitespace', () => {
      const result = createLabelSchema.safeParse({
        name: '  Bug Fix  ',
        color: '#22c55e',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Bug Fix');
        expect(result.data.color).toBe('#22c55e');
      }
    });

    it('applies a default color when color is omitted', () => {
      const result = createLabelSchema.safeParse({ name: 'Feature' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.color).toBe('#22C55E');
      }
    });

    it('rejects an invalid hex color', () => {
      const result = createLabelSchema.safeParse({
        name: 'Feature',
        color: 'not-a-hex',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a whitespace-only name', () => {
      const result = createLabelSchema.safeParse({
        name: '   ',
        color: '#10B981',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateLabelSchema', () => {
    it('rejects an empty update payload', () => {
      const result = updateLabelSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('accepts a valid partial update', () => {
      const result = updateLabelSchema.safeParse({ name: 'Refactor' });
      expect(result.success).toBe(true);
    });
  });
});
