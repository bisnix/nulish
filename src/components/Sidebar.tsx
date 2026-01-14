import { useEffect, useState } from 'react';
import { db, type Tag } from '../lib/db';
import { ChevronRight, ChevronDown, Hash, Plus, Settings } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const Sidebar = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    useEffect(() => {
        db.getTags().then(setTags);

        const handleTagsUpdate = () => {
            db.getTags().then(setTags);
        };

        window.addEventListener('nulish-tags-updated', handleTagsUpdate);
        return () => window.removeEventListener('nulish-tags-updated', handleTagsUpdate);
    }, []);

    const toggleExpand = (id: string) => {
        const next = new Set(expanded);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpanded(next);
    };

    const renderTag = (tag: Tag, depth = 0) => {
        // Only support 1 level nesting for now for simplicity in demo
        const children = tags.filter(t => t.parent_id === tag.id);
        const hasChildren = children.length > 0;
        const isExpanded = expanded.has(tag.id);

        return (
            <div key={tag.id} className="select-none">
                <div
                    className={clsx(
                        "flex items-center px-3 py-1.5 text-sm rounded-lg cursor-pointer transition-colors group",
                        "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
                    )}
                    style={{ paddingLeft: `${depth * 12 + 12}px` }}
                >
                    <div
                        className="p-0.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 mr-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(tag.id);
                        }}
                    >
                        {hasChildren ? (
                            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                        ) : <div className="w-[14px]" />}
                    </div>

                    <Hash size={14} className="mr-2 opacity-50" />
                    <span className="flex-1 truncate">{tag.name}</span>
                </div>

                {hasChildren && isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {children.map(child => renderTag(child, depth + 1))}
                    </motion.div>
                )}
            </div>
        );
    };

    const rootTags = tags.filter(t => !t.parent_id);

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 border-r border-gray-200 dark:border-white/5 bg-background-light dark:bg-card-dark flex flex-col z-20">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-white/5">
                <span className="font-serif italic font-bold text-xl tracking-tight">Nulish</span>
            </div>

            {/* Tags */}
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between items-center group">
                    <span>Tags</span>
                    <Plus size={14} className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {rootTags.map(tag => renderTag(tag))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-white/5">
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
                    <Settings size={16} />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
};
