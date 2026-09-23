import { Bot } from '@maxhub/max-bot-api'
import { isGroupChat, findBestMatch, insecureFetch } from './utils.js'
import { notFound } from './consts.js'
import cron from 'node-cron'

const bot = new Bot(process.env.BOT_TOKEN, { clientOptions: { fetch: insecureFetch } })
const botMention = `@${process.env.BOT_NICK}`
const allowedChatIds = JSON.parse(process.env.ALLOWED_CHAT_ID)
console.log(allowedChatIds)

bot.command('start', (ctx) => ctx.reply('Привет! Задай вопрос по ЖК.'))
bot.command('help', (ctx) => ctx.reply('Просто тегни меня и напиши вопрос.'))

bot.on('message_created', async (ctx) => {
  const userText = ctx.message.body.text || ''
  console.log(`Sender: `, JSON.stringify(ctx.message.sender), `ctx.chatId: `, ctx.chatId)
  console.log(`userText: `, userText)

  if (!allowedChatIds.includes(ctx.chatId)) return
  if (!userText) return
  if (isGroupChat(ctx.chatId) && !userText.includes(botMention)) return

  const bestMatch = findBestMatch(userText)
  const text = bestMatch ? `<i>${bestMatch.question}</i>\n${bestMatch.answer}` : notFound
  await ctx.reply(text, { format: 'html' })
})

cron.schedule(
  '59 16 22 * *',
  async () => {
    try {
      await bot.api.sendMessageToChat(-79220818271578, '🔔 Напоминание: не забудьте передать показания счётчиков!')
      console.log('✅ Напоминание отправлено')
    } catch (error) {
      console.error('❌ Ошибка отправки:', error)
    }
  },
  { timezone: 'Europe/Moscow' }
)

bot.start()
console.log(`Bot is started`)
