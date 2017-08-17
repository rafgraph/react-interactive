module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true,
  },
  extends: ['airbnb', 'prettier', 'prettier/react'],
  plugins: ['react', 'prettier'],
  rules: {
    'no-unused-expressions': [
      'error',
      { allowShortCircuit: true, allowTernary: true },
    ],
    'no-plusplus': 'off',
    'no-param-reassign': ['error', { props: false }],
    'import/no-unresolved': ['error', { ignore: ['^react$'] }],
    'import/extensions': ['error', 'never'],
    'react/jsx-filename-extension': 'off',
    'prettier/prettier': ['warn', { trailingComma: 'all', singleQuote: true }],
  },
};
