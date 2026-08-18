import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2F2B27",
        clay: "#C24F37",
        crema: "#F8F3E9",
        sage: "#B8C6A5",
        roast: "#3A2B24",
        midnight: "#211A17",
        lagoon: "#2F6652",
        linen: "#FFFDF8",
        gold: "#F2B544"
      },
      boxShadow: {
        panel: "0 16px 50px rgba(39, 31, 25, 0.10)",
        lift: "0 22px 50px rgba(39, 31, 25, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
