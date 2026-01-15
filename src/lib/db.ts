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

// Cloud-first database using Cloudflare D1
class CloudDB {
    // Cache to avoid redundant fetches within same render cycle
    private notesCache: Note[] | null = null;
    private tagsCache: Tag[] | null = null;
    private cacheTimeout: number = 0;

    private clearCache() {
        this.notesCache = null;
        this.tagsCache = null;
    }

    async getNotes(): Promise<Note[]> {
        // Use cache if fresh (within 100ms)
        if (this.notesCache && Date.now() - this.cacheTimeout < 100) {
            return this.notesCache;
        }

        try {
            const res = await fetch('/api/notes');
            if (!res.ok) throw new Error('Failed to fetch notes');
            const notes = await res.json();
            this.notesCache = notes;
            this.cacheTimeout = Date.now();
            return notes;
        } catch (err) {
            console.error('Failed to get notes:', err);
            // Return empty array on error, let UI handle it
            return [];
        }
    }

    async getNote(id: string): Promise<Note | undefined> {
        const notes = await this.getNotes();
        return notes.find(n => n.id === id);
    }

    async saveNote(note: Partial<Note> & { id?: string }): Promise<Note> {
        const now = Date.now();

        const noteToSave: Note = {
            id: note.id || uuidv4(),
            title: note.title || 'Untitled',
            content: note.content || '',
            tags: note.tags || [],
            updated_at: now,
            is_pinned: note.is_pinned || false
        };

        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteToSave)
            });

            if (!res.ok) throw new Error('Failed to save note');

            // Clear cache to force refresh
            this.clearCache();

            // Dispatch event for UI updates
            window.dispatchEvent(new Event('nulish-notes-updated'));
            window.dispatchEvent(new Event('nulish-tags-updated'));

            return noteToSave;
        } catch (err) {
            console.error('Failed to save note:', err);
            throw err;
        }
    }

    async deleteNote(id: string): Promise<void> {
        try {
            const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete note');

            this.clearCache();
            window.dispatchEvent(new Event('nulish-notes-updated'));
            window.dispatchEvent(new Event('nulish-tags-updated'));
        } catch (err) {
            console.error('Failed to delete note:', err);
            throw err;
        }
    }

    async getTags(): Promise<Tag[]> {
        // Use cache if fresh
        if (this.tagsCache && Date.now() - this.cacheTimeout < 100) {
            return this.tagsCache;
        }

        try {
            const res = await fetch('/api/tags');
            if (!res.ok) throw new Error('Failed to fetch tags');
            const tags = await res.json();
            this.tagsCache = tags;
            return tags;
        } catch (err) {
            console.error('Failed to get tags:', err);
            return [];
        }
    }
}

export const db = new CloudDB();
