# Matrix - A Mobile WebApp Framework
======

Matrix是一个面向移动端WebApp开发的前端框架，适用于开发Single Page Web Application。当前还处于开发阶段，功能还不完善，初期的Matrix功能会更好的支持阅读类产品开发，如新闻客户端等。

Matrix构建在 jQuery 1.9.1 以及 jQuery Mobile 1.3.1 之上，Matrix自身并不提供CSS、页面动画以及UI组件等功能，它只是将这些资源更有效的整合起来，并提供更多项目开发中所需要的工具、套件，辅助开发者更高效的构建移动WebApp项目。

## 功能特性

### MVC框架
Matrix是一个高度集成jQuery Mobile的MVC框架，它将jQuery Mobile的UI、事件控制等功能结构化，使用View、Controller、Template更快速的构建Single Page WebApp。

### 高速模版引擎
Matrix集成了[artTemplate](https://github.com/aui/artTemplate)模版引擎，并提供LocalStorage模版缓存机制。

### 页面实时响应数据更改
Model/Store数据更改之后，模版会自动更新绑定的页面视图区域，无需更多的额外编码。

## 支持平台

* iOS 5+
* Android 4+
* Windows Phone 8+ (建设中)

## Hello World!

使用Matrix非常简单，从第一个例子[Hello World](https://github.com/mxjs/matrix/tree/master/examples/helloworld/ "Example")开始吧

```
MX.ready('klass', function(X, Klass) {
    // 声明一个View类
    Klass.define({
        // 为DemoView类定义别名
        alias: 'demo.view',

        // 继承MX.app.View类
        extend: 'view',

        onRender: function() {
            // 更新body对象的HTML，body是一个jquery element对象
            this.body.html('Hello World!');
        }
    });

    // 启动App
    X.App.launch({
        // 定义pagelet
        pagelets: [
            {
                id: 'demo-pagelet', // pagelet唯一标识
                url: 'h', // pagelet访问路径
                view: 'demo.view' // 为pagelet设置一个View
            }
        ],

        // App的默认欢迎页
        welcome: 'h'
    });
});
```

## 一个比较完整的例子：手机搜狐

[手机搜狐WebApp](http://h5.m.sohu.com/matrix/v4/examples/msohu/index.html "手机搜狐（向Zaker致敬）")的功能完全模拟ZAKER for iPhone开发。

你可以直接从手机浏览器打开[手机搜狐WebApp](http://h5.m.sohu.com/matrix/v4/examples/msohu/index.html "手机搜狐（向Zaker致敬）")。由于页面是按照iPhone4S全屏高度设计，为了达到最佳展示效果，请使用iOS Safari打开，并将页面添加到你的桌面，然后从桌面打开进入。

直接用手机扫描下面的二维码，就可以访问[手机搜狐WebApp](http://h5.m.sohu.com/matrix/v4/examples/msohu/index.html "手机搜狐（向Zaker致敬）")

![QR Code](https://raw.github.com/mxjs/matrix/master/examples/msohu/qrcode.png "二维码")

## Examples

* [Hello World](http://mxjs.github.io/matrix/dev/examples/helloworld/index.html "Hello World")
* Use Template (建设中)
* Use Model (建设中)
* Use Store (建设中)
* Use jQuery Mobile Widget (建设中)
* [Use RequireJS](http://mxjs.github.io/matrix/dev/examples/requirejs/index.html "Hello RequireJS")
* [手机搜狐WebApp](http://h5.m.sohu.com/matrix/v4/examples/msohu/index.html "手机搜狐（向Zaker致敬）")

## 对jQuery Mobile的说明
Matrix框架是构建在jQuery Mobile（简称jqm）之上，既可以依赖包含所有jqm组件的版本，也可以只依赖jqm核心库，Matrix提供两个版本的jqm打包：

1. jquery.mobile-1.3.1.js，包含除Core Init模块之外的所有jqm代码，最后被打包在matrix-all.js中
2. jquery.mobile-1.3.1-lite.js，则只包含以下模块的代码，最后被打包matrix.js中：
 * Core，除init之外的部分
 * Events
 * Navigation
 * Transitions
 * Utilities: match media polyfill, zoom handling, ios orientation change fix
 * Widgets: toolbars fixed, toolbars fixed workarounds, loading message

## Downloads

* [v0.1.1](http://mxjs.github.io/matrix/tags/matrix-0.1.1.zip "matrix-0.1.1.zip")(latest version)

## Change Log

### v0.1.1 (2013/4/19)

* 第一个版本发布

