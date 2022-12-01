module.exports = {
  root: true,
  extends: [
    'plugin:crb/general',
    'plugin:crb/react',
  ],
  rules: {
    'no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_',
    }],
  },
}
