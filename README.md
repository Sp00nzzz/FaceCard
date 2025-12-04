# FaceCard - AI-Powered Face Analysis

A Next.js web application that uses Google Gemini AI to analyze facial attributes and generate a receipt-style valuation.

## Features

- Real-time webcam face detection
- AI-powered facial attribute analysis using Google Gemini
- Receipt-style display of detected attributes
- Apple-inspired UI design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual Gemini API key.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. Click "Scan My Face Card" button
2. A photobooth flash captures your face
3. The image is sent to Google Gemini AI for analysis
4. Gemini identifies facial attributes (e.g., "Symmetrical eyes", "Clear skin", etc.)
5. A receipt is generated with detected attributes and their prices

## Note

If the Gemini API key is not configured, the app will use fallback attributes instead of AI analysis.

# FaceCard
