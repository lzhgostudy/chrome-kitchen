# manifest.json

这是一个Chrome插件最重要也是必不可少的文件，用来配置所有和插件相关的配置，必须放在根目录。其中，`manifest_version`、`name`、`version` 3个是必不可少的，`description`和`icons`是推荐的。

下面给出的是一些常见的配置项，均有中文注释，完整的配置文档[请戳这里](https://developer.chrome.com/docs/extensions/mv3/manifest/)。

```json
{ 
  // 清单文件的版本，这个必须写，而且必须是3
  "manifest_version": 3,
  // 插件的名称
  "name": "My Chrome Extension Name",
  // 插件的版本
  "version": "1.0.0",
  // 插件描述
  "description": "简单的Chrome扩展demo",
  /**
    代表扩展或主题的一个或多个图标。您应该始终提供 128x128 的图标；
    它在安装过程中以及由 Chrome 网上应用店使用。扩展还应该提供一个 48x48 的图标，用于扩展管理页面 (chrome://extensions)。
    您还可以指定 16x16 图标用作扩展程序页面的图标。图标一般应为PNG格式，因为PNG对透明度的支持最好。
    不过，它们可以采用 Blink 支持的任何光栅格式，包括 BMP、GIF、ICO 和 JPEG。
    👉 详情: https://developer.chrome.com/docs/extensions/mv3/manifest/icons/
   */
  "icons": {
    "16": "icons/16.png",
    "32": "icons/32.png",
    "48": "icons/48.png",
    "128": "icons/128.png"
  },
  /**
    用于将 javascript 文件指定为扩展服务工作线程。Service Worker 是一个后台脚本，充当扩展的主事件处理程序。
    有关更多信息，请访问更全面的 Service Worker 介绍。
    👉 https://developer.chrome.com/docs/extensions/mv3/service_workers/#manifest
  */
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },
  /**
    扩展程序的工具栏按钮，操作图标显示在浏览器工具栏中，多功能框的右侧（在从左到右的设备上）。
    安装后，默认情况下，它们出现在扩展菜单（拼图）中。用户可以选择将您的扩展程序图标固定到工具栏。
    ❗️❗️ 请注意，即使未指定该键，每个扩展程序都会在 Chrome 的工具栏中有一个图标。
    👉 https://developer.chrome.com/docs/extensions/reference/action/
  */
  "action": {
    "default_icon": {              // 可选
      "16": "images/icon16.png",   // 可选
      "24": "images/icon24.png",   // 可选
      "32": "images/icon32.png"    // 可选
    },
    "default_title": "Click Me",   // 可选，图标悬停时的标题
    "default_popup": "popup.html"  // 可选
  },
  /**
    需要直接注入页面的 JS 或 CSS
    👉 https://developer.chrome.com/docs/extensions/mv3/manifest/content_scripts/
  */
  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      // 多个JS按顺序注入
      "js": ["js/jquery-1.8.3.js", "js/content-script.js"],
      // JS的注入可以随便一点，但是CSS的注意就要千万小心了，因为一不小心就可能影响全局样式
			"css": ["css/custom.css"],
      // 指定不执行注入操作的网址
      "exclude_matches": ["*://*/*foo*"],
      /**
        代码注入的时间，可选值： "document_start", "document_end", or "document_idle"，
        最后一个表示页面空闲时，默认document_idle
      */
      "run_at": "最后一个表示页面空闲时，默认document_idle"
    }
  ],
  /**
    👉 https://developer.chrome.com/docs/extensions/mv3/declare_permissions/#permissions
  */
  "permissions": [
    "contextMenus", // 右键菜单
    "storage", // 本地存储
  ],
  /**
    👉 https://developer.chrome.com/docs/extensions/reference/permissions/
  */
  "optional_permissions": [],
  // 主页，如果您在自己的站点上托管扩展程序，则此字段特别有用。
  "homepage_url": "https://example.com",
  /**
    覆盖浏览器默认页面，只能覆盖一个页面：书签管理页、历史、新标签
    👉 https://developer.chrome.com/docs/extensions/mv3/override/
  */
  "chrome_url_overrides": {
    "bookmarks": "bookmarks.html", // 覆盖浏览器默认的书签管理页
    "history": "history.html", // 覆盖浏览器默认的历史页
    "newtab": "newtab.html" // 覆盖浏览器默认的新标签页
  },
  /**
    选项页面也允许用户自定义扩展程序，使用选项来启用功能并允许用户选择与他们的需求相关的功能。
    👉 https://developer.chrome.com/docs/extensions/mv3/options/
  */
  "options_page": "options.html",
  /**
    默认语言
    👉 https://developer.chrome.com/docs/extensions/mv3/manifest/default_locale/
  */
	"default_locale": "zh_CN",
  /**
    Chrome 具有内置侧面板，使用户能够在网页主要内容旁边查看更多信息。
    侧面板 API 允许扩展程序在侧面板中显示自己的 UI，从而实现补充用户浏览旅程的持久体验。
    👉 https://developer.chrome.com/docs/extensions/reference/sidePanel/
  */
  "side_panel": {
    // 在每个站点上显示相同的侧面板
    "default_path": "sidepanel.html"
  }
}
```