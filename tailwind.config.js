/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#8B5CF6",
                "background-light": "#F9FAFB",
                "background-dark": "#0D0D0D",
                "card-dark": "#161616",
                "accent-yellow": "#D4AF37",
                "accent-blue": "#4A90E2",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                display: ["Inter", "sans-serif"],
                serif: ["Playfair Display", "serif"],
            },
            borderRadius: {
                DEFAULT: "12px",
                'xl': '20px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
