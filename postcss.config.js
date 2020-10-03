const cssWhitelistClassArray = [
  /tippy/,
  /leaflet/,
  /leaflet-container/,
  /leaflet-controls-container/,
  /pill/,
  /orange/,
  /red/,
  /yellow/,
  /green/,
  /purple/,
  /bg-blue-400/,
  /bg-blue-500/,
  /bg-purple-400/,
  /bg-purple-500/,
  /opacity-75/,
  /bg-gray-200/,
  /bg-gray-300/,
  /bg-gray-400/,
  /bg-gray-500/,
  /bg-gray-600/,
  /bg-white/,
];

// safelist purgecss plugin
const purgecss = require('@fullhuman/postcss-purgecss')({
  // Specify the paths to all of the template files in your project
  content: [
    './public/index.html',
    './src/components/**/*.js',
  ],

  // This is the function used to extract class names from your templates
  defaultExtractor: (content) => {
    // Capture as liberally as possible, including things like `h-(screen-1.5)`
    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
    // Capture classes within other delimiters like .block(class="w-1/2") in Pug
    const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
    return broadMatches.concat(innerMatches);
  },
  fontFace: false,
  safelist: cssWhitelistClassArray,
});

// Export all plugins our postcss should use
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('tailwindcss'),
    require('cssnano')({
      preset: 'default',
    }),
    purgecss,
    // ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
};
