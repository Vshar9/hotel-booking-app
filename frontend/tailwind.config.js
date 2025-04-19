/**@type {import('tailwindcss').config}*/

export default {
    content: ["./index.html, ./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
        container: {
            padding: {
                DEFAULT: '0.5rem',
                sm: "1rem",
                md: "10rem"
            }
        }
    },
    plugins: [],
}