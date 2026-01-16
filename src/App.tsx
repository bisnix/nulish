import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Route, Switch, useLocation } from 'wouter';
import { Plus, Search, Maximize2, X, Moon, Sun, ArrowLeft, MoreHorizontal, PanelRight, Trash2 } from 'lucide-react';
import { Editor } from './components/Editor';
import { db, type Note } from './lib/db';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TagInput } from './components/TagInput';
import { TitleTextarea } from './components/TitleTextarea';
import { GlobalSettingsModal } from './components/GlobalSettingsModal';
import { ConfirmDialog } from './components/ConfirmDialog';

// --- Components ---

function Home({ onOpenNote }: { onOpenNote: (note?: Note) => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Initial load
    db.getNotes().then(setNotes);

    // Polling only if NOT searching (to avoid overwriting search results)
    const interval = setInterval(() => {
      if (!searchQuery) {
        db.getNotes().then(setNotes);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = window.setTimeout(() => {
      if (val.trim()) {
        db.searchNotes(val).then(setNotes);
      } else {
        db.getNotes().then(setNotes);
      }
    }, 300);
  };

  return (
    <div className="p-8 pt-24 max-w-4xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center space-x-3 w-full bg-gray-100 dark:bg-white/5 pl-4 pr-1.5 py-1.5 rounded-xl text-sm text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 has-[button:hover]:bg-gray-100 dark:has-[button:hover]:bg-white/5 transition-colors focus-within:ring-2 ring-gray-200 dark:ring-white/10 group">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search notes (title, content, #tags)..."
            value={searchQuery}
            onChange={handleSearch}
            className="bg-transparent border-none outline-none w-full placeholder:text-gray-400 py-2 h-full"
          />
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

  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fontFamily, setFontFamily] = useState<'font-sans' | 'font-droid-serif' | 'font-dm-mono'>('font-sans');

  const [fontSize, setFontSize] = useState<'text-editor-sm' | 'text-editor-md' | 'text-editor-lg'>('text-editor-sm');
  const [frameStyle, setFrameStyle] = useState<'none' | 'vertical' | 'boxed'>('none');
  const [showToolbar, setShowToolbar] = useState(true);

  useEffect(() => {
    // Load sidebar state
    const savedSidebar = localStorage.getItem('nulish_sidebar_open');
    if (savedSidebar !== null) setIsSidebarOpen(savedSidebar === 'true');

    // Initialize dark mode from DOM
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }

    // Load settings from local storage
    const savedFont = localStorage.getItem('nulish_font');
    if (savedFont) setFontFamily(savedFont as any);
    const savedSize = localStorage.getItem('nulish_size');
    if (savedSize) setFontSize(savedSize as any);
    const savedFrame = localStorage.getItem('nulish_frame');
    if (savedFrame) setFrameStyle(savedFrame as any);
    const savedToolbar = localStorage.getItem('nulish_show_toolbar');
    if (savedToolbar !== null) setShowToolbar(savedToolbar === 'true');

    if (params.id) {
      db.getNote(params.id).then(n => {
        if (n) setNote(n);
      });
    }
  }, [params.id]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('nulish_sidebar_open', String(newState));
  };

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const updateFont = (font: string) => {
    setFontFamily(font as any);
    localStorage.setItem('nulish_font', font);
  };

  const updateSize = (size: string) => {
    setFontSize(size as any);
    localStorage.setItem('nulish_size', size);
  };

  const updateFrame = (style: string) => {
    setFrameStyle(style as any);
    localStorage.setItem('nulish_frame', style);
  };

  const toggleToolbar = () => {
    const next = !showToolbar;
    setShowToolbar(next);
    localStorage.setItem('nulish_show_toolbar', String(next));
  };

  const saveNote = async (title: string, content: string, tags?: string[]) => {
    if (!note) return;
    const updated = await db.saveNote({ ...note, title, content, tags: tags !== undefined ? tags : note.tags });
    setNote(updated);
  };

  if (!note) return <div className="p-8">Loading...</div>;

  return (
    <div className={`flex min-h-screen font-sans text-gray-900 dark:text-gray-100 bg-background-light dark:bg-background-dark animate-in fade-in duration-500`}>

      <Sidebar isOpen={isSidebarOpen} onOpenSettings={() => setShowGlobalSettings(true)} />

      <main className={`flex-1 relative bg-background-light dark:bg-background-dark min-h-screen transition-all duration-300 ${isSidebarOpen ? 'mr-64' : 'mr-0'}`}>
        <header className={`fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-8 z-10 glass-panel border-b-0 transition-all duration-300 ${isSidebarOpen ? 'mr-64' : 'mr-0'}`}>
          <div className="flex items-center space-x-4">
            <button onClick={() => setLocation('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={20} className="opacity-50" />
            </button>
            <div className="text-sm opacity-40 font-medium">Edited {format(note.updated_at, 'MMM d, HH:mm')}</div>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={toggleDark} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleSidebar} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
              <PanelRight size={20} className={isSidebarOpen ? 'text-primary' : 'text-gray-500'} />
            </button>

            {/* Settings Menu */}
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
                            { id: 'text-editor-sm', label: 'Small' },
                            { id: 'text-editor-md', label: 'Medium' },
                            { id: 'text-editor-lg', label: 'Large' }
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


                      <div className="h-px bg-gray-100 dark:bg-white/5" />

                      <div>
                        <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Frame</div>
                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                          {[
                            { id: 'none', label: 'None' },
                            { id: 'vertical', label: 'Sided' },
                            { id: 'boxed', label: 'Boxed' }
                          ].map(style => (
                            <button
                              key={style.id}
                              onClick={() => updateFrame(style.id)}
                              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${frameStyle === style.id ? 'bg-white dark:bg-card-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                            >
                              {style.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100 dark:bg-white/5" />

                      {/* Toolbar Toggle */}
                      <div>
                        <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Interface</div>
                        <button
                          onClick={toggleToolbar}
                          className={`w-full py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center space-x-2 ${!showToolbar
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200'
                            }`}
                        >
                          <span>{showToolbar ? 'Hide Toolbar' : 'Show Toolbar'}</span>
                        </button>
                      </div>

                      <div className="h-px bg-gray-100 dark:bg-white/5" />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Publish</div>
                          {note.is_published && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">LIVE</span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            const newStatus = !note.is_published;
                            setNote({ ...note, is_published: newStatus });
                            saveNote(note.title, note.content, note.tags);
                            // Explicit save with updated publish status is handled by setNote->saveNote logic? 
                            // Wait, saveNote uses args. We need to pass the updated note object or ensure saveNote handles generic updates.
                            // Actually saveNote signature is (title, content, tags). It doesn't take is_published.
                            // Let's create a specific update function or modify saveNote in FullPageEditor to be more generic?
                            // QUICK FIX: Update saveNote to support partial updates or just call db.saveNote directly here.
                            db.saveNote({ ...note, is_published: newStatus }).then(updated => setNote(updated));
                          }}
                          className={`w-full py-2 px-3 rounded-md text-xs font-medium transition-all mb-2 flex items-center justify-center space-x-2 ${note.is_published
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200'
                            }`}
                        >
                          <span>{note.is_published ? 'Unpublish Note' : 'Publish to Web'}</span>
                        </button>

                        {note.is_published && (
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/${note.id}`;
                              navigator.clipboard.writeText(url);
                              // Could show toast here
                              const btn = document.getElementById('copy-btn-text');
                              if (btn) {
                                const original = btn.textContent;
                                btn.textContent = 'Copied!';
                                setTimeout(() => btn.textContent = original, 2000);
                              }
                            }}
                            className="w-full py-2 px-3 rounded-md border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center space-x-2"
                          >
                            <span id="copy-btn-text">Copy Public Link</span>
                          </button>
                        )}
                      </div>

                      <div className="h-px bg-gray-100 dark:bg-white/5" />

                      <button
                        onClick={() => {
                          setShowSettings(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full flex items-center space-x-2 px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Delete Note</span>
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-16" onClick={() => setShowSettings(false)}>
          <div className={`max-w-3xl mx-auto py-12 px-8 transition-all duration-300 
            ${frameStyle === 'vertical' ? 'border-x border-gray-200 dark:border-white/5 min-h-screen bg-white dark:bg-card-dark' : ''} 
            ${frameStyle === 'boxed' ? 'border border-gray-200 dark:border-white/5 rounded-xl my-8 min-h-[calc(100vh-8rem)] bg-white dark:bg-card-dark shadow-sm' : ''}
          `}>
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
              showToolbar={showToolbar}
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
      </main>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (note) {
            db.deleteNote(note.id).then(() => {
              setLocation('/');
              window.dispatchEvent(new Event('nulish-notes-updated'));
            });
          }
        }}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
      <GlobalSettingsModal isOpen={showGlobalSettings} onClose={() => setShowGlobalSettings(false)} />
    </div >
  );
}

// --- Main App Logic ---

function AppLayout() {
  const [isDark, setIsDark] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  // Load sidebar state persistence
  useEffect(() => {
    const savedSidebar = localStorage.getItem('nulish_sidebar_open');
    if (savedSidebar !== null) setIsSidebarOpen(savedSidebar === 'true');
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('nulish_sidebar_open', String(newState));
  };
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
      // Create new note with DEFAULTS
      const defaultFont = localStorage.getItem('default_font') || 'font-sans';
      const defaultSize = localStorage.getItem('default_size') || 'prose-base';
      const defaultFrame = localStorage.getItem('default_frame') || 'none';

      // Temporarily save these to note-specific persistence keys so the editor picks them up initially
      localStorage.setItem('nulish_font', defaultFont);
      localStorage.setItem('nulish_size', defaultSize);
      localStorage.setItem('nulish_frame', defaultFrame);

      setActiveNote({
        title: '',
        content: '',
        id: '',
        tags: [],
        updated_at: new Date(),
        created_at: new Date()
      } as any);
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
    setLocation(`/n/${id}`);
  };

  return (
    <div className={`flex min-h-screen font-sans text-gray-900 dark:text-gray-100 selection:bg-primary/20 bg-background-light dark:bg-background-dark`}>

      <Sidebar isOpen={isSidebarOpen} onOpenSettings={() => setShowGlobalSettings(true)} />

      <main className={`flex-1 relative bg-background-light dark:bg-background-dark min-h-screen transition-all duration-300 ${isSidebarOpen ? 'mr-64' : 'mr-0'}`}>
        <header className={`fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-8 z-10 glass-panel border-b-0 transition-all duration-300 ${isSidebarOpen ? 'mr-64' : 'mr-0'}`}>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleDark} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleSidebar} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
              <PanelRight size={20} className={isSidebarOpen ? 'text-primary' : 'text-gray-500'} />
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
                    className="bg-transparent font-bold text-3xl outline-none w-full pb-4 px-8 text-center text-gray-900 dark:text-gray-100 break-words empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:opacity-30"
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
                      showToolbar={false}
                      className="text-editor-lg"
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
        <GlobalSettingsModal isOpen={showGlobalSettings} onClose={() => setShowGlobalSettings(false)} />
      </main>
    </div>
  );
}

function PublicNoteView({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if dark mode is preferred
    if (document.documentElement.classList.contains('dark') ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    db.getPublicNote(params.id).then(n => {
      if (n) {
        setNote(n);
      } else {
        setError('Note not found or not published');
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-background-dark dark:text-gray-100">Loading...</div>;
  if (error || !note) return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-background-dark dark:text-gray-100 space-y-4">
      <div className="text-xl font-medium">{error || '404 Not Found'}</div>
      <button onClick={() => setLocation('/')} className="text-primary hover:underline">Go Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex justify-center py-20 px-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 font-serif leading-tight">{note.title || 'Untitled'}</h1>
        <div className="flex items-center space-x-2 mb-8 overflow-x-auto no-scrollbar">
          {note.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300">#{tag}</span>
          ))}
          <span className="text-xs text-gray-400 pl-2">{format(note.updated_at, 'MMM d, yyyy')}</span>
        </div>
        <Editor
          markdown={note.content}
          readOnly={true}
          showToolbar={false}
          className="text-editor-lg"
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={AppLayout} />
      <Route path="/n/:id" component={FullPageEditor} />
      <Route path="/note/:id" component={FullPageEditor} />
      <Route path="/:id" component={PublicNoteView} />
    </Switch>
  );
}

export default App;
