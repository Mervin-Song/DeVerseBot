import {Composer} from 'grammy'

import {MyContext} from './types.js'

export const bot = new Composer<MyContext>()

bot.command(['start', 'help', 'peek', 'finish'], async ctx => {
	let text = ''
	text += ctx.t('private-start', {
		firstname: ctx.from?.first_name ?? 'there',
		username: '@EdJoPaTo',
		repolink: 'https://github.com/EdJoPaTo/telegram-chat-record-bot',
	})
	return ctx.reply(text)
})
