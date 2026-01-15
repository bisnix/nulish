// functions/api/tags.ts

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // --- GET /api/tags (List all tags) ---
    if (request.method === 'GET') {
        try {
            const { results } = await env.DB.prepare(
                "SELECT * FROM tags ORDER BY created_at ASC"
            ).all();

            return new Response(JSON.stringify(results), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err: any) {
            return new Response(err.message, { status: 500 });
        }
    }

    // --- POST /api/tags (Create/Update tags batch) ---
    if (request.method === 'POST') {
        try {
            const tags: any[] = await request.json();

            // Batch update tags
            const statements = tags.map(tag =>
                env.DB.prepare(`
          INSERT INTO tags (id, name, parent_id, created_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            parent_id = excluded.parent_id
        `).bind(tag.id, tag.name, tag.parent_id, tag.created_at || Date.now())
            );

            await env.DB.batch(statements);

            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err: any) {
            return new Response(err.message, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
};
