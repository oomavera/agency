import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    QSTASH_TOKEN: process.env.QSTASH_TOKEN ? '✅ Set (length: ' + process.env.QSTASH_TOKEN.length + ')' : '❌ NOT SET',
    QSTASH_URL: process.env.QSTASH_URL ? '✅ Set: ' + process.env.QSTASH_URL : '❌ NOT SET',
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY ? '✅ Set (length: ' + process.env.QSTASH_CURRENT_SIGNING_KEY.length + ')' : '❌ NOT SET',
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY ? '✅ Set (length: ' + process.env.QSTASH_NEXT_SIGNING_KEY.length + ')' : '❌ NOT SET',
    OPENPHONE_API_KEY: process.env.OPENPHONE_API_KEY ? '✅ Set (length: ' + process.env.OPENPHONE_API_KEY.length + ')' : '❌ NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
  };

  return NextResponse.json({
    message: 'Environment Variables Check',
    environment: {
      NODE_ENV: envVars.NODE_ENV,
      VERCEL_ENV: envVars.VERCEL_ENV,
    },
    qstash: {
      QSTASH_TOKEN: envVars.QSTASH_TOKEN,
      QSTASH_URL: envVars.QSTASH_URL,
      QSTASH_CURRENT_SIGNING_KEY: envVars.QSTASH_CURRENT_SIGNING_KEY,
      QSTASH_NEXT_SIGNING_KEY: envVars.QSTASH_NEXT_SIGNING_KEY,
    },
    openphone: {
      OPENPHONE_API_KEY: envVars.OPENPHONE_API_KEY,
    },
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
