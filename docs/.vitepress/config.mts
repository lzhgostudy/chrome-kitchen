import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Chrome Extension Kitchen",
  description: "Chrome Extension Kitchen",
  head: [
    ['link', { rel: 'shortcut icon', href: "/favicon.ico" }],
  ],
  base: '/chrome-kitchen/',
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // nav: [
    //   { text: 'Home', link: '/' },
    //   { text: 'Examples', link: '/markdown-examples' }
    // ],
    outline: 'deep',
    sidebar: [
      {
        text: "前言",
        link: "/preface",
      },
      {
        text: '核心概念',
        items: [
          { text: 'manifest.json', link: '/core-concept/manifest' },
          { text: 'content scripts', link: '/core-concept/content-scripts' },
          { text: 'background', link: '/core-concept/background' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    footer: {
      // message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Mine Lu'
    }
  }
})
