import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import fse from 'fs-extra'
import yamlHelper from './utils/yaml-helper.js'
import authHelper from './utils/auth.js'
import productHelper from './utils/products-download.js'
import readLineHelper from './utils/readline-helper.js'
import dayjs from 'dayjs'

/** 全局变量 */
const __filenameNew = fileURLToPath(import.meta.url)
const __dirnameNew = path.dirname(__filenameNew)
global.setting = {};
global.businessData = {};
global.rootPath = path.join(__dirnameNew, '.');
global.workspace = `${global.rootPath}/workspace/`;

if (!fs.existsSync(workspace)) {
  // 目录不存在，创建它  
  fs.mkdirSync(workspace, { recursive: true });
}
fse.emptyDirSync(workspace)

async function main() {
  global.setting = yamlHelper.reader(`${rootPath}/config.yaml`)

  await authHelper.getBusinessInfo(global.setting)
  const res = await productHelper.getProductListByPackageName(global.setting['products-center-api'])
  res.forEach(element => {
  });
  let lastVersion = res.at(-1).version
  lastVersion = (await readLineHelper.askQuestion(`请输入要发布的制品版本（默认为${lastVersion},回车键确认）:  `)) || lastVersion

  await productHelper.downloadProduct(lastVersion)
  global.businessData.title = global.setting['title'] ? global.setting['title'] : '医用洁净实时在线检测标准器系统'
  global.businessData.title = (await readLineHelper.askQuestion(`请输入驾驶舱页面标题（默认为${global.businessData.title},回车键确认）:  `)) || global.businessData.title
  global.businessData.EXTEND_CONFIG_MQTT_BROKER = global.setting['EXTEND_CONFIG_MQTT_BROKER'] ?? ''
  global.businessData.EXTEND_CONFIG_MQTT_USERNAME = global.setting['EXTEND_CONFIG_MQTT_USERNAME'] ?? ''
  global.businessData.EXTEND_CONFIG_MQTT_PASSWORD = global.setting['EXTEND_CONFIG_MQTT_PASSWORD'] ?? ''
  // 将对象转换为模块导出的字符串
  const dataContent = `window.businessData = ${JSON.stringify(global.businessData, null, 2)};`;
  try {
    // 使用同步方法写入文件
    fs.writeFileSync(`${global.workspace}/data.js`, dataContent);
  } catch (err) {
    process.exit(1)
  }

  // 根据配置生成 nginx 文件
  const nginxPort = global.setting['nginx-port'] ? global.setting['nginx-port'] : 80
  const nginxContent = `
    user nginx;
    worker_processes auto;
    error_log /var/log/nginx/error.log notice;
    pid /var/run/nginx.pid;
    events {
      worker_connections 2048;
    }

    http {
      include /etc/nginx/mime.types;
      default_type application/octet-stream;
      log_format main '$remote_addr - $remote_user [$time_local] "$request" '
      '$status $body_bytes_sent "$http_referer" '
      '"$http_user_agent" "$http_x_forwarded_for"';
      access_log /var/log/nginx/access.log main;
      sendfile on;
      keepalive_timeout 65;
      gzip on;

      map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
      }

      server {
        listen ${nginxPort};
        listen [::]:${nginxPort};
        server_name localhost;

        location / {
          root /data-viz-app;
          index index.html index.htm;
          include cache-rule.conf;
          include cors.conf;
        }
        location /apps/operating-room/data-viz {
          alias /data-viz-app;
          index index.html index.htm;
          include cache-rule.conf;
          include cors.conf;
        }
        location ^~ /api {
          include cors.conf;
          proxy_pass ${global.setting['cloud-api']}/;
          rewrite "^/api/(.*)$" /api/$1 break;
        }
        location /api/timestamp {
          include cors.conf;
          default_type text/plain;
          add_header 'Cache-Control' 'no-cache, no-store, must-revalidate';
          return 200 "${dayjs().valueOf()}";
        }
        include app-update.conf;
      }
    }
  `
  try {
    // 使用同步方法写入文件
    fs.writeFileSync(`${global.workspace}/nginx.conf`, nginxContent);
  } catch (err) {
    process.exit(1)
  }

  process.exit(0)
}

main()