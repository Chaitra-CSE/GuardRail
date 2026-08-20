/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                guardrail: {
                    blue: '#5B8CFF',
                    violet: '#8B5CF6',
                    cyan: '#22D3EE',
                    bg: '#070B14',
                    bg2: '#0B1220',
                }
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
            }
        },
    },
    plugins: [],
}