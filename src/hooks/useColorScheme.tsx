import { useEffect, useState } from 'react';

export function useColorScheme() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial
        setIsDark(document.documentElement.classList.contains('dark'));

        // Observer for changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDark(document.documentElement.classList.contains('dark'));
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    return isDark;
}
