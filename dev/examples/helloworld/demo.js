/*
 * 打开index.html页面，完成X.App.launch()初始化，hash被重置为'#/h'，
 * 加载pagelet 'demo-pagelet'，页面视图显示“hello world”
 */
MX.ready('klass', function(X, Klass) {
    // 声明一个View类
    Klass.define({
        // 为DemoView类定义别名
        alias: 'demo.view',

        // 继承MX.app.View类
        extend: 'view',

        onRender: function() {
            // 更新body对象的HTML，body是一个jquery element对象
            this.body.html('<h1>Hello World!</h1><p>这个一个简单的例子，参见<a href="demo.js" target="_blank">main.js</a></p>');
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