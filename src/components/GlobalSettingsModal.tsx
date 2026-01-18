import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface GlobalSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GlobalSettingsModal = ({ isOpen, onClose }: GlobalSettingsModalProps) => {
    const [fontFamily, setFontFamily] = useState('font-sans');
    const [fontSize, setFontSize] = useState('text-editor-sm');
    const [frameStyle, setFrameStyle] = useState('none');

    const [siteTitle, setSiteTitle] = useState('Nulish');
    const [siteDesc, setSiteDesc] = useState('A minimalist writing app.');
    const [siteFavicon, setSiteFavicon] = useState('');
    const [siteThumbnail, setSiteThumbnail] = useState('');

    // Load defaults on open
    useEffect(() => {
        if (isOpen) {
            const savedFont = localStorage.getItem('default_font') || 'font-sans';
            const savedSize = localStorage.getItem('default_size') || 'text-editor-sm';
            const savedFrame = localStorage.getItem('default_frame') || 'none';

            setFontFamily(savedFont);
            setFontSize(savedSize);
            setFrameStyle(savedFrame);

            setSiteTitle(localStorage.getItem('site_title') || 'Nulish');
            setSiteDesc(localStorage.getItem('site_desc') || 'A minimalist writing app.');
            setSiteFavicon(localStorage.getItem('site_favicon') || '');
            setSiteThumbnail(localStorage.getItem('site_thumbnail') || '');
        }
    }, [isOpen]);

    const saveSettings = () => {
        localStorage.setItem('default_font', fontFamily);
        localStorage.setItem('default_size', fontSize);
        localStorage.setItem('default_frame', frameStyle);

        localStorage.setItem('site_title', siteTitle);
        localStorage.setItem('site_desc', siteDesc);
        localStorage.setItem('site_favicon', siteFavicon);
        localStorage.setItem('site_thumbnail', siteThumbnail);

        onClose();
        // Notify app to refresh defaults if needed (optional)
        window.dispatchEvent(new Event('nulish-defaults-updated'));
        window.dispatchEvent(new Event('nulish-meta-updated'));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm pointer-events-auto"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 relative pointer-events-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold font-serif">Global Default Settings</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                These settings will be applied as defaults for all <strong>newly created notes</strong>.
                            </p>

                            {/* Site Identity */}
                            <div>
                                <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Site Identity (Meta Tags)</div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Site Title</label>
                                        <input
                                            type="text"
                                            value={siteTitle}
                                            onChange={(e) => setSiteTitle(e.target.value)}
                                            className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-md px-3 py-2 text-sm focus:ring-1 ring-primary outline-none"
                                            placeholder="Nulish"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={siteDesc}
                                            onChange={(e) => setSiteDesc(e.target.value)}
                                            className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-md px-3 py-2 text-sm focus:ring-1 ring-primary outline-none"
                                            placeholder="A minimalist writing app."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Favicon URL</label>
                                            <input
                                                type="text"
                                                value={siteFavicon}
                                                onChange={(e) => setSiteFavicon(e.target.value)}
                                                className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-md px-3 py-2 text-sm focus:ring-1 ring-primary outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Thumbnail URL</label>
                                            <input
                                                type="text"
                                                value={siteThumbnail}
                                                onChange={(e) => setSiteThumbnail(e.target.value)}
                                                className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-md px-3 py-2 text-sm focus:ring-1 ring-primary outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-white/5 my-4" />

                            {/* Font Family */}
                            <div>
                                <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Default Font</div>
                                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                                    {[
                                        { id: 'font-sans', label: 'Default' },
                                        { id: 'font-droid-serif', label: 'Serif' },
                                        { id: 'font-dm-mono', label: 'Mono' }
                                    ].map(font => (
                                        <button
                                            key={font.id}
                                            onClick={() => setFontFamily(font.id)}
                                            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${fontFamily === font.id ? 'bg-white dark:bg-card-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                        >
                                            {font.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Size */}
                            <div>
                                <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Default Size</div>
                                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                                    {[
                                        { id: 'text-editor-sm', label: 'Small' },
                                        { id: 'text-editor-md', label: 'Medium' },
                                        { id: 'text-editor-lg', label: 'Large' }
                                    ].map(size => (
                                        <button
                                            key={size.id}
                                            onClick={() => setFontSize(size.id)}
                                            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${fontSize === size.id ? 'bg-white dark:bg-card-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                        >
                                            {size.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Frame Style */}
                            <div>
                                <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Default Frame</div>
                                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                                    {[
                                        { id: 'none', label: 'None' },
                                        { id: 'vertical', label: 'Sided' },
                                        { id: 'boxed', label: 'Boxed' }
                                    ].map(style => (
                                        <button
                                            key={style.id}
                                            onClick={() => setFrameStyle(style.id)}
                                            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${frameStyle === style.id ? 'bg-white dark:bg-card-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={saveSettings}
                                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Check size={16} />
                                    <span>Save Defaults</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div >
            )}
        </AnimatePresence >
    );
};
