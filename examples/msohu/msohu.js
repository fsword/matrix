MX.ready('jquery', 'klass', 'localstorage', function(X, $, Klass, LocalStorage) {
    
    var AppView = Klass.define({
        alias: 'demo.appview',
        
        extend: 'view',
        
        bodyCls: 'index-content',
                
        templates: [{
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
        
        models: [
            {
                id: "demo-model"
                
            }
        ],
        
        stores: [
            {
                id: "demo-store"
                
            }
        ],
        
        pagelets: [
            {
                id: 'demo-pagelet',
                url: 'h',
                view: 'demo.appview',
                controller: 'demo.appcontroller',
                models: 'demo-model',
                stores: 'demo-store',
                transition: 'slidefade'
            },
            {
                id: 'demo-pagelet1',
                url: 's',
                view: 'demo.appview',
                controller: 'demo.appcontroller',
                models: 'demo-model',
                stores: 'demo-store',
                transition: 'slidefade'
            }
        ],
        
        welcome: 'h'
    };
    
    var numEl = $('#startUpView div.num'),
        count = 0,
        countDownTimeout;
    function countDown() {
        count += parseInt(Math.random() * 10 + 1);
        count = count > 100 ? 100 : count;
        numEl.html(count + '%');
        if (count < 100) {
            countDownTimeout = setTimeout(countDown, 70);
        }
    };
    countDown();
    X.App.on('pageafterchange', function() {
        clearTimeout(countDownTimeout);
        numEl.html('100%');
    }, window, {
        single: true
    });
    
    X.App.launch(config);
});