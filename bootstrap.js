/*!
 * @author max<zhandaiping@gmail.com>
 * 
 * 本地调试环境，根据"package-matrix.json"文件依赖加载JS源码文件
 */
(function() {
    // from jquery.mobile.path ------------------------------------------------------------------------
    var path, documentBase, $base, dialogHashKey = "&ui-state=dialog";

    path = {
        uiStateKey: "&ui-state",

        // This scary looking regular expression parses an absolute URL or its relative
        // variants (protocol, site, document, query, and hash), into the various
        // components (protocol, host, path, query, fragment, etc that make up the
        // URL as well as some other commonly used sub-parts. When used with RegExp.exec()
        // or String.match, it parses the URL into a results array that looks like this:
        //
        //     [0]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread#msg-content
        //     [1]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread
        //     [2]: http://jblas:password@mycompany.com:8080/mail/inbox
        //     [3]: http://jblas:password@mycompany.com:8080
        //     [4]: http:
        //     [5]: //
        //     [6]: jblas:password@mycompany.com:8080
        //     [7]: jblas:password
        //     [8]: jblas
        //     [9]: password
        //    [10]: mycompany.com:8080
        //    [11]: mycompany.com
        //    [12]: 8080
        //    [13]: /mail/inbox
        //    [14]: /mail/
        //    [15]: inbox
        //    [16]: ?msg=1234&type=unread
        //    [17]: #msg-content
        //
        urlParseRE: /^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,

        //Parse a URL into a structure that allows easy access to
        //all of the URL components by name.
        parseUrl: function( url ) {
            // If we're passed an object, we'll assume that it is
            // a parsed url object and just return it back to the caller.
            if ( typeof url === "object" ) {
                return url;
            }

            var matches = path.urlParseRE.exec( url || "" ) || [];

                // Create an object that allows the caller to access the sub-matches
                // by name. Note that IE returns an empty string instead of undefined,
                // like all other browsers do, so we normalize everything so its consistent
                // no matter what browser we're running on.
                return {
                    href:         matches[  0 ] || "",
                    hrefNoHash:   matches[  1 ] || "",
                    hrefNoSearch: matches[  2 ] || "",
                    domain:       matches[  3 ] || "",
                    protocol:     matches[  4 ] || "",
                    doubleSlash:  matches[  5 ] || "",
                    authority:    matches[  6 ] || "",
                    username:     matches[  8 ] || "",
                    password:     matches[  9 ] || "",
                    host:         matches[ 10 ] || "",
                    hostname:     matches[ 11 ] || "",
                    port:         matches[ 12 ] || "",
                    pathname:     matches[ 13 ] || "",
                    directory:    matches[ 14 ] || "",
                    filename:     matches[ 15 ] || "",
                    search:       matches[ 16 ] || "",
                    hash:         matches[ 17 ] || ""
                };
        },

        //Returns true for any relative variant.
        isRelativeUrl: function( url ) {
            // All relative Url variants have one thing in common, no protocol.
            return path.parseUrl( url ).protocol === "";
        },

        //Turn relPath into an asbolute path. absPath is
        //an optional absolute path which describes what
        //relPath is relative to.
        makePathAbsolute: function( relPath, absPath ) {
            if ( relPath && relPath.charAt( 0 ) === "/" ) {
                return relPath;
            }

            relPath = relPath || "";
            absPath = absPath ? absPath.replace( /^\/|(\/[^\/]*|[^\/]+)$/g, "" ) : "";

            var absStack = absPath ? absPath.split( "/" ) : [],
                relStack = relPath.split( "/" );
            for ( var i = 0; i < relStack.length; i++ ) {
                var d = relStack[ i ];
                switch ( d ) {
                    case ".":
                        break;
                    case "..":
                        if ( absStack.length ) {
                            absStack.pop();
                        }
                        break;
                    default:
                        absStack.push( d );
                        break;
                }
            }
            return "/" + absStack.join( "/" );
        },

        //Turn the specified realtive URL into an absolute one. This function
        //can handle all relative variants (protocol, site, document, query, fragment).
        makeUrlAbsolute: function( relUrl, absUrl ) {
            if ( !path.isRelativeUrl( relUrl ) ) {
                return relUrl;
            }

            if ( absUrl === undefined ) {
                absUrl = this.documentBase;
            }

            var relObj = path.parseUrl( relUrl ),
                absObj = path.parseUrl( absUrl ),
                protocol = relObj.protocol || absObj.protocol,
                doubleSlash = relObj.protocol ? relObj.doubleSlash : ( relObj.doubleSlash || absObj.doubleSlash ),
                authority = relObj.authority || absObj.authority,
                hasPath = relObj.pathname !== "",
                pathname = path.makePathAbsolute( relObj.pathname || absObj.filename, absObj.pathname ),
                search = relObj.search || ( !hasPath && absObj.search ) || "",
                hash = relObj.hash;

            return protocol + doubleSlash + authority + pathname + search + hash;
        }
    };
    
    // end ------------------------------------------------------------------------
    
    
    var headNode = document.getElementsByTagName('head')[0],
        bootstrap = document.getElementById('bootstrap'),
        bootstrapSrc = path.makeUrlAbsolute(bootstrap.src, window.location.href);
    
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