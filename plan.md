GENERATE REACT NULISH APP - 3 FILES NEEDED

PROJECT: Nulish - Tag-based note app dengan AI via OpenRouter
Framework: React 18 + TypeScript, Vite, Tailwind CSS
AI: OpenRouter.ai (200+ models selectable)
Target: Production-ready, <55 minutes

=== LAYOUT ===
LEFT: Nested tag sidebar (200px)
  - Tags with note counts
  - Expand/collapse children
  - Click tag to filter notes

MAIN: Search + Note list
  - Search bar top (search notes + tag filter)
  - Note list below (title, tags, date, preview)
  - Click note → floating modal

MODAL: Floating popup
  - Can expand to fullscreen [✕][↗]
  - ContentEditable markdown editor
  - Tag selector
  - 6 AI action buttons

=== FILES TO GENERATE ===

FILE 1: src/App.tsx (~500-600 lines)

Layout:
- Top: "Nulish" title (left), dark mode toggle (right)
- Left sidebar (200px): nested tag tree
  * Tags with note counts
  * Expand/collapse smooth animation
  * Click tag → filter notes
  * Show current tag highlighted
- Main area:
  * Search bar (search notes by title/content/tags)
  * Note list (vertical scroll)
  * Each item: title, tags, lastUpdated, preview
  * Click note → open in modal

State:
- notes: Note[] {id, title, content(HTML), tags:[], createdAt, updatedAt}
- tags: Tag[] {id, name, parentId?, noteCount, expanded?}
- selectedNoteId: string | null
- selectedTagId: string | null (filter)
- searchQuery: string
- isDark: boolean
- expandedTags: Set<string>
- isModalFullscreen: boolean
- aiLoading: boolean

Functions:
- loadFromStorage(): load all data
- saveToStorage(): persist all data
- createNewNote(tagIds?): void
- saveNote(id, content, tags): Promise
- deleteNote(id): Promise
- handleSearch(query): filter notes
- selectTag(tagId): filter by tag
- selectNote(noteId): open modal
- toggleTagExpand(tagId): expand/collapse
- toggleDarkMode(): switch theme
- toggleModalFullscreen(): modal ↔ fullscreen
- handleAIAction(text, action): call AI

Features:
- Auto-save every 2s (debounced)
- Unsaved indicator (●)
- Live search across all notes
- Tag filtering + search combination
- Nested tag hierarchy support
- localStorage persistence
- Works offline
- Smooth animations
- Responsive (mobile: stack layout)

Styling: Tailwind CSS, dark mode (dark: prefix), all components, animations

---

FILE 2: src/components/NoteDetailModal.tsx (~400-450 lines)

Design:
- Floating modal (bottom-right, 400px × 500px default)
- Expandable to fullscreen (toggle button)
- Smooth fade-in/slide animations
- Close button (X) top-right
- Expand button (↗) to fullscreen

Content:
- Header: Note title (editable), [✕ close][↗ expand]
- Tag selector: Show/add/remove tags
- Editor: ContentEditable with markdown
  * **bold**, *italic*, # h1, ## h2, ### h3, `code`, [text](url)
  * Real-time rendering (no dual view)
  * Preserve cursor after markdown
- Toolbar: B (bold), I (italic), List buttons
- Character counter
- AI Panel: When text selected, show 6 action buttons
  * Improve, Expand, Shorten, Tone (formal/casual/creative), Fix Grammar, Ideas
- Footer: "Saving..." indicator, unsaved (●), delete button
- Loading state during AI actions

Keyboard:
- Ctrl/Cmd+B: bold
- Ctrl/Cmd+I: italic
- Escape: close modal

Features:
- Real-time markdown→HTML conversion
- Auto-save debounced 500ms
- Show "Saving..." during save
- Unsaved indicator (●)
- Tag management (add/remove)
- Delete note (with confirmation)
- Fullscreen toggle
- Works offline
- Error handling with fallback

Props:
- note: Note | null
- tags: Tag[]
- onSave: (content, tags) => Promise<void>
- onDelete: (id) => Promise<void>
- onClose: () => void
- onAIAction: (text, action) => Promise<string>
- isFullscreen: boolean
- onToggleFullscreen: () => void

Styling: Tailwind, modal animations, dark mode, responsive (mobile: fullscreen)

---

FILE 3: src/lib/openrouter-ai.ts (~200-250 lines)

6 Async Functions:

1. improveWriting(text: string, model?: string): Promise<string>
   - Better grammar, clarity, flow, vocabulary

2. makeLonger(text: string, model?: string): Promise<string>
   - Expand 2-3x with details and examples

3. makeShorter(text: string, model?: string): Promise<string>
   - Condense to 50%, keep main ideas

4. changeTone(text: string, tone: 'formal'|'casual'|'creative', model?: string): Promise<string>
   - Rewrite with specified tone
   - formal: professional, academic
   - casual: friendly, conversational
   - creative: vivid, descriptive, engaging

5. fixGrammar(text: string, model?: string): Promise<string>
   - Fix spelling, grammar, punctuation

6. generateIdeas(text: string, model?: string): Promise<string>
   - Generate 3-5 brainstorming ideas

OpenRouter API:
- Endpoint: https://openrouter.ai/api/v1/chat/completions
- Auth: Bearer {VITE_OPENROUTER_API_KEY}
- Model support: 200+ models (GPT-4, Claude, Llama, Mistral, etc)
- Default model: gpt-3.5-turbo (via OpenRouter)
- User-selectable model via VITE_AI_MODEL env var

Implementation:
- HTTP client (fetch or axios)
- Model selection (default gpt-3.5-turbo)
- System prompts for each action
- Temperature: 0.7 (consistency)
- Timeout: 30s per request
- Retry logic for failed requests

Error Handling:
- Try-catch blocks
- API key validation
- Network error handling
- Rate limiting handling
- Timeout handling
- Fallback to original text
- Console.error for debugging
- User-friendly error messages

Exports:
export async function improveWriting(text, model?): Promise<string>
export async function makeLonger(text, model?): Promise<string>
export async function makeShorter(text, model?): Promise<string>
export async function changeTone(text, tone, model?): Promise<string>
export async function fixGrammar(text, model?): Promise<string>
export async function generateIdeas(text, model?): Promise<string>
export function setModel(model: string): void // Change model at runtime

Environment:
- VITE_OPENROUTER_API_KEY: sk-... (required)
- VITE_AI_MODEL: model name (optional, default: gpt-3.5-turbo)

=== REQUIREMENTS ===
✅ Production-ready (no TODOs)
✅ TypeScript strict mode
✅ Full error handling
✅ Mobile responsive
✅ Dark mode support
✅ Nested tag support
✅ Smooth animations
✅ Works offline (localStorage)
✅ Proper JSDOC comments
✅ ~1200-1300 lines total

=== EXPECTED OUTPUT ===
App.tsx: ~500-600 lines
NoteDetailModal.tsx: ~400-450 lines
openrouter-ai.ts: ~200-250 lines

ALL CODE COMPLETE AND READY TO COPY-PASTE
