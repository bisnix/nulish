import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                        className="fixed top-1/2 left-1/2 w-[420px] bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 z-[101] overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-start space-x-4">
                                {isDanger && (
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                        <AlertTriangle size={20} className="text-red-500" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-white/10">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDanger
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-primary hover:bg-primary/90 text-white'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
