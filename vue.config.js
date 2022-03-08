const { defineConfig } = require('@vue/cli-service')

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
      }
    }
  }
})
