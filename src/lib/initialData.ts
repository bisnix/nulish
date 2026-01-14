import { v4 as uuidv4 } from 'uuid';
import { type Note, type Tag } from './db';

const personalId = uuidv4();
const workId = uuidv4();

export const initialTags: Tag[] = [
    { id: personalId, name: 'Personal', parent_id: null, created_at: Date.now() },
    { id: workId, name: 'Work', parent_id: null, created_at: Date.now() },
    { id: uuidv4(), name: 'Ideas', parent_id: null, created_at: Date.now() },
    { id: uuidv4(), name: 'Travel', parent_id: personalId, created_at: Date.now() },
];

export const initialNotes: Note[] = [
    {
        id: uuidv4(),
        title: 'Selamat Datang di Nulish!',
        content: `# Welcome to Nulish

Aplikasi ini didesain untuk **Fokus**. 

### Fitur Utama:
- **Floating Modal**: Klik catatan untuk edit cepat.
- **Full Screen Focus**: Klik ikon ⤢ untuk menulis tanpa gangguan.
- **Markdown Support**: Ketik \`#\` untuk judul, \`-\` untuk list.
- **Dark Mode**: Toggle di pojok kanan atas.

Selamat menulis!`,
        updated_at: Date.now(),
        is_pinned: true
    },
    {
        id: uuidv4(),
        title: 'Rencana Project',
        content: `- [x] Setup Project
- [x] Desain UI
- [ ] Integrasi AI
- [ ] Deploy ke Cloudflare`,
        updated_at: Date.now() - 1000 * 60 * 60, // 1 hour ago
        is_pinned: false
    }
];
