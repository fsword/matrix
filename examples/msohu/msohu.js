MX.ready('jquery', 'klass', 'localstorage', function(X, $, Klass, LocalStorage) {
    
    LocalStorage.globalPrefix = 'msohu/';
    
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
        
        extend: 'controller',
        
        onPageShow: function() {
            var body = this.getBody();
            this.scroll = X.util.iScrollUtil.createScroll('h', body, {
                snap: true,
                momentum: false,
                hScrollbar: false,
                onScrollMove: function() {
                    var w = window.innerWidth,
                        x = this.x,
                        scale = Math.abs(x) / w;
                    body.css('background-position-x', x > 0 ? 0 : - scale * (w / 8));
                },
                onScrollEnd: function() {
                    var winPage = body.find('.winPage');
                    if (this.currPageX % 2 == 1) {
                        winPage.addClass('rotate');
                    } else {
                        winPage.removeClass('rotate');
                    }
                },
                onTouchEnd: function() {
                    body.one('webkitTransitionEnd transitionend', function() {
                        body.removeClass('slip');
                    });
                    body.addClass('slip');
                    body.css('background-position-x', - this.currPageX * (window.innerWidth / 8));
                }
            });
        },
        
        onDestroy: function() {
            this.scroll.destroy();
            this.scroll = null;
        }
    });
    
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
    X.App.on('pagechange', function() {
        clearTimeout(countDownTimeout);
        numEl.html('100%');
    }, window, {
        single: true
    });
    
    X.App.launch(config);
});