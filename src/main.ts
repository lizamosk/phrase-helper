#!/usr/bin/env node

import { getTaggedTranslations } from './translations'
import { program } from 'commander'

program
  .name('phrase-helper')
  .description('An internal CLI library with phrase utils.')
  .version('1.0.0')

program
  .command('pull')
  .description('Pulls tagged translations into existing locales.')
  .option(
    '-t, --tags <tags...>',
    'Specify the tags of translations to download - <tag1 tag2 tag3>.',
  )
  .argument('[locales...]')
  .action(async (locales, options) => {
    console.log(`--- Pulling translations with tags: ${options.tags} ---`)
    await getTaggedTranslations({ tags: options.tags, locales })
  })

program.parse(process.argv)
