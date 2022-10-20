const { aliasWebpack, aliasJest } = require('react-app-alias')
module.exports = {
  webpack: (config, env) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer'),
      stream: false
    }
    return aliasWebpack({ tsconfig: './tsconfig.paths.json' })(config)
  },
  jest: (config, env) => {
    return aliasJest({ tsconfig: './tsconfig.paths.json' })(config)
  }
}