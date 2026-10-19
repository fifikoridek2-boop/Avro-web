# Avro Web

Official Web Portal, Multi-Language Documentation Hub, and Cloud APIs for **Avro** — the private, local-first BYOK AI client for Android.

Developed by **Akio co**.

## Overview

- **Landing Page**: Interactive pure-CSS and JS parallax storytelling landing page showcasing Avro capabilities, model support, and agentic workflows.
- **Documentation Platform (`/docs/`)**:
  - Full multi-language documentation covering all 30 guides in 4 languages:
    - 🇸🇦 **العربية (Arabic)**: Native RTL layout with Google's `Noto Sans Arabic` typography.
    - 🇺🇸 **English**: Official guides and developer manuals.
    - 🇨🇳 **简体中文 (Simplified Chinese)**: Full translations for mainland China.
    - 🇹🇼 **繁體中文 (Traditional Chinese)**: Full translations for Taiwan and Hong Kong.
  - Deep-link compatible with the Android application's `DocumentationFab` floating button.
- **Micro-APIs (`/api/`)**:
  - `POST /api/crash`: Opt-in anonymous crash ingestion endpoint with stack trace capture and device telemetry.
  - `POST /api/rating`: User feedback and star rating submission endpoint.

## Deployment on Vercel

1. Import this repository into [Vercel](https://vercel.com).
2. Framework Preset: **Other** (Pure Static + Serverless Functions).
3. Root Directory: `./`.
4. Deploy! Zero additional configuration required.

## API Documentation

### 1. Crash Reporting
- **Endpoint**: `POST /api/crash`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "packageName": "com.aistudio.avro.app",
    "appVersion": "2.4.0",
    "versionCode": 45,
    "androidApi": 34,
    "androidRelease": "14",
    "device": "Google Pixel 8 Pro",
    "ts": 1729267200000,
    "trace": "stack trace string...",
    "breadcrumbs": ["event tags..."]
  }
  ```

### 2. Rating & Feedback
- **Endpoint**: `POST /api/rating`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "rating": 5,
    "name": "Ahmed",
    "email": "user@example.com",
    "comment": "Fast and private local AI client!",
    "appVersion": "2.4.0",
    "versionCode": 45,
    "device": "Samsung S24",
    "ts": 1729267500000
  }
  ```

## License

GNU General Public License v3.0 (GPL-3.0).

## Telegram Admin Bot Notifications

When users submit ratings or when crash reports occur, Avro Web automatically dispatches structured, formatted alerts directly to the admin via Telegram Bot with expandable quotes and reply buttons.

To enable this on **Vercel**:
1. Go to your project settings in Vercel: **Settings -> Environment Variables**.
2. Add the following variables:
   - `TELEGRAM_BOT_TOKEN`: The bot token obtained from `@BotFather`.
   - `TELEGRAM_ADMIN_CHAT_ID`: Your Telegram numeric chat ID (can be obtained via `@userinfobot`).
3. Redeploy or trigger a build. All future ratings and crashes will arrive directly on your Telegram!
