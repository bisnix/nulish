import { v4 as uuidv4 } from 'uuid';

export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    updated_at: number;
    is_pinned: boolean;
}

export interface Tag {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: number;
}

// Simple in-memory / local storage implementation for rapid UI dev
// Later replaced by fetch('/api/...') calls to Cloudflare D1
class LocalDB {
    private get<T>(key: string): T[] {
        const data = localStorage.getItem(`nulish_${key}`);
        return data ? JSON.parse(data) : [];
    }

    private set<T>(key: string, data: T[]) {
        localStorage.setItem(`nulish_${key}`, JSON.stringify(data));
    }

    async getNotes(): Promise<Note[]> {
        const notes = this.get<Note>('notes');
        if (notes.length === 0) {
            const { initialNotes } = await import('./initialData');
            this.set('notes', initialNotes);
            return initialNotes;
        }
        return notes.sort((a, b) => b.updated_at - a.updated_at);
    }

    async getNote(id: string): Promise<Note | undefined> {
        const notes = await this.getNotes();
        return notes.find(n => n.id === id);
    }

    async saveNote(note: Partial<Note> & { id?: string }): Promise<Note> {
        const notes = await this.getNotes();
        const now = Date.now();
        let savedNote: Note;

        if (note.id) {
            const index = notes.findIndex(n => n.id === note.id);
            if (index >= 0) {
                const updated = { ...notes[index], ...note, updated_at: now } as Note;
                notes[index] = updated;
                this.set('notes', notes);
                savedNote = updated;
            } else {
                savedNote = {
                    id: uuidv4(),
                    title: note.title || 'Untitled',
                    content: note.content || '',
                    tags: note.tags || [],
                    updated_at: now,
                    is_pinned: note.is_pinned || false
                };
                notes.unshift(savedNote);
                this.set('notes', notes);
            }
        } else {
            const newNote: Note = {
                id: uuidv4(),
                title: note.title || 'Untitled',
                content: note.content || '',
                tags: note.tags || [],
                updated_at: now,
                is_pinned: note.is_pinned || false
            };

            notes.unshift(newNote);
            this.set('notes', notes);
            savedNote = newNote;
        }

        // Auto-extract tags
        if (savedNote.content) {
            await this.extractTagsFromContent(savedNote.content);
        }

        return savedNote;
    }

    async deleteNote(id: string): Promise<void> {
        const notes = (await this.getNotes()).filter(n => n.id !== id);
        this.set('notes', notes);
    }

    private async extractTagsFromContent(_content: string) {
        // We will simply call cleanupUnusedTags which regenerates the entire tag tree from all notes.
        // This handles addition of new tags AND removal of stale ones in one go.
        // It is the source of truth based on current content.
        await this.cleanupUnusedTags();
    }

    // Remove tags that are no longer found in any note
    // This cleans up partial tags like 'w', 'wo' created during typing
    async cleanupUnusedTags() {
        const notes = await this.getNotes();
        const tags = await this.getTags();
        // const usedTagNames = new Set<string>();

        const regex = /#(\w+(?:\/\w+)*)/g;

        notes.forEach(note => {
            const matches = note.content.match(regex);
            if (matches) {
                matches.forEach(m => {
                    const fullPath = m.substring(1);
                    const parts = fullPath.split('/');
                    // For nested tags, we must consider all parent paths as "used"
                    // let pathAcc = '';
                    parts.forEach(_part => {
                        // Note: Our DB stores 'name' as just the segment, and 'parent_id'.
                        // To properly identify 'used' tags we'd need to reconstruct tree.
                        // Simpler approach for this MVP:
                        // Just keep tags if they are *part of* a valid active tag structure?
                        // Actually, simpler:
                        // We generated tags based on splitting matches.
                        // We can just re-generate the entire desired tag tree from scratch based on current notes
                        // And replace the tags table (preserving IDs where possible if needed, or just wiping).
                        // Since IDs are UUIDs and not referenced except by parent_id,
                        // And we don't have metadata on tags yet...
                        // Re-building might be cleaner.
                        // BUT, to avoid ID churn if we add features later, let's try to match.
                    });
                });
            }
        });

        // Re-generative approach is safest for "Zero Config" to clear junk.
        // We will Re-Extract EVERYTHING from ALL notes and Replace 'tags'.
        // This is expensive but fine for local text app.

        let newTags: Tag[] = [];

        // Helper
        const getOrAddTag = (name: string, parentId: string | null) => {
            let existing = newTags.find(t => t.name === name && t.parent_id === parentId);
            if (!existing) {
                existing = {
                    id: uuidv4(),
                    name,
                    parent_id: parentId,
                    created_at: Date.now()
                };
                newTags.push(existing);
            }
            return existing;
        };

        notes.forEach(note => {
            // Process content hashtags
            const matches = note.content.match(regex);
            if (matches) {
                matches.forEach(m => {
                    const parts = m.substring(1).split('/');
                    let parentId: string | null = null;
                    parts.forEach(part => {
                        const tag = getOrAddTag(part, parentId);
                        parentId = tag.id;
                    });
                });
            }

            // Process metadata tags (from UI input)
            if (note.tags && note.tags.length > 0) {
                note.tags.forEach(t => {
                    // Handle potential nested tags in metadata if user typed "parent/child"
                    // Also handle if user typed "#tag" in input (strip #)
                    const cleanTag = t.startsWith('#') ? t.substring(1) : t;
                    const parts = cleanTag.split('/');
                    let parentId: string | null = null;
                    parts.forEach(part => {
                        const tag = getOrAddTag(part, parentId);
                        parentId = tag.id;
                    });
                });
            }
        });

        // Check if different
        if (JSON.stringify(newTags.map(t => t.name).sort()) !== JSON.stringify(tags.map(t => t.name).sort())) {
            this.set('tags', newTags);
            window.dispatchEvent(new Event('nulish-tags-updated'));
        }
    }

    async getTags(): Promise<Tag[]> {
        const tags = this.get<Tag>('tags');
        if (tags.length === 0) {
            const { initialTags } = await import('./initialData');
            this.set('tags', initialTags);
            return initialTags;
        }
        return tags;
    }
}

export const db = new LocalDB();
