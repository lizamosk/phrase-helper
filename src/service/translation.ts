import { Translation, TranslationsApi } from 'phrase-js'
import { configuration, PHRASE_PROJECT_ID } from '../config/phrase'
import { LocaleOptions } from '../types'

const translationApi = new TranslationsApi(configuration)

export async function getTranslationsByLocale(
  locale: LocaleOptions,
  query?: string,
) {
  if (!locale.id) {
    return []
  }
  const translationsByLocale: Translation[] =
    await translationApi.translationsByLocale({
      projectId: PHRASE_PROJECT_ID,
      q: query,
      localeId: locale.id,
      perPage: 100,
    })
  return translationsByLocale
}
