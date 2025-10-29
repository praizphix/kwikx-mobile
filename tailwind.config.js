/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bgColor: "#EBF3F0",
        bgColor2: "#abcfbf",

        //green color
        g300: "#328B64",
        darkG300: "#353535",

        //orange
        o50: "#FFF7E9",

        o75: "#FFE0A5",
        o300: "#FFB323",

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
