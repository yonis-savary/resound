// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  nitro: {
    logLevel: 'debug'
  },

  image: {
    alias: {
      artist: '/api/artist'
    }
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui',
    'nuxt-auth-utils',
    'nuxt-socket-io',
    '@pinia/nuxt',
  ],
  css: ['public/assets/style.css'],
  io: {
    // module options
    sockets: [{
      name: 'main',
      url: 'http://localhost:3001'
    }]
  }
})