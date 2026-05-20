// Dynamic config that merges app.json with PostHog extras.
// Environment variables are read at build time.
const appJson = require('./app.json')

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST,
  },
}
