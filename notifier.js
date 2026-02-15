const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { spawn } = require('child_process');

const SOUND_FILE = '/home/str/.local/share/wa-notifier/assets/Fear-to-fathom.mp3';

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

client.on('qr', (qr) => {
  console.log('\nScan this QR code:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp notifier is ready.');
});

client.on('message', (message) => {

  const sender = message._data.notifyName || message.from;
  const text = message.body ? message.body.slice(0, 200) : '<media>';

  // 🔔 Play sound
  spawn('mpv', [SOUND_FILE]);

  // Just send normal notification
  spawn('notify-send', [
    '-a', 'WhatsApp',
    '-i', '/home/str/.local/share/wa-notifier/assets/WhatsApp.png',
    'WhatsApp',
    `${sender}: ${text}`
  ]);
});

client.initialize();
