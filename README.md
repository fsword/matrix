Matrix - A Mobile WebApp Framework
======

Matrix是一个面向移动端WebApp开发的框架，当前还处于开发阶段，初期的Matrix会更适用于阅读类产品开发，如新闻客户端等。

Matrix构建在jQuery Mobile 1.3.0之上，提供模版引擎、MVC框架，辅助开发者更高效的构建移动WebApp项目。

# Hello World!

<p><code>
MX.ready(function(X) {
    var DemoView = Klass.define({
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
</code></p>