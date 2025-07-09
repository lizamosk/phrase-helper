import { Configuration } from 'phrase-js'

export const PHRASE_ACCESS_TOKEN = `token ${process.env.PHRASE_ACCESS_TOKEN}`
export const PHRASE_PROJECT_ID = process.env.PHRASE_PROJECT_ID || ''

export const configuration = new Configuration({
  apiKey: PHRASE_ACCESS_TOKEN,
  fetchApi: fetch,
})
