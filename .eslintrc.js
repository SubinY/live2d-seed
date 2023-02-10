module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'plugin:compat/recommended'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  rules: {
    'no-extra-boolean-cast': 0,
    'react/no-unstable-nested-components': 1,
    'react/jsx-filename-extension': 1,
    'react/function-component-definition': 0,
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-one-expression-per-line': 0,
    'import/no-unresolved': [2, { ignore: ['^@/', '^umi/'] }],
    'import/no-extraneous-dependencies': [0, { optionalDependencies: true }],
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'linebreak-style': 0,
    'arrow-body-style': 0,
    'react/react-in-jsx-scope': 0,
    'react/jsx-no-bind': 0,
    'no-unused-vars': 1,
    'compat/compat': 0,
    'no-async-promise-executor': 0,
    'no-return-await': 0,
    'no-use-before-define': 0,
    'no-useless-return': 0,
    'consistent-return': 0,
    'import/no-useless-path-segments': 0,
    'import/extensions': 0,
    'no-shadow': 0,
    'prefer-template': 0,
    'react/jsx-props-no-spreading': 0,
    'import/order': 0,
    'react/jsx-boolean-value': 0,
    'react/jsx-curly-brace-presence': 1,
    'no-return-assign': 0,
    'no-param-reassign': 1,
    'react/destructuring-assignment': 0,
    'no-unsafe-optional-chaining': 1,
    'spaced-comment': 0,
    'react/jsx-fragments': 1,
    'react/no-array-index-key': 1,
    'no-await-in-loop': 1,
    'no-underscore-dangle': 0,
    'no-else-return': 1,
    'no-restricted-syntax': 0,
    'import/prefer-default-export': 0,
    'no-promise-executor-return': 0,
    'no-void': 0,
    'default-param-last': 0,
    'func-names': 0,
    'prefer-arrow-callback': 0,
    'prefer-const': 1,
    'no-useless-catch': 0,
    'jsx-a11y/alt-text': 0,
    'react/jsx-no-useless-fragment': 0,
    'no-empty': 1,
    'react/self-closing-comp': 1,
    'no-nested-ternary': 1,
    'no-unused-expressions': 1,
    'camelcase': 1,
    'prefer-destructuring': 1,
    'import/newline-after-import' : 0,
    'no-plusplus' : 0,
    'global-require' : 0,
    'import/no-dynamic-require' : 0,
  },
};