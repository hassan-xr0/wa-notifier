const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { spawn } = require('child_process');

const SOUND_FILE = '/home/str/.local/share/wa-notifier/assets/Fear-to-fathom.mp3';

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// This tell the whatsap-chromium to run in background  without using any resource
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './session'
  }),
  puppeteer: {
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  }
});


// Login qrcode
client.on('qr', (qr) => {
  console.log('\nScan this QR code:\n');
  qrcode.generate(qr, { small: true });
}
);

// Tells the when the notifier is ready
client.on('ready', () => {
  console.log('WhatsApp notifier is ready.');
});


// Perform the task when messages recieved
client.on('message',async (message) => {
  const chat = await message.getChat();
  // const media = awaitgcc message.downloadMedia();
  if (chat.archived) return; // skip archived chats
  console.log(message)

  const sender = `  ${message._data.notifyName || message.from}`;
  let text;
  
  if(message.type === "image"){
    const sizeKB = Math.round((message._data.size * 3 / 4) / 1024); // approximate size in KB
    text = `  Image ${sizeKB} KB`;

  }
  else if(message.type === "ptt" || message.type === "audio"){
    const duration = message.duration || 0; // in seconds
    text = `  ${formatDuration(duration)}`;
  }
  else{
    text=message.body
  } 
  

  // 🔔 Play sound
  spawn('mpv', [SOUND_FILE]);

  // Just send normal notification
  spawn('notify-send', [
    '-a', 'WhatsApp',
    '-i', '/home/str/.local/share/wa-notifier/assets/WhatsApp.png',
    'WhatsApp',
    `${sender}: ${text}`
  ]);
}
);


// not supported yet on linux
// client.on('call', (call) => {
//   console.log(call.status);
// });
//

client.initialize();
