/**
 * @class MX.util.LocalStorage
 */
MX.kindle(function(X) {
    var storage = window.localStorage;
    
    var LocalStorage = {
        globalPrefix: '',
        
        set: function(key, value) {
            storage.setItem(LocalStorage.globalPrefix + key, JSON.stringify(value));
        },
        
        get: function(key) {
            return JSON.parse(storage.getItem(LocalStorage.globalPrefix + key));
        },
        
        remove: function(key) {
            storage.removeItem(LocalStorage.globalPrefix + key);
        }
    };
    
    X.util.LocalStorage = LocalStorage;
    X.reg('localstorage', LocalStorage);
});