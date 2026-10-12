const { defineConfig } = require('@vue/cli-service')
const { name } = require('./package');
const path = require('path');
const Timestamp = new Date().getTime();
module.exports = defineConfig({
	transpileDependencies: true,
	lintOnSave: false,
	publicPath: process.env.PUBLIC_PATH,
	outputDir: "dist",
	productionSourceMap: true,
	configureWebpack: {
		resolve: {
			alias: {
				'ant-design-vue': '@nqmy/ant-design-vue',
				'@store': '@/store/modules',
				'@cahrts': '@/components/global/charts',
				vue$: 'vue/dist/vue.esm.js'
			},
		},
		output: {
			library: `${name}${Timestamp}-[name]`,
			libraryTarget: 'umd',
			chunkLoadingGlobal: `webpackJsonp_${name}${Timestamp}`,
		},
	},
	css: {
		loaderOptions: {
			less: {
				lessOptions: {
					modifyVars: {
						'primary-color': '#1DA57A',
						'link-color': '#1DA57A',
						'border-radius-base': '2px',
					},
					javascriptEnabled: true,
					globalVars: {
						deep: '>>>',
					},
				}
			},
		},
	},
	devServer: {
		hot: true,
		host: '0.0.0.0',
		allowedHosts: "all",
		port: 8888,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		client: {
      overlay: false
    },
		https: false,
	},
})
