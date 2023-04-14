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
    // todo try other apis
  }
});
client.login(DISCORD_TOKEN);

const requestListener = function (req, res) { 
    res.writeHead(200); 
    res.end("Hello from Server!"); 
}; 

const server = http.createServer(requestListener); 

server.listen(8080, () => {
  console.log('Listening on port 8080');
});
