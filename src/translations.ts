import { Translation } from 'phrase-js'
import { glob } from 'glob'
import { writeFile } from 'node:fs/promises'
import { LocaleOptions, PullTranslationsOptions } from './types'
import { getLocales } from './service/locale'
import { getTranslationsByLocale } from './service/translation'

const setDeepValue = (obj: any, path: string[], value: string | null) => {
  let current = obj
  path.forEach((key, index) => {
    if (!current[key]) {
      current[key] = {}
      if (index < path.length - 1) {
        current[key][path[index + 1]] = {}
      }
    }
    if (index === path.length - 1) {
      current[key] = value
    } else {
      current = current[key]
    }
  })
}

async function findLocalesDirectory() {
  const projectRoot = process.cwd()
  const directories = await glob('src/**/locales/', {
    cwd: projectRoot,
    nodir: false,
    absolute: true,
  })
  if (!directories.length) {
    return
  }
  return directories[0]
}

async function updateFileContent(
  locale: LocaleOptions,
  translationsByLocale: Translation[],
) {
  const localesPath = await findLocalesDirectory()
  if (!localesPath) {
    console.log('/locales not found')
    return
  }
  const localeFilePath = localesPath + `/${locale.code}.json`
  const fileContent = await import(localeFilePath)
  let updatedFileContent = fileContent
  for (const translation of translationsByLocale) {
    if (!translation.key?.name) {
      return
    }
    const namePath: string[] = translation.key.name.split('.')
    setDeepValue(fileContent, namePath, translation.content || null)
  }
  updatedFileContent = JSON.stringify(fileContent, null, 2)
  await writeFile(localeFilePath, updatedFileContent, 'utf-8')
  return
}

export async function getTaggedTranslations(options: PullTranslationsOptions) {
  const projectRoot = process.cwd()
  const directories = await glob('src/**/locales/', {
    cwd: projectRoot,
    nodir: false,
    absolute: true,
  })
  if (!directories.length) {
    return
  }
  const localesPath = directories[0]
  console.log(localesPath, projectRoot)
  try {
    const locales = await getLocales(options.locales)
    if (!locales) {
      return
    }
    console.log(' -- For locales -- :', locales)
    const query = options.tags ? `tags:${options.tags}` : undefined

    for (const locale of locales) {
      const translationsByLocale: Translation[] = await getTranslationsByLocale(
        locale,
        query,
      )
      console.log(
        'Translations length:',
        translationsByLocale.length,
        locale.code,
      )
      await updateFileContent(locale, translationsByLocale)
    }
  } catch (e) {
    console.log('Some error occured', e)
  }
}
