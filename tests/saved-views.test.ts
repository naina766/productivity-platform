import {
  serializeSavedView,
} from '@/lib/saved-views/saved-view.service';
import {
  createSavedViewSchema,
  updateSavedViewSchema,
} from '@/lib/validations/saved-view';

describe('Saved Views', () => {
  describe('Serialization', () => {
    it('correctly serializes a saved view model into API response format', () => {
      const now = new Date('2026-10-01T12:00:00.000Z');
      const raw = {
        id: '11111111-1111-1111-1111-111111111111',
        workspaceId: '22222222-2222-2222-2222-222222222222',
        projectId: '33333333-3333-3333-3333-333333333333',
        userId: '44444444-4444-4444-4444-444444444444',
        name: 'Urgent Bugs',
        filters: {
          status: ['TODO', 'IN_PROGRESS'],
          priority: ['URGENT', 'HIGH'],
          search: 'login crash',
        },
        sortBy: 'priority',
        sortOrder: 'desc',
        viewType: 'board',
        isShared: true,
        createdAt: now,
        updatedAt: now,
        user: { name: 'Alice Engineer' },
      };

      const serialized = serializeSavedView(raw);

      expect(serialized.id).toBe(raw.id);
      expect(serialized.name).toBe('Urgent Bugs');
      expect(serialized.filters.status).toEqual(['TODO', 'IN_PROGRESS']);
      expect(serialized.filters.priority).toEqual(['URGENT', 'HIGH']);
      expect(serialized.filters.search).toBe('login crash');
      expect(serialized.sortBy).toBe('priority');
      expect(serialized.sortOrder).toBe('desc');
      expect(serialized.viewType).toBe('board');
      expect(serialized.isShared).toBe(true);
      expect(serialized.userName).toBe('Alice Engineer');
      expect(serialized.createdAt).toBe('2026-10-01T12:00:00.000Z');
    });

    it('defaults filters to empty object if null or undefined in database', () => {
      const now = new Date();
      const raw = {
        id: '11111111-1111-1111-1111-111111111111',
        workspaceId: '22222222-2222-2222-2222-222222222222',
        projectId: null,
        userId: '44444444-4444-4444-4444-444444444444',
        name: 'Default Workspace Tasks',
        filters: null,
        sortBy: null,
        sortOrder: null,
        viewType: 'list',
        isShared: false,
        createdAt: now,
        updatedAt: now,
      };

      const serialized = serializeSavedView(raw);
      expect(serialized.filters).toEqual({});
      expect(serialized.sortBy).toBeNull();
      expect(serialized.sortOrder).toBeNull();
      expect(serialized.isShared).toBe(false);
    });
  });

  describe('Validation Schemas', () => {
    it('accepts valid create payload and trims name', () => {
      const payload = {
        name: '  Sprint 1 Focus  ',
        filters: {
          status: ['IN_PROGRESS'],
          priority: ['HIGH'],
        },
        viewType: 'board',
        isShared: true,
      };

      const res = createSavedViewSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe('Sprint 1 Focus');
        expect(res.data.viewType).toBe('board');
        expect(res.data.isShared).toBe(true);
      }
    });

    it('rejects empty name for create payload', () => {
      const payload = {
        name: '   ',
        filters: {},
      };

      const res = createSavedViewSchema.safeParse(payload);
      expect(res.success).toBe(false);
    });

    it('rejects invalid task status in filters', () => {
      const payload = {
        name: 'Invalid Status Test',
        filters: {
          status: ['UNKNOWN_STATUS'],
        },
      };

      const res = createSavedViewSchema.safeParse(payload);
      expect(res.success).toBe(false);
    });

    it('accepts partial update payload', () => {
      const payload = {
        name: 'Renamed View',
        isShared: true,
      };

      const res = updateSavedViewSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe('Renamed View');
        expect(res.data.isShared).toBe(true);
      }
    });
  });
});
