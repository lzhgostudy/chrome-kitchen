# API 参考

Chrome 提供了许多专用 API 的扩展，例如 `chrome.alarms` 和 `chrome.action`。 许多 API 由命名空间及其相关的 manifest 字段组成。这些字段通常是权限，但并非总是如此。例如，`chrome.alarms` 只需要 `alarms` 权限，而 `chrome.action` 需要文件中的操作对象 `manifest.json`。

::: tip 重要
Chrome 88 或更高版本普遍支持 Manifest V3。对于后续 Chrome 版本中添加的扩展功能，请参阅API 参考文档以获取支持信息。如果您的扩展程序需要特定的 API，您可以在清单文件中指定最低 chrome 版本。
:::

## 异步方法

除非另有说明，API 中的方法`chrome.*`是异步的：它们立即返回，而不等待操作完成。如果您需要知道调用此类方法的结果，请使用返回的 `Promise` 或将回调函数传递到该方法中。有关详细信息，请参阅异步方法。

## 自定义用户界面

| API    |               描述               |
| ------ | :------------------------------: |
| action | 控制工具栏中扩展程序图标的显示。 |
| command | 添加触发操作的键盘快捷键。 |
| menus|自定义Google Chrome 的上下文菜单。|
| omnibox | 向地址栏添加关键字功能。|
| pages | 创建新选项卡、书签或历史记录页面的版本。|
| actions | 在工具栏中动态显示图标。|

## 构建实用程序

| API    |               描述               |
| ------ | :------------------------------: |
| Accessibility | 为残疾人士提供方便的扩展。 |
| Service workers | 当有趣的事情发生时进行检测并做出反应。|
| Internationalization | 使用语言和区域设置。|
| Identity | 获取 OAuth2 访问令牌。|
| Management | 管理已安装和正在运行的扩展。|
| Message passing | 从内容脚本与其父扩展进行通信，反之亦然。|
| Options page | 让用户自定义扩展。|
| Permissions | 存储和检索数据。|

## 修改并观察Chrome浏览器

| API    |               描述               |
| ------ | :------------------------------: |
| Bookmarks | 创建、组织和操作书签行为。 |
| Browsing data | 从用户的本地配置文件中删除浏览数据。|
| Downloads | 以编程方式启动、监视、操作和搜索下载。|
| Settings | 管理 Chrome 的字体设置。|
| History | 与浏览器的访问页面记录进行交互。|
| Privacy | 控制 Chrome 隐私功能。|
| Proxy | 管理 Chrome 的代理设置。|
| Sessions | 从浏览会话中查询和恢复选项卡和窗口。|
| Tabs | 在浏览器中创建、修改和重新排列选项卡。|
| Top sites | 访问用户最常访问的 URL。|
| Themes | 更改浏览器的整体外观。|
| Windows | 在浏览器中创建、修改和重新排列窗口。|

## 修改和观察网络

| API    |               描述               |
| ------ | :------------------------------: |
| Active tab | 通过消除对主机权限的大部分需求来安全地访问网站<all_urls>。 |
| Content settings | 自定义网站功能，例如 cookie、JavaScript 和插件。|
| Content scripts | 在网页上下文中运行 JavaScript 代码。|
| Cookies | 探索并修改浏览器的cookie系统。|
| Cross-origin XMLHttpRequest | 使用 XMLHttpRequest 从远程服务器发送和接收数据。|
| Declarative content | 无需许可即可对页面内容执行操作。|
| Desktop capture | 捕获屏幕、单个窗口或选项卡的内容。|
| Page capture | 将选项卡的源信息保存为 MHTML。|
| Tab capture | 与选项卡媒体流交互。|
| Web navigation | 飞行中导航请求的状态更新。|
| Declarative net request | 提供告诉 Chrome 如何拦截、阻止或修改正在进行的请求的规则。|

## 打包、部署和更新

| API    |               描述               |
| ------ | :------------------------------: |
| Chrome Web Store | 使用 Chrome 网上应用店托管和更新扩展程序。 |
| Other deployment options | 在指定网络上或与其他软件一起分发扩展。|

## 展开 Chrome 开发者工具

| API    |               描述               |
| ------ | :------------------------------: |
| Debugger | 检测网络交互、调试 JavaScript、改变 DOM 和 CSS。 |
| Devtools | 向 Chrome 开发者工具添加功能。|