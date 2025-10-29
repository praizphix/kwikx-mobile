/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bgColor: "#E8F4F0",
        bgColor2: "#a3d5c3",

        //KwikX brand colors
        primary: "#0A5344",
        primaryDark: "#083D32",
        primaryLight: "#0D6B55",
        accent: "#F4B942",
        accentDark: "#E5A831",
        accentLight: "#F7C666",

        //legacy green (keep for gradual migration)
        g300: "#0A5344",
        darkG300: "#353535",

        //legacy orange (mapped to accent)
        o50: "#FFF9ED",
        o75: "#F9D796",
        o300: "#F4B942",

        //black color
        n0: "#090909",
        n20: "#F5F5F5",
        darkN20: "#151515",
        n40: "#DFDFDF",
        darkN40: "#242424",
        n70: "#A6A6A6",
        n90: "#898989",
        n500: "#424242",
        darkN500: "#B3B3B3",
        n900: "#090909",
      },
    },
  },
  plugins: [],
};
