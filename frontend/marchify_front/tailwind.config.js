// tailwind.config.js
const { guessProductionMode } = require("@ngneat/tailwind");

module.exports = {
  important: true,
  prefix: "",
  mode: "jit",
  purge: {
    enabled: guessProductionMode(),
    content: ["./src/**/*.{html,ts,css,scss,sass,less,styl}"],
  },
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        // Your custom colors
        "primary-dark": "#212c57",
        "primary-green": "#29875c",
        "primary-teal": "#38cddd",
        "primary-light-green": "#47a275",
        "primary-cyan": "#4bc5ce",
        "primary-mint": "#63bd8f",
        "primary-light-teal": "#91c4c8",
        "primary-lime": "#98e256",
        "primary-dark-orange": "#9d3518",
        "primary-pink": "#a52b4d",
        "primary-light-cyan": "#ace0e4",
        "primary-brown": "#b06129",
        "primary-purple": "#d585e1",
        "primary-red": "#dd5248",
        "primary-yellow": "#e0ab3a",
        "primary-orange": "#ec945a",
        "bg-light": "#f9f3d1",
        "bg-lighter": "#f9f1b2",
        "bg-neutral": "#e2dfc3",
        "principle-primary": "#4bc5ce",
        "principle-secondary": "#fec655",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      spacing: {
        128: "32rem",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      backgroundColor: ["disabled"],
      textColor: ["disabled"],
    },
  },
  plugins: [],
};
