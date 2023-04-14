/* eslint-disable no-undef */

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;
const http = require('http');
const { Client, Events, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { HfInference } = require('@huggingface/inference');
const { Buffer } = require("node:buffer");
const hf = new HfInference(HUGGINGFACE_TOKEN)

const client = new Client({
  intents:
    [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]
});

client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
  let prompt;
  if (message.content.startsWith("!i")) {
    prompt = message.content.substring(2);
    const img = await hf.textToImage({
      inputs: prompt,
      model: 'stabilityai/stable-diffusion-2',
      parameters: {
        negative_prompt: 'blurry',
      }
    });
    const arrayBuffer = await img.arrayBuffer();
    const file = new AttachmentBuilder(Buffer.from(arrayBuffer), { name: 'image.jpeg' });
    client.channels.fetch(message.channelId).then(channel => channel.send({ files: [file] }));
  } else if (message.content.startsWith("!t")) {
    prompt = message.content.substring(2);
    const inputPrompt = `The expected response for a highly intelligent chatbot to "${prompt}" is "`;
    console.log(inputPrompt);
    /*
    let response = [];
    await new Dalai().request({
      model: "alpaca.7B",
      prompt: inputPrompt,
      n_predict: 256
    }, (token) => {
      response.push(token);
    });
    client.channels.fetch(message.channelId)
      .then(channel => channel.send(response.join('').replace('<end>', '')));
      */
  }
});
client.login(DISCORD_TOKEN);


http.createServer().listen(8080, () => {
  console.log('Listening on port 8080');
});