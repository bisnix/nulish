import { v4 as uuidv4 } from 'uuid';

export interface Note {
    id: string;
    title: string;
    content: string;
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
                // If ID provided but not found (rare), treat as new or error?
                // Fallback to create new for safety in this mock
                savedNote = {
                    id: uuidv4(),
                    title: note.title || 'Untitled',
                    content: note.content || '',
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

    private async extractTagsFromContent(content: string) {
        // Regex to find #tag or #nested/tag
        // Matches # followed by alphanumeric/underscore, optionally followed by / and more chars
        const regex = /#(\w+(?:\/\w+)*)/g;
        const matches = content.match(regex);

        if (!matches) return;

        const currentTags = await this.getTags();
        let changed = false;

        // Helper to find tag by name (case insensitive?) - Keeping case sensitive for now as requested by user input usually
        const findTag = (name: string) => currentTags.find(t => t.name === name);

        for (const match of matches) {
            const fullPath = match.substring(1); // Remove #
            const parts = fullPath.split('/');

            let parentId: string | null = null;
            let pathAccumulator = '';

            for (const part of parts) {
                pathAccumulator = pathAccumulator ? `${pathAccumulator}/${part}` : part;
                const existing = currentTags.find(t => {
                    // Logic: if nested, name is just the part? 
                    // Based on current sidebar logic: 
                    // renderTag takes tag, finds children by parent_id.
                    // So 'name' should probably be just the 'part' (e.g. 'design'), not 'work/design'.
                    // But we need to distinguish 'work/design' from 'hobby/design'.
                    // So we strictly check parent_id.
                    return t.name === part && t.parent_id === parentId;
                });

                if (existing) {
                    parentId = existing.id;
                } else {
                    // Create new tag
                    const newTag: Tag = {
                        id: uuidv4(),
                        name: part,
                        parent_id: parentId,
                        created_at: Date.now()
                    };
                    currentTags.push(newTag);
                    parentId = newTag.id;
                    changed = true;
                }
            }
        }

        if (changed) {
            this.set('tags', currentTags);
            // Notify UI
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
