import React from 'react';
import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    markdownShortcutPlugin,
    type MDXEditorMethods
} from '@mdxeditor/editor';

interface EditorProps {
    markdown: string;
    onChange: (markdown: string) => void;
    editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
    className?: string;
}

export const Editor: React.FC<EditorProps> = ({ markdown, onChange, editorRef, className }) => {
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <div className="nulish-editor w-full h-full">
            <MDXEditor
                ref={editorRef}
                markdown={markdown}
                onChange={onChange}
                className={isDark ? 'dark-theme' : ''}
                contentEditableClassName={`prose dark:prose-invert max-w-none focus:outline-none min-h-[50vh] px-8 py-4 prose-headings:font-serif prose-headings:font-normal ${className || ''}`}
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    markdownShortcutPlugin()
                ]}
            />
        </div>
    );
};
