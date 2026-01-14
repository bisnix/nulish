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

        if (note.id) {
            const index = notes.findIndex(n => n.id === note.id);
            if (index >= 0) {
                const updated = { ...notes[index], ...note, updated_at: now } as Note;
                notes[index] = updated;
                this.set('notes', notes);
                return updated;
            }
        }

        const newNote: Note = {
            id: uuidv4(),
            title: note.title || 'Untitled',
            content: note.content || '',
            updated_at: now,
            is_pinned: note.is_pinned || false
        };

        notes.unshift(newNote);
        this.set('notes', notes);
        return newNote;
    }

    async deleteNote(id: string): Promise<void> {
        const notes = (await this.getNotes()).filter(n => n.id !== id);
        this.set('notes', notes);
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
