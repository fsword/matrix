/*!
 * @author max<zhandaiping@gmail.com>
 * 
 * 本地调试环境，根据"package-matrix.json"文件依赖加载JS源码文件
 */
(function() {
    var headNode = document.getElementsByTagName('head')[0],
        bootstrap = document.getElementById('bootstrap'),
        bootstrapSrc = bootstrap.src;
    
    function parseParams(url) {
        var params = {},
            idx = url.indexOf('?'),
            paramStr = idx != -1 ? url.substring(idx) : '';
        if (paramStr) {
            paramStr = paramStr.substr(1);
            idx = paramStr.indexOf('#');
            if (idx != -1) {
                paramStr = paramStr.substring(0, idx);
            }
            paramStr.split('&').forEach(function(param) {
                param = param.split('=');
                params[param[0]] = param[1];
            }, this);
        }
        return params;
    };
    
    var params = parseParams(bootstrapSrc),
        projectName = params.p,
        version = params.v,
        dependBuild = params.d,
        packageFile = 'package-' + projectName + '-' + version + '.json',
        srcArr = bootstrapSrc.split('?'),
        jsBaseUrl = srcArr[0].substring(0, srcArr[0].length - 'bootstrap.js'.length),
        remoteBaseUrl = window.remoteBaseUrl || jsBaseUrl,
        headjsNode,
        headReady = false,
        readyFnCache = [],
        headjsTimeoutId,
        invalidTimeoutId,
        xhr = new window.XMLHttpRequest(),
        xhrTimeoutId;
    
    headjsNode = document.createElement('script');
    headjsNode.src = remoteBaseUrl + 'src/lib/headjs-0.99.js';
    headjsNode.type = "text/javascript";
    headjsNode.onload = function() {
        headReady = true;
    };
    
    if (bootstrap.nextSibling) {
        headNode.insertBefore(headjsNode, bootstrap.nextSibling);
    } else {
        headNode.appendChild(headjsNode);
    }
    
    window.MX = {
        ready: function() {
            readyFnCache.push(Array.prototype.slice.call(arguments, 0));
        }
    };
    
    function err(msg) {
        if (console) {
            console.error('bootstrap.js error: ' + msg);
        }
    };
    
    function loadDepend(packageConf) {
        var builds = packageConf.builds,
            packages = packageConf.packages,
            dependPackages,
            package,
            file,
            depends = [];
        
        builds.forEach(function(build) {
            if (build.target == dependBuild) {
                dependPackages = build.packages;
                return false;
            }
        });
        if (dependPackages) {
            packages.forEach(function(package) {
                if (dependPackages.indexOf(package.id) != -1) {
                    package.files.forEach(function(file) {
                        depends.push(jsBaseUrl + 'src/' + file.path + file.name);
                    });
                }
            });
        } else {
            packages.forEach(function(package) {
                package.files.forEach(function(file) {
                    depends.push(jsBaseUrl + 'src/' + file.path + file.name);
                });
            });
        }
        loadHeadJS(depends);
    };
    
    function loadHeadJS(depends) {
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
                        readyFnCache.forEach(function(cache) {
                            MX.ready.apply(window, cache);
                        });
                    }
                }]));
            }
        }
    };
    
    xhr.open('GET', remoteBaseUrl + 'packages/' + packageFile, true);
    xhrTimeoutId = setTimeout(function() {
        if (xhr.readyState !== 4) {
            xhr.abort();
        }
        err('Cannot load "' + packageFile + '"');
    }, 90000);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            clearTimeout(xhrTimeoutId);
            var conf;
            try {
                conf = JSON.parse(xhr.responseText);
            } catch(e) {
                err('Parse error, unexpected in "' + packageFile + '"');
            }
            if (conf) {
                loadDepend(conf);
            } else {
                err('Cannot load "' + packageFile + '"');
            }
        }
    };
    xhr.send(null);
})();