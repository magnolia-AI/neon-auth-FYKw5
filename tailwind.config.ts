/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				// Use CSS variables so brand themes can override fonts
				// Fallbacks ensure text displays even before fonts load
				heading: ['var(--font-heading)', 'Poppins', 'sans-serif'],
				body: ['var(--font-body)', 'Inter', 'sans-serif'],
				mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
			},
			colors: {
				border: "oklch(var(--border))",
				input: "oklch(var(--input))",
				ring: "oklch(var(--ring))",
				background: "oklch(var(--background))",
				foreground: "oklch(var(--foreground))",
				primary: {
					DEFAULT: "oklch(var(--primary))",
					foreground: "oklch(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "oklch(var(--secondary))",
					foreground: "oklch(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "oklch(var(--destructive))",
					foreground: "oklch(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "oklch(var(--muted))",
					foreground: "oklch(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "oklch(var(--accent))",
					foreground: "oklch(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "oklch(var(--popover))",
					foreground: "oklch(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "oklch(var(--card))",
					foreground: "oklch(var(--card-foreground))",
				},
				// Sidebar colors for sidebar component
				sidebar: {
					DEFAULT: "oklch(var(--sidebar))",
					foreground: "oklch(var(--sidebar-foreground))",
					primary: "oklch(var(--sidebar-primary))",
					"primary-foreground": "oklch(var(--sidebar-primary-foreground))",
					accent: "oklch(var(--sidebar-accent))",
					"accent-foreground": "oklch(var(--sidebar-accent-foreground))",
					border: "oklch(var(--sidebar-border))",
					ring: "oklch(var(--sidebar-ring))",
				},
				// Chart colors
				chart: {
					1: "oklch(var(--chart-1))",
					2: "oklch(var(--chart-2))",
					3: "oklch(var(--chart-3))",
					4: "oklch(var(--chart-4))",
					5: "oklch(var(--chart-5))",
				},
			},
			borderRadius: {
				lg: `var(--radius)`,
				md: `calc(var(--radius) - 2px)`,
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require("tailwindcss-animate")],
}
