import { LocalesApi } from 'phrase-js'
import { configuration, PHRASE_PROJECT_ID } from '../config/phrase'
import { LocaleOptions } from '../types'

const localesApi = new LocalesApi(configuration)

export async function getLocales(
  requiredLocales?: string[],
): Promise<LocaleOptions[]> {
  const allLocales = await localesApi.localesList({
    projectId: PHRASE_PROJECT_ID,
  })
  const allLocalesParsed = allLocales.map((locale) => ({
    code: locale.code,
    id: locale.id,
  }))
  if (requiredLocales?.length) {
    const requiredLocalesToLowerCase = requiredLocales.map((item) =>
      item.toLocaleLowerCase(),
    )
    return allLocalesParsed.filter(
      (item) =>
        item.code &&
        requiredLocalesToLowerCase.includes(item.code.toLocaleLowerCase()),
    )
  }
  return allLocalesParsed
}
