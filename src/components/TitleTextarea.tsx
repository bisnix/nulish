import { useRef, useLayoutEffect } from 'react';

interface TitleTextareaProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
}

export function TitleTextarea({ value, onChange, className, placeholder = "Note Title" }: TitleTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useLayoutEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            onInput={adjustHeight}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`bg-transparent font-bold text-3xl outline-none w-full mb-4 placeholder:opacity-30 text-left resize-none overflow-hidden text-gray-900 dark:text-gray-100 ${className || ''}`}
        />
    );
}
