# 与 Service Worker 一起处理事件

## 概述

本教程介绍了 Chrome Extension Service Worker。作为本教程的一部分，我们将构建一个扩展程序，允许用户使用多功能框快速导航到 Chrome API 参考页面。你将学到如何：

1. 注册您的 Service Worker 并导入模块。
2. 调试您的 Extension Service Worker。
3. 管理状态并处理事件。
4. 触发周期性事件。
5. 与内容脚本进行通信。

<video src="https://storage.googleapis.com/web-dev-uploads/video/BhuKGJaIeLNPW9ehns59NfwqKxF2/WmVEGpEZ9ts1J0pUOzEr.mp4"></video>

## 构建项目

首先创建一个新目录来 `quick-api-reference` 保存扩展文件，或者从 `/example/quick-api-reference` 下载源代码。

### 第 1 步：注册 Service Worker

在项目根目录下创建 `manifest` 文件并添加以下代码：

```json
{
  "manifest_version": 3,
  "name": "Open extension API reference",
  "version": "1.0.0",
  "icons": {
    "16": "images/icon-16.png",
    "128": "images/icon-128.png"
  },
  "background": { // [!code focus:3]
    "service_worker": "service-worker.js",
  },
}
```

扩展程序在 manifest 中注册其 Service Worker，该 manifest 只需要一个 JavaScript 文件。无需 `navigator.serviceWorker.register()` 像在网络应用程序中那样调用 。

创建一个images文件夹，然后将图标下载到其中。


### 第 2 步：导入多个 Service Worker 模块

我们的 Service Worker 实现了两个功能。为了更好的可维护性，我们将在单独的模块中实现每个功能。首先，我们需要在 manifest 中将 Service Worker 声明为ES 模块，这允许我们在 Service Worker 中导入模块：

```json
{
  "manifest_version": 3,
  "name": "Open extension API reference",
  "version": "1.0.0",
  "icons": {
    "16": "images/icon-16.png",
    "128": "images/icon-128.png"
  },
  "background": { 
    "service_worker": "service-worker.js",
    "type": "module" // [!code focus]
  },
}
```

创建 `service-worker.js` 文件并导入两个模块：

```js
import './sw-omnibox.js';
import './sw-tips.js';
```

创建这些文件并向每个文件添加控制台日志。

::: code-group
```js [sw-omnibox.js]
console.log("sw-omnibox.js")
```

```js [sw-tips.js]
console.log("sw-tips.js")
```
:::

::: tip 重要提示
`type.module`请记住在使用现代模块捆绑器框架（例如CRXjs Vite 插件）时进行设置。
:::

#### 调试 Service Worker

让我们快速了解一下如何查找 Service Worker 日志并了解其何时终止。首先，按照说明加载解压的扩展。

30 秒后，您将看到 **“serviceWorker(inactive)”**，这意味着 `ServiceWorker` 已终止。单击 **“Service Worker（非活动）”** 超链接进行检查。请参阅下面的示例。

<video src="https://storage.googleapis.com/web-dev-uploads/video/BhuKGJaIeLNPW9ehns59NfwqKxF2/D1XRaA6q4xn9Ylwe1u1N.mp4"></video>

您是否注意到检查 Service Worker 唤醒了它？这是正确的！在开发工具中打开 Service Worker 将使其保持活动状态。为了确保您的扩展在 Service Worker 终止时正常运行，请记住关闭 DevTools。

接下来我们故意编写错误代码来让程序报错，以此来学习如何排查错误。其中一种方法是从 `service-worker.js` 文件中删除 `sw-omnibox.js` 文件的导入 。Chrome 将无法注册 Service Worker。

返回 chrome://extensions 并刷新扩展程序。你会看到两个错误：

```
Service worker registration failed. Status code: 3.

An unknown error occurred when fetching the script.
```

<video src="https://storage.googleapis.com/web-dev-uploads/video/BhuKGJaIeLNPW9ehns59NfwqKxF2/AbMNDSbURLKjH1Jm1C9Q.mp4"></video>

::: warning 警告
在继续之前不要忘记修复文件名！
:::

### 第 4 步：初始化状态

如果不需要，Chrome 将关闭 Service Worker。我们使用chrome.storageAPI 来跨 Service Worker 会话保存状态。对于存储访问，我们需要在 `manifest` 中请求权限：

```json
{
  "manifest_version": 3,
  "name": "Open extension API reference",
  "version": "1.0.0",
  "icons": {
    "16": "images/icon-16.png",
    "128": "images/icon-128.png"
  },
  "background": { 
    "service_worker": "service-worker.js",
    "type": "module" 
  },
  "permissions": ["storage"] // [!code focus]
}
```

首先，让我们将默认建议保存到存储中。我们可以通过监听事件来初始化扩展首次安装时的状态 `runtime.onInstalled()`：

::: code-group
``` js [sw-omnibox.js]
console.log("sw-omnibox.js")

// Save default API suggestions // [!code focus:8]
chrome.runtime.onInstalled.addListener(({ reason }) => { 
  if (reason === 'install') {
    chrome.storage.local.set({
      apiSuggestions: ['tabs', 'storage', 'scripting']
    });
  }
});
```
:::

Service Worker 无法直接访问 `window` 对象，因此无法使用 `window.localStorage()` 来存储值。此外，`Service Worker` 是短暂的执行环境；它们在用户的浏览器会话中反复终止，这使得它与全局变量不兼容。相反，我们使用 `chrome.storage.local` 它在本地计算机上存储数据。

### 第 5 步：注册您的事件

所有事件侦听器都需要在 Service Worker 的全局范围内静态注册。换句话说，事件侦听器不应嵌套在异步函数中。这样，Chrome 就可以确保在 Service Worker 重新启动时恢复所有事件处理程序。

在此示例中，我们将使用 API `chrome.omnibox`，但首先我们必须在 `manifest` 中声明多功能框关键字触发器：

```json
{
  "manifest_version": 3,
  "name": "Open extension API reference",
  "version": "1.0.0",
  "icons": {
    "16": "images/icon-16.png",
    "128": "images/icon-128.png"
  },
  "background": { 
    "service_worker": "service-worker.js",
    "type": "module" 
  },
  "permissions": ["storage"], 
  "minimum_chrome_version": "102", // [!code focus:4]
  "omnibox": {
    "keyword": "api"
  }
}
```

::: tip 重要
`minimum_chrome_version`: 当用户尝试安装您的扩展程序但未使用兼容版本的 Chrome 时，Chrome 会提醒用户。
:::

现在，让我们在脚本的顶层注册多功能框事件侦听器。当用户api在地址栏中输入多功能框关键字（ ），然后输入制表符或空格时，Chrome 将根据存储中的关键字显示建议列表。该`onInputChanged()`事件接受当前用户输入和`suggestResult`对象，负责填充这些建议。

::: code-group 
```js [sw-omnibox.js]
console.log("sw-omnibox.js")

// Save default API suggestions
chrome.runtime.onInstalled.addListener(({ reason }) => { 
  if (reason === 'install') {
    chrome.storage.local.set({
      apiSuggestions: ['tabs', 'storage', 'scripting']
    });
  }
});

const URL_CHROME_EXTENSIONS_DOC = // [!code focus:14]
  'https://developer.chrome.com/docs/extensions/reference/';
const NUMBER_OF_PREVIOUS_SEARCHES = 4;

// Display the suggestions after user starts typing
chrome.omnibox.onInputChanged.addListener(async (input, suggest) => {
  await chrome.omnibox.setDefaultSuggestion({
    description: 'Enter a Chrome API or choose from past searches'
  });
  const { apiSuggestions } = await chrome.storage.local.get('apiSuggestions');
  const suggestions = apiSuggestions.map((api) => {
    return { content: api, description: `Open chrome.${api} API` };
  });
  suggest(suggestions);
});
```
:::

用户选择建议后，`onInputEntered()`将打开相应的Chrome API参考页面。

::: code-group 
```js [sw-omnibox.js]
console.log("sw-omnibox.js")

// Save default API suggestions
chrome.runtime.onInstalled.addListener(({ reason }) => { 
  if (reason === 'install') {
    chrome.storage.local.set({
      apiSuggestions: ['tabs', 'storage', 'scripting']
    });
  }
});

const URL_CHROME_EXTENSIONS_DOC = 
  'https://developer.chrome.com/docs/extensions/reference/';
const NUMBER_OF_PREVIOUS_SEARCHES = 4;

// Display the suggestions after user starts typing
chrome.omnibox.onInputChanged.addListener(async (input, suggest) => {
  await chrome.omnibox.setDefaultSuggestion({
    description: 'Enter a Chrome API or choose from past searches'
  });
  const { apiSuggestions } = await chrome.storage.local.get('apiSuggestions');
  const suggestions = apiSuggestions.map((api) => {
    return { content: api, description: `Open chrome.${api} API` };
  });
  suggest(suggestions);
});

// Open the reference page of the chosen API // [!code focus:6]
chrome.omnibox.onInputEntered.addListener((input) => {
  chrome.tabs.create({ url: URL_CHROME_EXTENSIONS_DOC + input });
  // Save the latest keyword
  updateHistory(input);
});
```
:::

下面的函数 `updateHistory()` 接受多功能框输入并将其保存到`storage.local`。这样，最新的搜索词可以稍后用作多功能框建议。

::: code-group 
```js [sw-omnibox.js]
console.log("sw-omnibox.js")

// Save default API suggestions
chrome.runtime.onInstalled.addListener(({ reason }) => { 
  if (reason === 'install') {
    chrome.storage.local.set({
      apiSuggestions: ['tabs', 'storage', 'scripting']
    });
  }
});

const URL_CHROME_EXTENSIONS_DOC = 
  'https://developer.chrome.com/docs/extensions/reference/';
const NUMBER_OF_PREVIOUS_SEARCHES = 4;

// Display the suggestions after user starts typing
chrome.omnibox.onInputChanged.addListener(async (input, suggest) => {
  await chrome.omnibox.setDefaultSuggestion({
    description: 'Enter a Chrome API or choose from past searches'
  });
  const { apiSuggestions } = await chrome.storage.local.get('apiSuggestions');
  const suggestions = apiSuggestions.map((api) => {
    return { content: api, description: `Open chrome.${api} API` };
  });
  suggest(suggestions);
});

// Open the reference page of the chosen API 
chrome.omnibox.onInputEntered.addListener((input) => {
  chrome.tabs.create({ url: URL_CHROME_EXTENSIONS_DOC + input });
  // Save the latest keyword
  updateHistory(input);
});

async function updateHistory(input) { // [!code focus:6]
  const { apiSuggestions } = await chrome.storage.local.get('apiSuggestions');
  apiSuggestions.unshift(input);
  apiSuggestions.splice(NUMBER_OF_PREVIOUS_SEARCHES);
  return chrome.storage.local.set({ apiSuggestions });
}
```
:::

::: tip 重要
Extension Service Worker 可以使用 Web API 和 Chrome API，但有一些例外。有关更多信息，请参阅 [Service Worker](https://developer.chrome.com/docs/extensions/mv3/service-workers/events/) 事件。
:::

### 第 6 步：设置重复事件

`setTimeout()` 或方法`setInterval()`通常用于执行延迟或周期性任务。但是，这些 API 可能会失败，因为调度程序将在 Service Worker 终止时取消计时器。相反，扩展可以使用`chrome.alarmsAPI`。

首先请求`alarms`清单中的权限。此外，要从远程托管位置获取扩展提示，您需要请求主机权限：

```json
{
  "manifest_version": 3,
  "name": "Open extension API reference",
  "version": "1.0.0",
  "icons": {
    "16": "images/icon-16.png",
    "128": "images/icon-128.png"
  },
  "background": { 
    "service_worker": "service-worker.js",
    "type": "module" 
  },
  "permissions": ["storage", "alarms"], // [!code focus]
  "minimum_chrome_version": "102", 
  "omnibox": {
    "keyword": "api"
  }
}
```

该扩展程序将获取所有提示，随机选择一个并将其保存到存储中。我们将创建一个每天触发一次的警报来更新提示。关闭 Chrome 时不会保存闹钟。因此我们需要检查警报是否存在，如果不存在则创建警报。

::: code-group
```js [sw-tips.js]
// Fetch tip & save in storage
const updateTip = async () => {
  const response = await fetch('https://extension-tips.glitch.me/tips.json');
  const tips = await response.json();
  const randomIndex = Math.floor(Math.random() * tips.length);
  return chrome.storage.local.set({ tip: tips[randomIndex] });
};

const ALARM_NAME = 'tip';

// Check if alarm exists to avoid resetting the timer.
// The alarm might be removed when the browser session restarts.
async function createAlarm() {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (typeof alarm === 'undefined') {
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: 1,
      periodInMinutes: 1440
    });
    updateTip();
  }
}

createAlarm();

// Update tip once a the day
chrome.alarms.onAlarm.addListener(updateTip);
```
:::

::: tip 重要
所有Chrome API事件侦听器和方法都会重新启动 Service Worker 的 30 秒终止计时器。有关更多信息，请参阅 [Extension Service Worker](https://developer.chrome.com/docs/extensions/mv3/service-workers/service-worker-lifecycle/) 生命周期。
:::

### 第 7 步：与其他环境进行沟通

扩展使用内容脚本来读取和修改页面的内容。当用户访问 Chrome API 参考页面时，扩展程序的内容脚本将使用当天的提示更新页面。它发送一条消息，请求 Service Worker 提供当天的提示。

首先在清单中声明内容脚本，并添加与Chrome API参考文档相对应的匹配模式。

```json
{
  "manifest_version": 3,
  "name": "Open extension API reference",
  "version": "1.0.0",
  "icons": {
    "16": "images/icon-16.png",
    "128": "images/icon-128.png"
  },
  "background": { 
    "service_worker": "service-worker.js",
    "type": "module" 
  },
  "permissions": ["storage", "alarms"],
  "minimum_chrome_version": "102", 
  "omnibox": {
    "keyword": "api"
  },
  "content_scripts": [ // [!code focus:6]
    {
      "matches": ["https://developer.chrome.com/docs/extensions/reference/*"],
      "js": ["content.js"]
    }
  ]
}
```

创建一个新的内容文件。以下代码向 Service Worker 发送一条消息来请求数据。然后，添加一个按钮，该按钮将打开包含扩展提示的弹出窗口。此代码使用新的 Web 平台 [Popover API](https://developer.mozilla.org/docs/Web/API/Popover_API)（有关更多详细信息，请参阅[HTML 规范](https://html.spec.whatwg.org/multipage/popover.html)）。

::: code-group
```js [content.js]
(async () => {
  // Sends a message to the service worker and receives a tip in response
  const { tip } = await chrome.runtime.sendMessage({ greeting: 'tip' });

  const nav = document.querySelector('.navigation-rail__links');
  
  const tipWidget = createDomElement(`
    <button class="navigation-rail__link" popovertarget="tip-popover" popovertargetaction="show" style="padding: 0; border: none; background: none;>
      <div class="navigation-rail__icon">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none"> 
        <path d='M15 16H9M14.5 9C14.5 7.61929 13.3807 6.5 12 6.5M6 9C6 11.2208 7.2066 13.1599 9 14.1973V18.5C9 19.8807 10.1193 21 11.5 21H12.5C13.8807 21 15 19.8807 15 18.5V14.1973C16.7934 13.1599 18 11.2208 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9Z'"></path>
        </svg>
      </div>
      <span>Tip</span> 
    </button>
  `);

  const popover = createDomElement(
    `<div id='tip-popover' popover>${tip}</div>`
  );

  document.body.append(popover);
  nav.append(tipWidget);
})();

function createDomElement(html) {
  const dom = new DOMParser().parseFromString(html, 'text/html');
  return dom.body.firstElementChild;
}
```
:::

最后一步是向我们的 Service Worker 添加一个消息处理程序，该处理程序使用每日提示发送对内容脚本的回复。

::: code-group
```js [sw-tips.js]
// Fetch tip & save in storage
const updateTip = async () => {
  const response = await fetch('https://extension-tips.glitch.me/tips.json');
  const tips = await response.json();
  const randomIndex = Math.floor(Math.random() * tips.length);
  return chrome.storage.local.set({ tip: tips[randomIndex] });
};

const ALARM_NAME = 'tip';

// Check if alarm exists to avoid resetting the timer.
// The alarm might be removed when the browser session restarts.
async function createAlarm() {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (typeof alarm === 'undefined') {
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: 1,
      periodInMinutes: 1440
    });
    updateTip();
  }
}

createAlarm();

// Update tip once a the day
chrome.alarms.onAlarm.addListener(updateTip);

// Send tip to content script via messaging // [!code focus:7]
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.greeting === 'tip') {
    chrome.storage.local.get('tip').then(sendResponse);
    return true;
  }
});
```
:::

## 测试是否有效

验证项目的文件结构是否如下所示：

![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/l2HHbaSJeveap8EWLhrU.png?auto=format&w=758)

### 打开参考页面

1. 在浏览器地址栏中输入关键字“api”。
2. 按“制表符”或“空格键”。
3. 输入 API 的完整名称。
4. 将打开一个新页面，显示 Chrome API 参考页面。

它应该看起来像这样：

![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/tKsdFmAYFGApMRF47Nlp.gif?auto=format&w=1000)

### 打开当日提示

单击导航栏上的“提示”按钮可打开扩展提示。

![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/GqjdrVtuA0zt87l3QIn9.gif?auto=format&w=1000)

::: tip 重要
Popover API 在 Chrome 114 中推出。
:::