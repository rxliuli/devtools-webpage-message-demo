import { defineConfig } from 'wxt'

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    host_permissions: ['https://*/*', 'http://*/*'],
    permissions: ['scripting'],
    web_accessible_resources: [
      {
        resources: [
          '/main-content.js',
          '/isolation-content.js',
          '/iframe.html',
        ],
        matches: ['<all_urls>'],
      },
    ],
  },
  runner: {
    // disabled: true,
    startUrls: ['https://www.google.com'],
  },
})
