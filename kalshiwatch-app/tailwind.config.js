/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				// PolyWatch color scheme: Black/White/Green
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: '#000000', // Black background
				foreground: '#FFFFFF', // White text
				primary: {
					DEFAULT: '#10B981', // Green accent (emerald-500)
					foreground: '#000000',
					hover: '#059669', // emerald-600
				},
				secondary: {
					DEFAULT: '#1F1F1F', // Dark gray for cards
					foreground: '#FFFFFF',
				},
				accent: {
					DEFAULT: '#10B981', // Green accent
					foreground: '#000000',
				},
				destructive: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#404040', // Gray for muted text
					foreground: '#A3A3A3',
				},
				popover: {
					DEFAULT: '#1F1F1F',
					foreground: '#FFFFFF',
				},
				card: {
					DEFAULT: '#1F1F1F', // Dark gray for cards
					foreground: '#FFFFFF',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}