# Reading Time

创建您的第一个扩展，在页面上插入新元素。

## 概述

本教程构建了一个扩展程序，可将预期的阅读时间添加到任何 Chrome 扩展程序和 Chrome Web Store 文档页面。

![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/VczSGe8eh0Xv7nTXxhxg.png?auto=format&w=1000)

在本指南中，我们将解释以下概念：

1. 扩展清单。
2. 扩展程序使用什么图标大小。
3. 如何使用内容脚本将代码注入页面。
4. 如何使用匹配模式。
5. 扩展权限。

本指南假设您具有基本的 Web 开发经验。我们建议查看[开发基础知识](/quick-start/hello-extension)以了解扩展开发工作流程。

## 构建项目

首先，创建一个名为 的新目录 `reading-time` 来保存扩展的文件。可以从本项目 `/examples/reading-time` 下载完整的源代码。

### 第 1 步：添加有关扩展程序的信息

`manifest.json` 是唯一必需的文件。它包含有关扩展的重要信息。在项目根目录下创建一个 `manifest.json` 文件并添加以下代码：

```json
{
  "manifest_version": 3,
  "name": "Reading time",
  "version": "1.0",
  "description": "Add the reading time to Chrome Extension documentation articles"
}
```

这些键包含扩展的基本元数据。它们控制扩展程序在扩展程序页面上以及发布后在 Chrome 网上应用店中的显示方式。要深入了解，请查看[Manifest](https://developer.chrome.com/docs/extensions/mv3/manifest/)概述页面上的["name"](https://developer.chrome.com/docs/extensions/mv3/manifest/name/)、["version"](https://developer.chrome.com/docs/extensions/mv3/manifest/version/)、["description"](https://developer.chrome.com/docs/extensions/mv3/manifest/description/)

::: details 关于 `manifest.json` 的更多认识
1. 它必须位于项目的**根目录**。
2. 唯一需要的键是`manifest_version`、`name`和`version`。
3. 它在开发过程中支持注释 (`//`)，但在将代码上传到 Chrome 网上应用店之前必须删除这些注释。
:::

### 第 2 步：提供图标

那么，为什么我们需要图标呢？尽管图标在开发过程中是可选的，但如果您计划在 Chrome Web Store 上分发扩展程序，则需要它们。它们还出现在其他地方，例如“扩展”页面。

创建一个`images`文件夹并将图标放入其中。接下来，将突出显示的代码添加到`manifest.json`中以声明图标：

```json
{
  "manifest_version": 3,
  "name": "Reading time",
  "version": "1.0",
  "description": "Add the reading time to Chrome Extension documentation articles",
  "icons": { // [!code ++]
    "16": "images/icon-16.png", // [!code ++]
    "32": "images/icon-32.png", // [!code ++]
    "48": "images/icon-48.png", // [!code ++]
    "128": "images/icon-128.png"  // [!code ++]
  } // [!code ++]
}
```

我们建议使用 PNG 文件，但也允许使用除 SVG 文件之外的其他文件格式。

::: details 这些不同大小的图标显示在哪里？

| 图标大小 |                  图标使用                  |
| -------- | :----------------------------------------: |
| 16x16    | 扩展程序页面上的网站图标和上下文菜单图标。 |
| 32x32    |       Windows 计算机通常需要此大小。       |
| 48x48    |            显示在“扩展”页面上。            |
| 128x128  |    在安装时和 Chrome 网上应用店中显示。    |

:::

### 第 3 步：声明内容脚本

扩展可以运行读取和修改页面内容的脚本。这些称为内容脚本。他们生活在一个孤立的世界中，这意味着他们可以更改 JavaScript 环境，而不会与其主机页或其他扩展的内容脚本发生冲突。

将以下代码添加到 `manifest.json` 中：

```json
{
  "manifest_version": 3,
  "name": "Reading time",
  "version": "1.0",
  "description": "Add the reading time to Chrome Extension documentation articles",
  "icons": {
    "16": "images/icon-16.png",
    "32": "images/icon-32.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  },
  "content_scripts": [ // [!code ++]
    { // [!code ++]
      "js": ["scripts/content.js"], // [!code ++]
      "matches": [ // [!code ++]
        "https://developer.chrome.com/docs/extensions/*", // [!code ++]
        "https://developer.chrome.com/docs/webstore/*" // [!code ++]
      ] // [!code ++]
    } // [!code ++]
  ] // [!code ++]
}
```

该 `matches` 字段可以有一个或多个匹配模式。这些允许浏览器识别将内容脚本注入到哪些站点。匹配模式由三部分组成 `<scheme>://<host><path>`。它们可以包含 `*` 字符。

::: details 此扩展是否显示权限警告？
当用户安装扩展程序时，浏览器会通知他们该扩展程序可以执行哪些操作。内容脚本请求在满足匹配模式条件的网站上运行的权限。
在此示例中，用户将看到以下权限警告：

![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/rKDdOyri9x8VkhTEXbO6.png?auto=format&w=676)

要更深入地了解扩展权限，请参阅[声明权限并警告用户](https://developer.chrome.com/docs/extensions/mv3/permission_warnings/)。
:::

### 第 4 步：计算并插入阅读时间

内容脚本可以使用标准文档对象模型(DOM) 来读取和更改页面的内容。扩展程序将首先检查页面是否包含该`<article>`元素。然后，它将计算该元素内的所有单词并创建一个显示总阅读时间的段落。

`content.js` 在名为 的文件夹中创建一个名为 的文件 `scripts` 并添加以下代码：

```js
const article = document.querySelector("article");

// `document.querySelector` may return null if the selector doesn't match anything.
if (article) {
  const text = article.textContent;
  const wordMatchRegExp = /[^\s]+/g; // Regular expression
  const words = text.matchAll(wordMatchRegExp);
  // matchAll returns an iterator, convert to array to get word count
  const wordCount = [...words].length;
  const readingTime = Math.round(wordCount / 200);
  const badge = document.createElement("p");
  // Use the same styling as the publish information in an article's header
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  // Support for API reference docs
  const heading = article.querySelector("h1");
  // Support for article docs with date
  const date = article.querySelector("time")?.parentNode;

  (date ?? heading).insertAdjacentElement("afterend", badge);
}
```

::: details 如何理解这段 JavaScript 代码
1. **正则表达式**用于仅计算元素内的单词`<article>`。
2. [insertAdjacentElement()](https://developer.mozilla.org/docs/Web/API/Element/insertAdjacentElement)用于在元素后面插入读取时间节点。
3. classList属性用于将 CSS 类名添加到元素类属性中。
4. [可选链接](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining)用于访问可能未定义或为 `null` 的对象属性。
5. `<heading>`如果为空或未定义，则[空合并](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)返回`<date>`。
:::

## 测试它是否有效

验证项目的文件结构是否如下所示：

![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/clhDe13hHGwiNyuRczzk.png?auto=format&w=1400)

### 本地加载您的扩展

[要在开发人员模式下加载解压的扩展，请按照开发基础知识](/quick-start/hello-extension)中的步骤进行操作。

您可以打开以下几个页面来查看每篇文章的阅读时间。

- [欢迎使用 Chrome 扩展程序文档](https://developer.chrome.com/docs/extensions/mv3/)
- [在 Chrome 网上应用店中发布](https://developer.chrome.com/docs/webstore/publish/)
- [了解内容脚本](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

它应该看起来像这样：

![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/VczSGe8eh0Xv7nTXxhxg.png?auto=format&w=1000)

## 🎯 潜在的增强功能

根据您今天学到的知识，尝试实施以下任一操作：

- 在 `manifest.json` 中添加另一个 **匹配模式以支持其他** [Chrome 开发人员](https://developer.chrome.com/docs/) 页面，例如[Chrome DevTools](https://developer.chrome.com/docs/devtools/)或[Workbox](https://developer.chrome.com/docs/workbox/)。

- 添加一个新的内容脚本，用于计算您喜爱的任何博客或文档网站的阅读时间。