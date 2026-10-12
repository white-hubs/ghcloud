import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const appRoot = resolve(import.meta.dirname, '..')
const srcRoot = join(appRoot, 'src')

const requiredDirectories = [
  'application',
  'visualization-core',
  'features',
  'shared-ui',
  'infrastructure',
  'views',
]

const forbiddenRootDirectories = [
  'api',
  'bootstrap',
  'cards',
  'components',
  'config',
  'equipment',
  'event',
  'hooks',
  'model-sdk',
  'pages',
  'permission',
  'router',
  'service',
  'shared',
  'stores',
  'utils',
  'widgets',
]

const documentationFiles = ['STRUCTURE.md']

const panelShellDirectory = join(srcRoot, 'features', 'panel-shell')
const requiredPanelShellDirectories = [
  'charts',
  'media',
  'metrics',
  'tables',
  'templates',
]

const boundaryRules = [
  {
    directory: 'shared-ui',
    forbiddenImports: ['@/application', '@/features', '@/views', '@/visualization-core'],
  },
  {
    directory: 'features',
    forbiddenImports: ['@/views'],
  },
  {
    directory: 'visualization-core',
    forbiddenImports: ['@/views', '@/features/cards'],
  },
  {
    directory: 'infrastructure',
    forbiddenImports: ['@/views', '@/features', '@/shared-ui'],
  },
]

const failures = []

for (const directory of requiredDirectories) {
  if (!existsSync(join(srcRoot, directory))) {
    failures.push(`缺少边界目录: src/${directory}`)
  }
}

for (const directory of forbiddenRootDirectories) {
  if (existsSync(join(srcRoot, directory))) {
    failures.push(`禁止恢复旧一级目录: src/${directory}`)
  }
}

for (const filename of documentationFiles) {
  if (!existsSync(join(appRoot, filename))) {
    failures.push(`缺少统一结构文档: ${filename}`)
  }
}

if (!existsSync(panelShellDirectory)) {
  failures.push('缺少面板壳目录: src/features/panel-shell')
} else {
  const panelShellEntries = readdirSync(panelShellDirectory, { withFileTypes: true })
  const panelShellEntryNames = new Set(panelShellEntries.map((entry) => entry.name))

  for (const directory of requiredPanelShellDirectories) {
    if (!panelShellEntryNames.has(directory)) {
      failures.push(`缺少 panel-shell 分组目录: src/features/panel-shell/${directory}`)
    }
  }

  for (const entry of panelShellEntries) {
    if (!entry.isDirectory()) {
      failures.push(`panel-shell 根目录禁止放置零散文件: src/features/panel-shell/${entry.name}`)
    } else if (!requiredPanelShellDirectories.includes(entry.name)) {
      failures.push(`panel-shell 存在未定义分组: src/features/panel-shell/${entry.name}`)
    }
  }
}

const walkSourceFiles = (directory) => {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkSourceFiles(path))
    } else if (['.ts', '.tsx'].includes(extname(entry.name))) {
      files.push(path)
    }
  }
  return files
}

for (const rule of boundaryRules) {
  const directory = join(srcRoot, rule.directory)
  if (!existsSync(directory)) continue

  for (const file of walkSourceFiles(directory)) {
    const source = readFileSync(file, 'utf8')
    for (const forbiddenImport of rule.forbiddenImports) {
      if (source.includes(`from '${forbiddenImport}`) || source.includes(`from "${forbiddenImport}`) || source.includes(`import('${forbiddenImport}`) || source.includes(`import("${forbiddenImport}`)) {
        failures.push(`${relative(appRoot, file)} 反向依赖 ${forbiddenImport}`)
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('UE5 structure boundaries are valid.')
