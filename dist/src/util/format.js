/**
 * @class MX.util.Format
 * @alias format
 *
 * 常用格式化工具函数，包括：格式化String、格式化Number
 */
MX.kindle('jquery', function(X, $) {
    var formatRe = /\{(\d+)\}/g,
        escapeRe = /('|\\)/g,
        escapeRegexRe = /([-.*+?\^${}()|\[\]\/\\])/g,
        isToFixedBroken = (0.9).toFixed() !== '1';

    function toCamelCase(str) {
        if (str && str.length > 0) {
            var arr = str.split('-'),
                i = 1,
                len = arr.length,
                newStr = [];
            newStr.push(arr[0]);
            for (; i < len; i++) {
                newStr.push(UtilFormat.capitalize(arr[i]));
            }
            str = newStr.join('');
        }
        return str;
    }
    
    var UtilFormat = X.util.Format = {
        /* string format */
        
        /**
         * Pads the left side of a string with a specified character.  This is especially useful
         * for normalizing number and date strings.  Example usage:
         *
         * <pre><code>
         * var s = MX.util.String.leftPad('123', 5, '0');
         * // s now contains the string: '00123'
         * </code></pre>
         * @param {String} string The original string
         * @param {Number} size The total length of the output string
         * @param {String} character (optional) The character with which to pad the original string (defaults to empty string " ")
         * @return {String} The padded string
         */
        leftPad: function(string, size, character) {
            var result = String(string);
            character = character || " ";
            while (result.length < size) {
                result = character + result;
            }
            return result;
        },
        
        /**
         * 格式化一个字符串，例如：
         * <code>
         *  var str = MX.util.Format.format('Hi, {0}! {1}!', 'Max', 'Welcome');
         *  
         *  // 输出 “Hi, Max! Welcome!”
         *  alert(str);
         * </code>
         * 
         * @param {String} formatString 被格式化的字符串
         * @param {String} value1 被替换的值
         * @param {String...} value2...n (optional)
         * @return {String} 格式化完成的字符串
         */
        format: function(formatString) {
            var args = Array.prototype.slice.call(arguments, 1);
            return formatString.replace(formatRe, function(m, i) {
                return args[i];
            });
        },

        /**
         * Capitalize the given string
         * @param {String} string
         * @return {String}
         */
        capitalize: function(string) {
            return string.length > 0 ? (string.charAt(0).toUpperCase() + string.substr(1)) : string;
        },

        /**
         * Uncapitalize the given string
         * @param {String} string
         * @return {String}
         */
        uncapitalize: function(string) {
            return string.length > 0 ? (string.charAt(0).toLowerCase() + string.substr(1)) : string;
        },
        
        /**
         * 将一个'data-info-text'格式的字符串转换成，一个符合驼峰命名法的字符串并返回
         * 
         * 如果参数是一个String，例如：
         *      
         *      data-info-text 转换后 dataInfoText
         * 
         * 
         * 如果参数是一个Object，例如：
         * 
         *      {
         *          'data-info-text': 'text',
         *          'data-error-text': 'error',
         *      }
         *      
         *      转换后
         *      
         *      {
         *          dataInfoText: 'text',
         *          dataErrorText: 'error',
         *      }
         * 
         * @param {String/Object} obj
         * @return {String/Object}
         */
        toCamelCase: function(obj) {
            if (X.isObject(obj)) {
                var ret = {};
                X.each(obj, function(key, v) {
                    ret[toCamelCase(key)] = v;
                });
                return ret;
            }
            return toCamelCase(obj);
        },

        /**
         * Appends content to the query string of a URL, handling logic for whether to place
         * a question mark or ampersand.
         * @param {String} url The URL to append to.
         * @param {String/Object} obj The content to append to the URL.
         * @return {String} The resulting URL
         */
        urlAppend : function(url, obj) {
            url += (url.indexOf('?') === -1 ? '?' : '&');
            if (X.isString(obj)) {
                url += obj;
            } else {
                var arr = [];
                X.each(obj, function(key, value) {
                    arr.push(key + '=' + (value || ''));
                });
                url += arr.join('&');
            }
            if (url.charAt(url.length - 1) == '?') {
                url = url.substring(0, url.length - 1);
            }
            return url;
        },

        /**
         * Escapes the passed string for use in a regular expression
         * @param {String} string
         * @return {String}
         */
        escapeRegex: function(string) {
            return string.replace(escapeRegexRe, "\\$1");
        },

        /**
         * Escapes the passed string for ' and \
         * @param {String} string The string to escape
         * @return {String} The escaped string
         */
        escape: function(string) {
            return string.replace(escapeRe, "\\$1");
        },
        
        
        /* number format*/
        
        /**
         * Formats a number using fixed-point notation
         * @param {Number} value The number to format
         * @param {Number} precision The number of digits to show after the decimal point
         */
        numberToFixed: isToFixedBroken ? function(value, precision) {
            precision = precision || 0;
            var pow = Math.pow(10, precision);
            return (Math.round(value * pow) / pow).toFixed(precision);
        } : function(value, precision) {
            return value.toFixed(precision);
        },

        /**
         * Validate that a value is numeric and convert it to a number if necessary. Returns the specified default value if
         * it is not.
         * 
         * X.util.Number.from('1.23', 1); // returns 1.23
         * X.util.Number.from('abc', 1); // returns 1
         * 
         * @param {Object} value
         * @param {Number} defaultValue The value to return if the original value is non-numeric
         * @return {Number} value, if numeric, defaultValue otherwise
         */
        from: function(value, defaultValue) {
            if (isFinite(value)) {
                value = parseFloat(value);
            }

            return !isNaN(value) ? value : defaultValue;
        }
    };
    
    X.reg('format', UtilFormat);
});