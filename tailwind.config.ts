import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// Backgrounds
				background: "#0f0f0f",
				surface: "#1c1c1e",
				"surface-elevated": "#2c2c2e",

				// Texts
				primary: "#ffffff",
				secondary: "#a1a1aa",
				muted: "#52525b",

				// Accents
				accent: "#34d399",
				"accent-hover": "#15803d",
				"accent-light": "#dcfce7",

				// Status
				"status-to-read": "#6366f1",
				"status-reading": "#f59e0b",
				"status-finished": "#34d399",

				// Borders
				border: "#3f3f46",
			},
		},
	},
	plugins: [],
};

export default config;
