MX.ready('jquery', 'klass', 'localstorage', function(X, $, Klass, LocalStorage) {
    
    var IndexView = Klass.define({
        alias: 'msohu.indexview',
        
        extend: 'view',
        
        bodyCls: 'index-content',
                
        templates: [{
            id: 'index-body-template',
            renderToBody: true
        }]
    });
    
    var IndexController = Klass.define({
        alias: 'msohu.indexcontroller',
        
        extend: 'controller',
        
        delegates: {
            'click .nav_tool > a': 'showMessage'
        },
        
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
        
        showMessage: function(e) {
            e.preventDefault();
            showMessage();
        },
        
        onDestroy: function() {
            this.scroll.destroy();
            this.scroll = null;
        }
    });
    
    var msgEl = $('<div class="lay miniPop" style="opacity: 0; top: 278.5px; visibility: hidden;"><div class="cnt">这仅仅是一个demo，没有这个功能</div></div>');
    $('body').append(msgEl);
    var isMsgElShow;
    function showMessage() {
        if (!isMsgElShow) {
            isMsgElShow = true;
            msgEl.css('visibility', 'visible');
            msgEl.one('webkitTransitionEnd transitionend', function() {
                msgElHideTimeout = setTimeout(function() {
                    msgEl.css('visibility', 'hidden').css('opacity', 0);
                    isMsgElShow = false;
                }, 2000);
            });
            msgEl.css('opacity', 1);
        }
    };
    
    LocalStorage.globalPrefix = 'msohu/';
    
    var config = {
        templateVersion: '1.0',
        templateUrl: 'main.tmpl',
        
        databaseName: 'msohu',
        databaseDescription: 'msohu offline database',
        databaseExpires: 3 * 24 * 60 * 60 * 1000, // 3天后过期
        
        models: [
            {
                id: "list-model"
                
            }
        ],
        
        stores: [
            {
                id: "list-store"
                
            }
        ],
        
        pagelets: [
            {
                id: 'index-pagelet',
                url: 'h',
                view: 'msohu.indexview',
                controller: 'msohu.indexcontroller',
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