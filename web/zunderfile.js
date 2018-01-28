require('zunder').setConfig({
  deployBranch: 'production',
  staticGlobs: {
    'static/**': '',
    'node_modules/weathericons/font/**': '/font',
  },
})
