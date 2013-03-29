MX.ready(function(X) {
    var depends = [
        'dateformat.js'
    ];
    
    X.each(depends, function(i, path) {
        depends[i] = $.mobile.path.makeUrlAbsolute(path);
    });
    
    head.js(depends);
});