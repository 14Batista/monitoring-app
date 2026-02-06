# Service Monitor

Una aplicación de monitoreo de servicios con Next.js que verifica la disponibilidad de tus servicios, registra los resultados en Google Sheets y envía notificaciones a Telegram cuando hay problemas.

## 🚀 Características

- ✅ Monitoreo automático cada 5 minutos vía GitHub Actions
- 📊 Dashboard en tiempo real con estadísticas de uptime
- 📝 Logs separados por servicio en Google Sheets
- 🔔 Notificaciones instantáneas a Telegram cuando un servicio cae
- 🎯 Filtrado de logs por estado (online/offline)
- ➕ Agregar nuevos servicios dinámicamente
- 📈 Estadísticas de disponibilidad por servicio
- 🆓 100% gratis usando Vercel Free Tier

## 📋 Requisitos previos

- Cuenta de GitHub
- Cuenta de Vercel (gratis)
- Cuenta de Google (para Google Sheets)
- Bot de Telegram

## 🛠️ Configuración paso a paso

### 1. Configurar Google Sheets API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Sheets API**:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Sheets API"
   - Haz clic en "Enable"

4. Crea una cuenta de servicio:
   - Ve a "APIs & Services" > "Credentials"
   - Clic en "Create Credentials" > "Service Account"
   - Dale un nombre (ej: "service-monitor")
   - Clic en "Create and Continue"
   - Otorga el rol "Editor"
   - Clic en "Done"

5. Genera las credenciales:
   - Haz clic en la cuenta de servicio creada
   - Ve a la pestaña "Keys"
   - Clic en "Add Key" > "Create new key"
   - Selecciona "JSON" y descarga el archivo

6. Crea una hoja de Google Sheets:
   - Ve a [Google Sheets](https://sheets.google.com)
   - Crea una nueva hoja
   - Comparte la hoja con el email de la cuenta de servicio (el que está en el JSON descargado)
   - Dale permisos de "Editor"
   - Copia el ID de la hoja (está en la URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`)

### 2. Configurar Bot de Telegram

1. Abre Telegram y busca [@BotFather](https://t.me/BotFather)
2. Envía `/newbot` y sigue las instrucciones
3. Guarda el **token** que te proporciona
4. Para obtener tu Chat ID:
   - Busca [@userinfobot](https://t.me/userinfobot) en Telegram
   - Inicia una conversación
   - Te mostrará tu Chat ID

### 3. Configurar el proyecto

1. Clona este repositorio:

```bash
git clone <tu-repo>
cd monitoring-app
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea el archivo `.env.local` copiando `.env.example`:

```bash
cp .env.example .env.local
```

4. Completa las variables de entorno en `.env.local`:

```env
# Del archivo JSON de Google
GOOGLE_SPREADSHEET_ID=tu_spreadsheet_id
GOOGLE_CLIENT_EMAIL=tu-cuenta-servicio@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA\n-----END PRIVATE KEY-----\n"

# Del BotFather de Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789

# Genera una cadena aleatoria segura
CRON_SECRET=genera_un_string_aleatorio_aqui
```

**Importante**: La clave privada de Google debe incluir `\n` para los saltos de línea. Cópiala exactamente como aparece en el archivo JSON.

### 4. Inicializar Google Sheets

1. Ejecuta el proyecto localmente:

```bash
npm run dev
```

2. Abre tu navegador en `http://localhost:3000`

3. Inicializa la hoja de servicios haciendo una petición PUT:

```bash
curl -X PUT http://localhost:3000/api/services
```

Esto creará la hoja "services" en tu Google Sheets.

### 5. Deploy a Vercel

1. Sube el código a GitHub (si no lo has hecho):

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Ve a [Vercel](https://vercel.com) y conecta tu repositorio

3. **Importante**: Agrega las variables de entorno en Vercel:
   - Ve a tu proyecto en Vercel
   - Settings > Environment Variables
   - Agrega todas las variables del `.env.local`

4. Despliega el proyecto

### 6. Configurar GitHub Actions

1. Ve a tu repositorio en GitHub
2. Settings > Secrets and variables > Actions
3. Agrega el secreto `CRON_SECRET` con el mismo valor que pusiste en Vercel

4. Edita el archivo `.github/workflows/monitor.yml`:

```yaml
# Cambia esta línea:
curl -X POST https://tu-app.vercel.app/api/check-services \
# Por tu URL real de Vercel, ejemplo:
curl -X POST https://monitoring-app-abc123.vercel.app/api/check-services \
```

5. Haz commit y push:

```bash
git add .github/workflows/monitor.yml
git commit -m "Update GitHub Actions with Vercel URL"
git push
```

### 7. Verificar que funciona

1. Ve a la pestaña "Actions" en GitHub
2. Ejecuta manualmente el workflow:
   - Clic en "Monitor Services"
   - Clic en "Run workflow"
   - Selecciona la rama y "Run workflow"

3. Si todo está bien, deberías ver:
   - El workflow completado exitosamente
   - Logs en tu Google Sheets (se crearán hojas por cada servicio)
   - Si agregaste servicios y están caídos, recibirás notificación en Telegram

## 📱 Uso

### Agregar un servicio

1. Abre el dashboard en tu URL de Vercel
2. Haz clic en "Add New Service"
3. Completa:
   - **Nombre**: Un nombre descriptivo (ej: "API Principal")
   - **URL**: La URL completa (ej: `https://api.ejemplo.com/health`)
   - **Tipo**: HTTP/HTTPS (ping aún no implementado)
   - **Enabled**: Marca si quieres monitorearlo de inmediato

### Ver logs

- Los logs se actualizan automáticamente cada 30 segundos
- Puedes filtrar por estado: All, Online, Offline
- Haz clic en un servicio específico para ver solo sus logs
- Las estadísticas se calculan en tiempo real

### Notificaciones de Telegram

Recibirás notificaciones cuando:

- 🔴 Un servicio cae (pasa de online a offline)
- ✅ Un servicio se recupera (pasa de offline a online)

## 🏗️ Estructura de Google Sheets

Tu hoja de Google Sheets tendrá:

1. **Hoja "services"**: Lista de todos los servicios configurados
   - ID | Name | URL | Type | Enabled | Created At

2. **Hojas "logs\_{serviceId}"**: Una por cada servicio con sus logs
   - Timestamp | Service Name | Status | Response Time (ms) | Error Message

## ⚙️ Configuración del Cron

Por defecto, el monitoreo se ejecuta cada 5 minutos. Para cambiar la frecuencia:

1. Edita `.github/workflows/monitor.yml`
2. Modifica la línea del cron:

```yaml
- cron: "*/5 * * * *" # Cada 5 minutos
```

Ejemplos:

- `'*/10 * * * *'` - Cada 10 minutos
- `'0 * * * *'` - Cada hora
- `'0 */6 * * *'` - Cada 6 horas

## 🔒 Seguridad

- El endpoint `/api/check-services` está protegido con `CRON_SECRET`
- Solo GitHub Actions (o quien tenga el secret) puede disparar las verificaciones
- Las credenciales de Google nunca se exponen al frontend
- El token de Telegram está en variables de entorno seguras

## 🚨 Troubleshooting

### "Error getting services"

- Verifica que las credenciales de Google sean correctas
- Asegúrate de compartir la hoja con el email de la cuenta de servicio
- Revisa que `GOOGLE_PRIVATE_KEY` tenga los `\n` correctos

### "No se reciben notificaciones de Telegram"

- Verifica que el `TELEGRAM_BOT_TOKEN` sea correcto
- Asegúrate de haber iniciado una conversación con el bot
- Verifica que el `TELEGRAM_CHAT_ID` sea el tuyo

### "GitHub Actions falla"

- Verifica que el `CRON_SECRET` en GitHub coincida con Vercel
- Asegúrate de usar la URL correcta de Vercel
- Revisa los logs del workflow en la pestaña Actions

### "Timeout en Vercel"

- Vercel Free tiene límite de 10 segundos por función
- Si tienes muchos servicios, considera reducir el número
- O aumenta el timeout (hasta 60s en el código)

## 📊 Limitaciones de Vercel Free

- 100 GB bandwidth/mes
- 100 ejecuciones serverless/día
- 10-60 segundos de timeout por función
- Suficiente para monitorear ~20 servicios cada 5 minutos

## 🎯 Mejoras futuras

- [ ] Gráficos de uptime con Recharts
- [ ] Exportar reportes en PDF/CSV
- [ ] Múltiples canales de notificación (Email, Discord, Slack)
- [ ] Umbrales configurables (notificar después de N fallos)
- [ ] Soporte para autenticación en los servicios
- [ ] Dashboard público/privado
- [ ] Alertas programadas (resumen diario/semanal)

## 📄 Licencia

MIT

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o pull request.
## 📚 Documentación

- Documentación detallada del proyecto: [Documentación del proyecto](https://claude.ai/share/43d65fc4-90c7-48cf-8042-90bf05c9c576)
