import { isGroupChat, findBestMatch } from './utils.js'
import { notFound } from './consts.js'

export default function init(bot, cron) {
  const botMention = `@${process.env.BOT_NICK}`
  const allowedChatIds = JSON.parse(process.env.ALLOWED_CHAT_ID)

  bot.command('start', (ctx) => ctx.reply('Привет! Задай вопрос по ЖК.'))
  bot.command('help', (ctx) => ctx.reply('Просто тегни меня и напиши вопрос.'))

  bot.on('message_created', async (ctx) => {
    const userText = ctx.message.body.text || ''
    if (!userText) return
    if (isGroupChat(ctx.chatId) && !userText.includes(botMention)) return
    if (isGroupChat(ctx.chatId) && !allowedChatIds.includes(ctx.chatId)) return

    console.log(`Sender: `, JSON.stringify(ctx.message.sender), `ctx.chatId: `, ctx.chatId)
    console.log(`userText: `, userText)

    const bestMatch = findBestMatch(userText)
    const text = bestMatch ? `<i>${bestMatch.question}</i>\n${bestMatch.answer}` : notFound
    await ctx.reply(text, { format: 'html' })
  })

  const sendNotification = (msg) => bot.api.sendMessageToChat(-69311207801040, msg)

  cron.schedule(
    '15 9 * * *',
    async () => {
      try {
        const today = new Date().getDate()
        if (today === 20) {
          await sendNotification('🔔 Напоминание: не забудьте передать показания счётчиков до 25го числа!')
        } else if (today === 25) {
          await sendNotification('🔔 Напоминание: не забудьте передать показания счётчиков! Сегодня последний день!')
        }
      } catch (error) {
        console.error('❌ Ошибка отправки:', error)
      }
    },
    { timezone: 'Europe/Moscow' }
  )
}
