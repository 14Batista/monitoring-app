import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export interface NotificationData {
  serviceName: string;
  status: 'offline' | 'online';
  url: string;
  errorMessage?: string;
  timestamp: string;
}

/**
 * Envía notificación cuando un servicio cae
 */
export async function sendDownAlert(data: NotificationData) {
  try {
    const message = `
🔴 *SERVICIO CAÍDO*

📛 *Servicio:* ${data.serviceName}
🔗 *URL:* ${data.url}
⏰ *Timestamp:* ${data.timestamp}
${data.errorMessage ? `❌ *Error:* ${data.errorMessage}` : ''}

Por favor, verifica el servicio lo antes posible.
    `.trim();

    await bot.sendMessage(CHAT_ID, message, {
      parse_mode: 'Markdown',
    });

    console.log(`Alert sent for ${data.serviceName}`);
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
  }
}

/**
 * Envía notificación cuando un servicio se recupera
 */
export async function sendRecoveryAlert(data: NotificationData) {
  try {
    const message = `
✅ *SERVICIO RECUPERADO*

📛 *Servicio:* ${data.serviceName}
🔗 *URL:* ${data.url}
⏰ *Timestamp:* ${data.timestamp}

El servicio volvió a estar operativo.
    `.trim();

    await bot.sendMessage(CHAT_ID, message, {
      parse_mode: 'Markdown',
    });

    console.log(`Recovery alert sent for ${data.serviceName}`);
  } catch (error) {
    console.error('Error sending Telegram recovery alert:', error);
  }
}

/**
 * Envía un resumen diario
 */
export async function sendDailySummary(stats: {
  totalServices: number;
  onlineServices: number;
  offlineServices: number;
  totalChecks: number;
}) {
  try {
    const uptimePercentage = ((stats.onlineServices / stats.totalServices) * 100).toFixed(2);

    const message = `
📊 *RESUMEN DIARIO DE MONITOREO*

🔢 *Total de servicios:* ${stats.totalServices}
✅ *Servicios online:* ${stats.onlineServices}
❌ *Servicios offline:* ${stats.offlineServices}
📈 *Disponibilidad:* ${uptimePercentage}%
🔍 *Total de verificaciones:* ${stats.totalChecks}

Fecha: ${new Date().toLocaleDateString('es-ES')}
    `.trim();

    await bot.sendMessage(CHAT_ID, message, {
      parse_mode: 'Markdown',
    });

    console.log('Daily summary sent');
  } catch (error) {
    console.error('Error sending daily summary:', error);
  }
}