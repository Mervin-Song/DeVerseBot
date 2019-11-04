import {existsSync, readFileSync} from 'fs'

import Telegraf from 'telegraf'
import TelegrafI18n from 'telegraf-i18n'

import * as groupChat from './group-chat'
import * as privateChat from './private-chat'

const tokenFilePath = existsSync('/run/secrets') ? '/run/secrets/bot-token.txt' : 'bot-token.txt'
const token = readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

if (process.env.NODE_ENV !== 'production') {
	bot.use(async (ctx, next) => {
		const updateId = ctx.update.update_id.toString(36)
		const content = (ctx.callbackQuery && ctx.callbackQuery.data) || (ctx.message && ctx.message.text)
		const identifier = `${updateId} ${ctx.updateType} ${ctx.updateSubTypes} ${ctx.from && ctx.from.first_name} ${content && content.length} ${content}`

		console.time(identifier)
		if (next) {
			await next()
		}

		console.timeEnd(identifier)
	})
}

const i18n = new TelegrafI18n({
	directory: 'locales',
	defaultLanguage: 'en',
	defaultLanguageOnMissing: true,
	useSession: false
})

bot.use(i18n.middleware())

bot.use(Telegraf.privateChat(privateChat.bot.middleware()))
bot.use(Telegraf.groupChat(groupChat.bot.middleware()))

bot.use(Telegraf.chatType('channel', async ctx => {
	await ctx.reply((ctx as any).i18n.t('channel.fail'))
	return ctx.leaveChat()
}))

if (process.env.NODE_ENV !== 'production') {
	bot.use(ctx => {
		console.warn('no one handled this', ctx.updateType, ...ctx.updateSubTypes, ctx.update)
	})
}

bot.catch((error: any) => {
	console.error('telegraf error occured', error)
})

async function startup(): Promise<void> {
	try {
		await bot.launch()
		console.log(new Date(), 'Bot started as', bot.options.username)
	} catch (error) {
		console.error('startup failed:', error)
	}
}

startup()
