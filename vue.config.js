const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    /* css: {
        loaderOptions: {
            less: {
                additionalData: `@import "~@/assets/less/less.less";`,
            }
        }
    }, */
    publicPath: process.env.NODE_ENV === 'production'
        ? './'
        : '/',
    configureWebpack: {
        devServer: {
            historyApiFallback: true
        }
    }
})