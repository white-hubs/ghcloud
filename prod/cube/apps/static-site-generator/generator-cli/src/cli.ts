#!/usr/bin/env bun
import { Command } from 'commander'
import { build } from './commands/build'

const program = new Command()

program
  .name('ssg')
  .description('Static Site Generator CLI')
  .version('0.0.1')

program
  .command('build')
  .description('Build static site')
  .option('-i, --input <dir>', 'Input directory', './site')
  .option('-o, --output <dir>', 'Output directory', './dist')
  .option('-t, --tar', 'Create tar.gz package', false)
  .action(build)

program.parse()
