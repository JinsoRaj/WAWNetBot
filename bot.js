/*
  Project: WAWNet Telegram Bot - t.me/JinsoRaj
  Langauge: Node.js
  Framework: grammYjs
  configs: 
*/
import { Bot, GrammyError, HttpError } from "grammy";
import { checkNewDiscourse } from "./helpers/newEntries.js";
import cron from "node-cron";
import * as dotenv from 'dotenv'
dotenv.config()
export const bot = new Bot(process.env.BOT_TOKEN);

// Handle the /start command.
bot.command("start", (ctx) => {
  ctx.reply("Hi..\nWelcome to Women at Work Network (WAWNet)😊\nI will update you with latest posts from WAWNet\n",
  {
    parse_mode: "HTML",
    reply_to_message_id: ctx.message.message_id
  })
});

// Check for New Discourse group RSS feeds every 10 mints.
cron.schedule('*/10 * * * *', async () => {
  console.log('running a task every 10 minutes');
  await checkNewDiscourse()
});

// Catch Errors
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("An Unknown error occurred:", e);
  }
});

bot.start()