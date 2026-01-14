import { useState, useEffect, useRef } from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import { db, type Tag } from '../lib/db';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    showIcon?: boolean;
}

export const TagInput = ({ tags, onChange, showIcon = true }: TagInputProps) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        db.getTags().then(setAllTags);
        // Subscribe to updates in case sidebar adds something
        const handleUpdate = () => db.getTags().then(setAllTags);
        window.addEventListener('nulish-tags-updated', handleUpdate);
        return () => window.removeEventListener('nulish-tags-updated', handleUpdate);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue.trim());
            }
        }
        if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
        // Down/Up arrows for suggestion navigation could go here
    };

    const addTag = (text: string) => {
        // Prevent pure duplicates
        if (!tags.includes(text)) {
            onChange([...tags, text]);
        }
        setInputValue('');
        setShowSuggestions(false);
    };

    const removeTag = (index: number) => {
        const newTags = [...tags];
        newTags.splice(index, 1);
        onChange(newTags);
    };

    // Filter suggestions based on input
    useEffect(() => {
        if (!inputValue) {
            setSuggestions([]);
            return;
        }
        // Flat search for now. 
        // Note: db tags are stored as segments. We need to reconstruct full paths if we want to suggest full paths?
        // Or just suggest segments? 
        // For simplicity in this UI, let's suggest segments.
        const matches = allTags.filter(t => t.name.toLowerCase().includes(inputValue.toLowerCase()));
        setSuggestions(matches);
        setShowSuggestions(matches.length > 0);
    }, [inputValue, allTags]);

    return (
        <div className="flex flex-wrap items-center gap-2 relative group">
            {showIcon && <TagIcon size={16} className="text-gray-400" />}

            {tags.map((tag, index) => (
                <div key={index} className="flex items-center bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-md text-sm">
                    <span>{tag}</span>
                    <button
                        onClick={() => removeTag(index)}
                        className="ml-1 hover:text-red-500 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}

            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(!!inputValue)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={tags.length === 0 ? "Add tags..." : ""}
                className="bg-transparent border-none outline-none text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 min-w-[80px] flex-1"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {suggestions.map(tag => (
                        <div
                            key={tag.id}
                            className="px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-gray-700 dark:text-gray-300 flex items-center"
                            onClick={() => addTag(tag.name)}
                        >
                            <span className="opacity-50 mr-2">#</span>
                            {tag.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
