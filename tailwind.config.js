/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e8f5e9',
                    100: '#c8e6c9',
                    200: '#a5d6a7',
                    300: '#81c784',
                    400: '#66bb6a',
                    500: '#4caf50',  // Main green
                    600: '#43a047',
                    700: '#388e3c',
                    800: '#2e7d32',
                    900: '#1b5e20',  // Dark forest green
                },
                accent: {
                    50: '#f1f8e9',
                    100: '#dcedc8',
                    200: '#c5e1a5',
                    300: '#aed581',
                    400: '#9ccc65',
                    500: '#8bc34a',  // Bright lime green
                    600: '#7cb342',
                    700: '#689f38',
                    800: '#558b2f',
                    900: '#33691e',
                },
                blue: {
                    50: '#e3f2fd',
                    100: '#bbdefb',
                    200: '#90caf9',
                    300: '#64b5f6',
                    400: '#42a5f5',
                    500: '#2196f3',  // Button blue
                    600: '#1e88e5',
                    700: '#1976d2',
                    800: '#1565c0',
                    900: '#0d47a1',
                },
                // Dark mode colors
                dark: {
                    bg: '#0a2e1a',           // Very dark green
                    surface: '#0f3d24',       // Dark green surface
                    'surface-hover': '#144a2d', // Slightly lighter on hover
                    border: '#1a5f3a',        // Forest green border
                    text: '#ffffff',          // White text
                    'text-secondary': '#c8e6c9', // Light green text
                    'text-tertiary': '#81c784',  // Medium green text
                },
                // Light mode colors
                light: {
                    bg: '#f1f8e9',            // Very light green
                    surface: '#ffffff',        // White surface
                    'surface-hover': '#e8f5e9', // Light green hover
                    border: '#c8e6c9',         // Light green border
                    text: '#1b5e20',           // Dark green text
                    'text-secondary': '#2e7d32', // Medium green text
                    'text-tertiary': '#43a047',  // Lighter green text
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
                'glow-lg': '0 0 30px rgba(99, 102, 241, 0.4)',
            },
            animation: {
                'fade-in': 'fadeIn 0.25s ease-out',
                'slide-in': 'slideIn 0.35s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [],
}
