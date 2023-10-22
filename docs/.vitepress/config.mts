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
    nav: [
      { text: "基础指南", link: "/preface" },
      { text: 'API', link: '/apis/overview' },
    ],
    outline: 'deep',
    sidebar: {
      '/': [
        {
          text: "前言",
          link: "/preface",
        },
        {
          text: "快速开始",
          items: [
            { 
              text: "Hello Extension",
              link: "/quick-start/hello-extension"
            },
            { 
              text: "Reading Time",
              link: "/quick-start/reading-time"
            },
            {
              text: "与 Service Worker 一起处理事件",
              link: "/quick-start/service-worker"
            },
          ]
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
      '/apis/': [
        {
          text: "API 参考",
          link: "/apis/overview",
        },
        {
          text: "action",
          link: "/apis/action",
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    footer: {
      // message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Mine Lu'
    }
  }
})
