import { Agent, fetch as undiciFetch } from 'undici'
import { knowledgeBase } from './consts.js'

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-zа-я0-9\s]/g, '').split` `
}

export function findBestMatch(userText) {
  const normalizedWords = normalizeText(userText)
  let bestMatch = null
  let maxScore = 0

  for (const entry of knowledgeBase) {
    let score = 0
    for (const tag of entry.tags) {
      if (normalizedWords.some((word) => word && (word.startsWith(tag) || tag.startsWith(word)))) {
        score++
      }
    }
    if (score > maxScore) {
      maxScore = score
      bestMatch = entry
    }
  }

  return bestMatch && maxScore > 0 ? bestMatch : null
}

export const isGroupChat = (chatId) => chatId < 0

export const insecureFetch = (url, options = {}) => {
  return undiciFetch(url, {
    ...options,
    dispatcher: new Agent({ connect: { rejectUnauthorized: false } }),
  })
}
