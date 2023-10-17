# Hello Extension

了解 Chrome 扩展程序开发的基础知识。

本页描述了扩展开发工作流程。我们将创建一个“Hello，Extensions”示例，在本地加载扩展，找到日志，并探索其他建议。

当用户单击扩展工具栏图标时，此扩展将显示“Hello Extensions”。

![](/quick-start/hello-extension/hello-extension-1.png)

## 起步

首先创建一个新目录来存储开发文件。完整代码在 `/example/hello-extension`

接下来，在此目录中创建一个名为 `manifest.json`. 此 JSON 对象描述扩展的功能和配置。例如，大多数清单文件都包含一个"action"键，该键声明 Chrome 应用作扩展程序的操作图标的图像以及单击扩展程序的操作图标时在弹出窗口中显示的 HTML 页面。

```json
{
  "manifest_version": 3,
  "name": "Hello Extensions",
  "description": "Base Level Extension",
  "version": "1.0",
  "action": {
    "default_popup": "hello.html",
    "default_icon": "hello_extensions.png"
  }
}
```

对于弹出窗口，创建一个名为 的文件 `hello.html`，并添加以下代码：

```html
<html>
  <body>
    <h1>Hello Extensions</h1>
  </body>
</html>
```

现在，当单击扩展程序的操作图标（工具栏图标）时，扩展程序会显示弹出窗口。让我们在 Chrome 中通过本地加载来测试它。确保所有文件均已保存。

## 安装加载程序

要在开发者模式下加载解压的扩展：

1. `chrome://extensions`通过进入新选项卡转到“扩展”页面。（根据设计，`chrome://URL` 不可链接。）
   - 或者，单击“扩展”菜单拼图按钮，然后选择菜单底部的“管理扩展” 。
   - 或者，单击 Chrome 菜单，将鼠标悬停在“更多工具”上，然后选择“扩展”。
2. 单击开发人员模式旁边的切换开关启用开发人员模式。
3. 单击加载解压按钮并选择扩展目录。
![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/BzVElZpUtNE4dueVPSp3.png?auto=format&w=800)

扩展已成功安装。如果 `manifest.json` 中未包含扩展程序图标，将为该扩展程序创建一个通用图标。

## 固定扩展

默认情况下，当您在本地加载扩展程序时，它将显示在扩展程序菜单中 🧩。将您的扩展固定到工具栏，以便在开发过程中快速访问您的扩展。

![](/quick-start/hello-extension/hello-extension-2.png)

单击扩展程序的操作图标（工具栏图标）；您应该会看到一个弹出窗口。

![Hello Extension](/quick-start/hello-extension/hello-extension-1.png)

## 重新加载扩展

让我们回到代码，将扩展名更改为“Hello Extensions of the world!” 。

```json
{
  "manifest_version": 3,
  "name": "Hello Extensions of the world!",
}
```

保存文件后，要在浏览器中查看此更改，您还必须刷新扩展程序。转到扩展页面并单击 **开/关** 切换旁边的刷新图标：

![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/4Ph3qL9aUyswxmhauRFB.png?auto=format&w=1000)

::: details 是否总要刷新程序才能看到最新的更改效果？

并非所有组件都需要重新加载才能看到所做的更改，如下表所示：

| Extension Component | 是否需要手动刷新 |
| ------------------- | :--------------: |
| manifest.json       |        是        |
| Service worker      |        是        |
| content scripts     |        是        |
| popup               |        否        |
| options page        |        否        |
| 其他 HTML 页面      |        否        |

:::

## 查找控制台日志和错误

### 控制台日志

在开发过程中，您可以通过访问浏览器控制台日志来调试代码。在这种情况下，我们将找到弹出窗口的日志。首先将脚本标记添加到 `hello.html`。

```html
<html>
  <body>
    <h1>Hello Extensions</h1>
    <script src="popup.js"></script>
  </body>
</html>
```

创建一个 `popup.js` 文件并添加以下代码：

要查看控制台中记录的此消息：

1. 打开弹出窗口。
2. 右键单击弹出窗口。
3. 选择检查。

![](/quick-start/hello-extension/hello-extension-3.png)

4. 在 `DevTools` 中，导航至 **Console** 面板。

![](/quick-start/hello-extension/hello-extension-4.png)

### 错误日志

现在让我们打破扩展。我们可以通过删除以下中的结束引号来做到这一点 `popup.js` ：

```js
// ❌ broken code
console.log("This is a popup!) 
```

转到扩展页面并打开弹出窗口。将出现一个 **错误按钮**。

![](/quick-start/hello-extension/hello-extension-5.png)

单击**错误**按钮以了解有关错误的更多信息：

![](/quick-start/hello-extension/hello-extension-6.png)

## 构建扩展项目

构建扩展项目的方法有很多种；但是，您必须将 `manifest.json` 文件放置在扩展的根目录中。下面是一个结构示例：

![](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/hjccQNanPjTDpIajkhPU.png?auto=format&w=1400)

## 使用 TypeScript

如果您使用 VSCode 或 Atom 等代码编辑器进行开发，则可以使用 npm 包 [chrome-types](https://www.npmjs.com/package/chrome-types) 来利用 [Chrome API](https://developer.chrome.com/docs/extensions/reference/) 的自动完成功能。当 Chromium 源代码更改时，此 npm 包会自动更新。