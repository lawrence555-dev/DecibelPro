/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'noise-green': '#a7f3d0',
                'noise-yellow': '#fde68a',
                'noise-red': '#fca5a5',
                'dark-bg': '#0a0a0c',
            },
            backgroundImage: {
                'radial-gradient': 'radial-gradient(circle at top, rgba(10, 10, 12, 0.8) 0%, rgba(10, 10, 12, 1) 100%)',
            },
        },
    },
    plugins: [],
}
