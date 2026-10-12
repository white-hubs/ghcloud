const fs = require('fs').promises;
const path = require('path');
const rootDir = process.cwd(); // 项目的根目录
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
async function askQuestion(question) {
  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function findPackageJson(dir, packageName, basePath) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const absoluteFilePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      // 忽略node_modules文件夹
      if (file.name === 'node_modules') {
        continue;
      }
      // 递归查找子目录
      const result = await findPackageJson(absoluteFilePath, packageName, basePath);
      if (result) {
        return result;
      }
    } else if (file.name === 'package.json') {
      // 读取package.json文件内容
      const packageJsonContent = await fs.readFile(absoluteFilePath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);

      // 计算并输出相对于basePath的目录路径
      const directoryPath = path.dirname(absoluteFilePath);
      const relativeDirectoryPath = path.relative(basePath, directoryPath);

      // 检查package.json中的name字段是否匹配子项目名称
      if (packageJson.name === packageName) {
        return { packageJson, relativeDirectoryPath };
      }
    }
  }
  return null;
}

/** 程序入口 */
const main = async () => {
  const targetPackageName = await askQuestion(`请输入目标包名：`);
  const packageInfo = {
    name: '',
    version: '',
    path: ''
  }

  // 包查找
  await findPackageJson(rootDir, targetPackageName, rootDir).then(result => {
    if (result) {
      const { packageJson, relativeDirectoryPath } = result;
      packageInfo.name = packageJson.name
      packageInfo.version = packageJson.version
      packageInfo.path = relativeDirectoryPath
    } else {
      process.exit(1)
    }
  }).catch(err => {
    process.exit(1)
  });


  // 构建
  const startTime = Date.now();
  execSync(`pnpm -F ${packageInfo.name} build:prod`, { stdio: 'inherit' });
  const endTime = Date.now();

  //发布
  execSync(`npm publish`, {
    cwd: `${rootDir}/${packageInfo.path}`,
    stdio: 'inherit' // 如果你想在父进程中看到命令的输出
  })
};

main().then(() => {
}).finally(() => {
  process.exit(0);
})
