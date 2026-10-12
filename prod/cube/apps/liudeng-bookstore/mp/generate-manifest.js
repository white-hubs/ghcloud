const fs = require('fs');
const path = require('path');


// 读取环境变量
const env = process.env.NODE_ENV || 'dev';
const envFile = `.env.${env}`;
require('dotenv').config({ path: envFile });

// 读取原始 manifest.json
const manifestPath = path.join(__dirname, 'src', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 替换 mp-weixin 的 appid
if (process.env.VITE_MP_WEIXIN_APPID) {
  manifest['mp-weixin'].appid = process.env.VITE_MP_WEIXIN_APPID;
}

// 写入修改后的 manifest.json
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
