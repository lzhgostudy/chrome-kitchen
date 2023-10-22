# chrome.action

---
<el-descriptions border column="1">
  <el-descriptions-item label="描述">
    使用`chrome.action`API 控制 Google Chrome 工具栏中的扩展程序图标。
  </el-descriptions-item>
  <el-descriptions-item label="manifest 键名">
    必须在 manifest 中声明 `action` 键才能使用此 API。
  </el-descriptions-item>
  <el-descriptions-item label="可用性">
    <el-tag style="margin-right: 10px">chrome 88+</el-tag>
    <el-tag type="warning">mv3+</el-tag>
  </el-descriptions-item>
</el-descriptions>

您可以使用 `chrome.action`API 来控制 Chrome UI 中扩展程序的工具栏按钮。操作图标显示在浏览器工具栏中，多功能框的右侧（在从左到右的设备上）。安装后，默认情况下，它们出现在扩展菜单（拼图）中。用户可以选择将您的扩展程序图标固定到工具栏。

## manifest

要使用`chrome.action`API，您需要指定`manifest_version: 3`或更高版本，并将`action`包含在manifest文件中。

```json
{
  "name": "Action Extension",
  ...
  "action": {
    "default_icon": {              // optional
      "16": "images/icon16.png",   // optional
      "24": "images/icon24.png",   // optional
      "32": "images/icon32.png"    // optional
    },
    "default_title": "Click Me",   // optional, shown in tooltip
    "default_popup": "popup.html"  // optional
  },
  ...
}
```

这些值中的每一个都是可选的；从技术上讲，空字典`{}`是允许的。

下面详细描述这些属性。

## 用户界面的部分

### 图标

图标是工具栏按钮中使用的主要图像。图标的宽度和高度均为 16 DIP（与设备无关的像素）。该图标最初是由文件条目`default_icon`中的键设置的。该键是图像路径大小的字典。Chrome 将使用这些图标来选择要使用的图像比例。如果未找到完全匹配的内容，Chrome 将选择最接近的可用内容并将其缩放以适合图像。但是，这种缩放可能会导致图标丢失细节或看起来模糊。

由于具有 1.5 倍或 1.2 倍等不太常见比例因子的设备变得越来越常见，因此我们鼓励您为图标提供多种尺寸。这也确保了如果图标显示大小发生变化，您不需要做任何更多的工作来提供不同的图标。

还可以使用 `action.setIcon()` 该方法以编程方式设置图标。这可用于指定不同的图像路径或使用HTML canvas 元素提供动态生成的图标，或者，如果从 Extension Service Worker 设置，则使用离屏画布API。

```js
const canvas = new OffscreenCanvas(16, 16);
const context = canvas.getContext('2d');
context.clearRect(0, 0, 16, 16);
context.fillStyle = '#00FF00';  // Green
context.fillRect(0, 0, 16, 16);
const imageData = context.getImageData(0, 0, 16, 16);
chrome.action.setIcon({imageData: imageData}, () => { /* ... */ });
```

#### 格式

对于打包扩展（从 .crx 文件安装），图像可以采用 Blink 渲染引擎可以显示的大多数格式，包括 PNG、JPEG、BMP、ICO 等（不支持 SVG）。解压的扩展程序必须使用 PNG 格式的图像。

### Tooltip(标题)

当用户将鼠标悬停在工具栏中的扩展程序图标上时，会出现工具提示或标题。当按钮获得焦点时，它也包含在屏幕阅读器朗读的可访问文本中。

默认 tooltip 是从 manifest 中对象 `action.default_title` 的字段设置的。您还可以使用`action.setTitle()`该方法以编程方式设置它。

### Badge(徽章)

`action` 可以选择显示“徽章”——图标上分层的一些文本。这使得更新操作以显示有关扩展状态的少量信息（例如计数器）变得很容易。徽章具有文本组件和背景颜色。

请注意，徽章的空间有限，通常应使用四个或更少的字符。

Badge 徽章没有从 manifest 中获取的默认值；您可以使用编程方式 `action.setBadgeBackgroundColor()` 和 `action.setBadgeText()`设置它。设置颜色时，这些值可以是组成徽章 `RGBA` 颜色的 0 到 255 之间的四个整数的数组，也可以是具有 CSS 颜色值的字符串。

```js
chrome.action.setBadgeBackgroundColor(
  {color: [0, 255, 0, 0]},  // Green
  () => { /* ... */ },
);

chrome.action.setBadgeBackgroundColor(
  {color: '#00FF00'},  // Also green
  () => { /* ... */ },
);

chrome.action.setBadgeBackgroundColor(
  {color: 'green'},  // Also, also green
  () => { /* ... */ },
);
```

### Popup 弹出窗口

当用户单击工具栏中的扩展程序操作按钮时，将显示操作的弹出窗口。弹出窗口可以包含您喜欢的任何 HTML 内容，并且会自动调整大小以适合其内容。弹出窗口不能小于 **25x25**，不能大于 **800x600**。

弹出窗口最初是根据`manifest.json`文件中键的`default_popup`属性设置的。如果存在，则应指向扩展目录中的相对路径。还可以使用`action.setPopup()`该方法动态更新它以指向不同的相对路径。

::: tip
`action.onClicked`如果扩展操作已指定在单击当前选项卡时显示的弹出窗口，则不会调度该事件。
:::

## Per-tab state 选项卡状态

每个选项卡的扩展操作可以有不同的状态。例如，您可以将每个选项卡上的徽章文本设置为不同（以显示选项卡特定的状态）。您可以通过 `tabId` 使用 action API 上各种方法来设置单个选项卡的值。例如，要在特定选项卡上设置徽章文本，您可以执行以下操作：

```js
function getTabId() { /* ... */}
function getTabBadge() { /* ... */}

chrome.action.setBadgeText(
  {
    text: getTabBadge(tabId),
    tabId: getTabId(),
  },
  () => { ... }
);
```

如果省略 `tabId` 该属性，则该设置将被视为全局设置。选项卡特定设置优先于任何全局设置。