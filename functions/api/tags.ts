// functions/api/tags.ts
// Cloud-first: Extract tags directly from notes in D1

interface Env {
    DB: D1Database;
}

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string; // JSON string in DB
}

interface Tag {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: number;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // --- GET /api/tags (Extract tags from notes) ---
    if (request.method === 'GET') {
        try {
            // Get all notes to extract tags from
            const { results } = await env.DB.prepare(
                "SELECT id, title, content, tags FROM notes"
            ).all<Note>();

            const tagMap = new Map<string, Tag>();
            const now = Date.now();
            let idCounter = 0;

            const generateId = () => `tag_${now}_${idCounter++}`;

            const getOrAddTag = (name: string, parentId: string | null): Tag => {
                const compositeKey = `${name}:${parentId || 'null'}`;

                if (tagMap.has(compositeKey)) {
                    return tagMap.get(compositeKey)!;
                }

                const tag: Tag = {
                    id: generateId(),
                    name,
                    parent_id: parentId,
                    created_at: now
                };
                tagMap.set(compositeKey, tag);
                return tag;
            };

            // Extract tags from all notes
            const hashtagRegex = /#(\w+(?:\/\w+)*)/g;

            for (const note of results) {
                // Extract from content (hashtags like #work or #work/project)
                const matches = note.content?.match(hashtagRegex);
                if (matches) {
                    for (const m of matches) {
                        const parts = m.substring(1).split('/');
                        let parentId: string | null = null;
                        for (const part of parts) {
                            const tag = getOrAddTag(part, parentId);
                            parentId = tag.id;
                        }
                    }
                }

                // Extract from tags array
                try {
                    const noteTags: string[] = JSON.parse(note.tags || '[]');
                    for (const t of noteTags) {
                        const cleanTag = t.startsWith('#') ? t.substring(1) : t;
                        const parts = cleanTag.split('/');
                        let parentId: string | null = null;
                        for (const part of parts) {
                            if (part.trim()) { // Skip empty parts
                                const tag = getOrAddTag(part.trim(), parentId);
                                parentId = tag.id;
                            }
                        }
                    }
                } catch (e) {
                    // Ignore parse errors for malformed tags
                }
            }

            // Convert map to array and sort by name
            const tags = Array.from(tagMap.values()).sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            return new Response(JSON.stringify(tags), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err: any) {
            console.error('Tags API error:', err);
            return new Response(err.message, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
};
