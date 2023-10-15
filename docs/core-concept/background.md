# background

`background` 是一个常驻的页面，它的生命周期是插件中所有类型页面中最长的，它随着浏览器的打开而打开，随着浏览器的关闭而关闭，所以通常把需要一直运行的、启动就运行的、全局的代码放在 `background` 里面。

`background`的权限非常高，几乎可以调用所有的Chrome扩展API（除了`devtools`），而且它可以无限制跨域，也就是可以跨域访问任何网站而无需要求对方设置`CORS`。

```json
"background": {
  "service_worker": "service-worker.js",
  "type": "module"
}
```

## Extension Service Worker

本节介绍了在扩展中使用 Service Worker 需要了解的内容。无论您是否熟悉 Service Worker，您都应该阅读本节。Extension Service Worker 是扩展的中央事件处理程序。这使得它们与 Web Service Worker 有很大的不同，以至于网络上堆积如山的 Service Worker 文章可能有用，也可能没有用。

Extension Service Worker 与网络同行有一些共同点。Extension Service Worker 在需要时加载，并在休眠时卸载。加载后，Extension Service Worker 通常会在主动接收事件的情况下运行，尽管它可以关闭。与 Web 对应项一样，Extension Service Worker 无法访问 DOM，但如果需要，您可以将其用于屏幕外文档。

Extension Service Worker 不仅仅是网络代理（正如经常描述的 Web Service Worker一样）。除了标准的 Service Worker 事件之外，它们还响应扩展事件，例如导航到新页面、单击通知或关闭选项卡。它们的注册和更新方式也与 Web Service Worker不同。