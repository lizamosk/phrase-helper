import {Configuration, LocalesApi, Translation, TranslationsApi, LocaleDownloadsApi } from "phrase-js"
import {glob} from "glob";
import {writeFile} from "node:fs/promises";


const PHRASE_ACCESS_TOKEN = `token ${process.env.PHRASE_ACCESS_TOKEN}`
const configuration = new Configuration({apiKey: PHRASE_ACCESS_TOKEN, fetchApi: fetch})

const translationApi = new TranslationsApi(configuration)
const localesApi = new LocalesApi(configuration)
const projectId = '665ad61070232615f9412e535096c361'

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

export async function getTaggedTranslations(tag?: string) {
    const projectRoot = process.cwd();
    const directories = await glob('src/**/locales/', {cwd: projectRoot, nodir: false, absolute: true})
    if (!directories.length) {
        return
    }
    const localesPath = directories[0]
    console.log(localesPath, projectRoot)
    try {
        let locales = (await localesApi.localesList({projectId}))
            .map((locale) => ({code: locale.code, id: locale.id}))
        if (!locales) {
            return
        }
        const query = tag ? `tags:${tag}` : undefined
        console.log('locales:', locales)
        for (const locale of locales) {
            const localeFilePath = localesPath + `/${locale.code}.json`
            const fileContent = await import(localeFilePath)

            const translationsByLocale: Translation[] = await translationApi.translationsByLocale({
                projectId, q: query, localeId: locale.id!, perPage: 100})
            console.log('Translation for locale:', translationsByLocale)
            let updatedFileContent = fileContent
            for (const translation of translationsByLocale) {
                if (!translation.key?.name) {
                    return
                }
                const namePath: string[] = translation.key!.name!.split('.')

                setDeepValue(fileContent, namePath, translation.content || null)
            }
           // console.log('Set content:', updatedFileContent)
            updatedFileContent = JSON.stringify(fileContent, null, 2)
            await writeFile(localeFilePath, updatedFileContent, 'utf-8')
            //break
        }
    } catch (e) {
        console.log('Error occured', e)
    }
}

