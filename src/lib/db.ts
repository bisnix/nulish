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

// Local-first with Cloudflare D1 background sync
class LocalDB {
    private isSyncingNotes = false;
    private isSyncingTags = false;

    private get<T>(key: string): T[] {
        const data = localStorage.getItem(`nulish_${key}`);
        return data ? JSON.parse(data) : [];
    }

    private set<T>(key: string, data: T[]) {
        localStorage.setItem(`nulish_${key}`, JSON.stringify(data));
    }

    private async pushNoteToCloud(note: Note) {
        try {
            await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note)
            });
        } catch (err) {
            console.error('Failed to sync note to cloud:', err);
        }
    }

    private async pushTagsToCloud(tags: Tag[]) {
        try {
            await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tags)
            });
        } catch (err) {
            console.error('Failed to sync tags to cloud:', err);
        }
    }

    async getNotes(): Promise<Note[]> {
        const localNotes = this.get<Note>('notes');

        // Background sync from cloud - only if not already syncing
        if (!this.isSyncingNotes) {
            this.isSyncingNotes = true;
            Promise.resolve().then(async () => {
                try {
                    const res = await fetch('/api/notes');
                    if (res.ok) {
                        const cloudNotes = await res.json();

                        // If cloud is empty but local has data, sync local to cloud
                        if (cloudNotes.length === 0 && localNotes.length > 0) {
                            for (const note of localNotes) {
                                await this.pushNoteToCloud(note);
                            }
                        }
                        // Otherwise, update local if cloud has data and is different
                        else if (cloudNotes.length > 0 && JSON.stringify(cloudNotes) !== JSON.stringify(localNotes)) {
                            this.set('notes', cloudNotes);
                            window.dispatchEvent(new Event('nulish-notes-updated'));
                        }
                    }
                } catch (err) {
                    console.error('Notes background sync failed:', err);
                } finally {
                    this.isSyncingNotes = false;
                }
            });
        }

        if (localNotes.length === 0) {
            const { initialNotes } = await import('./initialData');
            this.set('notes', initialNotes);
            return initialNotes;
        }
        return localNotes.sort((a, b) => b.updated_at - a.updated_at);
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
                savedNote = { ...notes[index], ...note, updated_at: now } as Note;
                notes[index] = savedNote;
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
            }
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
        }

        this.set('notes', notes);
        this.pushNoteToCloud(savedNote);

        if (savedNote.content) {
            await this.extractTagsFromContent(savedNote.content);
        }

        return savedNote;
    }

    async deleteNote(id: string): Promise<void> {
        const notes = (await this.getNotes()).filter(n => n.id !== id);
        this.set('notes', notes);

        try {
            await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
        } catch (err) {
            console.error('Failed to delete note from cloud:', err);
        }
    }

    private async extractTagsFromContent(_content: string) {
        await this.cleanupUnusedTags();
    }

    async cleanupUnusedTags() {
        const notes = await this.getNotes();
        const tags = await this.getTags();
        const regex = /#(\w+(?:\/\w+)*)/g;

        let newTags: Tag[] = [];

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

            if (note.tags && note.tags.length > 0) {
                note.tags.forEach(t => {
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

        const currentTagNames = JSON.stringify(newTags.map(t => t.name).sort());
        const localTagNames = JSON.stringify(tags.map(t => t.name).sort());

        if (currentTagNames !== localTagNames) {
            this.set('tags', newTags);
            this.pushTagsToCloud(newTags);
            window.dispatchEvent(new Event('nulish-tags-updated'));
        }
    }

    async getTags(): Promise<Tag[]> {
        const localTags = this.get<Tag>('tags');

        if (!this.isSyncingTags) {
            this.isSyncingTags = true;
            Promise.resolve().then(async () => {
                try {
                    const res = await fetch('/api/tags');
                    if (res.ok) {
                        const cloudTags = await res.json();
                        if (cloudTags.length > 0 && JSON.stringify(cloudTags) !== JSON.stringify(localTags)) {
                            this.set('tags', cloudTags);
                            window.dispatchEvent(new Event('nulish-tags-updated'));
                        } else if (cloudTags.length === 0 && localTags.length > 0) {
                            this.pushTagsToCloud(localTags);
                        }
                    }
                } catch (err) {
                    console.error('Tags background sync failed:', err);
                } finally {
                    this.isSyncingTags = false;
                }
            });
        }

        if (localTags.length === 0) {
            const { initialTags } = await import('./initialData');
            this.set('tags', initialTags);
            return initialTags;
        }
        return localTags;
    }
}

export const db = new LocalDB();
