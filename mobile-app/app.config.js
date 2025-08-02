// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: 'march-madness-app',
    slug: 'march-madness-app',
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};