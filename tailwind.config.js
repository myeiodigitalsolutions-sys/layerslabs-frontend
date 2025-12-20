/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Poppins"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          pink: "#FF6AD5",
          orange: "#FFB347",
          blue: "#5B8DFF",
          purple: "#9B5BFF",
          yellow: "#FFE45E",
        },
      },
      boxShadow: {
        "toy": "0 20px 40px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
};
