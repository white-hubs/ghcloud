import { createWriteStream } from 'fs'
import archiver from 'archiver'

export async function packageDist(distDir: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath)
    const archive = archiver('tar', { gzip: true })

    output.on('close', () => resolve())
    archive.on('error', (err) => reject(err))

    archive.pipe(output)
    archive.directory(distDir, false)
    archive.finalize()
  })
}
