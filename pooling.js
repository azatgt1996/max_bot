import { Bot } from '@maxhub/max-bot-api'
import { Agent, fetch as undiciFetch } from 'undici'
import cron from 'node-cron'
import init from './common.js'

const insecureFetch = (url, options = {}) => {
  return undiciFetch(url, {
    ...options,
    dispatcher: new Agent({ connect: { rejectUnauthorized: false } }),
  })
}

const bot = new Bot(process.env.BOT_TOKEN, { clientOptions: { fetch: insecureFetch } })
init(bot, cron)

bot.start()
console.log(`Bot is started...`)
