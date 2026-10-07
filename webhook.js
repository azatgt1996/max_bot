import express from 'express'
import { Bot } from '@maxhub/max-bot-api'
import cron from 'node-cron'

const bot = new Bot(process.env.BOT_TOKEN)
init(bot, cron)

const app = express()
app.use(express.json())

app.post('/webhook', async (req, res) => {
  try {
    await bot.handleUpdate(req.body)
  } catch (error) {
    console.error('Ошибка при обработке вебхука:', error)
  } finally {
    res.status(200).json({ ok: true })
  }
})

app.get('/', (req, res) => {
  res.type('text/plain; charset=utf-8').send('Server is working...')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Bot is started on ${PORT}...`)
})
