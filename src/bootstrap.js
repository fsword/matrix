/*
 * 本地调试环境，根据"package-test.json"文件自动加载源码js依赖
 * 
 * @author max<zhandaiping@gmail.com>
 */
!function(window) {
    var headNode = document.getElementsByTagName('head')[0],
        bootstrap = document.getElementById('bootstrap'),
        src = bootstrap.src,
        location = window.location,
        _dt = new Date().getTime();
        
    src = src.split('?');
    var baseUrl = src[0].substring(0, src[0].length - 'bootstrap.js'.length);
    var sUrl = window.jsBaseUrl || baseUrl;
    
    var params = src[1].split('&');
    var projectName, category;
    for (var n in params) {
        var param = params[n].split('=');
        if (param[0] == 'p') {
            projectName = param[1];
        } else if (param[0] == 'c') {
            category = param[1];
        }
    }
    
    var packagePath = 'package/package-' + projectName + (category ? '-' + category : '') + '.json';
    
    var headjsNode = document.createElement('script');
    //headjsNode.src = sUrl + 'lib/head-0.96.js?_dt=' + _dt;
    headjsNode.src = sUrl + 'lib/head-0.96.js';
    headjsNode.type = "text/javascript";
    
    var headReady = false;
    headjsNode.onload = function() {
        headReady = true;
    };
    
    if (bootstrap.nextSibling) {
        headNode.insertBefore(headjsNode, bootstrap.nextSibling);
    } else {
        headNode.appendChild(headjsNode);
    }
    
    readyFnCache = [];
    window.MX = {
        ready: function(fn) {
            readyFnCache.push(fn);
        }
    };
    
    var err = function(msg) {
        if (console) {
            console.error('Matrix bootstrap.js error: ' + msg);
        }
    };
    
    var loadDepend = function(pkgConf) {
        var packages = pkgConf.packages,
            package,
            file,
            depends = [];
        
        for (var i = 0, len = packages.length; i < len; i++) {
            package = packages[i];
            for (var j = 0, len1 = package.files.length; j < len1; j++) {
                file = package.files[j];
                //depends.push(baseUrl + file.path + file.name + '?_dt=' + _dt); // 清缓存，在使用debug时不能断点
                depends.push(baseUrl + file.path + file.name);
            }
        }
        
        loadHeadJS(depends);
    };
    
    var headjsTimeoutId, invalidTimeoutId;
    var loadHeadJS = function(depends) {
        if (!headReady) {
            headjsTimeoutId = setTimeout(function() {
                loadHeadJS(depends);
            }, 50);
            if (typeof invalidTimeoutId == 'undefined') {
                invalidTimeoutId = setTimeout(function() {
                    clearTimeout(headjsTimeoutId);
                    clearTimeout(invalidTimeoutId);
                    err('Load head.js failed.');
                }, 30000);
            }
        } else {
            clearTimeout(headjsTimeoutId);
            clearTimeout(invalidTimeoutId);
            if (!head) {
                err('Load head.js failed.');
            } else {
                head.js.apply(window, depends.concat([function() {
                    // 注册给真实MX.ready函数
                    if (readyFnCache.length > 0) {
                        for (var i = 0, len = readyFnCache.length; i < len; i++) {
                            MX.ready(readyFnCache[i]);
                        }
                    }
                }]));
            }
        }
    };
    
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', sUrl + packagePath, true);
    var xhrTimeoutId = setTimeout(function() {
        if (xhr.readyState !== 4) {
            xhr.abort();
        }
        err('Cannot load "' + packagePath + '"');
    }, 90000);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            clearTimeout(xhrTimeoutId);
            
            var pkgConf;
            try {
                pkgConf = JSON.parse(xhr.responseText);
            } catch(e) {
                err('Parse error, unexpected in "' + packagePath + '"');
            }
            
            if (pkgConf) {
                loadDepend(pkgConf);
            } else {
                err('Cannot load "' + packagePath + '"');
            }
        }
    };
    xhr.send(null);
}(window);