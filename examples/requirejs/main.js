require.config({
    baseUrl: '../../',

    /*
     * 使用RequireJS，必须使用matrix-nolibs.js，只有matrix-nolibs.js才支持AMD规范，
     * matrix.js的包是不支持AMD规范的，第三方JS库需要单独依赖加载
     */
    paths: {
        jquery: 'src/lib/jquery-1.9.1',
        jquerymobile: 'src/lib/jquery.mobile-1.3.0',
        arttemplate: 'src/lib/artTemplate-1.4.0'  ,
        matrix: 'dist/matrix-nolibs'
    },

    shim: {
        // artTemplate是一个支持CMD规范的第三方JS库，需要使用shim参数配置访问对象
        arttemplate: {
            exports: 'template'
        }
    }
});

require(['matrix'], function(X) {
    X.ready('klass', function(X, Klass) {
        Klass.define({
            alias: 'demo.indexview',
            extend: 'view',
            headerCfg: {
                template: {
                    template: '<h3>Header</h3>'
                }
            },
            bodyCfg: {
                template: {
                    template: ['<ul data-role="listview" data-divider-theme="b" data-inset="true">',
                               '    <li data-role="list-divider" role="heading">',
                               '        Divider',
                               '    </li>',
                               '    <li data-theme="c">',
                               '        <a href="#0" data-transition="slide">',
                               '            Button',
                               '        </a>',
                               '    </li>',
                               '</ul>',
                               '<p>这个例子展示了如何使用RequireJS加载Matrix，参见<a href="main.js" target="_blank">main.js</a></p>'].join('')
                }
            },
            footerCfg: {
                fixed: true,
                template: {
                    template: '<h3>Footer</h3>'
                }
            }
        });

        X.App.launch({
            pagelets: [
                {
                    id: 'demo-index',
                    url: 'h',
                    view: 'demo.indexview',
                    transition: 'fade',
                    singleton: true
                }
            ],

            welcome: 'h'
        });
    });
})


