// tailwind.config.js
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: "class",
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        colors: {
          'useless': {
            dark: '#242424',
            navy: '#1E1E1E',
          },
          border: "var(--border)",
          input: "var(--input)",
          ring: "var(--ring)",
          background: "var(--background)",
          foreground: "var(--foreground)",
          primary: {
            DEFAULT: "var(--primary)",
            foreground: "var(--primary-foreground)",
          },
          secondary: {
            DEFAULT: "var(--secondary)",
            foreground: "var(--secondary-foreground)",
          },
          muted: {
            DEFAULT: "var(--muted)",
            foreground: "var(--muted-foreground)",
          },
          accent: {
            DEFAULT: "var(--accent)",
            foreground: "var(--accent-foreground)",
          },
          popover: {
            DEFAULT: "var(--popover)",
            foreground: "var(--popover-foreground)",
          },
          card: {
            DEFAULT: "var(--card)",
            foreground: "var(--card-foreground)",
          },
        },
        fontFamily: {
          'display': ['Geist', 'sans-serif'],
          'text': ['Geist', 'sans-serif'],
          'sans': ['Geist', 'sans-serif'],
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: {
          "accordion-down": {
            from: { height: "0" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0" },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
        typography: {
          DEFAULT: {
            css: {
              fontSize: '24px',
              lineHeight: '1.4',
              maxWidth: '65ch',
              color: '#D9D9D9', // text-gray-400
              'h1, h2, h3, h4, h5, h6': {
                color: '#ffffff',
                fontFamily: 'Geist, sans-serif',
                fontWeight: 'var(--display-weight)',
              },
              h1: {
                fontSize: '2.5em',
                fontWeight: '300',
              },
              h2: {
                fontSize: '2em',
                fontWeight: '300',
              },
              h3: {
                fontSize: '1.75em',
                fontWeight: '300',
              },
              'p, ul, ol, li': {
                color: '#D9D9D9',
                fontFamily: 'Geist, sans-serif',
                fontSize: '24px',
                lineHeight: '1.4',
                fontWeight: 'var(--text-weight)',
              },
              'em, i': {
                fontStyle: 'italic',
                fontFamily: 'Geist, sans-serif',
                color: '#D9D9D9',
                fontWeight: 'var(--text-weight)',
              },
              strong: {
                color: '#ffffff',
              },
              code: {
                color: '#ffffff',
              },
              a: {
                color: '#ffffff',
                '&:hover': {
                  color: '#D9D9D9',
                },
              },
              blockquote: {
                borderLeftColor: '#374151', // gray-700
                color: '#D9D9D9',
              },
              hr: {
                borderColor: '#374151',
              },
            },
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  };