// functions/api/public/notes.ts

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    // --- GET /api/public/notes (Get SINGLE published note by ID) ---
    if (request.method === 'GET') {
        const id = url.searchParams.get('id');
        if (!id) return new Response('Missing ID', { status: 400 });

        try {
            // SECURITY: Only return notes where is_published = 1 (true)
            const note: any = await env.DB.prepare(
                "SELECT * FROM notes WHERE id = ? AND is_published = 1"
            ).bind(id).first();

            if (!note) {
                return new Response('Note not found or not published', { status: 404 });
            }

            // Parse tags
            note.tags = JSON.parse(note.tags || '[]');
            note.is_pinned = Boolean(note.is_pinned);
            note.is_published = Boolean(note.is_published);

            return new Response(JSON.stringify(note), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err: any) {
            return new Response(err.message, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
};
