import test from 'node:test';
import assert from 'node:assert/strict';
import { createLabelSchema, updateLabelSchema } from '../lib/validations/label';

test('Validations — Label Schemas', () => {
  // Valid create
  const validCreate = createLabelSchema.safeParse({
    name: '  Bug Fix  ',
    color: '#22c55e',
  });
  assert.equal(validCreate.success, true);
  if (validCreate.success) {
    assert.equal(validCreate.data.name, 'Bug Fix');
    assert.equal(validCreate.data.color, '#22c55e');
  }

  // Default color
  const defaultColor = createLabelSchema.safeParse({
    name: 'Feature',
  });
  assert.equal(defaultColor.success, true);
  if (defaultColor.success) {
    assert.equal(defaultColor.data.color, '#22C55E');
  }

  // Reject invalid hex color
  const invalidColor = createLabelSchema.safeParse({
    name: 'Feature',
    color: 'not-a-hex',
  });
  assert.equal(invalidColor.success, false);

  // Reject empty name
  const emptyName = createLabelSchema.safeParse({
    name: '   ',
    color: '#10B981',
  });
  assert.equal(emptyName.success, false);

  // Update schema requires at least one field
  const emptyUpdate = updateLabelSchema.safeParse({});
  assert.equal(emptyUpdate.success, false);

  const validUpdate = updateLabelSchema.safeParse({
    name: 'Refactor',
  });
  assert.equal(validUpdate.success, true);
});
