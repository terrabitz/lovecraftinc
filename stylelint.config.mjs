/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-html/astro'],
  customSyntax: 'postcss-html',
  ignoreFiles: [
    'dist/**/*',
    'node_modules/**/*',
    '.astro/**/*'
  ],
  rules: {
    // Allow Astro's :global() syntax
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global']
      }
    ],
    
    // // Allow both context and range media query notation
    // 'media-feature-range-notation': null,
  }
};
