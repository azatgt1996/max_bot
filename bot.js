import { Bot } from '@maxhub/max-bot-api'
import { isGroupChat, findBestMatch, insecureFetch } from './utils.js'
import { notFound } from './consts.js'
import cron from 'node-cron'

const bot = new Bot(process.env.BOT_TOKEN, { clientOptions: { fetch: insecureFetch } })
const botMention = `@${process.env.BOT_NICK}`
const allowedChatIds = JSON.parse(process.env.ALLOWED_CHAT_ID)

bot.command('start', (ctx) => ctx.reply('Привет! Задай вопрос по ЖК.'))
bot.command('help', (ctx) => ctx.reply('Просто тегни меня и напиши вопрос.'))

bot.on('message_created', async (ctx) => {
  const userText = ctx.message.body.text || ''
  console.log(`Sender: `, JSON.stringify(ctx.message.sender), `ctx.chatId: `, ctx.chatId)
  console.log(`userText: `, userText)

  if (!userText) return
  if (isGroupChat(ctx.chatId) && !userText.includes(botMention)) return
  if (isGroupChat(ctx.chatId) && !allowedChatIds.includes(ctx.chatId)) return

  const bestMatch = findBestMatch(userText)
  const text = bestMatch ? `<i>${bestMatch.question}</i>\n${bestMatch.answer}` : notFound
  await ctx.reply(text, { format: 'html' })
})

const sendNotification = (msg) => bot.api.sendMessageToChat(-79220818271578, msg)

cron.schedule(
  '0 14 * * *',
  async () => {
    try {
      const today = new Date().getDate()
      if (today === 23) {
        await sendNotification('🔔 Напоминание: не забудьте передать показания счётчиков до 25го числа!')
      } else if (today === 24) {
        await sendNotification('🔔 Напоминание: не забудьте передать показания счётчиков! Сегодня последний день!')
      }
      console.log('✅ Напоминание отправлено')
    } catch (error) {
      console.error('❌ Ошибка отправки:', error)
    }
  },
  { timezone: 'Europe/Moscow' }
)

bot.start()
console.log(`Bot is started...`)
