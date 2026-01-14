import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Route, Switch, useLocation, useRoute } from 'wouter';
import { Plus, Search, Maximize2, X, Moon, Sun, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Editor } from './components/Editor';
import { db, type Note } from './lib/db';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="text-[10px] font-semibold tracking-[0.3em] uppercase opacity-40 mb-2">Daily Focus</div>
        <h1 className="text-3xl font-serif dark:text-gray-100">
          {format(new Date(), 'EEEE, d MMMM yyyy')}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => onOpenNote(note)}
            className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">{note.title || 'Untitled'}</h3>
            <p className="text-sm opacity-60 line-clamp-2">{note.content.replace(/[#*`_]/g, '') || 'No content'}</p>
            <div className="mt-4 text-xs opacity-40">{format(note.updated_at, 'MMM d, HH:mm')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FullPageEditor({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<Note | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (params.id) {
      db.getNote(params.id).then(n => {
        if (n) setNote(n);
      });
    }
  }, [params.id]);

  const saveNote = async (title: string, content: string) => {
    if (!note) return;
    const updated = await db.saveNote({ ...note, title, content });
    setNote(updated);
  };

  if (!note) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-background-dark">
      {/* Minimal Header */}
      <div className="h-16 flex items-center justify-between px-8 border-b border-gray-100 dark:border-white/5">
        <button onClick={() => setLocation('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} className="opacity-50" />
        </button>
        <div className="text-sm opacity-40 font-medium">Edited {format(note.updated_at, 'MMM d, HH:mm')}</div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <MoreHorizontal size={20} className="opacity-50" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-12 px-8">
          <input
            value={note.title}
            onChange={e => {
              setNote({ ...note, title: e.target.value });
              saveNote(e.target.value, note.content);
            }}
            placeholder="Note Title"
            className="text-4xl font-serif font-bold bg-transparent outline-none w-full mb-8 placeholder:opacity-30"
          />
          <Editor
            markdown={note.content}
            onChange={md => {
              setNote({ ...note, content: md });
              saveNote(note.title, md);
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
      setActiveNote({ title: '', content: '', id: '', updated_at: 0, is_pinned: false });
    }
    setIsNoteOpen(true);
  };

  const closeNote = () => {
    setIsNoteOpen(false);
    setActiveNote(null);
  };

  const saveActiveNote = async (title: string, content: string) => {
    if (!activeNote) return;
    const saved = await db.saveNote({ ...activeNote, title, content });
    setActiveNote(saved);
  };

  const maximizeNote = async () => {
    if (!activeNote) return;
    // Ensure it's saved first so we have an ID
    let id = activeNote.id;
    if (!id) {
      const saved = await db.saveNote(activeNote);
      id = saved.id;
    }
    closeNote(); // Close modal
    setLocation(`/note/${id}`); // Navigate
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 relative bg-background-light dark:bg-background-dark min-h-screen">
        <header className="fixed top-0 left-64 right-0 h-16 flex items-center justify-between px-8 z-10 glass-panel border-b-0">
          <div className="flex items-center space-x-3 w-full max-w-md bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-lg text-sm text-gray-500">
            <Search size={16} />
            <input type="text" placeholder="Search notes..." className="bg-transparent border-none outline-none w-full" />
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleDark} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => openNote()} className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity">
              <Plus size={18} />
              <span>New Note</span>
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
                <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                  <input
                    value={activeNote.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActiveNote(prev => prev ? { ...prev, title: val } : null);
                      saveActiveNote(val, activeNote.content);
                    }}
                    placeholder="Note Title"
                    className="bg-transparent font-medium outline-none text-lg flex-1 mr-4"
                  />
                  <div className="flex items-center space-x-1">
                    <button onClick={maximizeNote} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors" title="Expand to Full Screen">
                      <Maximize2 size={16} />
                    </button>
                    <button onClick={closeNote} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-gray-400 hover:text-red-500 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-card-dark flex flex-col">
                  <Editor
                    markdown={activeNote.content}
                    onChange={(md) => {
                      setActiveNote(prev => prev ? { ...prev, content: md } : null);
                      saveActiveNote(activeNote.title, md);
                    }}
                  />
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
