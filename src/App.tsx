import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Route, Switch, useLocation } from 'wouter';
import { Plus, Search, Maximize2, X, Moon, Sun, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Editor } from './components/Editor';
import { db, type Note } from './lib/db';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TagInput } from './components/TagInput';
import { TitleTextarea } from './components/TitleTextarea';

// --- Components ---

function Home({ onOpenNote }: { onOpenNote: (note?: Note) => void }) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    db.getNotes().then(setNotes);
    const interval = setInterval(() => db.getNotes().then(setNotes), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 pt-24 max-w-4xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center space-x-3 w-full bg-gray-100 dark:bg-white/5 pl-4 pr-1.5 py-1.5 rounded-xl text-sm text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 has-[button:hover]:bg-gray-100 dark:has-[button:hover]:bg-white/5 transition-colors focus-within:ring-2 ring-gray-200 dark:ring-white/10 group">
          <Search size={18} />
          <input type="text" placeholder="Search notes..." className="bg-transparent border-none outline-none w-full placeholder:text-gray-400 py-2 h-full" />
          <button
            onClick={(e) => { e.stopPropagation(); onOpenNote(); }}
            className="w-10 h-10 flex-shrink-0 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
            title="Create New Note"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="w-[90%] mx-auto flex flex-col divide-y divide-gray-100 dark:divide-white/5">
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => onOpenNote(note)}
            className="group flex items-center justify-between py-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors px-2 rounded-lg"
          >
            <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors truncate pr-8">{note.title || 'Untitled'}</h3>
            <div className="text-xs text-gray-400 whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">{format(note.updated_at, 'MMM d, HH:mm')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FullPageEditor({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<Note | null>(null);
  const [, setLocation] = useLocation();
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [fontFamily, setFontFamily] = useState<'font-sans' | 'font-droid-serif' | 'font-dm-mono'>('font-sans');
  const [fontSize, setFontSize] = useState<'prose-base' | 'prose-lg' | 'prose-xl'>('prose-base');

  useEffect(() => {
    // Load settings from local storage if available
    const savedFont = localStorage.getItem('nulish_font');
    if (savedFont) setFontFamily(savedFont as any);
    const savedSize = localStorage.getItem('nulish_size');
    if (savedSize) setFontSize(savedSize as any);

    if (params.id) {
      db.getNote(params.id).then(n => {
        if (n) setNote(n);
      });
    }
  }, [params.id]);

  const updateFont = (font: string) => {
    setFontFamily(font as any);
    localStorage.setItem('nulish_font', font);
  };

  const updateSize = (size: string) => {
    setFontSize(size as any);
    localStorage.setItem('nulish_size', size);
  };

  const saveNote = async (title: string, content: string, tags?: string[]) => {
    if (!note) return;
    const updated = await db.saveNote({ ...note, title, content, tags: tags !== undefined ? tags : note.tags });
    setNote(updated);
  };

  if (!note) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-background-dark animate-in fade-in duration-500">
      {/* Minimal Header */}
      <div className="h-16 flex items-center justify-between px-8 border-b border-gray-100 dark:border-white/5 relative z-50">
        <button onClick={() => setLocation('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} className="opacity-50" />
        </button>
        <div className="text-sm opacity-40 font-medium">Edited {format(note.updated_at, 'MMM d, HH:mm')}</div>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-gray-100 dark:bg-white/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
          >
            <MoreHorizontal size={20} className={showSettings ? "opacity-100" : "opacity-50"} />
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-64 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-white/10 p-4 z-50"
              >
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Font Family</div>
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                      {[
                        { id: 'font-sans', label: 'Default' },
                        { id: 'font-droid-serif', label: 'Serif' },
                        { id: 'font-dm-mono', label: 'Mono' }
                      ].map(font => (
                        <button
                          key={font.id}
                          onClick={() => updateFont(font.id)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${fontFamily === font.id ? 'bg-white dark:bg-card-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-white/5" />

                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Font Size</div>
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                      {[
                        { id: 'prose-base', label: 'Small' },
                        { id: 'prose-lg', label: 'Medium' },
                        { id: 'prose-xl', label: 'Large' }
                      ].map(size => (
                        <button
                          key={size.id}
                          onClick={() => updateSize(size.id)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${fontSize === size.id ? 'bg-white dark:bg-card-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" onClick={() => setShowSettings(false)}>
        <div className="max-w-3xl mx-auto py-12 px-8">
          <TitleTextarea
            value={note.title}
            onChange={(val) => {
              setNote({ ...note, title: val });
              if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
              saveTimeoutRef.current = window.setTimeout(() => {
                saveNote(val, note.content, note.tags);
              }, 1000);
            }}
            className={fontFamily}
          />

          <div className="border-t border-gray-100 dark:border-white/5" />

          <div className="py-4">
            <TagInput
              tags={note.tags || []}
              showIcon={false}
              onChange={(newTags) => {
                setNote({ ...note, tags: newTags });
                saveNote(note.title, note.content, newTags);
              }}
            />
          </div>

          <div className="border-t border-gray-100 dark:border-white/5" />

          <Editor
            markdown={note.content}
            className={`${fontFamily} ${fontSize}`}
            onChange={md => {
              setNote({ ...note, content: md });

              if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
              saveTimeoutRef.current = window.setTimeout(() => {
                saveNote(note.title, md, note.tags);
              }, 1000);
            }}
          />
        </div>
      </div>
    </div>
  );
}

// --- Main App Logic ---

function AppLayout() {
  const [isDark, setIsDark] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const openNote = (note?: Note) => {
    if (note) {
      setActiveNote(note);
    } else {
      setActiveNote({ title: '', content: '', id: '', tags: [], updated_at: 0, is_pinned: false });
    }
    setIsNoteOpen(true);
  };

  const closeNote = () => {
    setIsNoteOpen(false);
    setActiveNote(null);
  };

  const saveActiveNote = async (title: string, content: string, tags?: string[]) => {
    if (!activeNote) return;
    const saved = await db.saveNote({ ...activeNote, title, content, tags: tags !== undefined ? tags : activeNote.tags });
    setActiveNote(saved);
  };

  const maximizeNote = async () => {
    if (!activeNote) return;
    let id = activeNote.id;
    if (!id) {
      const saved = await db.saveNote(activeNote);
      id = saved.id;
    }
    closeNote();
    setLocation(`/note/${id}`);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 relative bg-background-light dark:bg-background-dark min-h-screen">
        <header className="fixed top-0 left-64 right-0 h-16 flex items-center justify-between px-8 z-10 glass-panel border-b-0">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleDark} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <Home onOpenNote={openNote} />

        <AnimatePresence>
          {isNoteOpen && activeNote && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
                onClick={closeNote}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                className="fixed top-1/2 left-1/2 w-[600px] h-[700px] bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col z-50 overflow-hidden"
              >
                <div className="h-14 flex items-center justify-end px-4 backdrop-blur-sm z-50">
                  <div className="flex items-center space-x-1">
                    <button onClick={maximizeNote} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors" title="Expand to Full Screen">
                      <Maximize2 size={16} />
                    </button>
                    <button onClick={closeNote} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-gray-400 hover:text-red-500 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-card-dark flex flex-col pb-8">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent || '';
                      setActiveNote(prev => prev ? { ...prev, title: val } : null);
                      saveActiveNote(val, activeNote.content);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                    data-placeholder="Note Title"
                    className="bg-transparent font-bold text-3xl outline-none w-full pb-4 px-8 text-gray-900 dark:text-gray-100 break-words empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:opacity-30"
                  >
                    {activeNote.title}
                  </div>

                  <div className="border-t border-gray-100 dark:border-white/5 mx-8" />

                  <div className="py-4 px-8">
                    <TagInput
                      tags={activeNote.tags || []}
                      showIcon={false}
                      onChange={(newTags) => {
                        setActiveNote(prev => prev ? { ...prev, tags: newTags } : null);
                        saveActiveNote(activeNote.title, activeNote.content, newTags);
                      }}
                    />
                  </div>

                  <div className="border-t border-gray-100 dark:border-white/5 mx-8" />

                  <div className="px-8">
                    <Editor
                      markdown={activeNote.content}
                      onChange={(md) => {
                        setActiveNote(prev => prev ? { ...prev, content: md } : null);
                        saveActiveNote(activeNote.title, md);
                      }}
                    />
                  </div>
                </div>
                <div className="h-8 flex items-center px-4 text-[10px] text-gray-400 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                  {activeNote.updated_at ? `Saved ${format(activeNote.updated_at, 'HH:mm:ss')}` : 'Unsaved'}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={AppLayout} />
      <Route path="/note/:id" component={FullPageEditor} />
    </Switch>
  );
}

export default App;
