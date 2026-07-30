import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ReplaceAll } from 'lucide-react';

interface FindReplaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReplace: (findText: string, replaceText: string) => void;
}

export const FindReplaceModal = ({ isOpen, onClose, onReplace }: FindReplaceModalProps) => {
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');

    // Focus management could be added here if needed

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
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
                        className="w-full max-w-sm bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 relative pointer-events-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold font-serif">Find & Replace</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Find</label>
                                <input
                                    type="text"
                                    value={findText}
                                    onChange={(e) => setFindText(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-md px-3 py-2 text-sm focus:ring-1 ring-primary outline-none"
                                    placeholder="Text to find..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Replace with</label>
                                <input
                                    type="text"
                                    value={replaceText}
                                    onChange={(e) => setReplaceText(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-md px-3 py-2 text-sm focus:ring-1 ring-primary outline-none"
                                    placeholder="Replacement text..."
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    onClick={() => {
                                        onReplace(findText, replaceText);
                                    }}
                                    disabled={!findText}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ReplaceAll size={16} />
                                    <span>Replace All</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
