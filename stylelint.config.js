module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-css-modules'],
  plugins: ['stylelint-order'],
  rules: {
    'alpha-value-notation': null,
    'at-rule-no-unknown': null,
    'block-no-empty': null,
    'color-function-notation': 'legacy',
    'font-family-name-quotes': null,
    'media-feature-range-notation': 'prefix',
    'no-descending-specificity': null,
    'no-empty-source': null,
    'property-no-vendor-prefix': null,
    'scss/double-slash-comment-whitespace-inside': 'never',
    'scss/at-rule-conditional-no-parentheses': null,
    'scss/at-import-no-partial-leading-underscore': null,
    'scss/at-else-closing-brace-newline-after': 'always-last-in-chain',
    'scss/at-else-closing-brace-space-after': 'always-intermediate',
    'scss/at-else-empty-line-before': 'never',
    'scss/at-if-closing-brace-newline-after': 'always-last-in-chain',
    'scss/at-if-closing-brace-space-after': 'always-intermediate',
    'scss/at-import-partial-extension': null,
    'scss/at-extend-no-missing-placeholder': null,
    'scss/no-global-function-names': null,
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
};
