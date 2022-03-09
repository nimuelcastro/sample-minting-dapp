const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    resolve: {
      fallback: { // not present by default
          "stream": require.resolve("stream-browserify"),
          "os": require.resolve("os-browserify/browser"),
          "https": require.resolve("https-browserify"),
          "http": require.resolve("stream-http"),
          "crypto": require.resolve("crypto-browserify"),
          "@ethersproject/abi": require.resolve("@ethersproject/abi"),
          "buffer": require.resolve("buffer"),
          "web3-utils": require.resolve("web3-utils"),
      }
    },
    plugins: [
      // Work around for Buffer is undefined:
      // https://github.com/webpack/changelog-v5/issues/10
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ]
  }
})
