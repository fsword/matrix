# Matrix - A Mobile WebApp Framework
======

Matrix是一个面向移动端WebApp开发的前端框架，当前还处于开发阶段，功能还不完善，初期的Matrix会更适用于阅读类产品开发，如新闻客户端等。

Matrix构建在 jQuery 1.9.1 以及 jQuery Mobile 1.3.0 之上，Matrix自身并不提供CSS、页面动画以及UI组件等功能，它只是将这些资源更有效的整合起来，并提供更多项目开发中所需要的工具、套件，辅助开发者更高效的构建移动WebApp项目。

## 功能特性

### MVC
Matrix是一个高度集成jQuery Mobile的MVC框架，它将jQuery Mobile的UI、事件控制等功能结构化，让开发者更少的纠结在jQuery Mobile以及如何构建页面本身，更多的专注在业务开发上。

### 高速模版引擎
Matrix集成了[artTemplate](https://github.com/aui/artTemplate)模版引擎，并提供LocalStorage模版缓存机制。

### 页面实时响应数据更改
Model/Store数据更改之后，模版会自动更新绑定的页面视图区域，无需更多的额外编码。

## Hello World!

使用Matrix非常简单，从第一个例子[Hello World](https://github.com/mxjs/matrix/tree/master/examples/helloworld/ "Example")开始吧

```
MX.ready('klass', function(X, Klass) {
    Klass.define({
        alias: 'demo.view',
        extend: 'view',
        onRender: function() {
            this.body.html('Hello World!');
        }
    });
    X.App.launch({
        pagelets: [{
            id: 'demo-pagelet',
            url: 'h',
            view: 'demo.view'
        }],
        welcome: 'h'
    });
});
```

## 一个比较完整的例子：手机搜狐

你可以直接从手机浏览器打开[手机搜狐WebApp](http://mxjs.github.com/matrix/dev/examples/msohu/index.html "手机搜狐（向Zaker致敬）")，__为了达到最佳展示效果，请使用iphone safari打开，并将页面添加到你的桌面__。

直接用手机扫描下面的二维码，就可以访问[手机搜狐WebApp](http://mxjs.github.com/matrix/dev/examples/msohu/index.html "手机搜狐（向Zaker致敬）")

![QR Code](http://mxjs.github.com/matrix/dev/examples/msohu/qrcode.png)
