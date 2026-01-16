// functions/api/notes.ts

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    // --- GET /api/notes (List all notes) ---
    if (request.method === 'GET') {
        try {
            const { results } = await env.DB.prepare(
                "SELECT * FROM notes ORDER BY updated_at DESC"
            ).all();

            // Parse tags JSON string back to array and handle is_pinned/is_published boolean
            const notes = results.map((n: any) => ({
                ...n,
                tags: JSON.parse(n.tags || '[]'),
                is_pinned: Boolean(n.is_pinned),
                is_published: Boolean(n.is_published)
            }));

            return new Response(JSON.stringify(notes), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err: any) {
            return new Response(err.message, { status: 500 });
        }
    }

    // --- POST /api/notes (Create/Update note) ---
    if (request.method === 'POST') {
        try {
            const note: any = await request.json();
            const now = Date.now();

            await env.DB.prepare(`
        INSERT INTO notes (id, title, content, tags, updated_at, created_at, is_pinned, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          content = excluded.content,
          tags = excluded.tags,
          updated_at = excluded.updated_at,
          is_pinned = excluded.is_pinned,
          is_published = excluded.is_published
      `).bind(
                note.id,
                note.title || '',
                note.content || '',
                JSON.stringify(note.tags || []),
                now,
                note.created_at || now,
                note.is_pinned ? 1 : 0,
                note.is_published ? 1 : 0
            ).run();

            return new Response(JSON.stringify({ success: true, updated_at: now }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err: any) {
            return new Response(err.message, { status: 500 });
        }
    }

    // --- DELETE /api/notes?id=... ---
    if (request.method === 'DELETE') {
        const id = url.searchParams.get('id');
        if (!id) return new Response('Missing ID', { status: 400 });

        try {
            await env.DB.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err: any) {
            return new Response(err.message, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
};
