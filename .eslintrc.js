module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ['eslint-plugin-import'],
  // extends: 'standard',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-extra-semi': 2, // 禁止额外的分号
    'no-trailing-spaces': 'off',
    'interface-name': 0,
    'interface-name-prefix': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-explicit-any': 'off',
    "@typescript-eslint/no-non-null-assertion": 'off',
    '@typescript-eslint/no-use-before-define': 0
  },
  overrides: []
}
