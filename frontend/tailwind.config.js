/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Arial",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        rc: {
          purple: "#6f4cf4",
          purple2: "#8160f3",
          blue: "#5088df",
          cyan: "#10b8bf",
          navy: "#182034",
          bg: "#f8f9fd",
          card: "#ffffff",
          line: "#e9ebf3",
          text: "#22283a",
          muted: "#7a839a",
          soft: "#f3f1ff",
          green: "#24b47e",
          red: "#ed5d67",
          orange: "#f5a524",
          info: "#4c91e8",
        },
      },
      backgroundImage: {
        "rc-grad": "linear-gradient(110deg, #6f4cf4 0%, #5e6bea 47%, #10b8bf 100%)",
      },
      boxShadow: {
        rc: "0 6px 24px rgba(34,40,74,.055)",
      },
      borderRadius: {
        rc: "10px",
      },
      spacing: {
        rcsidebar: "224px",
        "rcsidebar-sm": "205px",
        rcheader: "64px",
      },
    },
  },
  plugins: [],
};
