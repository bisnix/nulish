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

    // Load defaults on open
    useEffect(() => {
        if (isOpen) {
            const savedFont = localStorage.getItem('default_font') || 'font-sans';
            const savedSize = localStorage.getItem('default_size') || 'text-editor-sm';
            const savedFrame = localStorage.getItem('default_frame') || 'none';

            setFontFamily(savedFont);
            setFontSize(savedSize);
            setFrameStyle(savedFrame);
        }
    }, [isOpen]);

    const saveSettings = () => {
        localStorage.setItem('default_font', fontFamily);
        localStorage.setItem('default_size', fontSize);
        localStorage.setItem('default_frame', frameStyle);
        onClose();
        // Notify app to refresh defaults if needed (optional)
        window.dispatchEvent(new Event('nulish-defaults-updated'));
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
                </div>
            )}
        </AnimatePresence>
    );
};
