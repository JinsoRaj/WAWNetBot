/*
  Project: WAWNet Telegram Bot - t.me/JinsoRaj
  Langauge: Node.js
  Framework: grammYjs
  configs: 
*/
import { Bot, GrammyError, HttpError } from "grammy";
import { checkNewDiscourse } from "./helpers/newEntries.js";
import { addChat, removeChat } from "./database/methods.js";
import cron from "node-cron";
import * as dotenv from 'dotenv'
dotenv.config()
export const bot = new Bot(process.env.BOT_TOKEN);

// Handle the /start command.
bot.command("start", async (ctx) => {
  await ctx.reply("Hi..\nWelcome to Women at Work Network (WAWNet)😊\nI will update you with latest posts from WAWNet\n",
  {
    parse_mode: "HTML",
    reply_to_message_id: ctx.message.message_id
  })
  //add new users to DB
  if(ctx.message.chat.type === 'private'){
    await addChat(ctx.message.from.id, ctx.message.from.first_name)
  }
});

// Check for New Discourse group RSS feeds every 10 mints.
cron.schedule('*/10 * * * *', async () => {
  console.log('running a task every 10 minutes');
  await checkNewDiscourse()
});


// end DB
bot.on("my_chat_member", async ctx =>{
    //console.log(ctx.myChatMember);
    if(ctx.myChatMember.chat.type === 'private'){
      if(ctx.myChatMember.old_chat_member.status === "member" && ctx.myChatMember.new_chat_member.status === "kicked"){
        //remove user from db
        await removeChat(ctx.myChatMember.from.id)
      }
    }else if(ctx.myChatMember.old_chat_member.user.username == bot.botInfo.username){
      // if me then add / remove
      if(ctx.myChatMember.new_chat_member.status === "kicked" || ctx.myChatMember.new_chat_member.status === "left"){
        //remove
        await removeChat(ctx.myChatMember.chat.id);
      }
      else if(ctx.myChatMember.new_chat_member.status == "member" || ctx.myChatMember.new_chat_member.status == "administrator" ){
        //add
        await bot.api.sendMessage(ctx.myChatMember.chat.id, `Thanks for adding me\nNow you will get new Post notifications here...`)
        await addChat(ctx.myChatMember.chat.id, ctx.myChatMember.chat.title);
      }

    }

})

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