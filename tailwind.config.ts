import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        cream: 'hsl(var(--cream) / <alpha-value>)',
        ivory: 'hsl(var(--ivory) / <alpha-value>)',
        blush: 'hsl(var(--blush) / <alpha-value>)',
        gold: 'hsl(var(--gold) / <alpha-value>)',
        'gold-light': 'hsl(var(--gold-light) / <alpha-value>)',
        'warm-dark': 'hsl(var(--warm-dark) / <alpha-value>)',
        'warm-mid': 'hsl(var(--warm-mid) / <alpha-value>)',
        'warm-soft': 'hsl(var(--warm-soft) / <alpha-value>)',
        sage: 'hsl(var(--sage) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'serif'],
        body: ['var(--font-jost)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
