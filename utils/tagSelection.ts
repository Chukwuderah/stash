import type { Id } from "@/convex/_generated/dataModel";

/**
 * Simple module-level store for passing tag selections from the Tag Picker
 * back to screens that don't have an ideaId yet (e.g. Quick Add).
 *
 * Usage in Quick Add:
 *   useFocusEffect(() => {
 *     const tags = tagSelection.get();
 *     if (tags.length > 0) {
 *       setSelectedTags(tags);
 *       tagSelection.clear();
 *     }
 *   });
 *
 * Usage in Tag Picker (when no ideaId param):
 *   tagSelection.set(selected);
 *   router.back();
 */

let _selectedTagIds: Id<"tags">[] = [];

export const tagSelection = {
  set(ids: Id<"tags">[]): void {
    _selectedTagIds = ids;
  },
  get(): Id<"tags">[] {
    return _selectedTagIds;
  },
  clear(): void {
    _selectedTagIds = [];
  },
};
