MX.ready('klass', 'localstorage', function(X, Klass, LocalStorage) {
    
    var AppView = Klass.define({
        alias: 'demo.appview',
        
        extend: 'view',
        
        templates: [/*{
            id: 'demo-header-template',
            renderToHeader: true
        }, {
            id: 'demo-footer-template',
            renderToFooter: true
        }, */{
            id: 'demo-body-template',
            renderToBody: true
        }]
        
    });
    
    var AppController = Klass.define({
        alias: 'demo.appcontroller',
        
        extend: 'controller'
        
    });
    
    LocalStorage.globalPrefix = 'msohu/';
    
    var config = {
        templateVersion: '1.0', // 模版库版本号
        templateUrl: 'main.tmpl', // 模版更新URL
        
        databaseName: 'msohu',
        databaseDescription: 'msohu offline database',
        databaseExpires: 3 * 24 * 60 * 60 * 1000, // 3天后过期
        
        models: [{
            id: "demo-model"
            
        }],
        
        stores: [{
            id: "demo-store"
            
        }],
        
        pagelets: [{
            id: 'demo-pagelet',
            url: 'h',
            view: 'demo.appview',
            controller: 'demo.appcontroller',
            models: 'demo-model',
            stores: 'demo-store',
            transition: 'fade'
        }],
        
        welcome: 'h'
    };
    
    X.App.launch(config);
});