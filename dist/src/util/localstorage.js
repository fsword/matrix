/**
 * @class MX.util.LocalStorage
 * @alias localstorage
 *
 * window.localStorage的封装类，可以将String或Object存储到localStorage中，将值取回时，可以还原成存储时的格式
 */
MX.kindle(function(X) {
    var storage = window.localStorage;

    var LocalStorage = {
        /**
         * @cfg {String} globalPrefix localStorage存储key的前缀，全局属性，会影响到所有存储的值
         */
        globalPrefix: '',

        /**
         * 保存一个键值到localStorage中
         * @param {String} key
         * @param {String/Number/Object/Array/...} value
         */
        set: function(key, value) {
            storage.setItem(LocalStorage.globalPrefix + key, JSON.stringify(value));
        },

        /**
         * 使用key找回一个值
         * @param {String} key
         * @returns {Mixed}
         */
        get: function(key) {
            return JSON.parse(storage.getItem(LocalStorage.globalPrefix + key));
        },

        /**
         * 移除一个localStorage中的值
         * @param {String} key
         */
        remove: function(key) {
            storage.removeItem(LocalStorage.globalPrefix + key);
        }
    };
    
    X.util.LocalStorage = LocalStorage;
    X.reg('localstorage', LocalStorage);
});