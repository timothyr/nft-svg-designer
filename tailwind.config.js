module.exports = {
    mode: 'jit',
    purge: {
        enabled: true,
        // enabled: process.env.TAILWIND_MODE === 'build',
        content: ['./src/**/*.{html,ts}']
    },
    darkMode: 'media', // or 'media' or 'class'
    theme: {
        container: {
            padding: '2rem',
        },
        fontFamily: {
            'sans': ['Open Sans', 'ui-sans-serif', 'system-ui'],
        }
    },
    variants: {},
    plugins: [],
};