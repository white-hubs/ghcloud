const path = require('path');
const copyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    app: [
      './bin/www'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: [".js"]
  },
  target: 'node',
  // 移除或修改 externals 配置
  externals: [

  ],
  context: __dirname,
  node: {
    __dirname: true,
    __filename: true,
    global: true
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new copyPlugin({
      patterns: [
        { 
          from: 'line-config.json', 
          to: path.resolve(__dirname, 'dist') 
        }
      ]
    })
  ],
}
