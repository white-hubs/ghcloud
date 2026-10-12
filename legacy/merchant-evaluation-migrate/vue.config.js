const path = require('path')
const { defineConfig } = require('@vue/cli-service')
const { name } = require('./package')

// 强制使用本项目的 less 3.x，避免与 @nqmy/ant-design-vue 的 Less 语法不兼容
let lessImpl
try {
  lessImpl = require(path.join(__dirname, 'node_modules/less'))
} catch {
  lessImpl = require('less')
}

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
			// 把子应用打包成 umd 库格式
			library: `${name}-[name]`,
			libraryTarget: 'umd',
		},
	},
	css: {
		loaderOptions: {
			less: {
				implementation: lessImpl,
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
				},
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
