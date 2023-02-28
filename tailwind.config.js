const { red, emerald, orange, zinc, cyan } = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

/**
 * Function used to apply opacity modifiers to css variable colors
 * @param {string} variable
 * @returns string
 */
function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      backgroundColor: {
        base: withOpacityValue("--bg-base"),
        layer: {
          1: withOpacityValue("--bg-layer-1"),
          2: withOpacityValue("--bg-layer-2"),
        },
      },
      colors: {
        gray: {
          ...zinc,
          1000: "#06090E",
          1100: "#020203",
        },
        brand: {
          DEFAULT: withOpacityValue("--brand"),
          light: withOpacityValue("--brand-light"),
          dark: withOpacityValue("--brand-dark"),
        },
        danger: {
          ...red,
          DEFAULT: withOpacityValue("--danger"),
          hover: withOpacityValue("--danger-hover"),
        },
        info: {
          ...cyan,
          DEFAULT: withOpacityValue("--info"),
          hover: withOpacityValue("--info-hover"),
        },
        success: {
          ...emerald,
          DEFAULT: withOpacityValue("--success"),
          hover: withOpacityValue("--success-hover"),
        },
        warning: {
          ...orange,
          DEFAULT: withOpacityValue("--warning"),
          hover: withOpacityValue("--warning-hover"),
        },
      },
      ringColor: {
        DEFAULT: withOpacityValue("--ring-default"),
        ghost: withOpacityValue("--ring-ghost"),
        danger: withOpacityValue("--danger"),
      },
      fontFamily: {
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
      textColor: {
        secondary: withOpacityValue("--text-secondary"),
        primary: withOpacityValue("--text-primary"),
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
  ],
};
