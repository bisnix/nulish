import React from 'react';
import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    markdownShortcutPlugin,
    toolbarPlugin,
    linkPlugin,
    linkDialogPlugin,
    imagePlugin,
    tablePlugin,
    thematicBreakPlugin,
    codeBlockPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    CreateLink,
    InsertImage,
    InsertTable,
    ListsToggle,
    InsertCodeBlock,
    InsertThematicBreak,
    codeMirrorPlugin,
    type MDXEditorMethods
} from '@mdxeditor/editor';

interface EditorProps {
    markdown: string;
    onChange?: (markdown: string) => void;
    editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
    className?: string;
    showToolbar?: boolean; // Optional: default true
    readOnly?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ markdown, onChange, editorRef, className, showToolbar = true, readOnly = false }) => {
    const isDark = document.documentElement.classList.contains('dark');

    // Hack: Shorten Block Type Labels in Toolbar (e.g. "Paragraph" -> "P")
    React.useEffect(() => {
        if (readOnly) return; // Skip toolbar hacks if readOnly
        const shortenLabels = () => {
            const btn = document.querySelector('.mdxeditor-toolbar button[aria-label="Block type"]');
            if (btn) {
                // Find the text span
                const spans = Array.from(btn.querySelectorAll('span'));
                // Expected: span 1 = text, span 2 = arrow. But checking text content is safest.
                const textSpan = spans.find(s =>
                    s.textContent && (
                        s.textContent === 'Paragraph' ||
                        s.textContent.startsWith('Heading ') ||
                        s.textContent === 'Quote' ||
                        s.textContent === 'Check List'
                    )
                );

                if (textSpan) {
                    // Hide original span logic is in CSS (span:first-child)
                    // But if textSpan is NOT first child, our CSS fails. 
                    // Let's enforce hiding via JS styling to be safe.
                    textSpan.style.display = 'none'; // Force hide

                    let shortLabel = btn.querySelector('.short-label');
                    if (!shortLabel) {
                        shortLabel = document.createElement('span');
                        shortLabel.className = 'short-label';
                        // Insert before the arrow (last span usually, or just append to button if absolute pos)
                        btn.insertBefore(shortLabel, textSpan);
                    }

                    const text = textSpan.textContent || '';
                    let shortText = text.substring(0, 2);
                    if (text === 'Paragraph') shortText = 'P';
                    if (text.startsWith('Heading ')) shortText = 'H' + text.split(' ')[1];
                    if (text === 'Quote') shortText = '“';
                    if (text === 'Check List') shortText = '✓';

                    if (shortLabel.textContent !== shortText) {
                        shortLabel.textContent = shortText;
                    }
                }
            }
        };

        const interval = setInterval(shortenLabels, 100);
        setTimeout(shortenLabels, 0); // Run immediately

        return () => clearInterval(interval);
    }, [readOnly]);

    return (
        <div className={`nulish-editor w-full h-full ${readOnly ? 'read-only' : ''} ${!showToolbar ? 'hide-toolbar' : ''}`}>
            <MDXEditor
                ref={editorRef}
                markdown={markdown}
                onChange={onChange}
                readOnly={readOnly}
                className={isDark ? 'dark-theme' : ''}
                contentEditableClassName={`prose dark:prose-invert max-w-none focus:outline-none min-h-[50vh] py-4 prose-headings:font-serif prose-headings:font-normal ${className || ''}`}
                plugins={[
                    ...(!readOnly ? [
                        toolbarPlugin({
                            toolbarContents: () => (
                                <>
                                    <UndoRedo />
                                    <BoldItalicUnderlineToggles />
                                    <BlockTypeSelect />
                                    <ListsToggle />
                                    <CreateLink />
                                    <InsertImage />
                                    <InsertTable />
                                    <InsertCodeBlock />
                                    <InsertThematicBreak />
                                </>
                            )
                        })
                    ] : []),
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    markdownShortcutPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    imagePlugin(),
                    tablePlugin(),
                    thematicBreakPlugin(),
                    codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
                    codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'Plain Text', ts: 'TypeScript', html: 'HTML' } })
                ]}
            />
        </div>
    );
};
