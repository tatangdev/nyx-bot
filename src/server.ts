import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import axios from "axios";
import { env } from "@/common/utils/envConfig";

const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

bot.launch();
bot.command("start", (ctx: any) => {
  console.log("start context", ctx);
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Hello there! Welcome to the Chipmunk Kombat App. respond to /info. Please try it",
    {}
  );
});

bot.command("info", (ctx: any) => {
  console.log(ctx);
  // bot.telegram.setChatMenuButton({
  //   // chat_id: ctx.chat.id,
  //   menu_button: {
  //     /** Button type, must be web_app */
  //     type: "web_app",
  //     /** Text on the button */
  //     text: "Yo",
  //     /** Description of the Web App that will be launched when the user presses the button. The Web App will be able to send an arbitrary message on behalf of the user using the method answerWebAppQuery. */
  //     web_app: {
  //       url: "https://t2e-telegram-game.netlify.app/?referralParam=testing123",
  //     },
  //   },
  // });
});

bot.command("ethereum", (ctx: any) => {
  var rate;
  console.log(ctx.from);
  axios
    .get(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
    )
    .then((response) => {
      console.log(response.data);
      rate = response.data.ethereum;
      const message = `Hello, today the ethereum price is ${rate.usd}USD`;
      bot.telegram.sendMessage(ctx.chat.id, message, {});
    });
});

export { app, logger };
