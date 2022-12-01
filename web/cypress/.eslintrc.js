module.exports = {
  extends: [
    'plugin:crb/general',
    'plugin:crb/react',
    'plugin:cypress-dev/tests'
  ],
  plugins: ['cypress'],
  env: {
    'cypress/globals': true
  }
}
