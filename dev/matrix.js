/*!
 * Matrix - A Mobile WebApp Framework
 * http://github.com/mxjs/matrix
 * 
 * Author: max<zhangdaiping@gmail.com>
 * 
 * This version of Matrix is licensed under the MIT License.
 * http://github.com/mxjs/matrix/blob/master/MIT-LICENSE.md
 */
/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
    // The deferred used on DOM ready
    readyList,

    // A central reference to the root jQuery(document)
    rootjQuery,

    // Support: IE<9
    // For `typeof node.method` instead of `node.method !== undefined`
    core_strundefined = typeof undefined,

    // Use the correct document accordingly with window argument (sandbox)
    document = window.document,
    location = window.location,

    // Map over jQuery in case of overwrite
    _jQuery = window.jQuery,

    // Map over the $ in case of overwrite
    _$ = window.$,

    // [[Class]] -> type pairs
    class2type = {},

    // List of deleted data cache ids, so we can reuse them
    core_deletedIds = [],

    core_version = "1.9.1",

    // Save a reference to some core methods
    core_concat = core_deletedIds.concat,
    core_push = core_deletedIds.push,
    core_slice = core_deletedIds.slice,
    core_indexOf = core_deletedIds.indexOf,
    core_toString = class2type.toString,
    core_hasOwn = class2type.hasOwnProperty,
    core_trim = core_version.trim,

    // Define a local copy of jQuery
    jQuery = function( selector, context ) {
        // The jQuery object is actually just the init constructor 'enhanced'
        return new jQuery.fn.init( selector, context, rootjQuery );
    },

    // Used for matching numbers
    core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

    // Used for splitting on whitespace
    core_rnotwhite = /\S+/g,

    // Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

    // A simple way to check for HTML strings
    // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
    // Strict HTML recognition (#11290: must start with <)
    rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

    // Match a standalone tag
    rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

    // JSON RegExp
    rvalidchars = /^[\],:{}\s]*$/,
    rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
    rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
    rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

    // Matches dashed string for camelizing
    rmsPrefix = /^-ms-/,
    rdashAlpha = /-([\da-z])/gi,

    // Used by jQuery.camelCase as callback to replace()
    fcamelCase = function( all, letter ) {
        return letter.toUpperCase();
    },

    // The ready event handler
    completed = function( event ) {

        // readyState === "complete" is good enough for us to call the dom ready in oldIE
        if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
            detach();
            jQuery.ready();
        }
    },
    // Clean-up method for dom ready events
    detach = function() {
        if ( document.addEventListener ) {
            document.removeEventListener( "DOMContentLoaded", completed, false );
            window.removeEventListener( "load", completed, false );

        } else {
            document.detachEvent( "onreadystatechange", completed );
            window.detachEvent( "onload", completed );
        }
    };

jQuery.fn = jQuery.prototype = {
    // The current version of jQuery being used
    jquery: core_version,

    constructor: jQuery,
    init: function( selector, context, rootjQuery ) {
        var match, elem;

        // HANDLE: $(""), $(null), $(undefined), $(false)
        if ( !selector ) {
            return this;
        }

        // Handle HTML strings
        if ( typeof selector === "string" ) {
            if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
                // Assume that strings that start and end with <> are HTML and skip the regex check
                match = [ null, selector, null ];

            } else {
                match = rquickExpr.exec( selector );
            }

            // Match html or make sure no context is specified for #id
            if ( match && (match[1] || !context) ) {

                // HANDLE: $(html) -> $(array)
                if ( match[1] ) {
                    context = context instanceof jQuery ? context[0] : context;

                    // scripts is true for back-compat
                    jQuery.merge( this, jQuery.parseHTML(
                        match[1],
                        context && context.nodeType ? context.ownerDocument || context : document,
                        true
                    ) );

                    // HANDLE: $(html, props)
                    if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
                        for ( match in context ) {
                            // Properties of context are called as methods if possible
                            if ( jQuery.isFunction( this[ match ] ) ) {
                                this[ match ]( context[ match ] );

                            // ...and otherwise set as attributes
                            } else {
                                this.attr( match, context[ match ] );
                            }
                        }
                    }

                    return this;

                // HANDLE: $(#id)
                } else {
                    elem = document.getElementById( match[2] );

                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    if ( elem && elem.parentNode ) {
                        // Handle the case where IE and Opera return items
                        // by name instead of ID
                        if ( elem.id !== match[2] ) {
                            return rootjQuery.find( selector );
                        }

                        // Otherwise, we inject the element directly into the jQuery object
                        this.length = 1;
                        this[0] = elem;
                    }

                    this.context = document;
                    this.selector = selector;
                    return this;
                }

            // HANDLE: $(expr, $(...))
            } else if ( !context || context.jquery ) {
                return ( context || rootjQuery ).find( selector );

            // HANDLE: $(expr, context)
            // (which is just equivalent to: $(context).find(expr)
            } else {
                return this.constructor( context ).find( selector );
            }

        // HANDLE: $(DOMElement)
        } else if ( selector.nodeType ) {
            this.context = this[0] = selector;
            this.length = 1;
            return this;

        // HANDLE: $(function)
        // Shortcut for document ready
        } else if ( jQuery.isFunction( selector ) ) {
            return rootjQuery.ready( selector );
        }

        if ( selector.selector !== undefined ) {
            this.selector = selector.selector;
            this.context = selector.context;
        }

        return jQuery.makeArray( selector, this );
    },

    // Start with an empty selector
    selector: "",

    // The default length of a jQuery object is 0
    length: 0,

    // The number of elements contained in the matched element set
    size: function() {
        return this.length;
    },

    toArray: function() {
        return core_slice.call( this );
    },

    // Get the Nth element in the matched element set OR
    // Get the whole matched element set as a clean array
    get: function( num ) {
        return num == null ?

            // Return a 'clean' array
            this.toArray() :

            // Return just the object
            ( num < 0 ? this[ this.length + num ] : this[ num ] );
    },

    // Take an array of elements and push it onto the stack
    // (returning the new matched element set)
    pushStack: function( elems ) {

        // Build a new jQuery matched element set
        var ret = jQuery.merge( this.constructor(), elems );

        // Add the old object onto the stack (as a reference)
        ret.prevObject = this;
        ret.context = this.context;

        // Return the newly-formed element set
        return ret;
    },

    // Execute a callback for every element in the matched set.
    // (You can seed the arguments with an array of args, but this is
    // only used internally.)
    each: function( callback, args ) {
        return jQuery.each( this, callback, args );
    },

    ready: function( fn ) {
        // Add the callback
        jQuery.ready.promise().done( fn );

        return this;
    },

    slice: function() {
        return this.pushStack( core_slice.apply( this, arguments ) );
    },

    first: function() {
        return this.eq( 0 );
    },

    last: function() {
        return this.eq( -1 );
    },

    eq: function( i ) {
        var len = this.length,
            j = +i + ( i < 0 ? len : 0 );
        return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
    },

    map: function( callback ) {
        return this.pushStack( jQuery.map(this, function( elem, i ) {
            return callback.call( elem, i, elem );
        }));
    },

    end: function() {
        return this.prevObject || this.constructor(null);
    },

    // For internal use only.
    // Behaves like an Array's method, not like a jQuery method.
    push: core_push,
    sort: [].sort,
    splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
    var src, copyIsArray, copy, name, options, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if ( length === i ) {
        target = this;
        --i;
    }

    for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {
            // Extend the base object
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];

                // Prevent never-ending loop
                if ( target === copy ) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                    if ( copyIsArray ) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : [];

                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[ name ] = jQuery.extend( deep, clone, copy );

                // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};

jQuery.extend({
    noConflict: function( deep ) {
        if ( window.$ === jQuery ) {
            window.$ = _$;
        }

        if ( deep && window.jQuery === jQuery ) {
            window.jQuery = _jQuery;
        }

        return jQuery;
    },

    // Is the DOM ready to be used? Set to true once it occurs.
    isReady: false,

    // A counter to track how many items to wait for before
    // the ready event fires. See #6781
    readyWait: 1,

    // Hold (or release) the ready event
    holdReady: function( hold ) {
        if ( hold ) {
            jQuery.readyWait++;
        } else {
            jQuery.ready( true );
        }
    },

    // Handle when the DOM is ready
    ready: function( wait ) {

        // Abort if there are pending holds or we're already ready
        if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
            return;
        }

        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
        if ( !document.body ) {
            return setTimeout( jQuery.ready );
        }

        // Remember that the DOM is ready
        jQuery.isReady = true;

        // If a normal DOM Ready event fired, decrement, and wait if need be
        if ( wait !== true && --jQuery.readyWait > 0 ) {
            return;
        }

        // If there are functions bound, to execute
        readyList.resolveWith( document, [ jQuery ] );

        // Trigger any bound ready events
        if ( jQuery.fn.trigger ) {
            jQuery( document ).trigger("ready").off("ready");
        }
    },

    // See test/unit/core.js for details concerning isFunction.
    // Since version 1.3, DOM methods and functions like alert
    // aren't supported. They return false on IE (#2968).
    isFunction: function( obj ) {
        return jQuery.type(obj) === "function";
    },

    isArray: Array.isArray || function( obj ) {
        return jQuery.type(obj) === "array";
    },

    isWindow: function( obj ) {
        return obj != null && obj == obj.window;
    },

    isNumeric: function( obj ) {
        return !isNaN( parseFloat(obj) ) && isFinite( obj );
    },

    type: function( obj ) {
        if ( obj == null ) {
            return String( obj );
        }
        return typeof obj === "object" || typeof obj === "function" ?
            class2type[ core_toString.call(obj) ] || "object" :
            typeof obj;
    },

    isPlainObject: function( obj ) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if ( obj.constructor &&
                !core_hasOwn.call(obj, "constructor") &&
                !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                return false;
            }
        } catch ( e ) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for ( key in obj ) {}

        return key === undefined || core_hasOwn.call( obj, key );
    },

    isEmptyObject: function( obj ) {
        var name;
        for ( name in obj ) {
            return false;
        }
        return true;
    },

    error: function( msg ) {
        throw new Error( msg );
    },

    // data: string of html
    // context (optional): If specified, the fragment will be created in this context, defaults to document
    // keepScripts (optional): If true, will include scripts passed in the html string
    parseHTML: function( data, context, keepScripts ) {
        if ( !data || typeof data !== "string" ) {
            return null;
        }
        if ( typeof context === "boolean" ) {
            keepScripts = context;
            context = false;
        }
        context = context || document;

        var parsed = rsingleTag.exec( data ),
            scripts = !keepScripts && [];

        // Single tag
        if ( parsed ) {
            return [ context.createElement( parsed[1] ) ];
        }

        parsed = jQuery.buildFragment( [ data ], context, scripts );
        if ( scripts ) {
            jQuery( scripts ).remove();
        }
        return jQuery.merge( [], parsed.childNodes );
    },

    parseJSON: function( data ) {
        // Attempt to parse using the native JSON parser first
        if ( window.JSON && window.JSON.parse ) {
            return window.JSON.parse( data );
        }

        if ( data === null ) {
            return data;
        }

        if ( typeof data === "string" ) {

            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            data = jQuery.trim( data );

            if ( data ) {
                // Make sure the incoming data is actual JSON
                // Logic borrowed from http://json.org/json2.js
                if ( rvalidchars.test( data.replace( rvalidescape, "@" )
                    .replace( rvalidtokens, "]" )
                    .replace( rvalidbraces, "")) ) {

                    return ( new Function( "return " + data ) )();
                }
            }
        }

        jQuery.error( "Invalid JSON: " + data );
    },

    // Cross-browser xml parsing
    parseXML: function( data ) {
        var xml, tmp;
        if ( !data || typeof data !== "string" ) {
            return null;
        }
        try {
            if ( window.DOMParser ) { // Standard
                tmp = new DOMParser();
                xml = tmp.parseFromString( data , "text/xml" );
            } else { // IE
                xml = new ActiveXObject( "Microsoft.XMLDOM" );
                xml.async = "false";
                xml.loadXML( data );
            }
        } catch( e ) {
            xml = undefined;
        }
        if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
            jQuery.error( "Invalid XML: " + data );
        }
        return xml;
    },

    noop: function() {},

    // Evaluates a script in a global context
    // Workarounds based on findings by Jim Driscoll
    // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
    globalEval: function( data ) {
        if ( data && jQuery.trim( data ) ) {
            // We use execScript on Internet Explorer
            // We use an anonymous function so that context is window
            // rather than jQuery in Firefox
            ( window.execScript || function( data ) {
                window[ "eval" ].call( window, data );
            } )( data );
        }
    },

    // Convert dashed to camelCase; used by the css and data modules
    // Microsoft forgot to hump their vendor prefix (#9572)
    camelCase: function( string ) {
        return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
    },

    nodeName: function( elem, name ) {
        return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
    },

    // args is for internal usage only
    each: function( obj, callback, args ) {
        var value,
            i = 0,
            length = obj.length,
            isArray = isArraylike( obj );

        if ( args ) {
            if ( isArray ) {
                for ( ; i < length; i++ ) {
                    value = callback.apply( obj[ i ], args );

                    if ( value === false ) {
                        break;
                    }
                }
            } else {
                for ( i in obj ) {
                    value = callback.apply( obj[ i ], args );

                    if ( value === false ) {
                        break;
                    }
                }
            }

        // A special, fast, case for the most common use of each
        } else {
            if ( isArray ) {
                for ( ; i < length; i++ ) {
                    value = callback.call( obj[ i ], i, obj[ i ] );

                    if ( value === false ) {
                        break;
                    }
                }
            } else {
                for ( i in obj ) {
                    value = callback.call( obj[ i ], i, obj[ i ] );

                    if ( value === false ) {
                        break;
                    }
                }
            }
        }

        return obj;
    },

    // Use native String.trim function wherever possible
    trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
        function( text ) {
            return text == null ?
                "" :
                core_trim.call( text );
        } :

        // Otherwise use our own trimming functionality
        function( text ) {
            return text == null ?
                "" :
                ( text + "" ).replace( rtrim, "" );
        },

    // results is for internal usage only
    makeArray: function( arr, results ) {
        var ret = results || [];

        if ( arr != null ) {
            if ( isArraylike( Object(arr) ) ) {
                jQuery.merge( ret,
                    typeof arr === "string" ?
                    [ arr ] : arr
                );
            } else {
                core_push.call( ret, arr );
            }
        }

        return ret;
    },

    inArray: function( elem, arr, i ) {
        var len;

        if ( arr ) {
            if ( core_indexOf ) {
                return core_indexOf.call( arr, elem, i );
            }

            len = arr.length;
            i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

            for ( ; i < len; i++ ) {
                // Skip accessing in sparse arrays
                if ( i in arr && arr[ i ] === elem ) {
                    return i;
                }
            }
        }

        return -1;
    },

    merge: function( first, second ) {
        var l = second.length,
            i = first.length,
            j = 0;

        if ( typeof l === "number" ) {
            for ( ; j < l; j++ ) {
                first[ i++ ] = second[ j ];
            }
        } else {
            while ( second[j] !== undefined ) {
                first[ i++ ] = second[ j++ ];
            }
        }

        first.length = i;

        return first;
    },

    grep: function( elems, callback, inv ) {
        var retVal,
            ret = [],
            i = 0,
            length = elems.length;
        inv = !!inv;

        // Go through the array, only saving the items
        // that pass the validator function
        for ( ; i < length; i++ ) {
            retVal = !!callback( elems[ i ], i );
            if ( inv !== retVal ) {
                ret.push( elems[ i ] );
            }
        }

        return ret;
    },

    // arg is for internal usage only
    map: function( elems, callback, arg ) {
        var value,
            i = 0,
            length = elems.length,
            isArray = isArraylike( elems ),
            ret = [];

        // Go through the array, translating each of the items to their
        if ( isArray ) {
            for ( ; i < length; i++ ) {
                value = callback( elems[ i ], i, arg );

                if ( value != null ) {
                    ret[ ret.length ] = value;
                }
            }

        // Go through every key on the object,
        } else {
            for ( i in elems ) {
                value = callback( elems[ i ], i, arg );

                if ( value != null ) {
                    ret[ ret.length ] = value;
                }
            }
        }

        // Flatten any nested arrays
        return core_concat.apply( [], ret );
    },

    // A global GUID counter for objects
    guid: 1,

    // Bind a function to a context, optionally partially applying any
    // arguments.
    proxy: function( fn, context ) {
        var args, proxy, tmp;

        if ( typeof context === "string" ) {
            tmp = fn[ context ];
            context = fn;
            fn = tmp;
        }

        // Quick check to determine if target is callable, in the spec
        // this throws a TypeError, but we will just return undefined.
        if ( !jQuery.isFunction( fn ) ) {
            return undefined;
        }

        // Simulated bind
        args = core_slice.call( arguments, 2 );
        proxy = function() {
            return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
        };

        // Set the guid of unique handler to the same of original handler, so it can be removed
        proxy.guid = fn.guid = fn.guid || jQuery.guid++;

        return proxy;
    },

    // Multifunctional method to get and set values of a collection
    // The value/s can optionally be executed if it's a function
    access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
        var i = 0,
            length = elems.length,
            bulk = key == null;

        // Sets many values
        if ( jQuery.type( key ) === "object" ) {
            chainable = true;
            for ( i in key ) {
                jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
            }

        // Sets one value
        } else if ( value !== undefined ) {
            chainable = true;

            if ( !jQuery.isFunction( value ) ) {
                raw = true;
            }

            if ( bulk ) {
                // Bulk operations run against the entire set
                if ( raw ) {
                    fn.call( elems, value );
                    fn = null;

                // ...except when executing function values
                } else {
                    bulk = fn;
                    fn = function( elem, key, value ) {
                        return bulk.call( jQuery( elem ), value );
                    };
                }
            }

            if ( fn ) {
                for ( ; i < length; i++ ) {
                    fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
                }
            }
        }

        return chainable ?
            elems :

            // Gets
            bulk ?
                fn.call( elems ) :
                length ? fn( elems[0], key ) : emptyGet;
    },

    now: function() {
        return ( new Date() ).getTime();
    }
});

jQuery.ready.promise = function( obj ) {
    if ( !readyList ) {

        readyList = jQuery.Deferred();

        // Catch cases where $(document).ready() is called after the browser event has already occurred.
        // we once tried to use readyState "interactive" here, but it caused issues like the one
        // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
        if ( document.readyState === "complete" ) {
            // Handle it asynchronously to allow scripts the opportunity to delay ready
            setTimeout( jQuery.ready );

        // Standards-based browsers support DOMContentLoaded
        } else if ( document.addEventListener ) {
            // Use the handy event callback
            document.addEventListener( "DOMContentLoaded", completed, false );

            // A fallback to window.onload, that will always work
            window.addEventListener( "load", completed, false );

        // If IE event model is used
        } else {
            // Ensure firing before onload, maybe late but safe also for iframes
            document.attachEvent( "onreadystatechange", completed );

            // A fallback to window.onload, that will always work
            window.attachEvent( "onload", completed );

            // If IE and not a frame
            // continually check to see if the document is ready
            var top = false;

            try {
                top = window.frameElement == null && document.documentElement;
            } catch(e) {}

            if ( top && top.doScroll ) {
                (function doScrollCheck() {
                    if ( !jQuery.isReady ) {

                        try {
                            // Use the trick by Diego Perini
                            // http://javascript.nwbox.com/IEContentLoaded/
                            top.doScroll("left");
                        } catch(e) {
                            return setTimeout( doScrollCheck, 50 );
                        }

                        // detach all dom ready events
                        detach();

                        // and execute any waiting functions
                        jQuery.ready();
                    }
                })();
            }
        }
    }
    return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
    var length = obj.length,
        type = jQuery.type( obj );

    if ( jQuery.isWindow( obj ) ) {
        return false;
    }

    if ( obj.nodeType === 1 && length ) {
        return true;
    }

    return type === "array" || type !== "function" &&
        ( length === 0 ||
        typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
    var object = optionsCache[ options ] = {};
    jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
        object[ flag ] = true;
    });
    return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *  options: an optional list of space-separated options that will change how
 *          the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *  once:           will ensure the callback list can only be fired once (like a Deferred)
 *
 *  memory:         will keep track of previous values and will call any callback added
 *                  after the list has been fired right away with the latest "memorized"
 *                  values (like a Deferred)
 *
 *  unique:         will ensure a callback can only be added once (no duplicate in the list)
 *
 *  stopOnFalse:    interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

    // Convert options from String-formatted to Object-formatted if needed
    // (we check in cache first)
    options = typeof options === "string" ?
        ( optionsCache[ options ] || createOptions( options ) ) :
        jQuery.extend( {}, options );

    var // Flag to know if list is currently firing
        firing,
        // Last fire value (for non-forgettable lists)
        memory,
        // Flag to know if list was already fired
        fired,
        // End of the loop when firing
        firingLength,
        // Index of currently firing callback (modified by remove if needed)
        firingIndex,
        // First callback to fire (used internally by add and fireWith)
        firingStart,
        // Actual callback list
        list = [],
        // Stack of fire calls for repeatable lists
        stack = !options.once && [],
        // Fire callbacks
        fire = function( data ) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for ( ; list && firingIndex < firingLength; firingIndex++ ) {
                if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
                    memory = false; // To prevent further calls using add
                    break;
                }
            }
            firing = false;
            if ( list ) {
                if ( stack ) {
                    if ( stack.length ) {
                        fire( stack.shift() );
                    }
                } else if ( memory ) {
                    list = [];
                } else {
                    self.disable();
                }
            }
        },
        // Actual Callbacks object
        self = {
            // Add a callback or a collection of callbacks to the list
            add: function() {
                if ( list ) {
                    // First, we save the current length
                    var start = list.length;
                    (function add( args ) {
                        jQuery.each( args, function( _, arg ) {
                            var type = jQuery.type( arg );
                            if ( type === "function" ) {
                                if ( !options.unique || !self.has( arg ) ) {
                                    list.push( arg );
                                }
                            } else if ( arg && arg.length && type !== "string" ) {
                                // Inspect recursively
                                add( arg );
                            }
                        });
                    })( arguments );
                    // Do we need to add the callbacks to the
                    // current firing batch?
                    if ( firing ) {
                        firingLength = list.length;
                    // With memory, if we're not firing then
                    // we should call right away
                    } else if ( memory ) {
                        firingStart = start;
                        fire( memory );
                    }
                }
                return this;
            },
            // Remove a callback from the list
            remove: function() {
                if ( list ) {
                    jQuery.each( arguments, function( _, arg ) {
                        var index;
                        while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
                            list.splice( index, 1 );
                            // Handle firing indexes
                            if ( firing ) {
                                if ( index <= firingLength ) {
                                    firingLength--;
                                }
                                if ( index <= firingIndex ) {
                                    firingIndex--;
                                }
                            }
                        }
                    });
                }
                return this;
            },
            // Check if a given callback is in the list.
            // If no argument is given, return whether or not list has callbacks attached.
            has: function( fn ) {
                return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
            },
            // Remove all callbacks from the list
            empty: function() {
                list = [];
                return this;
            },
            // Have the list do nothing anymore
            disable: function() {
                list = stack = memory = undefined;
                return this;
            },
            // Is it disabled?
            disabled: function() {
                return !list;
            },
            // Lock the list in its current state
            lock: function() {
                stack = undefined;
                if ( !memory ) {
                    self.disable();
                }
                return this;
            },
            // Is it locked?
            locked: function() {
                return !stack;
            },
            // Call all callbacks with the given context and arguments
            fireWith: function( context, args ) {
                args = args || [];
                args = [ context, args.slice ? args.slice() : args ];
                if ( list && ( !fired || stack ) ) {
                    if ( firing ) {
                        stack.push( args );
                    } else {
                        fire( args );
                    }
                }
                return this;
            },
            // Call all the callbacks with the given arguments
            fire: function() {
                self.fireWith( this, arguments );
                return this;
            },
            // To know if the callbacks have already been called at least once
            fired: function() {
                return !!fired;
            }
        };

    return self;
};
jQuery.extend({

    Deferred: function( func ) {
        var tuples = [
                // action, add listener, listener list, final state
                [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
                [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
                [ "notify", "progress", jQuery.Callbacks("memory") ]
            ],
            state = "pending",
            promise = {
                state: function() {
                    return state;
                },
                always: function() {
                    deferred.done( arguments ).fail( arguments );
                    return this;
                },
                then: function( /* fnDone, fnFail, fnProgress */ ) {
                    var fns = arguments;
                    return jQuery.Deferred(function( newDefer ) {
                        jQuery.each( tuples, function( i, tuple ) {
                            var action = tuple[ 0 ],
                                fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
                            // deferred[ done | fail | progress ] for forwarding actions to newDefer
                            deferred[ tuple[1] ](function() {
                                var returned = fn && fn.apply( this, arguments );
                                if ( returned && jQuery.isFunction( returned.promise ) ) {
                                    returned.promise()
                                        .done( newDefer.resolve )
                                        .fail( newDefer.reject )
                                        .progress( newDefer.notify );
                                } else {
                                    newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
                                }
                            });
                        });
                        fns = null;
                    }).promise();
                },
                // Get a promise for this deferred
                // If obj is provided, the promise aspect is added to the object
                promise: function( obj ) {
                    return obj != null ? jQuery.extend( obj, promise ) : promise;
                }
            },
            deferred = {};

        // Keep pipe for back-compat
        promise.pipe = promise.then;

        // Add list-specific methods
        jQuery.each( tuples, function( i, tuple ) {
            var list = tuple[ 2 ],
                stateString = tuple[ 3 ];

            // promise[ done | fail | progress ] = list.add
            promise[ tuple[1] ] = list.add;

            // Handle state
            if ( stateString ) {
                list.add(function() {
                    // state = [ resolved | rejected ]
                    state = stateString;

                // [ reject_list | resolve_list ].disable; progress_list.lock
                }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
            }

            // deferred[ resolve | reject | notify ]
            deferred[ tuple[0] ] = function() {
                deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
                return this;
            };
            deferred[ tuple[0] + "With" ] = list.fireWith;
        });

        // Make the deferred a promise
        promise.promise( deferred );

        // Call given func if any
        if ( func ) {
            func.call( deferred, deferred );
        }

        // All done!
        return deferred;
    },

    // Deferred helper
    when: function( subordinate /* , ..., subordinateN */ ) {
        var i = 0,
            resolveValues = core_slice.call( arguments ),
            length = resolveValues.length,

            // the count of uncompleted subordinates
            remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

            // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
            deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

            // Update function for both resolve and progress values
            updateFunc = function( i, contexts, values ) {
                return function( value ) {
                    contexts[ i ] = this;
                    values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
                    if( values === progressValues ) {
                        deferred.notifyWith( contexts, values );
                    } else if ( !( --remaining ) ) {
                        deferred.resolveWith( contexts, values );
                    }
                };
            },

            progressValues, progressContexts, resolveContexts;

        // add listeners to Deferred subordinates; treat others as resolved
        if ( length > 1 ) {
            progressValues = new Array( length );
            progressContexts = new Array( length );
            resolveContexts = new Array( length );
            for ( ; i < length; i++ ) {
                if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
                    resolveValues[ i ].promise()
                        .done( updateFunc( i, resolveContexts, resolveValues ) )
                        .fail( deferred.reject )
                        .progress( updateFunc( i, progressContexts, progressValues ) );
                } else {
                    --remaining;
                }
            }
        }

        // if we're not waiting on anything, resolve the master
        if ( !remaining ) {
            deferred.resolveWith( resolveContexts, resolveValues );
        }

        return deferred.promise();
    }
});
jQuery.support = (function() {

    var support, all, a,
        input, select, fragment,
        opt, eventName, isSupported, i,
        div = document.createElement("div");

    // Setup
    div.setAttribute( "className", "t" );
    div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

    // Support tests won't run in some limited or non-browser environments
    all = div.getElementsByTagName("*");
    a = div.getElementsByTagName("a")[ 0 ];
    if ( !all || !a || !all.length ) {
        return {};
    }

    // First batch of tests
    select = document.createElement("select");
    opt = select.appendChild( document.createElement("option") );
    input = div.getElementsByTagName("input")[ 0 ];

    a.style.cssText = "top:1px;float:left;opacity:.5";
    support = {
        // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
        getSetAttribute: div.className !== "t",

        // IE strips leading whitespace when .innerHTML is used
        leadingWhitespace: div.firstChild.nodeType === 3,

        // Make sure that tbody elements aren't automatically inserted
        // IE will insert them into empty tables
        tbody: !div.getElementsByTagName("tbody").length,

        // Make sure that link elements get serialized correctly by innerHTML
        // This requires a wrapper element in IE
        htmlSerialize: !!div.getElementsByTagName("link").length,

        // Get the style information from getAttribute
        // (IE uses .cssText instead)
        style: /top/.test( a.getAttribute("style") ),

        // Make sure that URLs aren't manipulated
        // (IE normalizes it by default)
        hrefNormalized: a.getAttribute("href") === "/a",

        // Make sure that element opacity exists
        // (IE uses filter instead)
        // Use a regex to work around a WebKit issue. See #5145
        opacity: /^0.5/.test( a.style.opacity ),

        // Verify style float existence
        // (IE uses styleFloat instead of cssFloat)
        cssFloat: !!a.style.cssFloat,

        // Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
        checkOn: !!input.value,

        // Make sure that a selected-by-default option has a working selected property.
        // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
        optSelected: opt.selected,

        // Tests for enctype support on a form (#6743)
        enctype: !!document.createElement("form").enctype,

        // Makes sure cloning an html5 element does not cause problems
        // Where outerHTML is undefined, this still works
        html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

        // jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
        boxModel: document.compatMode === "CSS1Compat",

        // Will be defined later
        deleteExpando: true,
        noCloneEvent: true,
        inlineBlockNeedsLayout: false,
        shrinkWrapBlocks: false,
        reliableMarginRight: true,
        boxSizingReliable: true,
        pixelPosition: false
    };

    // Make sure checked status is properly cloned
    input.checked = true;
    support.noCloneChecked = input.cloneNode( true ).checked;

    // Make sure that the options inside disabled selects aren't marked as disabled
    // (WebKit marks them as disabled)
    select.disabled = true;
    support.optDisabled = !opt.disabled;

    // Support: IE<9
    try {
        delete div.test;
    } catch( e ) {
        support.deleteExpando = false;
    }

    // Check if we can trust getAttribute("value")
    input = document.createElement("input");
    input.setAttribute( "value", "" );
    support.input = input.getAttribute( "value" ) === "";

    // Check if an input maintains its value after becoming a radio
    input.value = "t";
    input.setAttribute( "type", "radio" );
    support.radioValue = input.value === "t";

    // #11217 - WebKit loses check when the name is after the checked attribute
    input.setAttribute( "checked", "t" );
    input.setAttribute( "name", "t" );

    fragment = document.createDocumentFragment();
    fragment.appendChild( input );

    // Check if a disconnected checkbox will retain its checked
    // value of true after appended to the DOM (IE6/7)
    support.appendChecked = input.checked;

    // WebKit doesn't clone checked state correctly in fragments
    support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

    // Support: IE<9
    // Opera does not clone events (and typeof div.attachEvent === undefined).
    // IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
    if ( div.attachEvent ) {
        div.attachEvent( "onclick", function() {
            support.noCloneEvent = false;
        });

        div.cloneNode( true ).click();
    }

    // Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
    // Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
    for ( i in { submit: true, change: true, focusin: true }) {
        div.setAttribute( eventName = "on" + i, "t" );

        support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
    }

    div.style.backgroundClip = "content-box";
    div.cloneNode( true ).style.backgroundClip = "";
    support.clearCloneStyle = div.style.backgroundClip === "content-box";

    // Run tests that need a body at doc ready
    jQuery(function() {
        var container, marginDiv, tds,
            divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
            body = document.getElementsByTagName("body")[0];

        if ( !body ) {
            // Return for frameset docs that don't have a body
            return;
        }

        container = document.createElement("div");
        container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

        body.appendChild( container ).appendChild( div );

        // Support: IE8
        // Check if table cells still have offsetWidth/Height when they are set
        // to display:none and there are still other visible table cells in a
        // table row; if so, offsetWidth/Height are not reliable for use when
        // determining if an element has been hidden directly using
        // display:none (it is still safe to use offsets if a parent element is
        // hidden; don safety goggles and see bug #4512 for more information).
        div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
        tds = div.getElementsByTagName("td");
        tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
        isSupported = ( tds[ 0 ].offsetHeight === 0 );

        tds[ 0 ].style.display = "";
        tds[ 1 ].style.display = "none";

        // Support: IE8
        // Check if empty table cells still have offsetWidth/Height
        support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

        // Check box-sizing and margin behavior
        div.innerHTML = "";
        div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
        support.boxSizing = ( div.offsetWidth === 4 );
        support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

        // Use window.getComputedStyle because jsdom on node.js will break without it.
        if ( window.getComputedStyle ) {
            support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
            support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

            // Check if div with explicit width and no margin-right incorrectly
            // gets computed margin-right based on width of container. (#3333)
            // Fails in WebKit before Feb 2011 nightlies
            // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
            marginDiv = div.appendChild( document.createElement("div") );
            marginDiv.style.cssText = div.style.cssText = divReset;
            marginDiv.style.marginRight = marginDiv.style.width = "0";
            div.style.width = "1px";

            support.reliableMarginRight =
                !parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
        }

        if ( typeof div.style.zoom !== core_strundefined ) {
            // Support: IE<8
            // Check if natively block-level elements act like inline-block
            // elements when setting their display to 'inline' and giving
            // them layout
            div.innerHTML = "";
            div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
            support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

            // Support: IE6
            // Check if elements with layout shrink-wrap their children
            div.style.display = "block";
            div.innerHTML = "<div></div>";
            div.firstChild.style.width = "5px";
            support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

            if ( support.inlineBlockNeedsLayout ) {
                // Prevent IE 6 from affecting layout for positioned elements #11048
                // Prevent IE from shrinking the body in IE 7 mode #12869
                // Support: IE<8
                body.style.zoom = 1;
            }
        }

        body.removeChild( container );

        // Null elements to avoid leaks in IE
        container = div = tds = marginDiv = null;
    });

    // Null elements to avoid leaks in IE
    all = select = fragment = opt = a = input = null;

    return support;
})();

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
    rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
    if ( !jQuery.acceptData( elem ) ) {
        return;
    }

    var thisCache, ret,
        internalKey = jQuery.expando,
        getByName = typeof name === "string",

        // We have to handle DOM nodes and JS objects differently because IE6-7
        // can't GC object references properly across the DOM-JS boundary
        isNode = elem.nodeType,

        // Only DOM nodes need the global jQuery cache; JS object data is
        // attached directly to the object so GC can occur automatically
        cache = isNode ? jQuery.cache : elem,

        // Only defining an ID for JS objects if its cache already exists allows
        // the code to shortcut on the same path as a DOM node with no cache
        id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

    // Avoid doing any more work than we need to when trying to get data on an
    // object that has no data at all
    if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
        return;
    }

    if ( !id ) {
        // Only DOM nodes need a new unique ID for each element since their data
        // ends up in the global cache
        if ( isNode ) {
            elem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;
        } else {
            id = internalKey;
        }
    }

    if ( !cache[ id ] ) {
        cache[ id ] = {};

        // Avoids exposing jQuery metadata on plain JS objects when the object
        // is serialized using JSON.stringify
        if ( !isNode ) {
            cache[ id ].toJSON = jQuery.noop;
        }
    }

    // An object can be passed to jQuery.data instead of a key/value pair; this gets
    // shallow copied over onto the existing cache
    if ( typeof name === "object" || typeof name === "function" ) {
        if ( pvt ) {
            cache[ id ] = jQuery.extend( cache[ id ], name );
        } else {
            cache[ id ].data = jQuery.extend( cache[ id ].data, name );
        }
    }

    thisCache = cache[ id ];

    // jQuery data() is stored in a separate object inside the object's internal data
    // cache in order to avoid key collisions between internal data and user-defined
    // data.
    if ( !pvt ) {
        if ( !thisCache.data ) {
            thisCache.data = {};
        }

        thisCache = thisCache.data;
    }

    if ( data !== undefined ) {
        thisCache[ jQuery.camelCase( name ) ] = data;
    }

    // Check for both converted-to-camel and non-converted data property names
    // If a data property was specified
    if ( getByName ) {

        // First Try to find as-is property data
        ret = thisCache[ name ];

        // Test for null|undefined property data
        if ( ret == null ) {

            // Try to find the camelCased property
            ret = thisCache[ jQuery.camelCase( name ) ];
        }
    } else {
        ret = thisCache;
    }

    return ret;
}

function internalRemoveData( elem, name, pvt ) {
    if ( !jQuery.acceptData( elem ) ) {
        return;
    }

    var i, l, thisCache,
        isNode = elem.nodeType,

        // See jQuery.data for more information
        cache = isNode ? jQuery.cache : elem,
        id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

    // If there is already no cache entry for this object, there is no
    // purpose in continuing
    if ( !cache[ id ] ) {
        return;
    }

    if ( name ) {

        thisCache = pvt ? cache[ id ] : cache[ id ].data;

        if ( thisCache ) {

            // Support array or space separated string names for data keys
            if ( !jQuery.isArray( name ) ) {

                // try the string as a key before any manipulation
                if ( name in thisCache ) {
                    name = [ name ];
                } else {

                    // split the camel cased version by spaces unless a key with the spaces exists
                    name = jQuery.camelCase( name );
                    if ( name in thisCache ) {
                        name = [ name ];
                    } else {
                        name = name.split(" ");
                    }
                }
            } else {
                // If "name" is an array of keys...
                // When data is initially created, via ("key", "val") signature,
                // keys will be converted to camelCase.
                // Since there is no way to tell _how_ a key was added, remove
                // both plain key and camelCase key. #12786
                // This will only penalize the array argument path.
                name = name.concat( jQuery.map( name, jQuery.camelCase ) );
            }

            for ( i = 0, l = name.length; i < l; i++ ) {
                delete thisCache[ name[i] ];
            }

            // If there is no data left in the cache, we want to continue
            // and let the cache object itself get destroyed
            if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
                return;
            }
        }
    }

    // See jQuery.data for more information
    if ( !pvt ) {
        delete cache[ id ].data;

        // Don't destroy the parent cache unless the internal data object
        // had been the only thing left in it
        if ( !isEmptyDataObject( cache[ id ] ) ) {
            return;
        }
    }

    // Destroy the cache
    if ( isNode ) {
        jQuery.cleanData( [ elem ], true );

    // Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
    } else if ( jQuery.support.deleteExpando || cache != cache.window ) {
        delete cache[ id ];

    // When all else fails, null
    } else {
        cache[ id ] = null;
    }
}

jQuery.extend({
    cache: {},

    // Unique for each copy of jQuery on the page
    // Non-digits removed to match rinlinejQuery
    expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
    noData: {
        "embed": true,
        // Ban all objects except for Flash (which handle expandos)
        "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
        "applet": true
    },

    hasData: function( elem ) {
        elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
        return !!elem && !isEmptyDataObject( elem );
    },

    data: function( elem, name, data ) {
        return internalData( elem, name, data );
    },

    removeData: function( elem, name ) {
        return internalRemoveData( elem, name );
    },

    // For internal use only.
    _data: function( elem, name, data ) {
        return internalData( elem, name, data, true );
    },

    _removeData: function( elem, name ) {
        return internalRemoveData( elem, name, true );
    },

    // A method for determining if a DOM node can handle the data expando
    acceptData: function( elem ) {
        // Do not set data on non-element because it will not be cleared (#8335).
        if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
            return false;
        }

        var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

        // nodes accept data unless otherwise specified; rejection can be conditional
        return !noData || noData !== true && elem.getAttribute("classid") === noData;
    }
});

jQuery.fn.extend({
    data: function( key, value ) {
        var attrs, name,
            elem = this[0],
            i = 0,
            data = null;

        // Gets all values
        if ( key === undefined ) {
            if ( this.length ) {
                data = jQuery.data( elem );

                if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
                    attrs = elem.attributes;
                    for ( ; i < attrs.length; i++ ) {
                        name = attrs[i].name;

                        if ( !name.indexOf( "data-" ) ) {
                            name = jQuery.camelCase( name.slice(5) );

                            dataAttr( elem, name, data[ name ] );
                        }
                    }
                    jQuery._data( elem, "parsedAttrs", true );
                }
            }

            return data;
        }

        // Sets multiple values
        if ( typeof key === "object" ) {
            return this.each(function() {
                jQuery.data( this, key );
            });
        }

        return jQuery.access( this, function( value ) {

            if ( value === undefined ) {
                // Try to fetch any internally stored data first
                return elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
            }

            this.each(function() {
                jQuery.data( this, key, value );
            });
        }, null, value, arguments.length > 1, null, true );
    },

    removeData: function( key ) {
        return this.each(function() {
            jQuery.removeData( this, key );
        });
    }
});

function dataAttr( elem, key, data ) {
    // If nothing was found internally, try to fetch any
    // data from the HTML5 data-* attribute
    if ( data === undefined && elem.nodeType === 1 ) {

        var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

        data = elem.getAttribute( name );

        if ( typeof data === "string" ) {
            try {
                data = data === "true" ? true :
                    data === "false" ? false :
                    data === "null" ? null :
                    // Only convert to a number if it doesn't change the string
                    +data + "" === data ? +data :
                    rbrace.test( data ) ? jQuery.parseJSON( data ) :
                        data;
            } catch( e ) {}

            // Make sure we set the data so it isn't changed later
            jQuery.data( elem, key, data );

        } else {
            data = undefined;
        }
    }

    return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
    var name;
    for ( name in obj ) {

        // if the public data object is empty, the private is still empty
        if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
            continue;
        }
        if ( name !== "toJSON" ) {
            return false;
        }
    }

    return true;
}
jQuery.extend({
    queue: function( elem, type, data ) {
        var queue;

        if ( elem ) {
            type = ( type || "fx" ) + "queue";
            queue = jQuery._data( elem, type );

            // Speed up dequeue by getting out quickly if this is just a lookup
            if ( data ) {
                if ( !queue || jQuery.isArray(data) ) {
                    queue = jQuery._data( elem, type, jQuery.makeArray(data) );
                } else {
                    queue.push( data );
                }
            }
            return queue || [];
        }
    },

    dequeue: function( elem, type ) {
        type = type || "fx";

        var queue = jQuery.queue( elem, type ),
            startLength = queue.length,
            fn = queue.shift(),
            hooks = jQuery._queueHooks( elem, type ),
            next = function() {
                jQuery.dequeue( elem, type );
            };

        // If the fx queue is dequeued, always remove the progress sentinel
        if ( fn === "inprogress" ) {
            fn = queue.shift();
            startLength--;
        }

        hooks.cur = fn;
        if ( fn ) {

            // Add a progress sentinel to prevent the fx queue from being
            // automatically dequeued
            if ( type === "fx" ) {
                queue.unshift( "inprogress" );
            }

            // clear up the last queue stop function
            delete hooks.stop;
            fn.call( elem, next, hooks );
        }

        if ( !startLength && hooks ) {
            hooks.empty.fire();
        }
    },

    // not intended for public consumption - generates a queueHooks object, or returns the current one
    _queueHooks: function( elem, type ) {
        var key = type + "queueHooks";
        return jQuery._data( elem, key ) || jQuery._data( elem, key, {
            empty: jQuery.Callbacks("once memory").add(function() {
                jQuery._removeData( elem, type + "queue" );
                jQuery._removeData( elem, key );
            })
        });
    }
});

jQuery.fn.extend({
    queue: function( type, data ) {
        var setter = 2;

        if ( typeof type !== "string" ) {
            data = type;
            type = "fx";
            setter--;
        }

        if ( arguments.length < setter ) {
            return jQuery.queue( this[0], type );
        }

        return data === undefined ?
            this :
            this.each(function() {
                var queue = jQuery.queue( this, type, data );

                // ensure a hooks for this queue
                jQuery._queueHooks( this, type );

                if ( type === "fx" && queue[0] !== "inprogress" ) {
                    jQuery.dequeue( this, type );
                }
            });
    },
    dequeue: function( type ) {
        return this.each(function() {
            jQuery.dequeue( this, type );
        });
    },
    // Based off of the plugin by Clint Helfers, with permission.
    // http://blindsignals.com/index.php/2009/07/jquery-delay/
    delay: function( time, type ) {
        time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
        type = type || "fx";

        return this.queue( type, function( next, hooks ) {
            var timeout = setTimeout( next, time );
            hooks.stop = function() {
                clearTimeout( timeout );
            };
        });
    },
    clearQueue: function( type ) {
        return this.queue( type || "fx", [] );
    },
    // Get a promise resolved when queues of a certain type
    // are emptied (fx is the type by default)
    promise: function( type, obj ) {
        var tmp,
            count = 1,
            defer = jQuery.Deferred(),
            elements = this,
            i = this.length,
            resolve = function() {
                if ( !( --count ) ) {
                    defer.resolveWith( elements, [ elements ] );
                }
            };

        if ( typeof type !== "string" ) {
            obj = type;
            type = undefined;
        }
        type = type || "fx";

        while( i-- ) {
            tmp = jQuery._data( elements[ i ], type + "queueHooks" );
            if ( tmp && tmp.empty ) {
                count++;
                tmp.empty.add( resolve );
            }
        }
        resolve();
        return defer.promise( obj );
    }
});
var nodeHook, boolHook,
    rclass = /[\t\r\n]/g,
    rreturn = /\r/g,
    rfocusable = /^(?:input|select|textarea|button|object)$/i,
    rclickable = /^(?:a|area)$/i,
    rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
    ruseDefault = /^(?:checked|selected)$/i,
    getSetAttribute = jQuery.support.getSetAttribute,
    getSetInput = jQuery.support.input;

jQuery.fn.extend({
    attr: function( name, value ) {
        return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
    },

    removeAttr: function( name ) {
        return this.each(function() {
            jQuery.removeAttr( this, name );
        });
    },

    prop: function( name, value ) {
        return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
    },

    removeProp: function( name ) {
        name = jQuery.propFix[ name ] || name;
        return this.each(function() {
            // try/catch handles cases where IE balks (such as removing a property on window)
            try {
                this[ name ] = undefined;
                delete this[ name ];
            } catch( e ) {}
        });
    },

    addClass: function( value ) {
        var classes, elem, cur, clazz, j,
            i = 0,
            len = this.length,
            proceed = typeof value === "string" && value;

        if ( jQuery.isFunction( value ) ) {
            return this.each(function( j ) {
                jQuery( this ).addClass( value.call( this, j, this.className ) );
            });
        }

        if ( proceed ) {
            // The disjunction here is for better compressibility (see removeClass)
            classes = ( value || "" ).match( core_rnotwhite ) || [];

            for ( ; i < len; i++ ) {
                elem = this[ i ];
                cur = elem.nodeType === 1 && ( elem.className ?
                    ( " " + elem.className + " " ).replace( rclass, " " ) :
                    " "
                );

                if ( cur ) {
                    j = 0;
                    while ( (clazz = classes[j++]) ) {
                        if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
                            cur += clazz + " ";
                        }
                    }
                    elem.className = jQuery.trim( cur );

                }
            }
        }

        return this;
    },

    removeClass: function( value ) {
        var classes, elem, cur, clazz, j,
            i = 0,
            len = this.length,
            proceed = arguments.length === 0 || typeof value === "string" && value;

        if ( jQuery.isFunction( value ) ) {
            return this.each(function( j ) {
                jQuery( this ).removeClass( value.call( this, j, this.className ) );
            });
        }
        if ( proceed ) {
            classes = ( value || "" ).match( core_rnotwhite ) || [];

            for ( ; i < len; i++ ) {
                elem = this[ i ];
                // This expression is here for better compressibility (see addClass)
                cur = elem.nodeType === 1 && ( elem.className ?
                    ( " " + elem.className + " " ).replace( rclass, " " ) :
                    ""
                );

                if ( cur ) {
                    j = 0;
                    while ( (clazz = classes[j++]) ) {
                        // Remove *all* instances
                        while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
                            cur = cur.replace( " " + clazz + " ", " " );
                        }
                    }
                    elem.className = value ? jQuery.trim( cur ) : "";
                }
            }
        }

        return this;
    },

    toggleClass: function( value, stateVal ) {
        var type = typeof value,
            isBool = typeof stateVal === "boolean";

        if ( jQuery.isFunction( value ) ) {
            return this.each(function( i ) {
                jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
            });
        }

        return this.each(function() {
            if ( type === "string" ) {
                // toggle individual class names
                var className,
                    i = 0,
                    self = jQuery( this ),
                    state = stateVal,
                    classNames = value.match( core_rnotwhite ) || [];

                while ( (className = classNames[ i++ ]) ) {
                    // check each className given, space separated list
                    state = isBool ? state : !self.hasClass( className );
                    self[ state ? "addClass" : "removeClass" ]( className );
                }

            // Toggle whole class name
            } else if ( type === core_strundefined || type === "boolean" ) {
                if ( this.className ) {
                    // store className if set
                    jQuery._data( this, "__className__", this.className );
                }

                // If the element has a class name or if we're passed "false",
                // then remove the whole classname (if there was one, the above saved it).
                // Otherwise bring back whatever was previously saved (if anything),
                // falling back to the empty string if nothing was stored.
                this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
            }
        });
    },

    hasClass: function( selector ) {
        var className = " " + selector + " ",
            i = 0,
            l = this.length;
        for ( ; i < l; i++ ) {
            if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
                return true;
            }
        }

        return false;
    },

    val: function( value ) {
        var ret, hooks, isFunction,
            elem = this[0];

        if ( !arguments.length ) {
            if ( elem ) {
                hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

                if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
                    return ret;
                }

                ret = elem.value;

                return typeof ret === "string" ?
                    // handle most common string cases
                    ret.replace(rreturn, "") :
                    // handle cases where value is null/undef or number
                    ret == null ? "" : ret;
            }

            return;
        }

        isFunction = jQuery.isFunction( value );

        return this.each(function( i ) {
            var val,
                self = jQuery(this);

            if ( this.nodeType !== 1 ) {
                return;
            }

            if ( isFunction ) {
                val = value.call( this, i, self.val() );
            } else {
                val = value;
            }

            // Treat null/undefined as ""; convert numbers to string
            if ( val == null ) {
                val = "";
            } else if ( typeof val === "number" ) {
                val += "";
            } else if ( jQuery.isArray( val ) ) {
                val = jQuery.map(val, function ( value ) {
                    return value == null ? "" : value + "";
                });
            }

            hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

            // If set returns undefined, fall back to normal setting
            if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
                this.value = val;
            }
        });
    }
});

jQuery.extend({
    valHooks: {
        option: {
            get: function( elem ) {
                // attributes.value is undefined in Blackberry 4.7 but
                // uses .value. See #6932
                var val = elem.attributes.value;
                return !val || val.specified ? elem.value : elem.text;
            }
        },
        select: {
            get: function( elem ) {
                var value, option,
                    options = elem.options,
                    index = elem.selectedIndex,
                    one = elem.type === "select-one" || index < 0,
                    values = one ? null : [],
                    max = one ? index + 1 : options.length,
                    i = index < 0 ?
                        max :
                        one ? index : 0;

                // Loop through all the selected options
                for ( ; i < max; i++ ) {
                    option = options[ i ];

                    // oldIE doesn't update selected after form reset (#2551)
                    if ( ( option.selected || i === index ) &&
                            // Don't return options that are disabled or in a disabled optgroup
                            ( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
                            ( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

                        // Get the specific value for the option
                        value = jQuery( option ).val();

                        // We don't need an array for one selects
                        if ( one ) {
                            return value;
                        }

                        // Multi-Selects return an array
                        values.push( value );
                    }
                }

                return values;
            },

            set: function( elem, value ) {
                var values = jQuery.makeArray( value );

                jQuery(elem).find("option").each(function() {
                    this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
                });

                if ( !values.length ) {
                    elem.selectedIndex = -1;
                }
                return values;
            }
        }
    },

    attr: function( elem, name, value ) {
        var hooks, notxml, ret,
            nType = elem.nodeType;

        // don't get/set attributes on text, comment and attribute nodes
        if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
            return;
        }

        // Fallback to prop when attributes are not supported
        if ( typeof elem.getAttribute === core_strundefined ) {
            return jQuery.prop( elem, name, value );
        }

        notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

        // All attributes are lowercase
        // Grab necessary hook if one is defined
        if ( notxml ) {
            name = name.toLowerCase();
            hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
        }

        if ( value !== undefined ) {

            if ( value === null ) {
                jQuery.removeAttr( elem, name );

            } else if ( hooks && notxml && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
                return ret;

            } else {
                elem.setAttribute( name, value + "" );
                return value;
            }

        } else if ( hooks && notxml && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
            return ret;

        } else {

            // In IE9+, Flash objects don't have .getAttribute (#12945)
            // Support: IE9+
            if ( typeof elem.getAttribute !== core_strundefined ) {
                ret =  elem.getAttribute( name );
            }

            // Non-existent attributes return null, we normalize to undefined
            return ret == null ?
                undefined :
                ret;
        }
    },

    removeAttr: function( elem, value ) {
        var name, propName,
            i = 0,
            attrNames = value && value.match( core_rnotwhite );

        if ( attrNames && elem.nodeType === 1 ) {
            while ( (name = attrNames[i++]) ) {
                propName = jQuery.propFix[ name ] || name;

                // Boolean attributes get special treatment (#10870)
                if ( rboolean.test( name ) ) {
                    // Set corresponding property to false for boolean attributes
                    // Also clear defaultChecked/defaultSelected (if appropriate) for IE<8
                    if ( !getSetAttribute && ruseDefault.test( name ) ) {
                        elem[ jQuery.camelCase( "default-" + name ) ] =
                            elem[ propName ] = false;
                    } else {
                        elem[ propName ] = false;
                    }

                // See #9699 for explanation of this approach (setting first, then removal)
                } else {
                    jQuery.attr( elem, name, "" );
                }

                elem.removeAttribute( getSetAttribute ? name : propName );
            }
        }
    },

    attrHooks: {
        type: {
            set: function( elem, value ) {
                if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
                    // Setting the type on a radio button after the value resets the value in IE6-9
                    // Reset value to default in case type is set after value during creation
                    var val = elem.value;
                    elem.setAttribute( "type", value );
                    if ( val ) {
                        elem.value = val;
                    }
                    return value;
                }
            }
        }
    },

    propFix: {
        tabindex: "tabIndex",
        readonly: "readOnly",
        "for": "htmlFor",
        "class": "className",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        cellpadding: "cellPadding",
        rowspan: "rowSpan",
        colspan: "colSpan",
        usemap: "useMap",
        frameborder: "frameBorder",
        contenteditable: "contentEditable"
    },

    prop: function( elem, name, value ) {
        var ret, hooks, notxml,
            nType = elem.nodeType;

        // don't get/set properties on text, comment and attribute nodes
        if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
            return;
        }

        notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

        if ( notxml ) {
            // Fix name and attach hooks
            name = jQuery.propFix[ name ] || name;
            hooks = jQuery.propHooks[ name ];
        }

        if ( value !== undefined ) {
            if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
                return ret;

            } else {
                return ( elem[ name ] = value );
            }

        } else {
            if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
                return ret;

            } else {
                return elem[ name ];
            }
        }
    },

    propHooks: {
        tabIndex: {
            get: function( elem ) {
                // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                var attributeNode = elem.getAttributeNode("tabindex");

                return attributeNode && attributeNode.specified ?
                    parseInt( attributeNode.value, 10 ) :
                    rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
                        0 :
                        undefined;
            }
        }
    }
});

// Hook for boolean attributes
boolHook = {
    get: function( elem, name ) {
        var
            // Use .prop to determine if this attribute is understood as boolean
            prop = jQuery.prop( elem, name ),

            // Fetch it accordingly
            attr = typeof prop === "boolean" && elem.getAttribute( name ),
            detail = typeof prop === "boolean" ?

                getSetInput && getSetAttribute ?
                    attr != null :
                    // oldIE fabricates an empty string for missing boolean attributes
                    // and conflates checked/selected into attroperties
                    ruseDefault.test( name ) ?
                        elem[ jQuery.camelCase( "default-" + name ) ] :
                        !!attr :

                // fetch an attribute node for properties not recognized as boolean
                elem.getAttributeNode( name );

        return detail && detail.value !== false ?
            name.toLowerCase() :
            undefined;
    },
    set: function( elem, value, name ) {
        if ( value === false ) {
            // Remove boolean attributes when set to false
            jQuery.removeAttr( elem, name );
        } else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
            // IE<8 needs the *property* name
            elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

        // Use defaultChecked and defaultSelected for oldIE
        } else {
            elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
        }

        return name;
    }
};

// fix oldIE value attroperty
if ( !getSetInput || !getSetAttribute ) {
    jQuery.attrHooks.value = {
        get: function( elem, name ) {
            var ret = elem.getAttributeNode( name );
            return jQuery.nodeName( elem, "input" ) ?

                // Ignore the value *property* by using defaultValue
                elem.defaultValue :

                ret && ret.specified ? ret.value : undefined;
        },
        set: function( elem, value, name ) {
            if ( jQuery.nodeName( elem, "input" ) ) {
                // Does not return so that setAttribute is also used
                elem.defaultValue = value;
            } else {
                // Use nodeHook if defined (#1954); otherwise setAttribute is fine
                return nodeHook && nodeHook.set( elem, value, name );
            }
        }
    };
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

    // Use this for any attribute in IE6/7
    // This fixes almost every IE6/7 issue
    nodeHook = jQuery.valHooks.button = {
        get: function( elem, name ) {
            var ret = elem.getAttributeNode( name );
            return ret && ( name === "id" || name === "name" || name === "coords" ? ret.value !== "" : ret.specified ) ?
                ret.value :
                undefined;
        },
        set: function( elem, value, name ) {
            // Set the existing or create a new attribute node
            var ret = elem.getAttributeNode( name );
            if ( !ret ) {
                elem.setAttributeNode(
                    (ret = elem.ownerDocument.createAttribute( name ))
                );
            }

            ret.value = value += "";

            // Break association with cloned elements by also using setAttribute (#9646)
            return name === "value" || value === elem.getAttribute( name ) ?
                value :
                undefined;
        }
    };

    // Set contenteditable to false on removals(#10429)
    // Setting to empty string throws an error as an invalid value
    jQuery.attrHooks.contenteditable = {
        get: nodeHook.get,
        set: function( elem, value, name ) {
            nodeHook.set( elem, value === "" ? false : value, name );
        }
    };

    // Set width and height to auto instead of 0 on empty string( Bug #8150 )
    // This is for removals
    jQuery.each([ "width", "height" ], function( i, name ) {
        jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
            set: function( elem, value ) {
                if ( value === "" ) {
                    elem.setAttribute( name, "auto" );
                    return value;
                }
            }
        });
    });
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
    jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
        jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
            get: function( elem ) {
                var ret = elem.getAttribute( name, 2 );
                return ret == null ? undefined : ret;
            }
        });
    });

    // href/src property should get the full normalized URL (#10299/#12915)
    jQuery.each([ "href", "src" ], function( i, name ) {
        jQuery.propHooks[ name ] = {
            get: function( elem ) {
                return elem.getAttribute( name, 4 );
            }
        };
    });
}

if ( !jQuery.support.style ) {
    jQuery.attrHooks.style = {
        get: function( elem ) {
            // Return undefined in the case of empty string
            // Note: IE uppercases css property names, but if we were to .toLowerCase()
            // .cssText, that would destroy case senstitivity in URL's, like in "background"
            return elem.style.cssText || undefined;
        },
        set: function( elem, value ) {
            return ( elem.style.cssText = value + "" );
        }
    };
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
    jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
        get: function( elem ) {
            var parent = elem.parentNode;

            if ( parent ) {
                parent.selectedIndex;

                // Make sure that it also works with optgroups, see #5701
                if ( parent.parentNode ) {
                    parent.parentNode.selectedIndex;
                }
            }
            return null;
        }
    });
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
    jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
    jQuery.each([ "radio", "checkbox" ], function() {
        jQuery.valHooks[ this ] = {
            get: function( elem ) {
                // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                return elem.getAttribute("value") === null ? "on" : elem.value;
            }
        };
    });
}
jQuery.each([ "radio", "checkbox" ], function() {
    jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
        set: function( elem, value ) {
            if ( jQuery.isArray( value ) ) {
                return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
            }
        }
    });
});
var rformElems = /^(?:input|select|textarea)$/i,
    rkeyEvent = /^key/,
    rmouseEvent = /^(?:mouse|contextmenu)|click/,
    rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
    rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

    global: {},

    add: function( elem, types, handler, data, selector ) {
        var tmp, events, t, handleObjIn,
            special, eventHandle, handleObj,
            handlers, type, namespaces, origType,
            elemData = jQuery._data( elem );

        // Don't attach events to noData or text/comment nodes (but allow plain objects)
        if ( !elemData ) {
            return;
        }

        // Caller can pass in an object of custom data in lieu of the handler
        if ( handler.handler ) {
            handleObjIn = handler;
            handler = handleObjIn.handler;
            selector = handleObjIn.selector;
        }

        // Make sure that the handler has a unique ID, used to find/remove it later
        if ( !handler.guid ) {
            handler.guid = jQuery.guid++;
        }

        // Init the element's event structure and main handler, if this is the first
        if ( !(events = elemData.events) ) {
            events = elemData.events = {};
        }
        if ( !(eventHandle = elemData.handle) ) {
            eventHandle = elemData.handle = function( e ) {
                // Discard the second event of a jQuery.event.trigger() and
                // when an event is called after a page has unloaded
                return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
                    jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
                    undefined;
            };
            // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
            eventHandle.elem = elem;
        }

        // Handle multiple events separated by a space
        // jQuery(...).bind("mouseover mouseout", fn);
        types = ( types || "" ).match( core_rnotwhite ) || [""];
        t = types.length;
        while ( t-- ) {
            tmp = rtypenamespace.exec( types[t] ) || [];
            type = origType = tmp[1];
            namespaces = ( tmp[2] || "" ).split( "." ).sort();

            // If event changes its type, use the special event handlers for the changed type
            special = jQuery.event.special[ type ] || {};

            // If selector defined, determine special event api type, otherwise given type
            type = ( selector ? special.delegateType : special.bindType ) || type;

            // Update special based on newly reset type
            special = jQuery.event.special[ type ] || {};

            // handleObj is passed to all event handlers
            handleObj = jQuery.extend({
                type: type,
                origType: origType,
                data: data,
                handler: handler,
                guid: handler.guid,
                selector: selector,
                needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
                namespace: namespaces.join(".")
            }, handleObjIn );

            // Init the event handler queue if we're the first
            if ( !(handlers = events[ type ]) ) {
                handlers = events[ type ] = [];
                handlers.delegateCount = 0;

                // Only use addEventListener/attachEvent if the special events handler returns false
                if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
                    // Bind the global event handler to the element
                    if ( elem.addEventListener ) {
                        elem.addEventListener( type, eventHandle, false );

                    } else if ( elem.attachEvent ) {
                        elem.attachEvent( "on" + type, eventHandle );
                    }
                }
            }

            if ( special.add ) {
                special.add.call( elem, handleObj );

                if ( !handleObj.handler.guid ) {
                    handleObj.handler.guid = handler.guid;
                }
            }

            // Add to the element's handler list, delegates in front
            if ( selector ) {
                handlers.splice( handlers.delegateCount++, 0, handleObj );
            } else {
                handlers.push( handleObj );
            }

            // Keep track of which events have ever been used, for event optimization
            jQuery.event.global[ type ] = true;
        }

        // Nullify elem to prevent memory leaks in IE
        elem = null;
    },

    // Detach an event or set of events from an element
    remove: function( elem, types, handler, selector, mappedTypes ) {
        var j, handleObj, tmp,
            origCount, t, events,
            special, handlers, type,
            namespaces, origType,
            elemData = jQuery.hasData( elem ) && jQuery._data( elem );

        if ( !elemData || !(events = elemData.events) ) {
            return;
        }

        // Once for each type.namespace in types; type may be omitted
        types = ( types || "" ).match( core_rnotwhite ) || [""];
        t = types.length;
        while ( t-- ) {
            tmp = rtypenamespace.exec( types[t] ) || [];
            type = origType = tmp[1];
            namespaces = ( tmp[2] || "" ).split( "." ).sort();

            // Unbind all events (on this namespace, if provided) for the element
            if ( !type ) {
                for ( type in events ) {
                    jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
                }
                continue;
            }

            special = jQuery.event.special[ type ] || {};
            type = ( selector ? special.delegateType : special.bindType ) || type;
            handlers = events[ type ] || [];
            tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

            // Remove matching events
            origCount = j = handlers.length;
            while ( j-- ) {
                handleObj = handlers[ j ];

                if ( ( mappedTypes || origType === handleObj.origType ) &&
                    ( !handler || handler.guid === handleObj.guid ) &&
                    ( !tmp || tmp.test( handleObj.namespace ) ) &&
                    ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
                    handlers.splice( j, 1 );

                    if ( handleObj.selector ) {
                        handlers.delegateCount--;
                    }
                    if ( special.remove ) {
                        special.remove.call( elem, handleObj );
                    }
                }
            }

            // Remove generic event handler if we removed something and no more handlers exist
            // (avoids potential for endless recursion during removal of special event handlers)
            if ( origCount && !handlers.length ) {
                if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
                    jQuery.removeEvent( elem, type, elemData.handle );
                }

                delete events[ type ];
            }
        }

        // Remove the expando if it's no longer used
        if ( jQuery.isEmptyObject( events ) ) {
            delete elemData.handle;

            // removeData also checks for emptiness and clears the expando if empty
            // so use it instead of delete
            jQuery._removeData( elem, "events" );
        }
    },

    trigger: function( event, data, elem, onlyHandlers ) {
        var handle, ontype, cur,
            bubbleType, special, tmp, i,
            eventPath = [ elem || document ],
            type = core_hasOwn.call( event, "type" ) ? event.type : event,
            namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

        cur = tmp = elem = elem || document;

        // Don't do events on text and comment nodes
        if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
            return;
        }

        // focus/blur morphs to focusin/out; ensure we're not firing them right now
        if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
            return;
        }

        if ( type.indexOf(".") >= 0 ) {
            // Namespaced trigger; create a regexp to match event type in handle()
            namespaces = type.split(".");
            type = namespaces.shift();
            namespaces.sort();
        }
        ontype = type.indexOf(":") < 0 && "on" + type;

        // Caller can pass in a jQuery.Event object, Object, or just an event type string
        event = event[ jQuery.expando ] ?
            event :
            new jQuery.Event( type, typeof event === "object" && event );

        event.isTrigger = true;
        event.namespace = namespaces.join(".");
        event.namespace_re = event.namespace ?
            new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
            null;

        // Clean up the event in case it is being reused
        event.result = undefined;
        if ( !event.target ) {
            event.target = elem;
        }

        // Clone any incoming data and prepend the event, creating the handler arg list
        data = data == null ?
            [ event ] :
            jQuery.makeArray( data, [ event ] );

        // Allow special events to draw outside the lines
        special = jQuery.event.special[ type ] || {};
        if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
            return;
        }

        // Determine event propagation path in advance, per W3C events spec (#9951)
        // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
        if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

            bubbleType = special.delegateType || type;
            if ( !rfocusMorph.test( bubbleType + type ) ) {
                cur = cur.parentNode;
            }
            for ( ; cur; cur = cur.parentNode ) {
                eventPath.push( cur );
                tmp = cur;
            }

            // Only add window if we got to document (e.g., not plain obj or detached DOM)
            if ( tmp === (elem.ownerDocument || document) ) {
                eventPath.push( tmp.defaultView || tmp.parentWindow || window );
            }
        }

        // Fire handlers on the event path
        i = 0;
        while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

            event.type = i > 1 ?
                bubbleType :
                special.bindType || type;

            // jQuery handler
            handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
            if ( handle ) {
                handle.apply( cur, data );
            }

            // Native handler
            handle = ontype && cur[ ontype ];
            if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
                event.preventDefault();
            }
        }
        event.type = type;

        // If nobody prevented the default action, do it now
        if ( !onlyHandlers && !event.isDefaultPrevented() ) {

            if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
                !(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

                // Call a native DOM method on the target with the same name name as the event.
                // Can't use an .isFunction() check here because IE6/7 fails that test.
                // Don't do default actions on window, that's where global variables be (#6170)
                if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

                    // Don't re-trigger an onFOO event when we call its FOO() method
                    tmp = elem[ ontype ];

                    if ( tmp ) {
                        elem[ ontype ] = null;
                    }

                    // Prevent re-triggering of the same event, since we already bubbled it above
                    jQuery.event.triggered = type;
                    try {
                        elem[ type ]();
                    } catch ( e ) {
                        // IE<9 dies on focus/blur to hidden element (#1486,#12518)
                        // only reproducible on winXP IE8 native, not IE9 in IE8 mode
                    }
                    jQuery.event.triggered = undefined;

                    if ( tmp ) {
                        elem[ ontype ] = tmp;
                    }
                }
            }
        }

        return event.result;
    },

    dispatch: function( event ) {

        // Make a writable jQuery.Event from the native event object
        event = jQuery.event.fix( event );

        var i, ret, handleObj, matched, j,
            handlerQueue = [],
            args = core_slice.call( arguments ),
            handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
            special = jQuery.event.special[ event.type ] || {};

        // Use the fix-ed jQuery.Event rather than the (read-only) native event
        args[0] = event;
        event.delegateTarget = this;

        // Call the preDispatch hook for the mapped type, and let it bail if desired
        if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
            return;
        }

        // Determine handlers
        handlerQueue = jQuery.event.handlers.call( this, event, handlers );

        // Run delegates first; they may want to stop propagation beneath us
        i = 0;
        while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
            event.currentTarget = matched.elem;

            j = 0;
            while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

                // Triggered event must either 1) have no namespace, or
                // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

                    event.handleObj = handleObj;
                    event.data = handleObj.data;

                    ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
                            .apply( matched.elem, args );

                    if ( ret !== undefined ) {
                        if ( (event.result = ret) === false ) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            }
        }

        // Call the postDispatch hook for the mapped type
        if ( special.postDispatch ) {
            special.postDispatch.call( this, event );
        }

        return event.result;
    },

    handlers: function( event, handlers ) {
        var sel, handleObj, matches, i,
            handlerQueue = [],
            delegateCount = handlers.delegateCount,
            cur = event.target;

        // Find delegate handlers
        // Black-hole SVG <use> instance trees (#13180)
        // Avoid non-left-click bubbling in Firefox (#3861)
        if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

            for ( ; cur != this; cur = cur.parentNode || this ) {

                // Don't check non-elements (#13208)
                // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
                    matches = [];
                    for ( i = 0; i < delegateCount; i++ ) {
                        handleObj = handlers[ i ];

                        // Don't conflict with Object.prototype properties (#13203)
                        sel = handleObj.selector + " ";

                        if ( matches[ sel ] === undefined ) {
                            matches[ sel ] = handleObj.needsContext ?
                                jQuery( sel, this ).index( cur ) >= 0 :
                                jQuery.find( sel, this, null, [ cur ] ).length;
                        }
                        if ( matches[ sel ] ) {
                            matches.push( handleObj );
                        }
                    }
                    if ( matches.length ) {
                        handlerQueue.push({ elem: cur, handlers: matches });
                    }
                }
            }
        }

        // Add the remaining (directly-bound) handlers
        if ( delegateCount < handlers.length ) {
            handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
        }

        return handlerQueue;
    },

    fix: function( event ) {
        if ( event[ jQuery.expando ] ) {
            return event;
        }

        // Create a writable copy of the event object and normalize some properties
        var i, prop, copy,
            type = event.type,
            originalEvent = event,
            fixHook = this.fixHooks[ type ];

        if ( !fixHook ) {
            this.fixHooks[ type ] = fixHook =
                rmouseEvent.test( type ) ? this.mouseHooks :
                rkeyEvent.test( type ) ? this.keyHooks :
                {};
        }
        copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

        event = new jQuery.Event( originalEvent );

        i = copy.length;
        while ( i-- ) {
            prop = copy[ i ];
            event[ prop ] = originalEvent[ prop ];
        }

        // Support: IE<9
        // Fix target property (#1925)
        if ( !event.target ) {
            event.target = originalEvent.srcElement || document;
        }

        // Support: Chrome 23+, Safari?
        // Target should not be a text node (#504, #13143)
        if ( event.target.nodeType === 3 ) {
            event.target = event.target.parentNode;
        }

        // Support: IE<9
        // For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
        event.metaKey = !!event.metaKey;

        return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
    },

    // Includes some event props shared by KeyEvent and MouseEvent
    props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

    fixHooks: {},

    keyHooks: {
        props: "char charCode key keyCode".split(" "),
        filter: function( event, original ) {

            // Add which for key events
            if ( event.which == null ) {
                event.which = original.charCode != null ? original.charCode : original.keyCode;
            }

            return event;
        }
    },

    mouseHooks: {
        props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
        filter: function( event, original ) {
            var body, eventDoc, doc,
                button = original.button,
                fromElement = original.fromElement;

            // Calculate pageX/Y if missing and clientX/Y available
            if ( event.pageX == null && original.clientX != null ) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
            }

            // Add relatedTarget, if necessary
            if ( !event.relatedTarget && fromElement ) {
                event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if ( !event.which && button !== undefined ) {
                event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
            }

            return event;
        }
    },

    special: {
        load: {
            // Prevent triggered image.load events from bubbling to window.load
            noBubble: true
        },
        click: {
            // For checkbox, fire native event so checked state will be right
            trigger: function() {
                if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
                    this.click();
                    return false;
                }
            }
        },
        focus: {
            // Fire native event if possible so blur/focus sequence is correct
            trigger: function() {
                if ( this !== document.activeElement && this.focus ) {
                    try {
                        this.focus();
                        return false;
                    } catch ( e ) {
                        // Support: IE<9
                        // If we error on focus to hidden element (#1486, #12518),
                        // let .trigger() run the handlers
                    }
                }
            },
            delegateType: "focusin"
        },
        blur: {
            trigger: function() {
                if ( this === document.activeElement && this.blur ) {
                    this.blur();
                    return false;
                }
            },
            delegateType: "focusout"
        },

        beforeunload: {
            postDispatch: function( event ) {

                // Even when returnValue equals to undefined Firefox will still show alert
                if ( event.result !== undefined ) {
                    event.originalEvent.returnValue = event.result;
                }
            }
        }
    },

    simulate: function( type, elem, event, bubble ) {
        // Piggyback on a donor event to simulate a different one.
        // Fake originalEvent to avoid donor's stopPropagation, but if the
        // simulated event prevents default then we do the same on the donor.
        var e = jQuery.extend(
            new jQuery.Event(),
            event,
            { type: type,
                isSimulated: true,
                originalEvent: {}
            }
        );
        if ( bubble ) {
            jQuery.event.trigger( e, null, elem );
        } else {
            jQuery.event.dispatch.call( elem, e );
        }
        if ( e.isDefaultPrevented() ) {
            event.preventDefault();
        }
    }
};

jQuery.removeEvent = document.removeEventListener ?
    function( elem, type, handle ) {
        if ( elem.removeEventListener ) {
            elem.removeEventListener( type, handle, false );
        }
    } :
    function( elem, type, handle ) {
        var name = "on" + type;

        if ( elem.detachEvent ) {

            // #8545, #7054, preventing memory leaks for custom events in IE6-8
            // detachEvent needed property on element, by name of that event, to properly expose it to GC
            if ( typeof elem[ name ] === core_strundefined ) {
                elem[ name ] = null;
            }

            elem.detachEvent( name, handle );
        }
    };

jQuery.Event = function( src, props ) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof jQuery.Event) ) {
        return new jQuery.Event( src, props );
    }

    // Event object
    if ( src && src.type ) {
        this.originalEvent = src;
        this.type = src.type;

        // Events bubbling up the document may have been marked as prevented
        // by a handler lower down the tree; reflect the correct value.
        this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
            src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

    // Event type
    } else {
        this.type = src;
    }

    // Put explicitly provided properties onto the event object
    if ( props ) {
        jQuery.extend( this, props );
    }

    // Create a timestamp if incoming event doesn't have one
    this.timeStamp = src && src.timeStamp || jQuery.now();

    // Mark it as fixed
    this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,

    preventDefault: function() {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;
        if ( !e ) {
            return;
        }

        // If preventDefault exists, run it on the original event
        if ( e.preventDefault ) {
            e.preventDefault();

        // Support: IE
        // Otherwise set the returnValue property of the original event to false
        } else {
            e.returnValue = false;
        }
    },
    stopPropagation: function() {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;
        if ( !e ) {
            return;
        }
        // If stopPropagation exists, run it on the original event
        if ( e.stopPropagation ) {
            e.stopPropagation();
        }

        // Support: IE
        // Set the cancelBubble property of the original event to true
        e.cancelBubble = true;
    },
    stopImmediatePropagation: function() {
        this.isImmediatePropagationStopped = returnTrue;
        this.stopPropagation();
    }
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
}, function( orig, fix ) {
    jQuery.event.special[ orig ] = {
        delegateType: fix,
        bindType: fix,

        handle: function( event ) {
            var ret,
                target = this,
                related = event.relatedTarget,
                handleObj = event.handleObj;

            // For mousenter/leave call the handler if related is outside the target.
            // NB: No relatedTarget if the mouse left/entered the browser window
            if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
                event.type = handleObj.origType;
                ret = handleObj.handler.apply( this, arguments );
                event.type = fix;
            }
            return ret;
        }
    };
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

    jQuery.event.special.submit = {
        setup: function() {
            // Only need this for delegated form submit events
            if ( jQuery.nodeName( this, "form" ) ) {
                return false;
            }

            // Lazy-add a submit handler when a descendant form may potentially be submitted
            jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
                // Node name check avoids a VML-related crash in IE (#9807)
                var elem = e.target,
                    form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
                if ( form && !jQuery._data( form, "submitBubbles" ) ) {
                    jQuery.event.add( form, "submit._submit", function( event ) {
                        event._submit_bubble = true;
                    });
                    jQuery._data( form, "submitBubbles", true );
                }
            });
            // return undefined since we don't need an event listener
        },

        postDispatch: function( event ) {
            // If form was submitted by the user, bubble the event up the tree
            if ( event._submit_bubble ) {
                delete event._submit_bubble;
                if ( this.parentNode && !event.isTrigger ) {
                    jQuery.event.simulate( "submit", this.parentNode, event, true );
                }
            }
        },

        teardown: function() {
            // Only need this for delegated form submit events
            if ( jQuery.nodeName( this, "form" ) ) {
                return false;
            }

            // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
            jQuery.event.remove( this, "._submit" );
        }
    };
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

    jQuery.event.special.change = {

        setup: function() {

            if ( rformElems.test( this.nodeName ) ) {
                // IE doesn't fire change on a check/radio until blur; trigger it on click
                // after a propertychange. Eat the blur-change in special.change.handle.
                // This still fires onchange a second time for check/radio after blur.
                if ( this.type === "checkbox" || this.type === "radio" ) {
                    jQuery.event.add( this, "propertychange._change", function( event ) {
                        if ( event.originalEvent.propertyName === "checked" ) {
                            this._just_changed = true;
                        }
                    });
                    jQuery.event.add( this, "click._change", function( event ) {
                        if ( this._just_changed && !event.isTrigger ) {
                            this._just_changed = false;
                        }
                        // Allow triggered, simulated change events (#11500)
                        jQuery.event.simulate( "change", this, event, true );
                    });
                }
                return false;
            }
            // Delegated event; lazy-add a change handler on descendant inputs
            jQuery.event.add( this, "beforeactivate._change", function( e ) {
                var elem = e.target;

                if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
                    jQuery.event.add( elem, "change._change", function( event ) {
                        if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
                            jQuery.event.simulate( "change", this.parentNode, event, true );
                        }
                    });
                    jQuery._data( elem, "changeBubbles", true );
                }
            });
        },

        handle: function( event ) {
            var elem = event.target;

            // Swallow native change events from checkbox/radio, we already triggered them above
            if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
                return event.handleObj.handler.apply( this, arguments );
            }
        },

        teardown: function() {
            jQuery.event.remove( this, "._change" );

            return !rformElems.test( this.nodeName );
        }
    };
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
    jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

        // Attach a single capturing handler while someone wants focusin/focusout
        var attaches = 0,
            handler = function( event ) {
                jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
            };

        jQuery.event.special[ fix ] = {
            setup: function() {
                if ( attaches++ === 0 ) {
                    document.addEventListener( orig, handler, true );
                }
            },
            teardown: function() {
                if ( --attaches === 0 ) {
                    document.removeEventListener( orig, handler, true );
                }
            }
        };
    });
}

jQuery.fn.extend({

    on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
        var type, origFn;

        // Types can be a map of types/handlers
        if ( typeof types === "object" ) {
            // ( types-Object, selector, data )
            if ( typeof selector !== "string" ) {
                // ( types-Object, data )
                data = data || selector;
                selector = undefined;
            }
            for ( type in types ) {
                this.on( type, selector, data, types[ type ], one );
            }
            return this;
        }

        if ( data == null && fn == null ) {
            // ( types, fn )
            fn = selector;
            data = selector = undefined;
        } else if ( fn == null ) {
            if ( typeof selector === "string" ) {
                // ( types, selector, fn )
                fn = data;
                data = undefined;
            } else {
                // ( types, data, fn )
                fn = data;
                data = selector;
                selector = undefined;
            }
        }
        if ( fn === false ) {
            fn = returnFalse;
        } else if ( !fn ) {
            return this;
        }

        if ( one === 1 ) {
            origFn = fn;
            fn = function( event ) {
                // Can use an empty set, since event contains the info
                jQuery().off( event );
                return origFn.apply( this, arguments );
            };
            // Use same guid so caller can remove using origFn
            fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
        }
        return this.each( function() {
            jQuery.event.add( this, types, fn, data, selector );
        });
    },
    one: function( types, selector, data, fn ) {
        return this.on( types, selector, data, fn, 1 );
    },
    off: function( types, selector, fn ) {
        var handleObj, type;
        if ( types && types.preventDefault && types.handleObj ) {
            // ( event )  dispatched jQuery.Event
            handleObj = types.handleObj;
            jQuery( types.delegateTarget ).off(
                handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                handleObj.selector,
                handleObj.handler
            );
            return this;
        }
        if ( typeof types === "object" ) {
            // ( types-object [, selector] )
            for ( type in types ) {
                this.off( type, selector, types[ type ] );
            }
            return this;
        }
        if ( selector === false || typeof selector === "function" ) {
            // ( types [, fn] )
            fn = selector;
            selector = undefined;
        }
        if ( fn === false ) {
            fn = returnFalse;
        }
        return this.each(function() {
            jQuery.event.remove( this, types, fn, selector );
        });
    },

    bind: function( types, data, fn ) {
        return this.on( types, null, data, fn );
    },
    unbind: function( types, fn ) {
        return this.off( types, null, fn );
    },

    delegate: function( selector, types, data, fn ) {
        return this.on( types, selector, data, fn );
    },
    undelegate: function( selector, types, fn ) {
        // ( namespace ) or ( selector, types [, fn] )
        return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
    },

    trigger: function( type, data ) {
        return this.each(function() {
            jQuery.event.trigger( type, data, this );
        });
    },
    triggerHandler: function( type, data ) {
        var elem = this[0];
        if ( elem ) {
            return jQuery.event.trigger( type, data, elem, true );
        }
    }
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var i,
    cachedruns,
    Expr,
    getText,
    isXML,
    compile,
    hasDuplicate,
    outermostContext,

    // Local document vars
    setDocument,
    document,
    docElem,
    documentIsXML,
    rbuggyQSA,
    rbuggyMatches,
    matches,
    contains,
    sortOrder,

    // Instance-specific data
    expando = "sizzle" + -(new Date()),
    preferredDoc = window.document,
    support = {},
    dirruns = 0,
    done = 0,
    classCache = createCache(),
    tokenCache = createCache(),
    compilerCache = createCache(),

    // General-purpose constants
    strundefined = typeof undefined,
    MAX_NEGATIVE = 1 << 31,

    // Array methods
    arr = [],
    pop = arr.pop,
    push = arr.push,
    slice = arr.slice,
    // Use a stripped-down indexOf if we can't use a native one
    indexOf = arr.indexOf || function( elem ) {
        var i = 0,
            len = this.length;
        for ( ; i < len; i++ ) {
            if ( this[i] === elem ) {
                return i;
            }
        }
        return -1;
    },


    // Regular expressions

    // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
    whitespace = "[\\x20\\t\\r\\n\\f]",
    // http://www.w3.org/TR/css3-syntax/#characters
    characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

    // Loosely modeled on CSS identifier characters
    // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
    // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
    identifier = characterEncoding.replace( "w", "w#" ),

    // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
    operators = "([*^$|!~]?=)",
    attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
        "*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

    // Prefer arguments quoted,
    //   then not containing pseudos/brackets,
    //   then attribute selectors/non-parenthetical expressions,
    //   then anything else
    // These preferences are here to reduce the number of selectors
    //   needing tokenize in the PSEUDO preFilter
    pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

    // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
    rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

    rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
    rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
    rpseudo = new RegExp( pseudos ),
    ridentifier = new RegExp( "^" + identifier + "$" ),

    matchExpr = {
        "ID": new RegExp( "^#(" + characterEncoding + ")" ),
        "CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
        "NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
        "TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
        "ATTR": new RegExp( "^" + attributes ),
        "PSEUDO": new RegExp( "^" + pseudos ),
        "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
            "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
            "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
        // For use in libraries implementing .is()
        // We use this for POS matching in `select`
        "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
            whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
    },

    rsibling = /[\x20\t\r\n\f]*[+~]/,

    rnative = /^[^{]+\{\s*\[native code/,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    rinputs = /^(?:input|select|textarea|button)$/i,
    rheader = /^h\d$/i,

    rescape = /'|\\/g,
    rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
    funescape = function( _, escaped ) {
        var high = "0x" + escaped - 0x10000;
        // NaN means non-codepoint
        return high !== high ?
            escaped :
            // BMP codepoint
            high < 0 ?
                String.fromCharCode( high + 0x10000 ) :
                // Supplemental Plane codepoint (surrogate pair)
                String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
    };

// Use a stripped-down slice if we can't use a native one
try {
    slice.call( preferredDoc.documentElement.childNodes, 0 )[0].nodeType;
} catch ( e ) {
    slice = function( i ) {
        var elem,
            results = [];
        while ( (elem = this[i++]) ) {
            results.push( elem );
        }
        return results;
    };
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
    return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *  property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *  deleting the oldest entry
 */
function createCache() {
    var cache,
        keys = [];

    return (cache = function( key, value ) {
        // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
        if ( keys.push( key += " " ) > Expr.cacheLength ) {
            // Only keep the most recent entries
            delete cache[ keys.shift() ];
        }
        return (cache[ key ] = value);
    });
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
    fn[ expando ] = true;
    return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
    var div = document.createElement("div");

    try {
        return fn( div );
    } catch (e) {
        return false;
    } finally {
        // release memory in IE
        div = null;
    }
}

function Sizzle( selector, context, results, seed ) {
    var match, elem, m, nodeType,
        // QSA vars
        i, groups, old, nid, newContext, newSelector;

    if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
        setDocument( context );
    }

    context = context || document;
    results = results || [];

    if ( !selector || typeof selector !== "string" ) {
        return results;
    }

    if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
        return [];
    }

    if ( !documentIsXML && !seed ) {

        // Shortcuts
        if ( (match = rquickExpr.exec( selector )) ) {
            // Speed-up: Sizzle("#ID")
            if ( (m = match[1]) ) {
                if ( nodeType === 9 ) {
                    elem = context.getElementById( m );
                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    if ( elem && elem.parentNode ) {
                        // Handle the case where IE, Opera, and Webkit return items
                        // by name instead of ID
                        if ( elem.id === m ) {
                            results.push( elem );
                            return results;
                        }
                    } else {
                        return results;
                    }
                } else {
                    // Context is not a document
                    if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
                        contains( context, elem ) && elem.id === m ) {
                        results.push( elem );
                        return results;
                    }
                }

            // Speed-up: Sizzle("TAG")
            } else if ( match[2] ) {
                push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
                return results;

            // Speed-up: Sizzle(".CLASS")
            } else if ( (m = match[3]) && support.getByClassName && context.getElementsByClassName ) {
                push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
                return results;
            }
        }

        // QSA path
        if ( support.qsa && !rbuggyQSA.test(selector) ) {
            old = true;
            nid = expando;
            newContext = context;
            newSelector = nodeType === 9 && selector;

            // qSA works strangely on Element-rooted queries
            // We can work around this by specifying an extra ID on the root
            // and working up from there (Thanks to Andrew Dupont for the technique)
            // IE 8 doesn't work on object elements
            if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
                groups = tokenize( selector );

                if ( (old = context.getAttribute("id")) ) {
                    nid = old.replace( rescape, "\\$&" );
                } else {
                    context.setAttribute( "id", nid );
                }
                nid = "[id='" + nid + "'] ";

                i = groups.length;
                while ( i-- ) {
                    groups[i] = nid + toSelector( groups[i] );
                }
                newContext = rsibling.test( selector ) && context.parentNode || context;
                newSelector = groups.join(",");
            }

            if ( newSelector ) {
                try {
                    push.apply( results, slice.call( newContext.querySelectorAll(
                        newSelector
                    ), 0 ) );
                    return results;
                } catch(qsaError) {
                } finally {
                    if ( !old ) {
                        context.removeAttribute("id");
                    }
                }
            }
        }
    }

    // All others
    return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
    // documentElement is verified for cases where it doesn't yet exist
    // (such as loading iframes in IE - #4833)
    var documentElement = elem && (elem.ownerDocument || elem).documentElement;
    return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
    var doc = node ? node.ownerDocument || node : preferredDoc;

    // If no document and documentElement is available, return
    if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
        return document;
    }

    // Set our document
    document = doc;
    docElem = doc.documentElement;

    // Support tests
    documentIsXML = isXML( doc );

    // Check if getElementsByTagName("*") returns only elements
    support.tagNameNoComments = assert(function( div ) {
        div.appendChild( doc.createComment("") );
        return !div.getElementsByTagName("*").length;
    });

    // Check if attributes should be retrieved by attribute nodes
    support.attributes = assert(function( div ) {
        div.innerHTML = "<select></select>";
        var type = typeof div.lastChild.getAttribute("multiple");
        // IE8 returns a string for some attributes even when not present
        return type !== "boolean" && type !== "string";
    });

    // Check if getElementsByClassName can be trusted
    support.getByClassName = assert(function( div ) {
        // Opera can't find a second classname (in 9.6)
        div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
        if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
            return false;
        }

        // Safari 3.2 caches class attributes and doesn't catch changes
        div.lastChild.className = "e";
        return div.getElementsByClassName("e").length === 2;
    });

    // Check if getElementById returns elements by name
    // Check if getElementsByName privileges form controls or returns elements by ID
    support.getByName = assert(function( div ) {
        // Inject content
        div.id = expando + 0;
        div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
        docElem.insertBefore( div, docElem.firstChild );

        // Test
        var pass = doc.getElementsByName &&
            // buggy browsers will return fewer than the correct 2
            doc.getElementsByName( expando ).length === 2 +
            // buggy browsers will return more than the correct 0
            doc.getElementsByName( expando + 0 ).length;
        support.getIdNotName = !doc.getElementById( expando );

        // Cleanup
        docElem.removeChild( div );

        return pass;
    });

    // IE6/7 return modified attributes
    Expr.attrHandle = assert(function( div ) {
        div.innerHTML = "<a href='#'></a>";
        return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
            div.firstChild.getAttribute("href") === "#";
    }) ?
        {} :
        {
            "href": function( elem ) {
                return elem.getAttribute( "href", 2 );
            },
            "type": function( elem ) {
                return elem.getAttribute("type");
            }
        };

    // ID find and filter
    if ( support.getIdNotName ) {
        Expr.find["ID"] = function( id, context ) {
            if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
                var m = context.getElementById( id );
                // Check parentNode to catch when Blackberry 4.6 returns
                // nodes that are no longer in the document #6963
                return m && m.parentNode ? [m] : [];
            }
        };
        Expr.filter["ID"] = function( id ) {
            var attrId = id.replace( runescape, funescape );
            return function( elem ) {
                return elem.getAttribute("id") === attrId;
            };
        };
    } else {
        Expr.find["ID"] = function( id, context ) {
            if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
                var m = context.getElementById( id );

                return m ?
                    m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
                        [m] :
                        undefined :
                    [];
            }
        };
        Expr.filter["ID"] =  function( id ) {
            var attrId = id.replace( runescape, funescape );
            return function( elem ) {
                var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                return node && node.value === attrId;
            };
        };
    }

    // Tag
    Expr.find["TAG"] = support.tagNameNoComments ?
        function( tag, context ) {
            if ( typeof context.getElementsByTagName !== strundefined ) {
                return context.getElementsByTagName( tag );
            }
        } :
        function( tag, context ) {
            var elem,
                tmp = [],
                i = 0,
                results = context.getElementsByTagName( tag );

            // Filter out possible comments
            if ( tag === "*" ) {
                while ( (elem = results[i++]) ) {
                    if ( elem.nodeType === 1 ) {
                        tmp.push( elem );
                    }
                }

                return tmp;
            }
            return results;
        };

    // Name
    Expr.find["NAME"] = support.getByName && function( tag, context ) {
        if ( typeof context.getElementsByName !== strundefined ) {
            return context.getElementsByName( name );
        }
    };

    // Class
    Expr.find["CLASS"] = support.getByClassName && function( className, context ) {
        if ( typeof context.getElementsByClassName !== strundefined && !documentIsXML ) {
            return context.getElementsByClassName( className );
        }
    };

    // QSA and matchesSelector support

    // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
    rbuggyMatches = [];

    // qSa(:focus) reports false when true (Chrome 21),
    // no need to also add to buggyMatches since matches checks buggyQSA
    // A support test would require too much code (would include document ready)
    rbuggyQSA = [ ":focus" ];

    if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
        // Build QSA regex
        // Regex strategy adopted from Diego Perini
        assert(function( div ) {
            // Select is set to empty string on purpose
            // This is to test IE's treatment of not explictly
            // setting a boolean content attribute,
            // since its presence should be enough
            // http://bugs.jquery.com/ticket/12359
            div.innerHTML = "<select><option selected=''></option></select>";

            // IE8 - Some boolean attributes are not treated correctly
            if ( !div.querySelectorAll("[selected]").length ) {
                rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
            }

            // Webkit/Opera - :checked should return selected option elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
            // IE8 throws error here and will not see later tests
            if ( !div.querySelectorAll(":checked").length ) {
                rbuggyQSA.push(":checked");
            }
        });

        assert(function( div ) {

            // Opera 10-12/IE8 - ^= $= *= and empty values
            // Should not select anything
            div.innerHTML = "<input type='hidden' i=''/>";
            if ( div.querySelectorAll("[i^='']").length ) {
                rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
            }

            // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
            // IE8 throws error here and will not see later tests
            if ( !div.querySelectorAll(":enabled").length ) {
                rbuggyQSA.push( ":enabled", ":disabled" );
            }

            // Opera 10-11 does not throw on post-comma invalid pseudos
            div.querySelectorAll("*,:x");
            rbuggyQSA.push(",.*:");
        });
    }

    if ( (support.matchesSelector = isNative( (matches = docElem.matchesSelector ||
        docElem.mozMatchesSelector ||
        docElem.webkitMatchesSelector ||
        docElem.oMatchesSelector ||
        docElem.msMatchesSelector) )) ) {

        assert(function( div ) {
            // Check to see if it's possible to do matchesSelector
            // on a disconnected node (IE 9)
            support.disconnectedMatch = matches.call( div, "div" );

            // This should fail with an exception
            // Gecko does not error, returns false instead
            matches.call( div, "[s!='']:x" );
            rbuggyMatches.push( "!=", pseudos );
        });
    }

    rbuggyQSA = new RegExp( rbuggyQSA.join("|") );
    rbuggyMatches = new RegExp( rbuggyMatches.join("|") );

    // Element contains another
    // Purposefully does not implement inclusive descendent
    // As in, an element does not contain itself
    contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
        function( a, b ) {
            var adown = a.nodeType === 9 ? a.documentElement : a,
                bup = b && b.parentNode;
            return a === bup || !!( bup && bup.nodeType === 1 && (
                adown.contains ?
                    adown.contains( bup ) :
                    a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
            ));
        } :
        function( a, b ) {
            if ( b ) {
                while ( (b = b.parentNode) ) {
                    if ( b === a ) {
                        return true;
                    }
                }
            }
            return false;
        };

    // Document order sorting
    sortOrder = docElem.compareDocumentPosition ?
    function( a, b ) {
        var compare;

        if ( a === b ) {
            hasDuplicate = true;
            return 0;
        }

        if ( (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b )) ) {
            if ( compare & 1 || a.parentNode && a.parentNode.nodeType === 11 ) {
                if ( a === doc || contains( preferredDoc, a ) ) {
                    return -1;
                }
                if ( b === doc || contains( preferredDoc, b ) ) {
                    return 1;
                }
                return 0;
            }
            return compare & 4 ? -1 : 1;
        }

        return a.compareDocumentPosition ? -1 : 1;
    } :
    function( a, b ) {
        var cur,
            i = 0,
            aup = a.parentNode,
            bup = b.parentNode,
            ap = [ a ],
            bp = [ b ];

        // Exit early if the nodes are identical
        if ( a === b ) {
            hasDuplicate = true;
            return 0;

        // Parentless nodes are either documents or disconnected
        } else if ( !aup || !bup ) {
            return a === doc ? -1 :
                b === doc ? 1 :
                aup ? -1 :
                bup ? 1 :
                0;

        // If the nodes are siblings, we can do a quick check
        } else if ( aup === bup ) {
            return siblingCheck( a, b );
        }

        // Otherwise we need full lists of their ancestors for comparison
        cur = a;
        while ( (cur = cur.parentNode) ) {
            ap.unshift( cur );
        }
        cur = b;
        while ( (cur = cur.parentNode) ) {
            bp.unshift( cur );
        }

        // Walk down the tree looking for a discrepancy
        while ( ap[i] === bp[i] ) {
            i++;
        }

        return i ?
            // Do a sibling check if the nodes have a common ancestor
            siblingCheck( ap[i], bp[i] ) :

            // Otherwise nodes in our document sort first
            ap[i] === preferredDoc ? -1 :
            bp[i] === preferredDoc ? 1 :
            0;
    };

    // Always assume the presence of duplicates if sort doesn't
    // pass them to our comparison function (as in Google Chrome).
    hasDuplicate = false;
    [0, 0].sort( sortOrder );
    support.detectDuplicates = hasDuplicate;

    return document;
};

Sizzle.matches = function( expr, elements ) {
    return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
    // Set document vars if needed
    if ( ( elem.ownerDocument || elem ) !== document ) {
        setDocument( elem );
    }

    // Make sure that attribute selectors are quoted
    expr = expr.replace( rattributeQuotes, "='$1']" );

    // rbuggyQSA always contains :focus, so no need for an existence check
    if ( support.matchesSelector && !documentIsXML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && !rbuggyQSA.test(expr) ) {
        try {
            var ret = matches.call( elem, expr );

            // IE 9's matchesSelector returns false on disconnected nodes
            if ( ret || support.disconnectedMatch ||
                    // As well, disconnected nodes are said to be in a document
                    // fragment in IE 9
                    elem.document && elem.document.nodeType !== 11 ) {
                return ret;
            }
        } catch(e) {}
    }

    return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
    // Set document vars if needed
    if ( ( context.ownerDocument || context ) !== document ) {
        setDocument( context );
    }
    return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
    var val;

    // Set document vars if needed
    if ( ( elem.ownerDocument || elem ) !== document ) {
        setDocument( elem );
    }

    if ( !documentIsXML ) {
        name = name.toLowerCase();
    }
    if ( (val = Expr.attrHandle[ name ]) ) {
        return val( elem );
    }
    if ( documentIsXML || support.attributes ) {
        return elem.getAttribute( name );
    }
    return ( (val = elem.getAttributeNode( name )) || elem.getAttribute( name ) ) && elem[ name ] === true ?
        name :
        val && val.specified ? val.value : null;
};

Sizzle.error = function( msg ) {
    throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
    var elem,
        duplicates = [],
        i = 1,
        j = 0;

    // Unless we *know* we can detect duplicates, assume their presence
    hasDuplicate = !support.detectDuplicates;
    results.sort( sortOrder );

    if ( hasDuplicate ) {
        for ( ; (elem = results[i]); i++ ) {
            if ( elem === results[ i - 1 ] ) {
                j = duplicates.push( i );
            }
        }
        while ( j-- ) {
            results.splice( duplicates[ j ], 1 );
        }
    }

    return results;
};

function siblingCheck( a, b ) {
    var cur = b && a,
        diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

    // Use IE sourceIndex if available on both nodes
    if ( diff ) {
        return diff;
    }

    // Check if b follows a
    if ( cur ) {
        while ( (cur = cur.nextSibling) ) {
            if ( cur === b ) {
                return -1;
            }
        }
    }

    return a ? 1 : -1;
}

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
    return function( elem ) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && elem.type === type;
    };
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
    return function( elem ) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && elem.type === type;
    };
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
    return markFunction(function( argument ) {
        argument = +argument;
        return markFunction(function( seed, matches ) {
            var j,
                matchIndexes = fn( [], seed.length, argument ),
                i = matchIndexes.length;

            // Match elements found at the specified indexes
            while ( i-- ) {
                if ( seed[ (j = matchIndexes[i]) ] ) {
                    seed[j] = !(matches[j] = seed[j]);
                }
            }
        });
    });
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
    var node,
        ret = "",
        i = 0,
        nodeType = elem.nodeType;

    if ( !nodeType ) {
        // If no nodeType, this is expected to be an array
        for ( ; (node = elem[i]); i++ ) {
            // Do not traverse comment nodes
            ret += getText( node );
        }
    } else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (see #11153)
        if ( typeof elem.textContent === "string" ) {
            return elem.textContent;
        } else {
            // Traverse its children
            for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                ret += getText( elem );
            }
        }
    } else if ( nodeType === 3 || nodeType === 4 ) {
        return elem.nodeValue;
    }
    // Do not include comment or processing instruction nodes

    return ret;
};

Expr = Sizzle.selectors = {

    // Can be adjusted by the user
    cacheLength: 50,

    createPseudo: markFunction,

    match: matchExpr,

    find: {},

    relative: {
        ">": { dir: "parentNode", first: true },
        " ": { dir: "parentNode" },
        "+": { dir: "previousSibling", first: true },
        "~": { dir: "previousSibling" }
    },

    preFilter: {
        "ATTR": function( match ) {
            match[1] = match[1].replace( runescape, funescape );

            // Move the given value to match[3] whether quoted or unquoted
            match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

            if ( match[2] === "~=" ) {
                match[3] = " " + match[3] + " ";
            }

            return match.slice( 0, 4 );
        },

        "CHILD": function( match ) {
            /* matches from matchExpr["CHILD"]
                1 type (only|nth|...)
                2 what (child|of-type)
                3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
                4 xn-component of xn+y argument ([+-]?\d*n|)
                5 sign of xn-component
                6 x of xn-component
                7 sign of y-component
                8 y of y-component
            */
            match[1] = match[1].toLowerCase();

            if ( match[1].slice( 0, 3 ) === "nth" ) {
                // nth-* requires argument
                if ( !match[3] ) {
                    Sizzle.error( match[0] );
                }

                // numeric x and y parameters for Expr.filter.CHILD
                // remember that false/true cast respectively to 0/1
                match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
                match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

            // other types prohibit arguments
            } else if ( match[3] ) {
                Sizzle.error( match[0] );
            }

            return match;
        },

        "PSEUDO": function( match ) {
            var excess,
                unquoted = !match[5] && match[2];

            if ( matchExpr["CHILD"].test( match[0] ) ) {
                return null;
            }

            // Accept quoted arguments as-is
            if ( match[4] ) {
                match[2] = match[4];

            // Strip excess characters from unquoted arguments
            } else if ( unquoted && rpseudo.test( unquoted ) &&
                // Get excess from tokenize (recursively)
                (excess = tokenize( unquoted, true )) &&
                // advance to the next closing parenthesis
                (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

                // excess is a negative index
                match[0] = match[0].slice( 0, excess );
                match[2] = unquoted.slice( 0, excess );
            }

            // Return only captures needed by the pseudo filter method (type and argument)
            return match.slice( 0, 3 );
        }
    },

    filter: {

        "TAG": function( nodeName ) {
            if ( nodeName === "*" ) {
                return function() { return true; };
            }

            nodeName = nodeName.replace( runescape, funescape ).toLowerCase();
            return function( elem ) {
                return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
            };
        },

        "CLASS": function( className ) {
            var pattern = classCache[ className + " " ];

            return pattern ||
                (pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
                classCache( className, function( elem ) {
                    return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
                });
        },

        "ATTR": function( name, operator, check ) {
            return function( elem ) {
                var result = Sizzle.attr( elem, name );

                if ( result == null ) {
                    return operator === "!=";
                }
                if ( !operator ) {
                    return true;
                }

                result += "";

                return operator === "=" ? result === check :
                    operator === "!=" ? result !== check :
                    operator === "^=" ? check && result.indexOf( check ) === 0 :
                    operator === "*=" ? check && result.indexOf( check ) > -1 :
                    operator === "$=" ? check && result.slice( -check.length ) === check :
                    operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
                    operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
                    false;
            };
        },

        "CHILD": function( type, what, argument, first, last ) {
            var simple = type.slice( 0, 3 ) !== "nth",
                forward = type.slice( -4 ) !== "last",
                ofType = what === "of-type";

            return first === 1 && last === 0 ?

                // Shortcut for :nth-*(n)
                function( elem ) {
                    return !!elem.parentNode;
                } :

                function( elem, context, xml ) {
                    var cache, outerCache, node, diff, nodeIndex, start,
                        dir = simple !== forward ? "nextSibling" : "previousSibling",
                        parent = elem.parentNode,
                        name = ofType && elem.nodeName.toLowerCase(),
                        useCache = !xml && !ofType;

                    if ( parent ) {

                        // :(first|last|only)-(child|of-type)
                        if ( simple ) {
                            while ( dir ) {
                                node = elem;
                                while ( (node = node[ dir ]) ) {
                                    if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
                                        return false;
                                    }
                                }
                                // Reverse direction for :only-* (if we haven't yet done so)
                                start = dir = type === "only" && !start && "nextSibling";
                            }
                            return true;
                        }

                        start = [ forward ? parent.firstChild : parent.lastChild ];

                        // non-xml :nth-child(...) stores cache data on `parent`
                        if ( forward && useCache ) {
                            // Seek `elem` from a previously-cached index
                            outerCache = parent[ expando ] || (parent[ expando ] = {});
                            cache = outerCache[ type ] || [];
                            nodeIndex = cache[0] === dirruns && cache[1];
                            diff = cache[0] === dirruns && cache[2];
                            node = nodeIndex && parent.childNodes[ nodeIndex ];

                            while ( (node = ++nodeIndex && node && node[ dir ] ||

                                // Fallback to seeking `elem` from the start
                                (diff = nodeIndex = 0) || start.pop()) ) {

                                // When found, cache indexes on `parent` and break
                                if ( node.nodeType === 1 && ++diff && node === elem ) {
                                    outerCache[ type ] = [ dirruns, nodeIndex, diff ];
                                    break;
                                }
                            }

                        // Use previously-cached element index if available
                        } else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
                            diff = cache[1];

                        // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
                        } else {
                            // Use the same loop as above to seek `elem` from the start
                            while ( (node = ++nodeIndex && node && node[ dir ] ||
                                (diff = nodeIndex = 0) || start.pop()) ) {

                                if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
                                    // Cache the index of each encountered element
                                    if ( useCache ) {
                                        (node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
                                    }

                                    if ( node === elem ) {
                                        break;
                                    }
                                }
                            }
                        }

                        // Incorporate the offset, then check against cycle size
                        diff -= last;
                        return diff === first || ( diff % first === 0 && diff / first >= 0 );
                    }
                };
        },

        "PSEUDO": function( pseudo, argument ) {
            // pseudo-class names are case-insensitive
            // http://www.w3.org/TR/selectors/#pseudo-classes
            // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
            // Remember that setFilters inherits from pseudos
            var args,
                fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
                    Sizzle.error( "unsupported pseudo: " + pseudo );

            // The user may use createPseudo to indicate that
            // arguments are needed to create the filter function
            // just as Sizzle does
            if ( fn[ expando ] ) {
                return fn( argument );
            }

            // But maintain support for old signatures
            if ( fn.length > 1 ) {
                args = [ pseudo, pseudo, "", argument ];
                return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
                    markFunction(function( seed, matches ) {
                        var idx,
                            matched = fn( seed, argument ),
                            i = matched.length;
                        while ( i-- ) {
                            idx = indexOf.call( seed, matched[i] );
                            seed[ idx ] = !( matches[ idx ] = matched[i] );
                        }
                    }) :
                    function( elem ) {
                        return fn( elem, 0, args );
                    };
            }

            return fn;
        }
    },

    pseudos: {
        // Potentially complex pseudos
        "not": markFunction(function( selector ) {
            // Trim the selector passed to compile
            // to avoid treating leading and trailing
            // spaces as combinators
            var input = [],
                results = [],
                matcher = compile( selector.replace( rtrim, "$1" ) );

            return matcher[ expando ] ?
                markFunction(function( seed, matches, context, xml ) {
                    var elem,
                        unmatched = matcher( seed, null, xml, [] ),
                        i = seed.length;

                    // Match elements unmatched by `matcher`
                    while ( i-- ) {
                        if ( (elem = unmatched[i]) ) {
                            seed[i] = !(matches[i] = elem);
                        }
                    }
                }) :
                function( elem, context, xml ) {
                    input[0] = elem;
                    matcher( input, null, xml, results );
                    return !results.pop();
                };
        }),

        "has": markFunction(function( selector ) {
            return function( elem ) {
                return Sizzle( selector, elem ).length > 0;
            };
        }),

        "contains": markFunction(function( text ) {
            return function( elem ) {
                return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
            };
        }),

        // "Whether an element is represented by a :lang() selector
        // is based solely on the element's language value
        // being equal to the identifier C,
        // or beginning with the identifier C immediately followed by "-".
        // The matching of C against the element's language value is performed case-insensitively.
        // The identifier C does not have to be a valid language name."
        // http://www.w3.org/TR/selectors/#lang-pseudo
        "lang": markFunction( function( lang ) {
            // lang value must be a valid identifider
            if ( !ridentifier.test(lang || "") ) {
                Sizzle.error( "unsupported lang: " + lang );
            }
            lang = lang.replace( runescape, funescape ).toLowerCase();
            return function( elem ) {
                var elemLang;
                do {
                    if ( (elemLang = documentIsXML ?
                        elem.getAttribute("xml:lang") || elem.getAttribute("lang") :
                        elem.lang) ) {

                        elemLang = elemLang.toLowerCase();
                        return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
                    }
                } while ( (elem = elem.parentNode) && elem.nodeType === 1 );
                return false;
            };
        }),

        // Miscellaneous
        "target": function( elem ) {
            var hash = window.location && window.location.hash;
            return hash && hash.slice( 1 ) === elem.id;
        },

        "root": function( elem ) {
            return elem === docElem;
        },

        "focus": function( elem ) {
            return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
        },

        // Boolean properties
        "enabled": function( elem ) {
            return elem.disabled === false;
        },

        "disabled": function( elem ) {
            return elem.disabled === true;
        },

        "checked": function( elem ) {
            // In CSS3, :checked should return both checked and selected elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
            var nodeName = elem.nodeName.toLowerCase();
            return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
        },

        "selected": function( elem ) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if ( elem.parentNode ) {
                elem.parentNode.selectedIndex;
            }

            return elem.selected === true;
        },

        // Contents
        "empty": function( elem ) {
            // http://www.w3.org/TR/selectors/#empty-pseudo
            // :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
            //   not comment, processing instructions, or others
            // Thanks to Diego Perini for the nodeName shortcut
            //   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
            for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
                    return false;
                }
            }
            return true;
        },

        "parent": function( elem ) {
            return !Expr.pseudos["empty"]( elem );
        },

        // Element/input types
        "header": function( elem ) {
            return rheader.test( elem.nodeName );
        },

        "input": function( elem ) {
            return rinputs.test( elem.nodeName );
        },

        "button": function( elem ) {
            var name = elem.nodeName.toLowerCase();
            return name === "input" && elem.type === "button" || name === "button";
        },

        "text": function( elem ) {
            var attr;
            // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
            // use getAttribute instead to test this case
            return elem.nodeName.toLowerCase() === "input" &&
                elem.type === "text" &&
                ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
        },

        // Position-in-collection
        "first": createPositionalPseudo(function() {
            return [ 0 ];
        }),

        "last": createPositionalPseudo(function( matchIndexes, length ) {
            return [ length - 1 ];
        }),

        "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
            return [ argument < 0 ? argument + length : argument ];
        }),

        "even": createPositionalPseudo(function( matchIndexes, length ) {
            var i = 0;
            for ( ; i < length; i += 2 ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        }),

        "odd": createPositionalPseudo(function( matchIndexes, length ) {
            var i = 1;
            for ( ; i < length; i += 2 ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        }),

        "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
            var i = argument < 0 ? argument + length : argument;
            for ( ; --i >= 0; ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        }),

        "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
            var i = argument < 0 ? argument + length : argument;
            for ( ; ++i < length; ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        })
    }
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
    Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
    Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
    var matched, match, tokens, type,
        soFar, groups, preFilters,
        cached = tokenCache[ selector + " " ];

    if ( cached ) {
        return parseOnly ? 0 : cached.slice( 0 );
    }

    soFar = selector;
    groups = [];
    preFilters = Expr.preFilter;

    while ( soFar ) {

        // Comma and first run
        if ( !matched || (match = rcomma.exec( soFar )) ) {
            if ( match ) {
                // Don't consume trailing commas as valid
                soFar = soFar.slice( match[0].length ) || soFar;
            }
            groups.push( tokens = [] );
        }

        matched = false;

        // Combinators
        if ( (match = rcombinators.exec( soFar )) ) {
            matched = match.shift();
            tokens.push( {
                value: matched,
                // Cast descendant combinators to space
                type: match[0].replace( rtrim, " " )
            } );
            soFar = soFar.slice( matched.length );
        }

        // Filters
        for ( type in Expr.filter ) {
            if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
                (match = preFilters[ type ]( match ))) ) {
                matched = match.shift();
                tokens.push( {
                    value: matched,
                    type: type,
                    matches: match
                } );
                soFar = soFar.slice( matched.length );
            }
        }

        if ( !matched ) {
            break;
        }
    }

    // Return the length of the invalid excess
    // if we're just parsing
    // Otherwise, throw an error or return tokens
    return parseOnly ?
        soFar.length :
        soFar ?
            Sizzle.error( selector ) :
            // Cache the tokens
            tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
    var i = 0,
        len = tokens.length,
        selector = "";
    for ( ; i < len; i++ ) {
        selector += tokens[i].value;
    }
    return selector;
}

function addCombinator( matcher, combinator, base ) {
    var dir = combinator.dir,
        checkNonElements = base && dir === "parentNode",
        doneName = done++;

    return combinator.first ?
        // Check against closest ancestor/preceding element
        function( elem, context, xml ) {
            while ( (elem = elem[ dir ]) ) {
                if ( elem.nodeType === 1 || checkNonElements ) {
                    return matcher( elem, context, xml );
                }
            }
        } :

        // Check against all ancestor/preceding elements
        function( elem, context, xml ) {
            var data, cache, outerCache,
                dirkey = dirruns + " " + doneName;

            // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
            if ( xml ) {
                while ( (elem = elem[ dir ]) ) {
                    if ( elem.nodeType === 1 || checkNonElements ) {
                        if ( matcher( elem, context, xml ) ) {
                            return true;
                        }
                    }
                }
            } else {
                while ( (elem = elem[ dir ]) ) {
                    if ( elem.nodeType === 1 || checkNonElements ) {
                        outerCache = elem[ expando ] || (elem[ expando ] = {});
                        if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
                            if ( (data = cache[1]) === true || data === cachedruns ) {
                                return data === true;
                            }
                        } else {
                            cache = outerCache[ dir ] = [ dirkey ];
                            cache[1] = matcher( elem, context, xml ) || cachedruns;
                            if ( cache[1] === true ) {
                                return true;
                            }
                        }
                    }
                }
            }
        };
}

function elementMatcher( matchers ) {
    return matchers.length > 1 ?
        function( elem, context, xml ) {
            var i = matchers.length;
            while ( i-- ) {
                if ( !matchers[i]( elem, context, xml ) ) {
                    return false;
                }
            }
            return true;
        } :
        matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
    var elem,
        newUnmatched = [],
        i = 0,
        len = unmatched.length,
        mapped = map != null;

    for ( ; i < len; i++ ) {
        if ( (elem = unmatched[i]) ) {
            if ( !filter || filter( elem, context, xml ) ) {
                newUnmatched.push( elem );
                if ( mapped ) {
                    map.push( i );
                }
            }
        }
    }

    return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
    if ( postFilter && !postFilter[ expando ] ) {
        postFilter = setMatcher( postFilter );
    }
    if ( postFinder && !postFinder[ expando ] ) {
        postFinder = setMatcher( postFinder, postSelector );
    }
    return markFunction(function( seed, results, context, xml ) {
        var temp, i, elem,
            preMap = [],
            postMap = [],
            preexisting = results.length,

            // Get initial elements from seed or context
            elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

            // Prefilter to get matcher input, preserving a map for seed-results synchronization
            matcherIn = preFilter && ( seed || !selector ) ?
                condense( elems, preMap, preFilter, context, xml ) :
                elems,

            matcherOut = matcher ?
                // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

                    // ...intermediate processing is necessary
                    [] :

                    // ...otherwise use results directly
                    results :
                matcherIn;

        // Find primary matches
        if ( matcher ) {
            matcher( matcherIn, matcherOut, context, xml );
        }

        // Apply postFilter
        if ( postFilter ) {
            temp = condense( matcherOut, postMap );
            postFilter( temp, [], context, xml );

            // Un-match failing elements by moving them back to matcherIn
            i = temp.length;
            while ( i-- ) {
                if ( (elem = temp[i]) ) {
                    matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
                }
            }
        }

        if ( seed ) {
            if ( postFinder || preFilter ) {
                if ( postFinder ) {
                    // Get the final matcherOut by condensing this intermediate into postFinder contexts
                    temp = [];
                    i = matcherOut.length;
                    while ( i-- ) {
                        if ( (elem = matcherOut[i]) ) {
                            // Restore matcherIn since elem is not yet a final match
                            temp.push( (matcherIn[i] = elem) );
                        }
                    }
                    postFinder( null, (matcherOut = []), temp, xml );
                }

                // Move matched elements from seed to results to keep them synchronized
                i = matcherOut.length;
                while ( i-- ) {
                    if ( (elem = matcherOut[i]) &&
                        (temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

                        seed[temp] = !(results[temp] = elem);
                    }
                }
            }

        // Add elements to results, through postFinder if defined
        } else {
            matcherOut = condense(
                matcherOut === results ?
                    matcherOut.splice( preexisting, matcherOut.length ) :
                    matcherOut
            );
            if ( postFinder ) {
                postFinder( null, results, matcherOut, xml );
            } else {
                push.apply( results, matcherOut );
            }
        }
    });
}

function matcherFromTokens( tokens ) {
    var checkContext, matcher, j,
        len = tokens.length,
        leadingRelative = Expr.relative[ tokens[0].type ],
        implicitRelative = leadingRelative || Expr.relative[" "],
        i = leadingRelative ? 1 : 0,

        // The foundational matcher ensures that elements are reachable from top-level context(s)
        matchContext = addCombinator( function( elem ) {
            return elem === checkContext;
        }, implicitRelative, true ),
        matchAnyContext = addCombinator( function( elem ) {
            return indexOf.call( checkContext, elem ) > -1;
        }, implicitRelative, true ),
        matchers = [ function( elem, context, xml ) {
            return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
                (checkContext = context).nodeType ?
                    matchContext( elem, context, xml ) :
                    matchAnyContext( elem, context, xml ) );
        } ];

    for ( ; i < len; i++ ) {
        if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
            matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
        } else {
            matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

            // Return special upon seeing a positional matcher
            if ( matcher[ expando ] ) {
                // Find the next relative operator (if any) for proper handling
                j = ++i;
                for ( ; j < len; j++ ) {
                    if ( Expr.relative[ tokens[j].type ] ) {
                        break;
                    }
                }
                return setMatcher(
                    i > 1 && elementMatcher( matchers ),
                    i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),
                    matcher,
                    i < j && matcherFromTokens( tokens.slice( i, j ) ),
                    j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
                    j < len && toSelector( tokens )
                );
            }
            matchers.push( matcher );
        }
    }

    return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
    // A counter to specify which element is currently being matched
    var matcherCachedRuns = 0,
        bySet = setMatchers.length > 0,
        byElement = elementMatchers.length > 0,
        superMatcher = function( seed, context, xml, results, expandContext ) {
            var elem, j, matcher,
                setMatched = [],
                matchedCount = 0,
                i = "0",
                unmatched = seed && [],
                outermost = expandContext != null,
                contextBackup = outermostContext,
                // We must always have either seed elements or context
                elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
                // Use integer dirruns iff this is the outermost matcher
                dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

            if ( outermost ) {
                outermostContext = context !== document && context;
                cachedruns = matcherCachedRuns;
            }

            // Add elements passing elementMatchers directly to results
            // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
            for ( ; (elem = elems[i]) != null; i++ ) {
                if ( byElement && elem ) {
                    j = 0;
                    while ( (matcher = elementMatchers[j++]) ) {
                        if ( matcher( elem, context, xml ) ) {
                            results.push( elem );
                            break;
                        }
                    }
                    if ( outermost ) {
                        dirruns = dirrunsUnique;
                        cachedruns = ++matcherCachedRuns;
                    }
                }

                // Track unmatched elements for set filters
                if ( bySet ) {
                    // They will have gone through all possible matchers
                    if ( (elem = !matcher && elem) ) {
                        matchedCount--;
                    }

                    // Lengthen the array for every element, matched or not
                    if ( seed ) {
                        unmatched.push( elem );
                    }
                }
            }

            // Apply set filters to unmatched elements
            matchedCount += i;
            if ( bySet && i !== matchedCount ) {
                j = 0;
                while ( (matcher = setMatchers[j++]) ) {
                    matcher( unmatched, setMatched, context, xml );
                }

                if ( seed ) {
                    // Reintegrate element matches to eliminate the need for sorting
                    if ( matchedCount > 0 ) {
                        while ( i-- ) {
                            if ( !(unmatched[i] || setMatched[i]) ) {
                                setMatched[i] = pop.call( results );
                            }
                        }
                    }

                    // Discard index placeholder values to get only actual matches
                    setMatched = condense( setMatched );
                }

                // Add matches to results
                push.apply( results, setMatched );

                // Seedless set matches succeeding multiple successful matchers stipulate sorting
                if ( outermost && !seed && setMatched.length > 0 &&
                    ( matchedCount + setMatchers.length ) > 1 ) {

                    Sizzle.uniqueSort( results );
                }
            }

            // Override manipulation of globals by nested matchers
            if ( outermost ) {
                dirruns = dirrunsUnique;
                outermostContext = contextBackup;
            }

            return unmatched;
        };

    return bySet ?
        markFunction( superMatcher ) :
        superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
    var i,
        setMatchers = [],
        elementMatchers = [],
        cached = compilerCache[ selector + " " ];

    if ( !cached ) {
        // Generate a function of recursive functions that can be used to check each element
        if ( !group ) {
            group = tokenize( selector );
        }
        i = group.length;
        while ( i-- ) {
            cached = matcherFromTokens( group[i] );
            if ( cached[ expando ] ) {
                setMatchers.push( cached );
            } else {
                elementMatchers.push( cached );
            }
        }

        // Cache the compiled function
        cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
    }
    return cached;
};

function multipleContexts( selector, contexts, results ) {
    var i = 0,
        len = contexts.length;
    for ( ; i < len; i++ ) {
        Sizzle( selector, contexts[i], results );
    }
    return results;
}

function select( selector, context, results, seed ) {
    var i, tokens, token, type, find,
        match = tokenize( selector );

    if ( !seed ) {
        // Try to minimize operations if there is only one group
        if ( match.length === 1 ) {

            // Take a shortcut and set the context if the root selector is an ID
            tokens = match[0] = match[0].slice( 0 );
            if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
                    context.nodeType === 9 && !documentIsXML &&
                    Expr.relative[ tokens[1].type ] ) {

                context = Expr.find["ID"]( token.matches[0].replace( runescape, funescape ), context )[0];
                if ( !context ) {
                    return results;
                }

                selector = selector.slice( tokens.shift().value.length );
            }

            // Fetch a seed set for right-to-left matching
            i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
            while ( i-- ) {
                token = tokens[i];

                // Abort if we hit a combinator
                if ( Expr.relative[ (type = token.type) ] ) {
                    break;
                }
                if ( (find = Expr.find[ type ]) ) {
                    // Search, expanding context for leading sibling combinators
                    if ( (seed = find(
                        token.matches[0].replace( runescape, funescape ),
                        rsibling.test( tokens[0].type ) && context.parentNode || context
                    )) ) {

                        // If seed is empty or no tokens remain, we can return early
                        tokens.splice( i, 1 );
                        selector = seed.length && toSelector( tokens );
                        if ( !selector ) {
                            push.apply( results, slice.call( seed, 0 ) );
                            return results;
                        }

                        break;
                    }
                }
            }
        }
    }

    // Compile and execute a filtering function
    // Provide `match` to avoid retokenization if we modified the selector above
    compile( selector, match )(
        seed,
        context,
        documentIsXML,
        results,
        rsibling.test( selector )
    );
    return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Initialize with the default document
setDocument();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
    rparentsprev = /^(?:parents|prev(?:Until|All))/,
    isSimple = /^.[^:#\[\.,]*$/,
    rneedsContext = jQuery.expr.match.needsContext,
    // methods guaranteed to produce a unique set when starting from a unique set
    guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
    };

jQuery.fn.extend({
    find: function( selector ) {
        var i, ret, self,
            len = this.length;

        if ( typeof selector !== "string" ) {
            self = this;
            return this.pushStack( jQuery( selector ).filter(function() {
                for ( i = 0; i < len; i++ ) {
                    if ( jQuery.contains( self[ i ], this ) ) {
                        return true;
                    }
                }
            }) );
        }

        ret = [];
        for ( i = 0; i < len; i++ ) {
            jQuery.find( selector, this[ i ], ret );
        }

        // Needed because $( selector, context ) becomes $( context ).find( selector )
        ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
        ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
        return ret;
    },

    has: function( target ) {
        var i,
            targets = jQuery( target, this ),
            len = targets.length;

        return this.filter(function() {
            for ( i = 0; i < len; i++ ) {
                if ( jQuery.contains( this, targets[i] ) ) {
                    return true;
                }
            }
        });
    },

    not: function( selector ) {
        return this.pushStack( winnow(this, selector, false) );
    },

    filter: function( selector ) {
        return this.pushStack( winnow(this, selector, true) );
    },

    is: function( selector ) {
        return !!selector && (
            typeof selector === "string" ?
                // If this is a positional/relative selector, check membership in the returned set
                // so $("p:first").is("p:last") won't return true for a doc with two "p".
                rneedsContext.test( selector ) ?
                    jQuery( selector, this.context ).index( this[0] ) >= 0 :
                    jQuery.filter( selector, this ).length > 0 :
                this.filter( selector ).length > 0 );
    },

    closest: function( selectors, context ) {
        var cur,
            i = 0,
            l = this.length,
            ret = [],
            pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
                jQuery( selectors, context || this.context ) :
                0;

        for ( ; i < l; i++ ) {
            cur = this[i];

            while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
                if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
                    ret.push( cur );
                    break;
                }
                cur = cur.parentNode;
            }
        }

        return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
    },

    // Determine the position of an element within
    // the matched set of elements
    index: function( elem ) {

        // No argument, return index in parent
        if ( !elem ) {
            return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
        }

        // index in selector
        if ( typeof elem === "string" ) {
            return jQuery.inArray( this[0], jQuery( elem ) );
        }

        // Locate the position of the desired element
        return jQuery.inArray(
            // If it receives a jQuery object, the first element is used
            elem.jquery ? elem[0] : elem, this );
    },

    add: function( selector, context ) {
        var set = typeof selector === "string" ?
                jQuery( selector, context ) :
                jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
            all = jQuery.merge( this.get(), set );

        return this.pushStack( jQuery.unique(all) );
    },

    addBack: function( selector ) {
        return this.add( selector == null ?
            this.prevObject : this.prevObject.filter(selector)
        );
    }
});

jQuery.fn.andSelf = jQuery.fn.addBack;

function sibling( cur, dir ) {
    do {
        cur = cur[ dir ];
    } while ( cur && cur.nodeType !== 1 );

    return cur;
}

jQuery.each({
    parent: function( elem ) {
        var parent = elem.parentNode;
        return parent && parent.nodeType !== 11 ? parent : null;
    },
    parents: function( elem ) {
        return jQuery.dir( elem, "parentNode" );
    },
    parentsUntil: function( elem, i, until ) {
        return jQuery.dir( elem, "parentNode", until );
    },
    next: function( elem ) {
        return sibling( elem, "nextSibling" );
    },
    prev: function( elem ) {
        return sibling( elem, "previousSibling" );
    },
    nextAll: function( elem ) {
        return jQuery.dir( elem, "nextSibling" );
    },
    prevAll: function( elem ) {
        return jQuery.dir( elem, "previousSibling" );
    },
    nextUntil: function( elem, i, until ) {
        return jQuery.dir( elem, "nextSibling", until );
    },
    prevUntil: function( elem, i, until ) {
        return jQuery.dir( elem, "previousSibling", until );
    },
    siblings: function( elem ) {
        return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
    },
    children: function( elem ) {
        return jQuery.sibling( elem.firstChild );
    },
    contents: function( elem ) {
        return jQuery.nodeName( elem, "iframe" ) ?
            elem.contentDocument || elem.contentWindow.document :
            jQuery.merge( [], elem.childNodes );
    }
}, function( name, fn ) {
    jQuery.fn[ name ] = function( until, selector ) {
        var ret = jQuery.map( this, fn, until );

        if ( !runtil.test( name ) ) {
            selector = until;
        }

        if ( selector && typeof selector === "string" ) {
            ret = jQuery.filter( selector, ret );
        }

        ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

        if ( this.length > 1 && rparentsprev.test( name ) ) {
            ret = ret.reverse();
        }

        return this.pushStack( ret );
    };
});

jQuery.extend({
    filter: function( expr, elems, not ) {
        if ( not ) {
            expr = ":not(" + expr + ")";
        }

        return elems.length === 1 ?
            jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
            jQuery.find.matches(expr, elems);
    },

    dir: function( elem, dir, until ) {
        var matched = [],
            cur = elem[ dir ];

        while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
            if ( cur.nodeType === 1 ) {
                matched.push( cur );
            }
            cur = cur[dir];
        }
        return matched;
    },

    sibling: function( n, elem ) {
        var r = [];

        for ( ; n; n = n.nextSibling ) {
            if ( n.nodeType === 1 && n !== elem ) {
                r.push( n );
            }
        }

        return r;
    }
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

    // Can't pass null or undefined to indexOf in Firefox 4
    // Set to 0 to skip string check
    qualifier = qualifier || 0;

    if ( jQuery.isFunction( qualifier ) ) {
        return jQuery.grep(elements, function( elem, i ) {
            var retVal = !!qualifier.call( elem, i, elem );
            return retVal === keep;
        });

    } else if ( qualifier.nodeType ) {
        return jQuery.grep(elements, function( elem ) {
            return ( elem === qualifier ) === keep;
        });

    } else if ( typeof qualifier === "string" ) {
        var filtered = jQuery.grep(elements, function( elem ) {
            return elem.nodeType === 1;
        });

        if ( isSimple.test( qualifier ) ) {
            return jQuery.filter(qualifier, filtered, !keep);
        } else {
            qualifier = jQuery.filter( qualifier, filtered );
        }
    }

    return jQuery.grep(elements, function( elem ) {
        return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
    });
}
function createSafeFragment( document ) {
    var list = nodeNames.split( "|" ),
        safeFrag = document.createDocumentFragment();

    if ( safeFrag.createElement ) {
        while ( list.length ) {
            safeFrag.createElement(
                list.pop()
            );
        }
    }
    return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
        "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
    rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
    rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
    rleadingWhitespace = /^\s+/,
    rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    rtagName = /<([\w:]+)/,
    rtbody = /<tbody/i,
    rhtml = /<|&#?\w+;/,
    rnoInnerhtml = /<(?:script|style|link)/i,
    manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
    // checked="checked" or checked
    rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
    rscriptType = /^$|\/(?:java|ecma)script/i,
    rscriptTypeMasked = /^true\/(.*)/,
    rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

    // We have to close these tags to support XHTML (#13200)
    wrapMap = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        legend: [ 1, "<fieldset>", "</fieldset>" ],
        area: [ 1, "<map>", "</map>" ],
        param: [ 1, "<object>", "</object>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

        // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
        // unless wrapped in a div with non-breaking characters in front of it.
        _default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
    },
    safeFragment = createSafeFragment( document ),
    fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
    text: function( value ) {
        return jQuery.access( this, function( value ) {
            return value === undefined ?
                jQuery.text( this ) :
                this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
        }, null, value, arguments.length );
    },

    wrapAll: function( html ) {
        if ( jQuery.isFunction( html ) ) {
            return this.each(function(i) {
                jQuery(this).wrapAll( html.call(this, i) );
            });
        }

        if ( this[0] ) {
            // The elements to wrap the target around
            var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

            if ( this[0].parentNode ) {
                wrap.insertBefore( this[0] );
            }

            wrap.map(function() {
                var elem = this;

                while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
                    elem = elem.firstChild;
                }

                return elem;
            }).append( this );
        }

        return this;
    },

    wrapInner: function( html ) {
        if ( jQuery.isFunction( html ) ) {
            return this.each(function(i) {
                jQuery(this).wrapInner( html.call(this, i) );
            });
        }

        return this.each(function() {
            var self = jQuery( this ),
                contents = self.contents();

            if ( contents.length ) {
                contents.wrapAll( html );

            } else {
                self.append( html );
            }
        });
    },

    wrap: function( html ) {
        var isFunction = jQuery.isFunction( html );

        return this.each(function(i) {
            jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
        });
    },

    unwrap: function() {
        return this.parent().each(function() {
            if ( !jQuery.nodeName( this, "body" ) ) {
                jQuery( this ).replaceWith( this.childNodes );
            }
        }).end();
    },

    append: function() {
        return this.domManip(arguments, true, function( elem ) {
            if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
                this.appendChild( elem );
            }
        });
    },

    prepend: function() {
        return this.domManip(arguments, true, function( elem ) {
            if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
                this.insertBefore( elem, this.firstChild );
            }
        });
    },

    before: function() {
        return this.domManip( arguments, false, function( elem ) {
            if ( this.parentNode ) {
                this.parentNode.insertBefore( elem, this );
            }
        });
    },

    after: function() {
        return this.domManip( arguments, false, function( elem ) {
            if ( this.parentNode ) {
                this.parentNode.insertBefore( elem, this.nextSibling );
            }
        });
    },

    // keepData is for internal use only--do not document
    remove: function( selector, keepData ) {
        var elem,
            i = 0;

        for ( ; (elem = this[i]) != null; i++ ) {
            if ( !selector || jQuery.filter( selector, [ elem ] ).length > 0 ) {
                if ( !keepData && elem.nodeType === 1 ) {
                    jQuery.cleanData( getAll( elem ) );
                }

                if ( elem.parentNode ) {
                    if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
                        setGlobalEval( getAll( elem, "script" ) );
                    }
                    elem.parentNode.removeChild( elem );
                }
            }
        }

        return this;
    },

    empty: function() {
        var elem,
            i = 0;

        for ( ; (elem = this[i]) != null; i++ ) {
            // Remove element nodes and prevent memory leaks
            if ( elem.nodeType === 1 ) {
                jQuery.cleanData( getAll( elem, false ) );
            }

            // Remove any remaining nodes
            while ( elem.firstChild ) {
                elem.removeChild( elem.firstChild );
            }

            // If this is a select, ensure that it displays empty (#12336)
            // Support: IE<9
            if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
                elem.options.length = 0;
            }
        }

        return this;
    },

    clone: function( dataAndEvents, deepDataAndEvents ) {
        dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
        deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

        return this.map( function () {
            return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
        });
    },

    html: function( value ) {
        return jQuery.access( this, function( value ) {
            var elem = this[0] || {},
                i = 0,
                l = this.length;

            if ( value === undefined ) {
                return elem.nodeType === 1 ?
                    elem.innerHTML.replace( rinlinejQuery, "" ) :
                    undefined;
            }

            // See if we can take a shortcut and just use innerHTML
            if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
                ( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
                ( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
                !wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

                value = value.replace( rxhtmlTag, "<$1></$2>" );

                try {
                    for (; i < l; i++ ) {
                        // Remove element nodes and prevent memory leaks
                        elem = this[i] || {};
                        if ( elem.nodeType === 1 ) {
                            jQuery.cleanData( getAll( elem, false ) );
                            elem.innerHTML = value;
                        }
                    }

                    elem = 0;

                // If using innerHTML throws an exception, use the fallback method
                } catch(e) {}
            }

            if ( elem ) {
                this.empty().append( value );
            }
        }, null, value, arguments.length );
    },

    replaceWith: function( value ) {
        var isFunc = jQuery.isFunction( value );

        // Make sure that the elements are removed from the DOM before they are inserted
        // this can help fix replacing a parent with child elements
        if ( !isFunc && typeof value !== "string" ) {
            value = jQuery( value ).not( this ).detach();
        }

        return this.domManip( [ value ], true, function( elem ) {
            var next = this.nextSibling,
                parent = this.parentNode;

            if ( parent ) {
                jQuery( this ).remove();
                parent.insertBefore( elem, next );
            }
        });
    },

    detach: function( selector ) {
        return this.remove( selector, true );
    },

    domManip: function( args, table, callback ) {

        // Flatten any nested arrays
        args = core_concat.apply( [], args );

        var first, node, hasScripts,
            scripts, doc, fragment,
            i = 0,
            l = this.length,
            set = this,
            iNoClone = l - 1,
            value = args[0],
            isFunction = jQuery.isFunction( value );

        // We can't cloneNode fragments that contain checked, in WebKit
        if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
            return this.each(function( index ) {
                var self = set.eq( index );
                if ( isFunction ) {
                    args[0] = value.call( this, index, table ? self.html() : undefined );
                }
                self.domManip( args, table, callback );
            });
        }

        if ( l ) {
            fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
            first = fragment.firstChild;

            if ( fragment.childNodes.length === 1 ) {
                fragment = first;
            }

            if ( first ) {
                table = table && jQuery.nodeName( first, "tr" );
                scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
                hasScripts = scripts.length;

                // Use the original fragment for the last item instead of the first because it can end up
                // being emptied incorrectly in certain situations (#8070).
                for ( ; i < l; i++ ) {
                    node = fragment;

                    if ( i !== iNoClone ) {
                        node = jQuery.clone( node, true, true );

                        // Keep references to cloned scripts for later restoration
                        if ( hasScripts ) {
                            jQuery.merge( scripts, getAll( node, "script" ) );
                        }
                    }

                    callback.call(
                        table && jQuery.nodeName( this[i], "table" ) ?
                            findOrAppend( this[i], "tbody" ) :
                            this[i],
                        node,
                        i
                    );
                }

                if ( hasScripts ) {
                    doc = scripts[ scripts.length - 1 ].ownerDocument;

                    // Reenable scripts
                    jQuery.map( scripts, restoreScript );

                    // Evaluate executable scripts on first document insertion
                    for ( i = 0; i < hasScripts; i++ ) {
                        node = scripts[ i ];
                        if ( rscriptType.test( node.type || "" ) &&
                            !jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

                            if ( node.src ) {
                                // Hope ajax is available...
                                jQuery.ajax({
                                    url: node.src,
                                    type: "GET",
                                    dataType: "script",
                                    async: false,
                                    global: false,
                                    "throws": true
                                });
                            } else {
                                jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
                            }
                        }
                    }
                }

                // Fix #11809: Avoid leaking memory
                fragment = first = null;
            }
        }

        return this;
    }
});

function findOrAppend( elem, tag ) {
    return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
    var attr = elem.getAttributeNode("type");
    elem.type = ( attr && attr.specified ) + "/" + elem.type;
    return elem;
}
function restoreScript( elem ) {
    var match = rscriptTypeMasked.exec( elem.type );
    if ( match ) {
        elem.type = match[1];
    } else {
        elem.removeAttribute("type");
    }
    return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
    var elem,
        i = 0;
    for ( ; (elem = elems[i]) != null; i++ ) {
        jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
    }
}

function cloneCopyEvent( src, dest ) {

    if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
        return;
    }

    var type, i, l,
        oldData = jQuery._data( src ),
        curData = jQuery._data( dest, oldData ),
        events = oldData.events;

    if ( events ) {
        delete curData.handle;
        curData.events = {};

        for ( type in events ) {
            for ( i = 0, l = events[ type ].length; i < l; i++ ) {
                jQuery.event.add( dest, type, events[ type ][ i ] );
            }
        }
    }

    // make the cloned public data object a copy from the original
    if ( curData.data ) {
        curData.data = jQuery.extend( {}, curData.data );
    }
}

function fixCloneNodeIssues( src, dest ) {
    var nodeName, e, data;

    // We do not need to do anything for non-Elements
    if ( dest.nodeType !== 1 ) {
        return;
    }

    nodeName = dest.nodeName.toLowerCase();

    // IE6-8 copies events bound via attachEvent when using cloneNode.
    if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
        data = jQuery._data( dest );

        for ( e in data.events ) {
            jQuery.removeEvent( dest, e, data.handle );
        }

        // Event data gets referenced instead of copied if the expando gets copied too
        dest.removeAttribute( jQuery.expando );
    }

    // IE blanks contents when cloning scripts, and tries to evaluate newly-set text
    if ( nodeName === "script" && dest.text !== src.text ) {
        disableScript( dest ).text = src.text;
        restoreScript( dest );

    // IE6-10 improperly clones children of object elements using classid.
    // IE10 throws NoModificationAllowedError if parent is null, #12132.
    } else if ( nodeName === "object" ) {
        if ( dest.parentNode ) {
            dest.outerHTML = src.outerHTML;
        }

        // This path appears unavoidable for IE9. When cloning an object
        // element in IE9, the outerHTML strategy above is not sufficient.
        // If the src has innerHTML and the destination does not,
        // copy the src.innerHTML into the dest.innerHTML. #10324
        if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
            dest.innerHTML = src.innerHTML;
        }

    } else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
        // IE6-8 fails to persist the checked state of a cloned checkbox
        // or radio button. Worse, IE6-7 fail to give the cloned element
        // a checked appearance if the defaultChecked value isn't also set

        dest.defaultChecked = dest.checked = src.checked;

        // IE6-7 get confused and end up setting the value of a cloned
        // checkbox/radio button to an empty string instead of "on"
        if ( dest.value !== src.value ) {
            dest.value = src.value;
        }

    // IE6-8 fails to return the selected option to the default selected
    // state when cloning options
    } else if ( nodeName === "option" ) {
        dest.defaultSelected = dest.selected = src.defaultSelected;

    // IE6-8 fails to set the defaultValue to the correct value when
    // cloning other types of input fields
    } else if ( nodeName === "input" || nodeName === "textarea" ) {
        dest.defaultValue = src.defaultValue;
    }
}

jQuery.each({
    appendTo: "append",
    prependTo: "prepend",
    insertBefore: "before",
    insertAfter: "after",
    replaceAll: "replaceWith"
}, function( name, original ) {
    jQuery.fn[ name ] = function( selector ) {
        var elems,
            i = 0,
            ret = [],
            insert = jQuery( selector ),
            last = insert.length - 1;

        for ( ; i <= last; i++ ) {
            elems = i === last ? this : this.clone(true);
            jQuery( insert[i] )[ original ]( elems );

            // Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
            core_push.apply( ret, elems.get() );
        }

        return this.pushStack( ret );
    };
});

function getAll( context, tag ) {
    var elems, elem,
        i = 0,
        found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
            typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
            undefined;

    if ( !found ) {
        for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
            if ( !tag || jQuery.nodeName( elem, tag ) ) {
                found.push( elem );
            } else {
                jQuery.merge( found, getAll( elem, tag ) );
            }
        }
    }

    return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
        jQuery.merge( [ context ], found ) :
        found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
    if ( manipulation_rcheckableType.test( elem.type ) ) {
        elem.defaultChecked = elem.checked;
    }
}

jQuery.extend({
    clone: function( elem, dataAndEvents, deepDataAndEvents ) {
        var destElements, node, clone, i, srcElements,
            inPage = jQuery.contains( elem.ownerDocument, elem );

        if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
            clone = elem.cloneNode( true );

        // IE<=8 does not properly clone detached, unknown element nodes
        } else {
            fragmentDiv.innerHTML = elem.outerHTML;
            fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
        }

        if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
                (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

            // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
            destElements = getAll( clone );
            srcElements = getAll( elem );

            // Fix all IE cloning issues
            for ( i = 0; (node = srcElements[i]) != null; ++i ) {
                // Ensure that the destination node is not null; Fixes #9587
                if ( destElements[i] ) {
                    fixCloneNodeIssues( node, destElements[i] );
                }
            }
        }

        // Copy the events from the original to the clone
        if ( dataAndEvents ) {
            if ( deepDataAndEvents ) {
                srcElements = srcElements || getAll( elem );
                destElements = destElements || getAll( clone );

                for ( i = 0; (node = srcElements[i]) != null; i++ ) {
                    cloneCopyEvent( node, destElements[i] );
                }
            } else {
                cloneCopyEvent( elem, clone );
            }
        }

        // Preserve script evaluation history
        destElements = getAll( clone, "script" );
        if ( destElements.length > 0 ) {
            setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
        }

        destElements = srcElements = node = null;

        // Return the cloned set
        return clone;
    },

    buildFragment: function( elems, context, scripts, selection ) {
        var j, elem, contains,
            tmp, tag, tbody, wrap,
            l = elems.length,

            // Ensure a safe fragment
            safe = createSafeFragment( context ),

            nodes = [],
            i = 0;

        for ( ; i < l; i++ ) {
            elem = elems[ i ];

            if ( elem || elem === 0 ) {

                // Add nodes directly
                if ( jQuery.type( elem ) === "object" ) {
                    jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

                // Convert non-html into a text node
                } else if ( !rhtml.test( elem ) ) {
                    nodes.push( context.createTextNode( elem ) );

                // Convert html into DOM nodes
                } else {
                    tmp = tmp || safe.appendChild( context.createElement("div") );

                    // Deserialize a standard representation
                    tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
                    wrap = wrapMap[ tag ] || wrapMap._default;

                    tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

                    // Descend through wrappers to the right content
                    j = wrap[0];
                    while ( j-- ) {
                        tmp = tmp.lastChild;
                    }

                    // Manually add leading whitespace removed by IE
                    if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
                        nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
                    }

                    // Remove IE's autoinserted <tbody> from table fragments
                    if ( !jQuery.support.tbody ) {

                        // String was a <table>, *may* have spurious <tbody>
                        elem = tag === "table" && !rtbody.test( elem ) ?
                            tmp.firstChild :

                            // String was a bare <thead> or <tfoot>
                            wrap[1] === "<table>" && !rtbody.test( elem ) ?
                                tmp :
                                0;

                        j = elem && elem.childNodes.length;
                        while ( j-- ) {
                            if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
                                elem.removeChild( tbody );
                            }
                        }
                    }

                    jQuery.merge( nodes, tmp.childNodes );

                    // Fix #12392 for WebKit and IE > 9
                    tmp.textContent = "";

                    // Fix #12392 for oldIE
                    while ( tmp.firstChild ) {
                        tmp.removeChild( tmp.firstChild );
                    }

                    // Remember the top-level container for proper cleanup
                    tmp = safe.lastChild;
                }
            }
        }

        // Fix #11356: Clear elements from fragment
        if ( tmp ) {
            safe.removeChild( tmp );
        }

        // Reset defaultChecked for any radios and checkboxes
        // about to be appended to the DOM in IE 6/7 (#8060)
        if ( !jQuery.support.appendChecked ) {
            jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
        }

        i = 0;
        while ( (elem = nodes[ i++ ]) ) {

            // #4087 - If origin and destination elements are the same, and this is
            // that element, do not do anything
            if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
                continue;
            }

            contains = jQuery.contains( elem.ownerDocument, elem );

            // Append to fragment
            tmp = getAll( safe.appendChild( elem ), "script" );

            // Preserve script evaluation history
            if ( contains ) {
                setGlobalEval( tmp );
            }

            // Capture executables
            if ( scripts ) {
                j = 0;
                while ( (elem = tmp[ j++ ]) ) {
                    if ( rscriptType.test( elem.type || "" ) ) {
                        scripts.push( elem );
                    }
                }
            }
        }

        tmp = null;

        return safe;
    },

    cleanData: function( elems, /* internal */ acceptData ) {
        var elem, type, id, data,
            i = 0,
            internalKey = jQuery.expando,
            cache = jQuery.cache,
            deleteExpando = jQuery.support.deleteExpando,
            special = jQuery.event.special;

        for ( ; (elem = elems[i]) != null; i++ ) {

            if ( acceptData || jQuery.acceptData( elem ) ) {

                id = elem[ internalKey ];
                data = id && cache[ id ];

                if ( data ) {
                    if ( data.events ) {
                        for ( type in data.events ) {
                            if ( special[ type ] ) {
                                jQuery.event.remove( elem, type );

                            // This is a shortcut to avoid jQuery.event.remove's overhead
                            } else {
                                jQuery.removeEvent( elem, type, data.handle );
                            }
                        }
                    }

                    // Remove cache only if it was not already removed by jQuery.event.remove
                    if ( cache[ id ] ) {

                        delete cache[ id ];

                        // IE does not allow us to delete expando properties from nodes,
                        // nor does it have a removeAttribute function on Document nodes;
                        // we must handle all of these cases
                        if ( deleteExpando ) {
                            delete elem[ internalKey ];

                        } else if ( typeof elem.removeAttribute !== core_strundefined ) {
                            elem.removeAttribute( internalKey );

                        } else {
                            elem[ internalKey ] = null;
                        }

                        core_deletedIds.push( id );
                    }
                }
            }
        }
    }
});
var iframe, getStyles, curCSS,
    ralpha = /alpha\([^)]*\)/i,
    ropacity = /opacity\s*=\s*([^)]*)/,
    rposition = /^(top|right|bottom|left)$/,
    // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
    // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
    rdisplayswap = /^(none|table(?!-c[ea]).+)/,
    rmargin = /^margin/,
    rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
    rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
    rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
    elemdisplay = { BODY: "block" },

    cssShow = { position: "absolute", visibility: "hidden", display: "block" },
    cssNormalTransform = {
        letterSpacing: 0,
        fontWeight: 400
    },

    cssExpand = [ "Top", "Right", "Bottom", "Left" ],
    cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

    // shortcut for names that are not vendor prefixed
    if ( name in style ) {
        return name;
    }

    // check for vendor prefixed names
    var capName = name.charAt(0).toUpperCase() + name.slice(1),
        origName = name,
        i = cssPrefixes.length;

    while ( i-- ) {
        name = cssPrefixes[ i ] + capName;
        if ( name in style ) {
            return name;
        }
    }

    return origName;
}

function isHidden( elem, el ) {
    // isHidden might be called from jQuery#filter function;
    // in that case, element will be second argument
    elem = el || elem;
    return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
    var display, elem, hidden,
        values = [],
        index = 0,
        length = elements.length;

    for ( ; index < length; index++ ) {
        elem = elements[ index ];
        if ( !elem.style ) {
            continue;
        }

        values[ index ] = jQuery._data( elem, "olddisplay" );
        display = elem.style.display;
        if ( show ) {
            // Reset the inline display of this element to learn if it is
            // being hidden by cascaded rules or not
            if ( !values[ index ] && display === "none" ) {
                elem.style.display = "";
            }

            // Set elements which have been overridden with display: none
            // in a stylesheet to whatever the default browser style is
            // for such an element
            if ( elem.style.display === "" && isHidden( elem ) ) {
                values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
            }
        } else {

            if ( !values[ index ] ) {
                hidden = isHidden( elem );

                if ( display && display !== "none" || !hidden ) {
                    jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
                }
            }
        }
    }

    // Set the display of most of the elements in a second loop
    // to avoid the constant reflow
    for ( index = 0; index < length; index++ ) {
        elem = elements[ index ];
        if ( !elem.style ) {
            continue;
        }
        if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
            elem.style.display = show ? values[ index ] || "" : "none";
        }
    }

    return elements;
}

jQuery.fn.extend({
    css: function( name, value ) {
        return jQuery.access( this, function( elem, name, value ) {
            var len, styles,
                map = {},
                i = 0;

            if ( jQuery.isArray( name ) ) {
                styles = getStyles( elem );
                len = name.length;

                for ( ; i < len; i++ ) {
                    map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
                }

                return map;
            }

            return value !== undefined ?
                jQuery.style( elem, name, value ) :
                jQuery.css( elem, name );
        }, name, value, arguments.length > 1 );
    },
    show: function() {
        return showHide( this, true );
    },
    hide: function() {
        return showHide( this );
    },
    toggle: function( state ) {
        var bool = typeof state === "boolean";

        return this.each(function() {
            if ( bool ? state : isHidden( this ) ) {
                jQuery( this ).show();
            } else {
                jQuery( this ).hide();
            }
        });
    }
});

jQuery.extend({
    // Add in style property hooks for overriding the default
    // behavior of getting and setting a style property
    cssHooks: {
        opacity: {
            get: function( elem, computed ) {
                if ( computed ) {
                    // We should always get a number back from opacity
                    var ret = curCSS( elem, "opacity" );
                    return ret === "" ? "1" : ret;
                }
            }
        }
    },

    // Exclude the following css properties to add px
    cssNumber: {
        "columnCount": true,
        "fillOpacity": true,
        "fontWeight": true,
        "lineHeight": true,
        "opacity": true,
        "orphans": true,
        "widows": true,
        "zIndex": true,
        "zoom": true
    },

    // Add in properties whose names you wish to fix before
    // setting or getting the value
    cssProps: {
        // normalize float css property
        "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
    },

    // Get and set the style property on a DOM Node
    style: function( elem, name, value, extra ) {
        // Don't set styles on text and comment nodes
        if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
            return;
        }

        // Make sure that we're working with the right name
        var ret, type, hooks,
            origName = jQuery.camelCase( name ),
            style = elem.style;

        name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

        // Check if we're setting a value
        if ( value !== undefined ) {
            type = typeof value;

            // convert relative number strings (+= or -=) to relative numbers. #7345
            if ( type === "string" && (ret = rrelNum.exec( value )) ) {
                value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
                // Fixes bug #9237
                type = "number";
            }

            // Make sure that NaN and null values aren't set. See: #7116
            if ( value == null || type === "number" && isNaN( value ) ) {
                return;
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)
            if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
                value += "px";
            }

            // Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
            // but it would mean to define eight (for every problematic property) identical functions
            if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
                style[ name ] = "inherit";
            }

            // If a hook was provided, use that value, otherwise just set the specified value
            if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

                // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
                // Fixes bug #5509
                try {
                    style[ name ] = value;
                } catch(e) {}
            }

        } else {
            // If a hook was provided get the non-computed value from there
            if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
                return ret;
            }

            // Otherwise just get the value from the style object
            return style[ name ];
        }
    },

    css: function( elem, name, extra, styles ) {
        var num, val, hooks,
            origName = jQuery.camelCase( name );

        // Make sure that we're working with the right name
        name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

        // If a hook was provided get the computed value from there
        if ( hooks && "get" in hooks ) {
            val = hooks.get( elem, true, extra );
        }

        // Otherwise, if a way to get the computed value exists, use that
        if ( val === undefined ) {
            val = curCSS( elem, name, styles );
        }

        //convert "normal" to computed value
        if ( val === "normal" && name in cssNormalTransform ) {
            val = cssNormalTransform[ name ];
        }

        // Return, converting to number if forced or a qualifier was provided and val looks numeric
        if ( extra === "" || extra ) {
            num = parseFloat( val );
            return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
        }
        return val;
    },

    // A method for quickly swapping in/out CSS properties to get correct calculations
    swap: function( elem, options, callback, args ) {
        var ret, name,
            old = {};

        // Remember the old values, and insert the new ones
        for ( name in options ) {
            old[ name ] = elem.style[ name ];
            elem.style[ name ] = options[ name ];
        }

        ret = callback.apply( elem, args || [] );

        // Revert the old values
        for ( name in options ) {
            elem.style[ name ] = old[ name ];
        }

        return ret;
    }
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
    getStyles = function( elem ) {
        return window.getComputedStyle( elem, null );
    };

    curCSS = function( elem, name, _computed ) {
        var width, minWidth, maxWidth,
            computed = _computed || getStyles( elem ),

            // getPropertyValue is only needed for .css('filter') in IE9, see #12537
            ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
            style = elem.style;

        if ( computed ) {

            if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
                ret = jQuery.style( elem, name );
            }

            // A tribute to the "awesome hack by Dean Edwards"
            // Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
            // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
            // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
            if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

                // Remember the original values
                width = style.width;
                minWidth = style.minWidth;
                maxWidth = style.maxWidth;

                // Put in the new values to get a computed value out
                style.minWidth = style.maxWidth = style.width = ret;
                ret = computed.width;

                // Revert the changed values
                style.width = width;
                style.minWidth = minWidth;
                style.maxWidth = maxWidth;
            }
        }

        return ret;
    };
} else if ( document.documentElement.currentStyle ) {
    getStyles = function( elem ) {
        return elem.currentStyle;
    };

    curCSS = function( elem, name, _computed ) {
        var left, rs, rsLeft,
            computed = _computed || getStyles( elem ),
            ret = computed ? computed[ name ] : undefined,
            style = elem.style;

        // Avoid setting ret to empty string here
        // so we don't default to auto
        if ( ret == null && style && style[ name ] ) {
            ret = style[ name ];
        }

        // From the awesome hack by Dean Edwards
        // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

        // If we're not dealing with a regular pixel number
        // but a number that has a weird ending, we need to convert it to pixels
        // but not position css attributes, as those are proportional to the parent element instead
        // and we can't measure the parent instead because it might trigger a "stacking dolls" problem
        if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

            // Remember the original values
            left = style.left;
            rs = elem.runtimeStyle;
            rsLeft = rs && rs.left;

            // Put in the new values to get a computed value out
            if ( rsLeft ) {
                rs.left = elem.currentStyle.left;
            }
            style.left = name === "fontSize" ? "1em" : ret;
            ret = style.pixelLeft + "px";

            // Revert the changed values
            style.left = left;
            if ( rsLeft ) {
                rs.left = rsLeft;
            }
        }

        return ret === "" ? "auto" : ret;
    };
}

function setPositiveNumber( elem, value, subtract ) {
    var matches = rnumsplit.exec( value );
    return matches ?
        // Guard against undefined "subtract", e.g., when used as in cssHooks
        Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
        value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
    var i = extra === ( isBorderBox ? "border" : "content" ) ?
        // If we already have the right measurement, avoid augmentation
        4 :
        // Otherwise initialize for horizontal or vertical properties
        name === "width" ? 1 : 0,

        val = 0;

    for ( ; i < 4; i += 2 ) {
        // both box models exclude margin, so add it if we want it
        if ( extra === "margin" ) {
            val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
        }

        if ( isBorderBox ) {
            // border-box includes padding, so remove it if we want content
            if ( extra === "content" ) {
                val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
            }

            // at this point, extra isn't border nor margin, so remove border
            if ( extra !== "margin" ) {
                val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
            }
        } else {
            // at this point, extra isn't content, so add padding
            val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

            // at this point, extra isn't content nor padding, so add border
            if ( extra !== "padding" ) {
                val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
            }
        }
    }

    return val;
}

function getWidthOrHeight( elem, name, extra ) {

    // Start with offset property, which is equivalent to the border-box value
    var valueIsBorderBox = true,
        val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
        styles = getStyles( elem ),
        isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

    // some non-html elements return undefined for offsetWidth, so check for null/undefined
    // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
    // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
    if ( val <= 0 || val == null ) {
        // Fall back to computed then uncomputed css if necessary
        val = curCSS( elem, name, styles );
        if ( val < 0 || val == null ) {
            val = elem.style[ name ];
        }

        // Computed unit is not pixels. Stop here and return.
        if ( rnumnonpx.test(val) ) {
            return val;
        }

        // we need the check for style in case a browser which returns unreliable values
        // for getComputedStyle silently falls back to the reliable elem.style
        valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

        // Normalize "", auto, and prepare for extra
        val = parseFloat( val ) || 0;
    }

    // use the active box-sizing model to add/subtract irrelevant styles
    return ( val +
        augmentWidthOrHeight(
            elem,
            name,
            extra || ( isBorderBox ? "border" : "content" ),
            valueIsBorderBox,
            styles
        )
    ) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
    var doc = document,
        display = elemdisplay[ nodeName ];

    if ( !display ) {
        display = actualDisplay( nodeName, doc );

        // If the simple way fails, read from inside an iframe
        if ( display === "none" || !display ) {
            // Use the already-created iframe if possible
            iframe = ( iframe ||
                jQuery("<iframe frameborder='0' width='0' height='0'/>")
                .css( "cssText", "display:block !important" )
            ).appendTo( doc.documentElement );

            // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
            doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
            doc.write("<!doctype html><html><body>");
            doc.close();

            display = actualDisplay( nodeName, doc );
            iframe.detach();
        }

        // Store the correct default display
        elemdisplay[ nodeName ] = display;
    }

    return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
    var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
        display = jQuery.css( elem[0], "display" );
    elem.remove();
    return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
    jQuery.cssHooks[ name ] = {
        get: function( elem, computed, extra ) {
            if ( computed ) {
                // certain elements can have dimension info if we invisibly show them
                // however, it must have a current display style that would benefit from this
                return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
                    jQuery.swap( elem, cssShow, function() {
                        return getWidthOrHeight( elem, name, extra );
                    }) :
                    getWidthOrHeight( elem, name, extra );
            }
        },

        set: function( elem, value, extra ) {
            var styles = extra && getStyles( elem );
            return setPositiveNumber( elem, value, extra ?
                augmentWidthOrHeight(
                    elem,
                    name,
                    extra,
                    jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
                    styles
                ) : 0
            );
        }
    };
});

if ( !jQuery.support.opacity ) {
    jQuery.cssHooks.opacity = {
        get: function( elem, computed ) {
            // IE uses filters for opacity
            return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
                ( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
                computed ? "1" : "";
        },

        set: function( elem, value ) {
            var style = elem.style,
                currentStyle = elem.currentStyle,
                opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
                filter = currentStyle && currentStyle.filter || style.filter || "";

            // IE has trouble with opacity if it does not have layout
            // Force it by setting the zoom level
            style.zoom = 1;

            // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
            // if value === "", then remove inline opacity #12685
            if ( ( value >= 1 || value === "" ) &&
                    jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
                    style.removeAttribute ) {

                // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                // if "filter:" is present at all, clearType is disabled, we want to avoid this
                // style.removeAttribute is IE Only, but so apparently is this code path...
                style.removeAttribute( "filter" );

                // if there is no filter style applied in a css rule or unset inline opacity, we are done
                if ( value === "" || currentStyle && !currentStyle.filter ) {
                    return;
                }
            }

            // otherwise, set new filter values
            style.filter = ralpha.test( filter ) ?
                filter.replace( ralpha, opacity ) :
                filter + " " + opacity;
        }
    };
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
    if ( !jQuery.support.reliableMarginRight ) {
        jQuery.cssHooks.marginRight = {
            get: function( elem, computed ) {
                if ( computed ) {
                    // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                    // Work around by temporarily setting element display to inline-block
                    return jQuery.swap( elem, { "display": "inline-block" },
                        curCSS, [ elem, "marginRight" ] );
                }
            }
        };
    }

    // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
    // getComputedStyle returns percent when specified for top/left/bottom/right
    // rather than make the css module depend on the offset module, we just check for it here
    if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
        jQuery.each( [ "top", "left" ], function( i, prop ) {
            jQuery.cssHooks[ prop ] = {
                get: function( elem, computed ) {
                    if ( computed ) {
                        computed = curCSS( elem, prop );
                        // if curCSS returns percentage, fallback to offset
                        return rnumnonpx.test( computed ) ?
                            jQuery( elem ).position()[ prop ] + "px" :
                            computed;
                    }
                }
            };
        });
    }

});

if ( jQuery.expr && jQuery.expr.filters ) {
    jQuery.expr.filters.hidden = function( elem ) {
        // Support: Opera <= 12.12
        // Opera reports offsetWidths and offsetHeights less than zero on some elements
        return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
            (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
    };

    jQuery.expr.filters.visible = function( elem ) {
        return !jQuery.expr.filters.hidden( elem );
    };
}

// These hooks are used by animate to expand properties
jQuery.each({
    margin: "",
    padding: "",
    border: "Width"
}, function( prefix, suffix ) {
    jQuery.cssHooks[ prefix + suffix ] = {
        expand: function( value ) {
            var i = 0,
                expanded = {},

                // assumes a single number if not a string
                parts = typeof value === "string" ? value.split(" ") : [ value ];

            for ( ; i < 4; i++ ) {
                expanded[ prefix + cssExpand[ i ] + suffix ] =
                    parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
            }

            return expanded;
        }
    };

    if ( !rmargin.test( prefix ) ) {
        jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
    }
});
var r20 = /%20/g,
    rbracket = /\[\]$/,
    rCRLF = /\r?\n/g,
    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
    rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
    serialize: function() {
        return jQuery.param( this.serializeArray() );
    },
    serializeArray: function() {
        return this.map(function(){
            // Can add propHook for "elements" to filter or add form elements
            var elements = jQuery.prop( this, "elements" );
            return elements ? jQuery.makeArray( elements ) : this;
        })
        .filter(function(){
            var type = this.type;
            // Use .is(":disabled") so that fieldset[disabled] works
            return this.name && !jQuery( this ).is( ":disabled" ) &&
                rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
                ( this.checked || !manipulation_rcheckableType.test( type ) );
        })
        .map(function( i, elem ){
            var val = jQuery( this ).val();

            return val == null ?
                null :
                jQuery.isArray( val ) ?
                    jQuery.map( val, function( val ){
                        return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
                    }) :
                    { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
        }).get();
    }
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
    var prefix,
        s = [],
        add = function( key, value ) {
            // If value is a function, invoke it and return its value
            value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
            s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
        };

    // Set traditional to true for jQuery <= 1.3.2 behavior.
    if ( traditional === undefined ) {
        traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
    }

    // If an array was passed in, assume that it is an array of form elements.
    if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
        // Serialize the form elements
        jQuery.each( a, function() {
            add( this.name, this.value );
        });

    } else {
        // If traditional, encode the "old" way (the way 1.3.2 or older
        // did it), otherwise encode params recursively.
        for ( prefix in a ) {
            buildParams( prefix, a[ prefix ], traditional, add );
        }
    }

    // Return the resulting serialization
    return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
    var name;

    if ( jQuery.isArray( obj ) ) {
        // Serialize array item.
        jQuery.each( obj, function( i, v ) {
            if ( traditional || rbracket.test( prefix ) ) {
                // Treat each array item as a scalar.
                add( prefix, v );

            } else {
                // Item is non-scalar (array or object), encode its numeric index.
                buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
            }
        });

    } else if ( !traditional && jQuery.type( obj ) === "object" ) {
        // Serialize object item.
        for ( name in obj ) {
            buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
        }

    } else {
        // Serialize scalar item.
        add( prefix, obj );
    }
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

    // Handle event binding
    jQuery.fn[ name ] = function( data, fn ) {
        return arguments.length > 0 ?
            this.on( name, null, data, fn ) :
            this.trigger( name );
    };
});

jQuery.fn.hover = function( fnOver, fnOut ) {
    return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
};
var
    // Document location
    ajaxLocParts,
    ajaxLocation,
    ajax_nonce = jQuery.now(),

    ajax_rquery = /\?/,
    rhash = /#.*$/,
    rts = /([?&])_=[^&]*/,
    rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
    // #7653, #8125, #8152: local protocol detection
    rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
    rnoContent = /^(?:GET|HEAD)$/,
    rprotocol = /^\/\//,
    rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

    // Keep a copy of the old load method
    _load = jQuery.fn.load,

    /* Prefilters
     * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
     * 2) These are called:
     *    - BEFORE asking for a transport
     *    - AFTER param serialization (s.data is a string if s.processData is true)
     * 3) key is the dataType
     * 4) the catchall symbol "*" can be used
     * 5) execution will start with transport dataType and THEN continue down to "*" if needed
     */
    prefilters = {},

    /* Transports bindings
     * 1) key is the dataType
     * 2) the catchall symbol "*" can be used
     * 3) selection will start with transport dataType and THEN go to "*" if needed
     */
    transports = {},

    // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
    allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
    ajaxLocation = location.href;
} catch( e ) {
    // Use the href attribute of an A element
    // since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

    // dataTypeExpression is optional and defaults to "*"
    return function( dataTypeExpression, func ) {

        if ( typeof dataTypeExpression !== "string" ) {
            func = dataTypeExpression;
            dataTypeExpression = "*";
        }

        var dataType,
            i = 0,
            dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

        if ( jQuery.isFunction( func ) ) {
            // For each dataType in the dataTypeExpression
            while ( (dataType = dataTypes[i++]) ) {
                // Prepend if requested
                if ( dataType[0] === "+" ) {
                    dataType = dataType.slice( 1 ) || "*";
                    (structure[ dataType ] = structure[ dataType ] || []).unshift( func );

                // Otherwise append
                } else {
                    (structure[ dataType ] = structure[ dataType ] || []).push( func );
                }
            }
        }
    };
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

    var inspected = {},
        seekingTransport = ( structure === transports );

    function inspect( dataType ) {
        var selected;
        inspected[ dataType ] = true;
        jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
            var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
            if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
                options.dataTypes.unshift( dataTypeOrTransport );
                inspect( dataTypeOrTransport );
                return false;
            } else if ( seekingTransport ) {
                return !( selected = dataTypeOrTransport );
            }
        });
        return selected;
    }

    return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
    var deep, key,
        flatOptions = jQuery.ajaxSettings.flatOptions || {};

    for ( key in src ) {
        if ( src[ key ] !== undefined ) {
            ( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
        }
    }
    if ( deep ) {
        jQuery.extend( true, target, deep );
    }

    return target;
}

jQuery.fn.load = function( url, params, callback ) {
    if ( typeof url !== "string" && _load ) {
        return _load.apply( this, arguments );
    }

    var selector, response, type,
        self = this,
        off = url.indexOf(" ");

    if ( off >= 0 ) {
        selector = url.slice( off, url.length );
        url = url.slice( 0, off );
    }

    // If it's a function
    if ( jQuery.isFunction( params ) ) {

        // We assume that it's the callback
        callback = params;
        params = undefined;

    // Otherwise, build a param string
    } else if ( params && typeof params === "object" ) {
        type = "POST";
    }

    // If we have elements to modify, make the request
    if ( self.length > 0 ) {
        jQuery.ajax({
            url: url,

            // if "type" variable is undefined, then "GET" method will be used
            type: type,
            dataType: "html",
            data: params
        }).done(function( responseText ) {

            // Save response for use in complete callback
            response = arguments;

            self.html( selector ?

                // If a selector was specified, locate the right elements in a dummy div
                // Exclude scripts to avoid IE 'Permission Denied' errors
                jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

                // Otherwise use the full result
                responseText );

        }).complete( callback && function( jqXHR, status ) {
            self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
        });
    }

    return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
    jQuery.fn[ type ] = function( fn ){
        return this.on( type, fn );
    };
});

jQuery.each( [ "get", "post" ], function( i, method ) {
    jQuery[ method ] = function( url, data, callback, type ) {
        // shift arguments if data argument was omitted
        if ( jQuery.isFunction( data ) ) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        return jQuery.ajax({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback
        });
    };
});

jQuery.extend({

    // Counter for holding the number of active queries
    active: 0,

    // Last-Modified header cache for next request
    lastModified: {},
    etag: {},

    ajaxSettings: {
        url: ajaxLocation,
        type: "GET",
        isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
        global: true,
        processData: true,
        async: true,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        /*
        timeout: 0,
        data: null,
        dataType: null,
        username: null,
        password: null,
        cache: null,
        throws: false,
        traditional: false,
        headers: {},
        */

        accepts: {
            "*": allTypes,
            text: "text/plain",
            html: "text/html",
            xml: "application/xml, text/xml",
            json: "application/json, text/javascript"
        },

        contents: {
            xml: /xml/,
            html: /html/,
            json: /json/
        },

        responseFields: {
            xml: "responseXML",
            text: "responseText"
        },

        // Data converters
        // Keys separate source (or catchall "*") and destination types with a single space
        converters: {

            // Convert anything to text
            "* text": window.String,

            // Text to html (true = no transformation)
            "text html": true,

            // Evaluate text as a json expression
            "text json": jQuery.parseJSON,

            // Parse text as xml
            "text xml": jQuery.parseXML
        },

        // For options that shouldn't be deep extended:
        // you can add your own custom options here if
        // and when you create one that shouldn't be
        // deep extended (see ajaxExtend)
        flatOptions: {
            url: true,
            context: true
        }
    },

    // Creates a full fledged settings object into target
    // with both ajaxSettings and settings fields.
    // If target is omitted, writes into ajaxSettings.
    ajaxSetup: function( target, settings ) {
        return settings ?

            // Building a settings object
            ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

            // Extending ajaxSettings
            ajaxExtend( jQuery.ajaxSettings, target );
    },

    ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
    ajaxTransport: addToPrefiltersOrTransports( transports ),

    // Main method
    ajax: function( url, options ) {

        // If url is an object, simulate pre-1.5 signature
        if ( typeof url === "object" ) {
            options = url;
            url = undefined;
        }

        // Force options to be an object
        options = options || {};

        var // Cross-domain detection vars
            parts,
            // Loop variable
            i,
            // URL without anti-cache param
            cacheURL,
            // Response headers as string
            responseHeadersString,
            // timeout handle
            timeoutTimer,

            // To know if global events are to be dispatched
            fireGlobals,

            transport,
            // Response headers
            responseHeaders,
            // Create the final options object
            s = jQuery.ajaxSetup( {}, options ),
            // Callbacks context
            callbackContext = s.context || s,
            // Context for global events is callbackContext if it is a DOM node or jQuery collection
            globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
                jQuery( callbackContext ) :
                jQuery.event,
            // Deferreds
            deferred = jQuery.Deferred(),
            completeDeferred = jQuery.Callbacks("once memory"),
            // Status-dependent callbacks
            statusCode = s.statusCode || {},
            // Headers (they are sent all at once)
            requestHeaders = {},
            requestHeadersNames = {},
            // The jqXHR state
            state = 0,
            // Default abort message
            strAbort = "canceled",
            // Fake xhr
            jqXHR = {
                readyState: 0,

                // Builds headers hashtable if needed
                getResponseHeader: function( key ) {
                    var match;
                    if ( state === 2 ) {
                        if ( !responseHeaders ) {
                            responseHeaders = {};
                            while ( (match = rheaders.exec( responseHeadersString )) ) {
                                responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
                            }
                        }
                        match = responseHeaders[ key.toLowerCase() ];
                    }
                    return match == null ? null : match;
                },

                // Raw string
                getAllResponseHeaders: function() {
                    return state === 2 ? responseHeadersString : null;
                },

                // Caches the header
                setRequestHeader: function( name, value ) {
                    var lname = name.toLowerCase();
                    if ( !state ) {
                        name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
                        requestHeaders[ name ] = value;
                    }
                    return this;
                },

                // Overrides response content-type header
                overrideMimeType: function( type ) {
                    if ( !state ) {
                        s.mimeType = type;
                    }
                    return this;
                },

                // Status-dependent callbacks
                statusCode: function( map ) {
                    var code;
                    if ( map ) {
                        if ( state < 2 ) {
                            for ( code in map ) {
                                // Lazy-add the new callback in a way that preserves old ones
                                statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
                            }
                        } else {
                            // Execute the appropriate callbacks
                            jqXHR.always( map[ jqXHR.status ] );
                        }
                    }
                    return this;
                },

                // Cancel the request
                abort: function( statusText ) {
                    var finalText = statusText || strAbort;
                    if ( transport ) {
                        transport.abort( finalText );
                    }
                    done( 0, finalText );
                    return this;
                }
            };

        // Attach deferreds
        deferred.promise( jqXHR ).complete = completeDeferred.add;
        jqXHR.success = jqXHR.done;
        jqXHR.error = jqXHR.fail;

        // Remove hash character (#7531: and string promotion)
        // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
        // Handle falsy url in the settings object (#10093: consistency with old signature)
        // We also use the url parameter if available
        s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

        // Alias method option to type as per ticket #12004
        s.type = options.method || options.type || s.method || s.type;

        // Extract dataTypes list
        s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

        // A cross-domain request is in order when we have a protocol:host:port mismatch
        if ( s.crossDomain == null ) {
            parts = rurl.exec( s.url.toLowerCase() );
            s.crossDomain = !!( parts &&
                ( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
                    ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
                        ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
            );
        }

        // Convert data if not already a string
        if ( s.data && s.processData && typeof s.data !== "string" ) {
            s.data = jQuery.param( s.data, s.traditional );
        }

        // Apply prefilters
        inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

        // If request was aborted inside a prefilter, stop there
        if ( state === 2 ) {
            return jqXHR;
        }

        // We can fire global events as of now if asked to
        fireGlobals = s.global;

        // Watch for a new set of requests
        if ( fireGlobals && jQuery.active++ === 0 ) {
            jQuery.event.trigger("ajaxStart");
        }

        // Uppercase the type
        s.type = s.type.toUpperCase();

        // Determine if request has content
        s.hasContent = !rnoContent.test( s.type );

        // Save the URL in case we're toying with the If-Modified-Since
        // and/or If-None-Match header later on
        cacheURL = s.url;

        // More options handling for requests with no content
        if ( !s.hasContent ) {

            // If data is available, append data to url
            if ( s.data ) {
                cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
                // #9682: remove data so that it's not used in an eventual retry
                delete s.data;
            }

            // Add anti-cache in url if needed
            if ( s.cache === false ) {
                s.url = rts.test( cacheURL ) ?

                    // If there is already a '_' parameter, set its value
                    cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

                    // Otherwise add one to the end
                    cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
            }
        }

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if ( s.ifModified ) {
            if ( jQuery.lastModified[ cacheURL ] ) {
                jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
            }
            if ( jQuery.etag[ cacheURL ] ) {
                jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
            }
        }

        // Set the correct header, if data is being sent
        if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
            jqXHR.setRequestHeader( "Content-Type", s.contentType );
        }

        // Set the Accepts header for the server, depending on the dataType
        jqXHR.setRequestHeader(
            "Accept",
            s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
                s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
                s.accepts[ "*" ]
        );

        // Check for headers option
        for ( i in s.headers ) {
            jqXHR.setRequestHeader( i, s.headers[ i ] );
        }

        // Allow custom headers/mimetypes and early abort
        if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
            // Abort if not done already and return
            return jqXHR.abort();
        }

        // aborting is no longer a cancellation
        strAbort = "abort";

        // Install callbacks on deferreds
        for ( i in { success: 1, error: 1, complete: 1 } ) {
            jqXHR[ i ]( s[ i ] );
        }

        // Get transport
        transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

        // If no transport, we auto-abort
        if ( !transport ) {
            done( -1, "No Transport" );
        } else {
            jqXHR.readyState = 1;

            // Send global event
            if ( fireGlobals ) {
                globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
            }
            // Timeout
            if ( s.async && s.timeout > 0 ) {
                timeoutTimer = setTimeout(function() {
                    jqXHR.abort("timeout");
                }, s.timeout );
            }

            try {
                state = 1;
                transport.send( requestHeaders, done );
            } catch ( e ) {
                // Propagate exception as error if not done
                if ( state < 2 ) {
                    done( -1, e );
                // Simply rethrow otherwise
                } else {
                    throw e;
                }
            }
        }

        // Callback for when everything is done
        function done( status, nativeStatusText, responses, headers ) {
            var isSuccess, success, error, response, modified,
                statusText = nativeStatusText;

            // Called once
            if ( state === 2 ) {
                return;
            }

            // State is "done" now
            state = 2;

            // Clear timeout if it exists
            if ( timeoutTimer ) {
                clearTimeout( timeoutTimer );
            }

            // Dereference transport for early garbage collection
            // (no matter how long the jqXHR object will be used)
            transport = undefined;

            // Cache response headers
            responseHeadersString = headers || "";

            // Set readyState
            jqXHR.readyState = status > 0 ? 4 : 0;

            // Get response data
            if ( responses ) {
                response = ajaxHandleResponses( s, jqXHR, responses );
            }

            // If successful, handle type chaining
            if ( status >= 200 && status < 300 || status === 304 ) {

                // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                if ( s.ifModified ) {
                    modified = jqXHR.getResponseHeader("Last-Modified");
                    if ( modified ) {
                        jQuery.lastModified[ cacheURL ] = modified;
                    }
                    modified = jqXHR.getResponseHeader("etag");
                    if ( modified ) {
                        jQuery.etag[ cacheURL ] = modified;
                    }
                }

                // if no content
                if ( status === 204 ) {
                    isSuccess = true;
                    statusText = "nocontent";

                // if not modified
                } else if ( status === 304 ) {
                    isSuccess = true;
                    statusText = "notmodified";

                // If we have data, let's convert it
                } else {
                    isSuccess = ajaxConvert( s, response );
                    statusText = isSuccess.state;
                    success = isSuccess.data;
                    error = isSuccess.error;
                    isSuccess = !error;
                }
            } else {
                // We extract error from statusText
                // then normalize statusText and status for non-aborts
                error = statusText;
                if ( status || !statusText ) {
                    statusText = "error";
                    if ( status < 0 ) {
                        status = 0;
                    }
                }
            }

            // Set data for the fake xhr object
            jqXHR.status = status;
            jqXHR.statusText = ( nativeStatusText || statusText ) + "";

            // Success/Error
            if ( isSuccess ) {
                deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
            } else {
                deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
            }

            // Status-dependent callbacks
            jqXHR.statusCode( statusCode );
            statusCode = undefined;

            if ( fireGlobals ) {
                globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
                    [ jqXHR, s, isSuccess ? success : error ] );
            }

            // Complete
            completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

            if ( fireGlobals ) {
                globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
                // Handle the global AJAX counter
                if ( !( --jQuery.active ) ) {
                    jQuery.event.trigger("ajaxStop");
                }
            }
        }

        return jqXHR;
    },

    getScript: function( url, callback ) {
        return jQuery.get( url, undefined, callback, "script" );
    },

    getJSON: function( url, data, callback ) {
        return jQuery.get( url, data, callback, "json" );
    }
});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
    var firstDataType, ct, finalDataType, type,
        contents = s.contents,
        dataTypes = s.dataTypes,
        responseFields = s.responseFields;

    // Fill responseXXX fields
    for ( type in responseFields ) {
        if ( type in responses ) {
            jqXHR[ responseFields[type] ] = responses[ type ];
        }
    }

    // Remove auto dataType and get content-type in the process
    while( dataTypes[ 0 ] === "*" ) {
        dataTypes.shift();
        if ( ct === undefined ) {
            ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
        }
    }

    // Check if we're dealing with a known content-type
    if ( ct ) {
        for ( type in contents ) {
            if ( contents[ type ] && contents[ type ].test( ct ) ) {
                dataTypes.unshift( type );
                break;
            }
        }
    }

    // Check to see if we have a response for the expected dataType
    if ( dataTypes[ 0 ] in responses ) {
        finalDataType = dataTypes[ 0 ];
    } else {
        // Try convertible dataTypes
        for ( type in responses ) {
            if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
                finalDataType = type;
                break;
            }
            if ( !firstDataType ) {
                firstDataType = type;
            }
        }
        // Or just use first one
        finalDataType = finalDataType || firstDataType;
    }

    // If we found a dataType
    // We add the dataType to the list if needed
    // and return the corresponding response
    if ( finalDataType ) {
        if ( finalDataType !== dataTypes[ 0 ] ) {
            dataTypes.unshift( finalDataType );
        }
        return responses[ finalDataType ];
    }
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {
    var conv2, current, conv, tmp,
        converters = {},
        i = 0,
        // Work with a copy of dataTypes in case we need to modify it for conversion
        dataTypes = s.dataTypes.slice(),
        prev = dataTypes[ 0 ];

    // Apply the dataFilter if provided
    if ( s.dataFilter ) {
        response = s.dataFilter( response, s.dataType );
    }

    // Create converters map with lowercased keys
    if ( dataTypes[ 1 ] ) {
        for ( conv in s.converters ) {
            converters[ conv.toLowerCase() ] = s.converters[ conv ];
        }
    }

    // Convert to each sequential dataType, tolerating list modification
    for ( ; (current = dataTypes[++i]); ) {

        // There's only work to do if current dataType is non-auto
        if ( current !== "*" ) {

            // Convert response if prev dataType is non-auto and differs from current
            if ( prev !== "*" && prev !== current ) {

                // Seek a direct converter
                conv = converters[ prev + " " + current ] || converters[ "* " + current ];

                // If none found, seek a pair
                if ( !conv ) {
                    for ( conv2 in converters ) {

                        // If conv2 outputs current
                        tmp = conv2.split(" ");
                        if ( tmp[ 1 ] === current ) {

                            // If prev can be converted to accepted input
                            conv = converters[ prev + " " + tmp[ 0 ] ] ||
                                converters[ "* " + tmp[ 0 ] ];
                            if ( conv ) {
                                // Condense equivalence converters
                                if ( conv === true ) {
                                    conv = converters[ conv2 ];

                                // Otherwise, insert the intermediate dataType
                                } else if ( converters[ conv2 ] !== true ) {
                                    current = tmp[ 0 ];
                                    dataTypes.splice( i--, 0, current );
                                }

                                break;
                            }
                        }
                    }
                }

                // Apply converter (if not an equivalence)
                if ( conv !== true ) {

                    // Unless errors are allowed to bubble, catch and return them
                    if ( conv && s["throws"] ) {
                        response = conv( response );
                    } else {
                        try {
                            response = conv( response );
                        } catch ( e ) {
                            return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
                        }
                    }
                }
            }

            // Update prev for next iteration
            prev = current;
        }
    }

    return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
    accepts: {
        script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
    },
    contents: {
        script: /(?:java|ecma)script/
    },
    converters: {
        "text script": function( text ) {
            jQuery.globalEval( text );
            return text;
        }
    }
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
    if ( s.cache === undefined ) {
        s.cache = false;
    }
    if ( s.crossDomain ) {
        s.type = "GET";
        s.global = false;
    }
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

    // This transport only deals with cross domain requests
    if ( s.crossDomain ) {

        var script,
            head = document.head || jQuery("head")[0] || document.documentElement;

        return {

            send: function( _, callback ) {

                script = document.createElement("script");

                script.async = true;

                if ( s.scriptCharset ) {
                    script.charset = s.scriptCharset;
                }

                script.src = s.url;

                // Attach handlers for all browsers
                script.onload = script.onreadystatechange = function( _, isAbort ) {

                    if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

                        // Handle memory leak in IE
                        script.onload = script.onreadystatechange = null;

                        // Remove the script
                        if ( script.parentNode ) {
                            script.parentNode.removeChild( script );
                        }

                        // Dereference the script
                        script = null;

                        // Callback if not abort
                        if ( !isAbort ) {
                            callback( 200, "success" );
                        }
                    }
                };

                // Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
                // Use native DOM manipulation to avoid our domManip AJAX trickery
                head.insertBefore( script, head.firstChild );
            },

            abort: function() {
                if ( script ) {
                    script.onload( undefined, true );
                }
            }
        };
    }
});
var oldCallbacks = [],
    rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
    jsonp: "callback",
    jsonpCallback: function() {
        var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
        this[ callback ] = true;
        return callback;
    }
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

    var callbackName, overwritten, responseContainer,
        jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
            "url" :
            typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
        );

    // Handle iff the expected data type is "jsonp" or we have a parameter to set
    if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

        // Get callback name, remembering preexisting value associated with it
        callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
            s.jsonpCallback() :
            s.jsonpCallback;

        // Insert callback into url or form data
        if ( jsonProp ) {
            s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
        } else if ( s.jsonp !== false ) {
            s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
        }

        // Use data converter to retrieve json after script execution
        s.converters["script json"] = function() {
            if ( !responseContainer ) {
                jQuery.error( callbackName + " was not called" );
            }
            return responseContainer[ 0 ];
        };

        // force json dataType
        s.dataTypes[ 0 ] = "json";

        // Install callback
        overwritten = window[ callbackName ];
        window[ callbackName ] = function() {
            responseContainer = arguments;
        };

        // Clean-up function (fires after converters)
        jqXHR.always(function() {
            // Restore preexisting value
            window[ callbackName ] = overwritten;

            // Save back as free
            if ( s[ callbackName ] ) {
                // make sure that re-using the options doesn't screw things around
                s.jsonpCallback = originalSettings.jsonpCallback;

                // save the callback name for future use
                oldCallbacks.push( callbackName );
            }

            // Call if it was a function and we have a response
            if ( responseContainer && jQuery.isFunction( overwritten ) ) {
                overwritten( responseContainer[ 0 ] );
            }

            responseContainer = overwritten = undefined;
        });

        // Delegate to script
        return "script";
    }
});
var xhrCallbacks, xhrSupported,
    xhrId = 0,
    // #5280: Internet Explorer will keep connections alive if we don't abort on unload
    xhrOnUnloadAbort = window.ActiveXObject && function() {
        // Abort all pending requests
        var key;
        for ( key in xhrCallbacks ) {
            xhrCallbacks[ key ]( undefined, true );
        }
    };

// Functions to create xhrs
function createStandardXHR() {
    try {
        return new window.XMLHttpRequest();
    } catch( e ) {}
}

function createActiveXHR() {
    try {
        return new window.ActiveXObject("Microsoft.XMLHTTP");
    } catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
    /* Microsoft failed to properly
     * implement the XMLHttpRequest in IE7 (can't request local files),
     * so we use the ActiveXObject when it is available
     * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
     * we need a fallback.
     */
    function() {
        return !this.isLocal && createStandardXHR() || createActiveXHR();
    } :
    // For all other browsers, use the standard XMLHttpRequest object
    createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

    jQuery.ajaxTransport(function( s ) {
        // Cross domain only allowed if supported through XMLHttpRequest
        if ( !s.crossDomain || jQuery.support.cors ) {

            var callback;

            return {
                send: function( headers, complete ) {

                    // Get a new xhr
                    var handle, i,
                        xhr = s.xhr();

                    // Open the socket
                    // Passing null username, generates a login popup on Opera (#2865)
                    if ( s.username ) {
                        xhr.open( s.type, s.url, s.async, s.username, s.password );
                    } else {
                        xhr.open( s.type, s.url, s.async );
                    }

                    // Apply custom fields if provided
                    if ( s.xhrFields ) {
                        for ( i in s.xhrFields ) {
                            xhr[ i ] = s.xhrFields[ i ];
                        }
                    }

                    // Override mime type if needed
                    if ( s.mimeType && xhr.overrideMimeType ) {
                        xhr.overrideMimeType( s.mimeType );
                    }

                    // X-Requested-With header
                    // For cross-domain requests, seeing as conditions for a preflight are
                    // akin to a jigsaw puzzle, we simply never set it to be sure.
                    // (it can always be set on a per-request basis or even using ajaxSetup)
                    // For same-domain requests, won't change header if already provided.
                    if ( !s.crossDomain && !headers["X-Requested-With"] ) {
                        headers["X-Requested-With"] = "XMLHttpRequest";
                    }

                    // Need an extra try/catch for cross domain requests in Firefox 3
                    try {
                        for ( i in headers ) {
                            xhr.setRequestHeader( i, headers[ i ] );
                        }
                    } catch( err ) {}

                    // Do send the request
                    // This may raise an exception which is actually
                    // handled in jQuery.ajax (so no try/catch here)
                    xhr.send( ( s.hasContent && s.data ) || null );

                    // Listener
                    callback = function( _, isAbort ) {
                        var status, responseHeaders, statusText, responses;

                        // Firefox throws exceptions when accessing properties
                        // of an xhr when a network error occurred
                        // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                        try {

                            // Was never called and is aborted or complete
                            if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

                                // Only called once
                                callback = undefined;

                                // Do not keep as active anymore
                                if ( handle ) {
                                    xhr.onreadystatechange = jQuery.noop;
                                    if ( xhrOnUnloadAbort ) {
                                        delete xhrCallbacks[ handle ];
                                    }
                                }

                                // If it's an abort
                                if ( isAbort ) {
                                    // Abort it manually if needed
                                    if ( xhr.readyState !== 4 ) {
                                        xhr.abort();
                                    }
                                } else {
                                    responses = {};
                                    status = xhr.status;
                                    responseHeaders = xhr.getAllResponseHeaders();

                                    // When requesting binary data, IE6-9 will throw an exception
                                    // on any attempt to access responseText (#11426)
                                    if ( typeof xhr.responseText === "string" ) {
                                        responses.text = xhr.responseText;
                                    }

                                    // Firefox throws an exception when accessing
                                    // statusText for faulty cross-domain requests
                                    try {
                                        statusText = xhr.statusText;
                                    } catch( e ) {
                                        // We normalize with Webkit giving an empty statusText
                                        statusText = "";
                                    }

                                    // Filter status for non standard behaviors

                                    // If the request is local and we have data: assume a success
                                    // (success with no data won't get notified, that's the best we
                                    // can do given current implementations)
                                    if ( !status && s.isLocal && !s.crossDomain ) {
                                        status = responses.text ? 200 : 404;
                                    // IE - #1450: sometimes returns 1223 when it should be 204
                                    } else if ( status === 1223 ) {
                                        status = 204;
                                    }
                                }
                            }
                        } catch( firefoxAccessException ) {
                            if ( !isAbort ) {
                                complete( -1, firefoxAccessException );
                            }
                        }

                        // Call complete if needed
                        if ( responses ) {
                            complete( status, statusText, responses, responseHeaders );
                        }
                    };

                    if ( !s.async ) {
                        // if we're in sync mode we fire the callback
                        callback();
                    } else if ( xhr.readyState === 4 ) {
                        // (IE6 & IE7) if it's in cache and has been
                        // retrieved directly we need to fire the callback
                        setTimeout( callback );
                    } else {
                        handle = ++xhrId;
                        if ( xhrOnUnloadAbort ) {
                            // Create the active xhrs callbacks list if needed
                            // and attach the unload handler
                            if ( !xhrCallbacks ) {
                                xhrCallbacks = {};
                                jQuery( window ).unload( xhrOnUnloadAbort );
                            }
                            // Add to list of active xhrs callbacks
                            xhrCallbacks[ handle ] = callback;
                        }
                        xhr.onreadystatechange = callback;
                    }
                },

                abort: function() {
                    if ( callback ) {
                        callback( undefined, true );
                    }
                }
            };
        }
    });
}
var fxNow, timerId,
    rfxtypes = /^(?:toggle|show|hide)$/,
    rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
    rrun = /queueHooks$/,
    animationPrefilters = [ defaultPrefilter ],
    tweeners = {
        "*": [function( prop, value ) {
            var end, unit,
                tween = this.createTween( prop, value ),
                parts = rfxnum.exec( value ),
                target = tween.cur(),
                start = +target || 0,
                scale = 1,
                maxIterations = 20;

            if ( parts ) {
                end = +parts[2];
                unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

                // We need to compute starting value
                if ( unit !== "px" && start ) {
                    // Iteratively approximate from a nonzero starting point
                    // Prefer the current property, because this process will be trivial if it uses the same units
                    // Fallback to end or a simple constant
                    start = jQuery.css( tween.elem, prop, true ) || end || 1;

                    do {
                        // If previous iteration zeroed out, double until we get *something*
                        // Use a string for doubling factor so we don't accidentally see scale as unchanged below
                        scale = scale || ".5";

                        // Adjust and apply
                        start = start / scale;
                        jQuery.style( tween.elem, prop, start + unit );

                    // Update scale, tolerating zero or NaN from tween.cur()
                    // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
                    } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
                }

                tween.unit = unit;
                tween.start = start;
                // If a +=/-= token was provided, we're doing a relative animation
                tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
            }
            return tween;
        }]
    };

// Animations created synchronously will run synchronously
function createFxNow() {
    setTimeout(function() {
        fxNow = undefined;
    });
    return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
    jQuery.each( props, function( prop, value ) {
        var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
            index = 0,
            length = collection.length;
        for ( ; index < length; index++ ) {
            if ( collection[ index ].call( animation, prop, value ) ) {

                // we're done with this property
                return;
            }
        }
    });
}

function Animation( elem, properties, options ) {
    var result,
        stopped,
        index = 0,
        length = animationPrefilters.length,
        deferred = jQuery.Deferred().always( function() {
            // don't match elem in the :animated selector
            delete tick.elem;
        }),
        tick = function() {
            if ( stopped ) {
                return false;
            }
            var currentTime = fxNow || createFxNow(),
                remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
                // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
                temp = remaining / animation.duration || 0,
                percent = 1 - temp,
                index = 0,
                length = animation.tweens.length;

            for ( ; index < length ; index++ ) {
                animation.tweens[ index ].run( percent );
            }

            deferred.notifyWith( elem, [ animation, percent, remaining ]);

            if ( percent < 1 && length ) {
                return remaining;
            } else {
                deferred.resolveWith( elem, [ animation ] );
                return false;
            }
        },
        animation = deferred.promise({
            elem: elem,
            props: jQuery.extend( {}, properties ),
            opts: jQuery.extend( true, { specialEasing: {} }, options ),
            originalProperties: properties,
            originalOptions: options,
            startTime: fxNow || createFxNow(),
            duration: options.duration,
            tweens: [],
            createTween: function( prop, end ) {
                var tween = jQuery.Tween( elem, animation.opts, prop, end,
                        animation.opts.specialEasing[ prop ] || animation.opts.easing );
                animation.tweens.push( tween );
                return tween;
            },
            stop: function( gotoEnd ) {
                var index = 0,
                    // if we are going to the end, we want to run all the tweens
                    // otherwise we skip this part
                    length = gotoEnd ? animation.tweens.length : 0;
                if ( stopped ) {
                    return this;
                }
                stopped = true;
                for ( ; index < length ; index++ ) {
                    animation.tweens[ index ].run( 1 );
                }

                // resolve when we played the last frame
                // otherwise, reject
                if ( gotoEnd ) {
                    deferred.resolveWith( elem, [ animation, gotoEnd ] );
                } else {
                    deferred.rejectWith( elem, [ animation, gotoEnd ] );
                }
                return this;
            }
        }),
        props = animation.props;

    propFilter( props, animation.opts.specialEasing );

    for ( ; index < length ; index++ ) {
        result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
        if ( result ) {
            return result;
        }
    }

    createTweens( animation, props );

    if ( jQuery.isFunction( animation.opts.start ) ) {
        animation.opts.start.call( elem, animation );
    }

    jQuery.fx.timer(
        jQuery.extend( tick, {
            elem: elem,
            anim: animation,
            queue: animation.opts.queue
        })
    );

    // attach callbacks from options
    return animation.progress( animation.opts.progress )
        .done( animation.opts.done, animation.opts.complete )
        .fail( animation.opts.fail )
        .always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
    var value, name, index, easing, hooks;

    // camelCase, specialEasing and expand cssHook pass
    for ( index in props ) {
        name = jQuery.camelCase( index );
        easing = specialEasing[ name ];
        value = props[ index ];
        if ( jQuery.isArray( value ) ) {
            easing = value[ 1 ];
            value = props[ index ] = value[ 0 ];
        }

        if ( index !== name ) {
            props[ name ] = value;
            delete props[ index ];
        }

        hooks = jQuery.cssHooks[ name ];
        if ( hooks && "expand" in hooks ) {
            value = hooks.expand( value );
            delete props[ name ];

            // not quite $.extend, this wont overwrite keys already present.
            // also - reusing 'index' from above because we have the correct "name"
            for ( index in value ) {
                if ( !( index in props ) ) {
                    props[ index ] = value[ index ];
                    specialEasing[ index ] = easing;
                }
            }
        } else {
            specialEasing[ name ] = easing;
        }
    }
}

jQuery.Animation = jQuery.extend( Animation, {

    tweener: function( props, callback ) {
        if ( jQuery.isFunction( props ) ) {
            callback = props;
            props = [ "*" ];
        } else {
            props = props.split(" ");
        }

        var prop,
            index = 0,
            length = props.length;

        for ( ; index < length ; index++ ) {
            prop = props[ index ];
            tweeners[ prop ] = tweeners[ prop ] || [];
            tweeners[ prop ].unshift( callback );
        }
    },

    prefilter: function( callback, prepend ) {
        if ( prepend ) {
            animationPrefilters.unshift( callback );
        } else {
            animationPrefilters.push( callback );
        }
    }
});

function defaultPrefilter( elem, props, opts ) {
    /*jshint validthis:true */
    var prop, index, length,
        value, dataShow, toggle,
        tween, hooks, oldfire,
        anim = this,
        style = elem.style,
        orig = {},
        handled = [],
        hidden = elem.nodeType && isHidden( elem );

    // handle queue: false promises
    if ( !opts.queue ) {
        hooks = jQuery._queueHooks( elem, "fx" );
        if ( hooks.unqueued == null ) {
            hooks.unqueued = 0;
            oldfire = hooks.empty.fire;
            hooks.empty.fire = function() {
                if ( !hooks.unqueued ) {
                    oldfire();
                }
            };
        }
        hooks.unqueued++;

        anim.always(function() {
            // doing this makes sure that the complete handler will be called
            // before this completes
            anim.always(function() {
                hooks.unqueued--;
                if ( !jQuery.queue( elem, "fx" ).length ) {
                    hooks.empty.fire();
                }
            });
        });
    }

    // height/width overflow pass
    if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
        // Make sure that nothing sneaks out
        // Record all 3 overflow attributes because IE does not
        // change the overflow attribute when overflowX and
        // overflowY are set to the same value
        opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

        // Set display property to inline-block for height/width
        // animations on inline elements that are having width/height animated
        if ( jQuery.css( elem, "display" ) === "inline" &&
                jQuery.css( elem, "float" ) === "none" ) {

            // inline-level elements accept inline-block;
            // block-level elements need to be inline with layout
            if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
                style.display = "inline-block";

            } else {
                style.zoom = 1;
            }
        }
    }

    if ( opts.overflow ) {
        style.overflow = "hidden";
        if ( !jQuery.support.shrinkWrapBlocks ) {
            anim.always(function() {
                style.overflow = opts.overflow[ 0 ];
                style.overflowX = opts.overflow[ 1 ];
                style.overflowY = opts.overflow[ 2 ];
            });
        }
    }


    // show/hide pass
    for ( index in props ) {
        value = props[ index ];
        if ( rfxtypes.exec( value ) ) {
            delete props[ index ];
            toggle = toggle || value === "toggle";
            if ( value === ( hidden ? "hide" : "show" ) ) {
                continue;
            }
            handled.push( index );
        }
    }

    length = handled.length;
    if ( length ) {
        dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
        if ( "hidden" in dataShow ) {
            hidden = dataShow.hidden;
        }

        // store state if its toggle - enables .stop().toggle() to "reverse"
        if ( toggle ) {
            dataShow.hidden = !hidden;
        }
        if ( hidden ) {
            jQuery( elem ).show();
        } else {
            anim.done(function() {
                jQuery( elem ).hide();
            });
        }
        anim.done(function() {
            var prop;
            jQuery._removeData( elem, "fxshow" );
            for ( prop in orig ) {
                jQuery.style( elem, prop, orig[ prop ] );
            }
        });
        for ( index = 0 ; index < length ; index++ ) {
            prop = handled[ index ];
            tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
            orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

            if ( !( prop in dataShow ) ) {
                dataShow[ prop ] = tween.start;
                if ( hidden ) {
                    tween.end = tween.start;
                    tween.start = prop === "width" || prop === "height" ? 1 : 0;
                }
            }
        }
    }
}

function Tween( elem, options, prop, end, easing ) {
    return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
    constructor: Tween,
    init: function( elem, options, prop, end, easing, unit ) {
        this.elem = elem;
        this.prop = prop;
        this.easing = easing || "swing";
        this.options = options;
        this.start = this.now = this.cur();
        this.end = end;
        this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
    },
    cur: function() {
        var hooks = Tween.propHooks[ this.prop ];

        return hooks && hooks.get ?
            hooks.get( this ) :
            Tween.propHooks._default.get( this );
    },
    run: function( percent ) {
        var eased,
            hooks = Tween.propHooks[ this.prop ];

        if ( this.options.duration ) {
            this.pos = eased = jQuery.easing[ this.easing ](
                percent, this.options.duration * percent, 0, 1, this.options.duration
            );
        } else {
            this.pos = eased = percent;
        }
        this.now = ( this.end - this.start ) * eased + this.start;

        if ( this.options.step ) {
            this.options.step.call( this.elem, this.now, this );
        }

        if ( hooks && hooks.set ) {
            hooks.set( this );
        } else {
            Tween.propHooks._default.set( this );
        }
        return this;
    }
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
    _default: {
        get: function( tween ) {
            var result;

            if ( tween.elem[ tween.prop ] != null &&
                (!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
                return tween.elem[ tween.prop ];
            }

            // passing an empty string as a 3rd parameter to .css will automatically
            // attempt a parseFloat and fallback to a string if the parse fails
            // so, simple values such as "10px" are parsed to Float.
            // complex values such as "rotate(1rad)" are returned as is.
            result = jQuery.css( tween.elem, tween.prop, "" );
            // Empty strings, null, undefined and "auto" are converted to 0.
            return !result || result === "auto" ? 0 : result;
        },
        set: function( tween ) {
            // use step hook for back compat - use cssHook if its there - use .style if its
            // available and use plain properties where available
            if ( jQuery.fx.step[ tween.prop ] ) {
                jQuery.fx.step[ tween.prop ]( tween );
            } else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
                jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
            } else {
                tween.elem[ tween.prop ] = tween.now;
            }
        }
    }
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
    set: function( tween ) {
        if ( tween.elem.nodeType && tween.elem.parentNode ) {
            tween.elem[ tween.prop ] = tween.now;
        }
    }
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
    var cssFn = jQuery.fn[ name ];
    jQuery.fn[ name ] = function( speed, easing, callback ) {
        return speed == null || typeof speed === "boolean" ?
            cssFn.apply( this, arguments ) :
            this.animate( genFx( name, true ), speed, easing, callback );
    };
});

jQuery.fn.extend({
    fadeTo: function( speed, to, easing, callback ) {

        // show any hidden elements after setting opacity to 0
        return this.filter( isHidden ).css( "opacity", 0 ).show()

            // animate to the value specified
            .end().animate({ opacity: to }, speed, easing, callback );
    },
    animate: function( prop, speed, easing, callback ) {
        var empty = jQuery.isEmptyObject( prop ),
            optall = jQuery.speed( speed, easing, callback ),
            doAnimation = function() {
                // Operate on a copy of prop so per-property easing won't be lost
                var anim = Animation( this, jQuery.extend( {}, prop ), optall );
                doAnimation.finish = function() {
                    anim.stop( true );
                };
                // Empty animations, or finishing resolves immediately
                if ( empty || jQuery._data( this, "finish" ) ) {
                    anim.stop( true );
                }
            };
            doAnimation.finish = doAnimation;

        return empty || optall.queue === false ?
            this.each( doAnimation ) :
            this.queue( optall.queue, doAnimation );
    },
    stop: function( type, clearQueue, gotoEnd ) {
        var stopQueue = function( hooks ) {
            var stop = hooks.stop;
            delete hooks.stop;
            stop( gotoEnd );
        };

        if ( typeof type !== "string" ) {
            gotoEnd = clearQueue;
            clearQueue = type;
            type = undefined;
        }
        if ( clearQueue && type !== false ) {
            this.queue( type || "fx", [] );
        }

        return this.each(function() {
            var dequeue = true,
                index = type != null && type + "queueHooks",
                timers = jQuery.timers,
                data = jQuery._data( this );

            if ( index ) {
                if ( data[ index ] && data[ index ].stop ) {
                    stopQueue( data[ index ] );
                }
            } else {
                for ( index in data ) {
                    if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
                        stopQueue( data[ index ] );
                    }
                }
            }

            for ( index = timers.length; index--; ) {
                if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
                    timers[ index ].anim.stop( gotoEnd );
                    dequeue = false;
                    timers.splice( index, 1 );
                }
            }

            // start the next in the queue if the last step wasn't forced
            // timers currently will call their complete callbacks, which will dequeue
            // but only if they were gotoEnd
            if ( dequeue || !gotoEnd ) {
                jQuery.dequeue( this, type );
            }
        });
    },
    finish: function( type ) {
        if ( type !== false ) {
            type = type || "fx";
        }
        return this.each(function() {
            var index,
                data = jQuery._data( this ),
                queue = data[ type + "queue" ],
                hooks = data[ type + "queueHooks" ],
                timers = jQuery.timers,
                length = queue ? queue.length : 0;

            // enable finishing flag on private data
            data.finish = true;

            // empty the queue first
            jQuery.queue( this, type, [] );

            if ( hooks && hooks.cur && hooks.cur.finish ) {
                hooks.cur.finish.call( this );
            }

            // look for any active animations, and finish them
            for ( index = timers.length; index--; ) {
                if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
                    timers[ index ].anim.stop( true );
                    timers.splice( index, 1 );
                }
            }

            // look for any animations in the old queue and finish them
            for ( index = 0; index < length; index++ ) {
                if ( queue[ index ] && queue[ index ].finish ) {
                    queue[ index ].finish.call( this );
                }
            }

            // turn off finishing flag
            delete data.finish;
        });
    }
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
    var which,
        attrs = { height: type },
        i = 0;

    // if we include width, step value is 1 to do all cssExpand values,
    // if we don't include width, step value is 2 to skip over Left and Right
    includeWidth = includeWidth? 1 : 0;
    for( ; i < 4 ; i += 2 - includeWidth ) {
        which = cssExpand[ i ];
        attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
    }

    if ( includeWidth ) {
        attrs.opacity = attrs.width = type;
    }

    return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
    slideDown: genFx("show"),
    slideUp: genFx("hide"),
    slideToggle: genFx("toggle"),
    fadeIn: { opacity: "show" },
    fadeOut: { opacity: "hide" },
    fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
    jQuery.fn[ name ] = function( speed, easing, callback ) {
        return this.animate( props, speed, easing, callback );
    };
});

jQuery.speed = function( speed, easing, fn ) {
    var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
        complete: fn || !fn && easing ||
            jQuery.isFunction( speed ) && speed,
        duration: speed,
        easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
    };

    opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
        opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

    // normalize opt.queue - true/undefined/null -> "fx"
    if ( opt.queue == null || opt.queue === true ) {
        opt.queue = "fx";
    }

    // Queueing
    opt.old = opt.complete;

    opt.complete = function() {
        if ( jQuery.isFunction( opt.old ) ) {
            opt.old.call( this );
        }

        if ( opt.queue ) {
            jQuery.dequeue( this, opt.queue );
        }
    };

    return opt;
};

jQuery.easing = {
    linear: function( p ) {
        return p;
    },
    swing: function( p ) {
        return 0.5 - Math.cos( p*Math.PI ) / 2;
    }
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
    var timer,
        timers = jQuery.timers,
        i = 0;

    fxNow = jQuery.now();

    for ( ; i < timers.length; i++ ) {
        timer = timers[ i ];
        // Checks the timer has not already been removed
        if ( !timer() && timers[ i ] === timer ) {
            timers.splice( i--, 1 );
        }
    }

    if ( !timers.length ) {
        jQuery.fx.stop();
    }
    fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
    if ( timer() && jQuery.timers.push( timer ) ) {
        jQuery.fx.start();
    }
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
    if ( !timerId ) {
        timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
    }
};

jQuery.fx.stop = function() {
    clearInterval( timerId );
    timerId = null;
};

jQuery.fx.speeds = {
    slow: 600,
    fast: 200,
    // Default speed
    _default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
    jQuery.expr.filters.animated = function( elem ) {
        return jQuery.grep(jQuery.timers, function( fn ) {
            return elem === fn.elem;
        }).length;
    };
}
jQuery.fn.offset = function( options ) {
    if ( arguments.length ) {
        return options === undefined ?
            this :
            this.each(function( i ) {
                jQuery.offset.setOffset( this, options, i );
            });
    }

    var docElem, win,
        box = { top: 0, left: 0 },
        elem = this[ 0 ],
        doc = elem && elem.ownerDocument;

    if ( !doc ) {
        return;
    }

    docElem = doc.documentElement;

    // Make sure it's not a disconnected DOM node
    if ( !jQuery.contains( docElem, elem ) ) {
        return box;
    }

    // If we don't have gBCR, just use 0,0 rather than error
    // BlackBerry 5, iOS 3 (original iPhone)
    if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
        box = elem.getBoundingClientRect();
    }
    win = getWindow( doc );
    return {
        top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
        left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
    };
};

jQuery.offset = {

    setOffset: function( elem, options, i ) {
        var position = jQuery.css( elem, "position" );

        // set position first, in-case top/left are set even on static elem
        if ( position === "static" ) {
            elem.style.position = "relative";
        }

        var curElem = jQuery( elem ),
            curOffset = curElem.offset(),
            curCSSTop = jQuery.css( elem, "top" ),
            curCSSLeft = jQuery.css( elem, "left" ),
            calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
            props = {}, curPosition = {}, curTop, curLeft;

        // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
        if ( calculatePosition ) {
            curPosition = curElem.position();
            curTop = curPosition.top;
            curLeft = curPosition.left;
        } else {
            curTop = parseFloat( curCSSTop ) || 0;
            curLeft = parseFloat( curCSSLeft ) || 0;
        }

        if ( jQuery.isFunction( options ) ) {
            options = options.call( elem, i, curOffset );
        }

        if ( options.top != null ) {
            props.top = ( options.top - curOffset.top ) + curTop;
        }
        if ( options.left != null ) {
            props.left = ( options.left - curOffset.left ) + curLeft;
        }

        if ( "using" in options ) {
            options.using.call( elem, props );
        } else {
            curElem.css( props );
        }
    }
};


jQuery.fn.extend({

    position: function() {
        if ( !this[ 0 ] ) {
            return;
        }

        var offsetParent, offset,
            parentOffset = { top: 0, left: 0 },
            elem = this[ 0 ];

        // fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
        if ( jQuery.css( elem, "position" ) === "fixed" ) {
            // we assume that getBoundingClientRect is available when computed position is fixed
            offset = elem.getBoundingClientRect();
        } else {
            // Get *real* offsetParent
            offsetParent = this.offsetParent();

            // Get correct offsets
            offset = this.offset();
            if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
                parentOffset = offsetParent.offset();
            }

            // Add offsetParent borders
            parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
            parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
        }

        // Subtract parent offsets and element margins
        // note: when an element has margin: auto the offsetLeft and marginLeft
        // are the same in Safari causing offset.left to incorrectly be 0
        return {
            top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
            left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
        };
    },

    offsetParent: function() {
        return this.map(function() {
            var offsetParent = this.offsetParent || document.documentElement;
            while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || document.documentElement;
        });
    }
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
    var top = /Y/.test( prop );

    jQuery.fn[ method ] = function( val ) {
        return jQuery.access( this, function( elem, method, val ) {
            var win = getWindow( elem );

            if ( val === undefined ) {
                return win ? (prop in win) ? win[ prop ] :
                    win.document.documentElement[ method ] :
                    elem[ method ];
            }

            if ( win ) {
                win.scrollTo(
                    !top ? val : jQuery( win ).scrollLeft(),
                    top ? val : jQuery( win ).scrollTop()
                );

            } else {
                elem[ method ] = val;
            }
        }, method, val, arguments.length, null );
    };
});

function getWindow( elem ) {
    return jQuery.isWindow( elem ) ?
        elem :
        elem.nodeType === 9 ?
            elem.defaultView || elem.parentWindow :
            false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
    jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
        // margin is only for outerHeight, outerWidth
        jQuery.fn[ funcName ] = function( margin, value ) {
            var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
                extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

            return jQuery.access( this, function( elem, type, value ) {
                var doc;

                if ( jQuery.isWindow( elem ) ) {
                    // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
                    // isn't a whole lot we can do. See pull request at this URL for discussion:
                    // https://github.com/jquery/jquery/pull/764
                    return elem.document.documentElement[ "client" + name ];
                }

                // Get document width or height
                if ( elem.nodeType === 9 ) {
                    doc = elem.documentElement;

                    // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
                    // unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
                    return Math.max(
                        elem.body[ "scroll" + name ], doc[ "scroll" + name ],
                        elem.body[ "offset" + name ], doc[ "offset" + name ],
                        doc[ "client" + name ]
                    );
                }

                return value === undefined ?
                    // Get width or height on the element, requesting but not forcing parseFloat
                    jQuery.css( elem, type, extra ) :

                    // Set width or height on the element
                    jQuery.style( elem, type, value, extra );
            }, type, chainable ? margin : undefined, chainable, null );
        };
    });
});
// Limit scope pollution from any deprecated API
// (function() {

// })();
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
    define( "jquery", [], function () { return jQuery; } );
}

})( window );
/*
* jQuery Mobile v1.3.0
* http://jquerymobile.com
*
* Copyright 2010, 2013 jQuery Foundation, Inc. and other contributors
* Released under the MIT license.
* http://jquery.org/license
*
*/

(function ( root, doc, factory ) {
    if ( typeof define === "function" && define.amd ) {
        // AMD. Register as an anonymous module.
        define( [ "jquery" ], function ( $ ) {
            factory( $, root, doc );
            return $.mobile;
        });
    } else {
        // Browser globals
        factory( root.jQuery, root, doc );
    }
}( this, document, function ( jQuery, window, document, undefined ) {
// Script: jQuery hashchange event
// 
// *Version: 1.3, Last updated: 7/21/2010*
// 
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
// 
// About: Known issues
// 
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
// 
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
// 
// Also note that should a browser natively support the window.onhashchange 
// event, but not report that it does, the fallback polling loop will be used.
// 
// About: Release History
// 
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added 
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function( $, window, undefined ) {
  // Reused string.
  var str_hashchange = 'hashchange',
    
    // Method / object references.
    doc = document,
    fake_onhashchange,
    special = $.event.special,
    
    // Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );
  
  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };
  
  // Method: jQuery.fn.hashchange
  // 
  // Bind a handler to the window.onhashchange event or trigger all bound
  // window.onhashchange event handlers. This behavior is consistent with
  // jQuery's built-in event handlers.
  // 
  // Usage:
  // 
  // > jQuery(window).hashchange( [ handler ] );
  // 
  // Arguments:
  // 
  //  handler - (Function) Optional handler to be bound to the hashchange
  //    event. This is a "shortcut" for the more verbose form:
  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
  //    all bound window.onhashchange event handlers will be triggered. This
  //    is a shortcut for the more verbose
  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
  //    the <hashchange event> section.
  // 
  // Returns:
  // 
  //  (jQuery) The initial jQuery collection of elements.
  
  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };
  
  // Property: jQuery.fn.hashchange.delay
  // 
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 50.
  
  // Property: jQuery.fn.hashchange.domain
  // 
  // If you're setting document.domain in your JavaScript, and you want hash
  // history to work in IE6/7, not only must this property be set, but you must
  // also set document.domain BEFORE jQuery is loaded into the page. This
  // property is only applicable if you are supporting IE6/7 (or IE8 operating
  // in "IE7 compatibility" mode).
  // 
  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
  // path of the included "document-domain.html" file, which can be renamed or
  // modified if necessary (note that the document.domain specified must be the
  // same in both your main JavaScript as well as in this file).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.domain = document.domain;
  
  // Property: jQuery.fn.hashchange.src
  // 
  // If, for some reason, you need to specify an Iframe src file (for example,
  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
  // do so using this property. Note that when using this property, history
  // won't be recorded in IE6/7 until the Iframe src file loads. This property
  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
  // compatibility" mode).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.src = 'path/to/file.html';
  
  $.fn[ str_hashchange ].delay = 50;
  /*
  $.fn[ str_hashchange ].domain = null;
  $.fn[ str_hashchange ].src = null;
  */
  
  // Event: hashchange event
  // 
  // Fired when location.hash changes. In browsers that support it, the native
  // HTML5 window.onhashchange event is used, otherwise a polling loop is
  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
  // compatibility" mode), a hidden Iframe is created to allow the back button
  // and hash-based history to work.
  // 
  // Usage as described in <jQuery.fn.hashchange>:
  // 
  // > // Bind an event handler.
  // > jQuery(window).hashchange( function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).hashchange();
  // 
  // A more verbose usage that allows for event namespacing:
  // 
  // > // Bind an event handler.
  // > jQuery(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).trigger( 'hashchange' );
  // 
  // Additional Notes:
  // 
  // * The polling loop and Iframe are not created until at least one handler
  //   is actually bound to the 'hashchange' event.
  // * If you need the bound handler(s) to execute immediately, in cases where
  //   a location.hash exists on page load, via bookmark or page refresh for
  //   example, use jQuery(window).hashchange() or the more verbose 
  //   jQuery(window).trigger( 'hashchange' ).
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a DOM ready handler.
  
  // Override existing $.event.special.hashchange methods (allowing this plugin
  // to be defined after jQuery BBQ in BBQ's source code).
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {
    
    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },
    
    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }
    
  });
  
  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function() {
    var self = {},
      timeout_id,
      
      // Remember the initial hash so it doesn't get triggered immediately.
      last_hash = get_fragment(),
      
      fn_retval = function( val ) { return val; },
      history_set = fn_retval,
      history_get = fn_retval;
    
    // Start the polling loop.
    self.start = function() {
      timeout_id || poll();
    };
    
    // Stop the polling loop.
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };
    
    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
    // if location.hash has changed, and triggers the 'hashchange' event on
    // window when necessary.
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );
      
      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );
        
        $(window).trigger( str_hashchange );
        
      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }
      
      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };
    
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    window.attachEvent && !window.addEventListener && !supports_onhashchange && (function() {
      // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
      // when running in "IE7 compatibility" mode.
      
      var iframe,
        iframe_src;
      
      // When the event is bound and polling starts in IE 6/7, create a hidden
      // Iframe for history handling.
      self.start = function() {
        if ( !iframe ) {
          iframe_src = $.fn[ str_hashchange ].src;
          iframe_src = iframe_src && iframe_src + get_fragment();
          
          // Create hidden Iframe. Attempt to make Iframe as hidden as possible
          // by using techniques from http://www.paciellogroup.com/blog/?p=604.
          iframe = $('<iframe tabindex="-1" title="empty"/>').hide()
            
            // When Iframe has completely loaded, initialize the history and
            // start polling.
            .one( 'load', function() {
              iframe_src || history_set( get_fragment() );
              poll();
            })
            
            // Load Iframe src if specified, otherwise nothing.
            .attr( 'src', iframe_src || 'javascript:0' )
            
            // Append Iframe after the end of the body to prevent unnecessary
            // initial page scrolling (yes, this works).
            .insertAfter( 'body' )[0].contentWindow;
          
          // Whenever `document.title` changes, update the Iframe's title to
          // prettify the back/next history menu entries. Since IE sometimes
          // errors with "Unspecified error" the very first time this is set
          // (yes, very useful) wrap this with a try/catch block.
          doc.onpropertychange = function() {
            try {
              if ( event.propertyName === 'title' ) {
                iframe.document.title = doc.title;
              }
            } catch(e) {}
          };
          
        }
      };
      
      // Override the "stop" method since an IE6/7 Iframe was created. Even
      // if there are no longer any bound event handlers, the polling loop
      // is still necessary for back/next to work at all!
      self.stop = fn_retval;
      
      // Get history by looking at the hidden Iframe's location.hash.
      history_get = function() {
        return get_fragment( iframe.location.href );
      };
      
      // Set a new history item by opening and then closing the Iframe
      // document, *then* setting its location.hash. If document.domain has
      // been set, update that as well.
      history_set = function( hash, history_hash ) {
        var iframe_doc = iframe.document,
          domain = $.fn[ str_hashchange ].domain;
        
        if ( hash !== history_hash ) {
          // Update Iframe with any initial `document.title` that might be set.
          iframe_doc.title = doc.title;
          
          // Opening the Iframe's document after it has been closed is what
          // actually adds a history entry.
          iframe_doc.open();
          
          // Set document.domain for the Iframe document as well, if necessary.
          domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );
          
          iframe_doc.close();
          
          // Update the Iframe's hash, for great justice.
          iframe.location.hash = hash;
        }
      };
      
    })();
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    
    return self;
  })();
  
})(jQuery,this);


    // throttled resize event
    (function( $ ) {
        $.event.special.throttledresize = {
            setup: function() {
                $( this ).bind( "resize", handler );
            },
            teardown: function() {
                $( this ).unbind( "resize", handler );
            }
        };

        var throttle = 250,
            handler = function() {
                curr = ( new Date() ).getTime();
                diff = curr - lastCall;

                if ( diff >= throttle ) {

                    lastCall = curr;
                    $( this ).trigger( "throttledresize" );

                } else {

                    if ( heldCall ) {
                        clearTimeout( heldCall );
                    }

                    // Promise a held call will still execute
                    heldCall = setTimeout( handler, throttle - diff );
                }
            },
            lastCall = 0,
            heldCall,
            curr,
            diff;
    })( jQuery );
(function( $ ) {
    $.mobile = {};
}( jQuery ));
(function( $, window, undefined ) {

    var nsNormalizeDict = {};

    // jQuery.mobile configurable options
    $.mobile = $.extend($.mobile, {

        // Version of the jQuery Mobile Framework
        version: "1.3.0",

        // Namespace used framework-wide for data-attrs. Default is no namespace
        ns: "",

        // Define the url parameter used for referencing widget-generated sub-pages.
        // Translates to to example.html&ui-page=subpageIdentifier
        // hash segment before &ui-page= is used to make Ajax request
        subPageUrlKey: "ui-page",

        // Class assigned to page currently in view, and during transitions
        activePageClass: "ui-page-active",

        // Class used for "active" button state, from CSS framework
        activeBtnClass: "ui-btn-active",

        // Class used for "focus" form element state, from CSS framework
        focusClass: "ui-focus",

        // Automatically handle clicks and form submissions through Ajax, when same-domain
        ajaxEnabled: true,

        // Automatically load and show pages based on location.hash
        hashListeningEnabled: true,

        // disable to prevent jquery from bothering with links
        linkBindingEnabled: true,

        // Set default page transition - 'none' for no transitions
        defaultPageTransition: "fade",

        // Set maximum window width for transitions to apply - 'false' for no limit
        maxTransitionWidth: false,

        // Minimum scroll distance that will be remembered when returning to a page
        minScrollBack: 250,

        // DEPRECATED: the following property is no longer in use, but defined until 2.0 to prevent conflicts
        touchOverflowEnabled: false,

        // Set default dialog transition - 'none' for no transitions
        defaultDialogTransition: "pop",

        // Error response message - appears when an Ajax page request fails
        pageLoadErrorMessage: "Error Loading Page",

        // For error messages, which theme does the box uses?
        pageLoadErrorMessageTheme: "e",

        // replace calls to window.history.back with phonegaps navigation helper
        // where it is provided on the window object
        phonegapNavigationEnabled: false,

        //automatically initialize the DOM when it's ready
        autoInitializePage: true,

        pushStateEnabled: true,

        // allows users to opt in to ignoring content by marking a parent element as
        // data-ignored
        ignoreContentEnabled: false,

        // turn of binding to the native orientationchange due to android orientation behavior
        orientationChangeEnabled: true,

        buttonMarkup: {
            hoverDelay: 200
        },

        // define the window and the document objects
        window: $( window ),
        document: $( document ),

        // TODO might be useful upstream in jquery itself ?
        keyCode: {
            ALT: 18,
            BACKSPACE: 8,
            CAPS_LOCK: 20,
            COMMA: 188,
            COMMAND: 91,
            COMMAND_LEFT: 91, // COMMAND
            COMMAND_RIGHT: 93,
            CONTROL: 17,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            INSERT: 45,
            LEFT: 37,
            MENU: 93, // COMMAND_RIGHT
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SHIFT: 16,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            WINDOWS: 91 // COMMAND
        },

        // Place to store various widget extensions
        behaviors: {},

        // Scroll page vertically: scroll to 0 to hide iOS address bar, or pass a Y value
        silentScroll: function( ypos ) {
            if ( $.type( ypos ) !== "number" ) {
                ypos = $.mobile.defaultHomeScroll;
            }

            // prevent scrollstart and scrollstop events
            $.event.special.scrollstart.enabled = false;

            setTimeout( function() {
                window.scrollTo( 0, ypos );
                $.mobile.document.trigger( "silentscroll", { x: 0, y: ypos });
            }, 20 );

            setTimeout( function() {
                $.event.special.scrollstart.enabled = true;
            }, 150 );
        },

        // Expose our cache for testing purposes.
        nsNormalizeDict: nsNormalizeDict,

        // Take a data attribute property, prepend the namespace
        // and then camel case the attribute string. Add the result
        // to our nsNormalizeDict so we don't have to do this again.
        nsNormalize: function( prop ) {
            if ( !prop ) {
                return;
            }

            return nsNormalizeDict[ prop ] || ( nsNormalizeDict[ prop ] = $.camelCase( $.mobile.ns + prop ) );
        },

        // Find the closest parent with a theme class on it. Note that
        // we are not using $.fn.closest() on purpose here because this
        // method gets called quite a bit and we need it to be as fast
        // as possible.
        getInheritedTheme: function( el, defaultTheme ) {
            var e = el[ 0 ],
                ltr = "",
                re = /ui-(bar|body|overlay)-([a-z])\b/,
                c, m;

            while ( e ) {
                c = e.className || "";
                if ( c && ( m = re.exec( c ) ) && ( ltr = m[ 2 ] ) ) {
                    // We found a parent with a theme class
                    // on it so bail from this loop.
                    break;
                }

                e = e.parentNode;
            }

            // Return the theme letter we found, if none, return the
            // specified default.

            return ltr || defaultTheme || "a";
        },

        // TODO the following $ and $.fn extensions can/probably should be moved into jquery.mobile.core.helpers
        //
        // Find the closest javascript page element to gather settings data jsperf test
        // http://jsperf.com/single-complex-selector-vs-many-complex-selectors/edit
        // possibly naive, but it shows that the parsing overhead for *just* the page selector vs
        // the page and dialog selector is negligable. This could probably be speed up by
        // doing a similar parent node traversal to the one found in the inherited theme code above
        closestPageData: function( $target ) {
            return $target
                .closest( ':jqmData(role="page"), :jqmData(role="dialog")' )
                .data( "mobile-page" );
        },

        enhanceable: function( $set ) {
            return this.haveParents( $set, "enhance" );
        },

        hijackable: function( $set ) {
            return this.haveParents( $set, "ajax" );
        },

        haveParents: function( $set, attr ) {
            if ( !$.mobile.ignoreContentEnabled ) {
                return $set;
            }

            var count = $set.length,
                $newSet = $(),
                e, $element, excluded;

            for ( var i = 0; i < count; i++ ) {
                $element = $set.eq( i );
                excluded = false;
                e = $set[ i ];

                while ( e ) {
                    var c = e.getAttribute ? e.getAttribute( "data-" + $.mobile.ns + attr ) : "";

                    if ( c === "false" ) {
                        excluded = true;
                        break;
                    }

                    e = e.parentNode;
                }

                if ( !excluded ) {
                    $newSet = $newSet.add( $element );
                }
            }

            return $newSet;
        },

        getScreenHeight: function() {
            // Native innerHeight returns more accurate value for this across platforms,
            // jQuery version is here as a normalized fallback for platforms like Symbian
            return window.innerHeight || $.mobile.window.height();
        }
    }, $.mobile );

    // Mobile version of data and removeData and hasData methods
    // ensures all data is set and retrieved using jQuery Mobile's data namespace
    $.fn.jqmData = function( prop, value ) {
        var result;
        if ( typeof prop !== "undefined" ) {
            if ( prop ) {
                prop = $.mobile.nsNormalize( prop );
            }

            // undefined is permitted as an explicit input for the second param
            // in this case it returns the value and does not set it to undefined
            if( arguments.length < 2 || value === undefined ){
                result = this.data( prop );
            } else {
                result = this.data( prop, value );
            }
        }
        return result;
    };

    $.jqmData = function( elem, prop, value ) {
        var result;
        if ( typeof prop !== "undefined" ) {
            result = $.data( elem, prop ? $.mobile.nsNormalize( prop ) : prop, value );
        }
        return result;
    };

    $.fn.jqmRemoveData = function( prop ) {
        return this.removeData( $.mobile.nsNormalize( prop ) );
    };

    $.jqmRemoveData = function( elem, prop ) {
        return $.removeData( elem, $.mobile.nsNormalize( prop ) );
    };

    $.fn.removeWithDependents = function() {
        $.removeWithDependents( this );
    };

    $.removeWithDependents = function( elem ) {
        var $elem = $( elem );

        ( $elem.jqmData( 'dependents' ) || $() ).remove();
        $elem.remove();
    };

    $.fn.addDependents = function( newDependents ) {
        $.addDependents( $( this ), newDependents );
    };

    $.addDependents = function( elem, newDependents ) {
        var dependents = $( elem ).jqmData( 'dependents' ) || $();

        $( elem ).jqmData( 'dependents', $.merge( dependents, newDependents ) );
    };

    // note that this helper doesn't attempt to handle the callback
    // or setting of an html elements text, its only purpose is
    // to return the html encoded version of the text in all cases. (thus the name)
    $.fn.getEncodedText = function() {
        return $( "<div/>" ).text( $( this ).text() ).html();
    };

    // fluent helper function for the mobile namespaced equivalent
    $.fn.jqmEnhanceable = function() {
        return $.mobile.enhanceable( this );
    };

    $.fn.jqmHijackable = function() {
        return $.mobile.hijackable( this );
    };

    // Monkey-patching Sizzle to filter the :jqmData selector
    var oldFind = $.find,
        jqmDataRE = /:jqmData\(([^)]*)\)/g;

    $.find = function( selector, context, ret, extra ) {
        selector = selector.replace( jqmDataRE, "[data-" + ( $.mobile.ns || "" ) + "$1]" );

        return oldFind.call( this, selector, context, ret, extra );
    };

    $.extend( $.find, oldFind );

    $.find.matches = function( expr, set ) {
        return $.find( expr, null, null, set );
    };

    $.find.matchesSelector = function( node, expr ) {
        return $.find( expr, null, null, [ node ] ).length > 0;
    };
})( jQuery, this );


(function( $, undefined ) {

    /*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
    window.matchMedia = window.matchMedia || (function( doc, undefined ) {

        

        var bool,
            docElem = doc.documentElement,
            refNode = docElem.firstElementChild || docElem.firstChild,
            // fakeBody required for <FF4 when executed in <head>
            fakeBody = doc.createElement( "body" ),
            div = doc.createElement( "div" );

        div.id = "mq-test-1";
        div.style.cssText = "position:absolute;top:-100em";
        fakeBody.style.background = "none";
        fakeBody.appendChild(div);

        return function(q){

            div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

            docElem.insertBefore( fakeBody, refNode );
            bool = div.offsetWidth === 42;
            docElem.removeChild( fakeBody );

            return {
                matches: bool,
                media: q
            };

        };

    }( document ));

    // $.mobile.media uses matchMedia to return a boolean.
    $.mobile.media = function( q ) {
        return window.matchMedia( q ).matches;
    };

})(jQuery);

    (function( $, undefined ) {
        $.extend( $.support, {
            orientation: "orientation" in window && "onorientationchange" in window
        });
    }( jQuery ));


(function( $, window ) {
    var win = $( window ),
        event_name = "orientationchange",
        special_event,
        get_orientation,
        last_orientation,
        initial_orientation_is_landscape,
        initial_orientation_is_default,
        portrait_map = { "0": true, "180": true };

    // It seems that some device/browser vendors use window.orientation values 0 and 180 to
    // denote the "default" orientation. For iOS devices, and most other smart-phones tested,
    // the default orientation is always "portrait", but in some Android and RIM based tablets,
    // the default orientation is "landscape". The following code attempts to use the window
    // dimensions to figure out what the current orientation is, and then makes adjustments
    // to the to the portrait_map if necessary, so that we can properly decode the
    // window.orientation value whenever get_orientation() is called.
    //
    // Note that we used to use a media query to figure out what the orientation the browser
    // thinks it is in:
    //
    //     initial_orientation_is_landscape = $.mobile.media("all and (orientation: landscape)");
    //
    // but there was an iPhone/iPod Touch bug beginning with iOS 4.2, up through iOS 5.1,
    // where the browser *ALWAYS* applied the landscape media query. This bug does not
    // happen on iPad.

    if ( $.support.orientation ) {

        // Check the window width and height to figure out what the current orientation
        // of the device is at this moment. Note that we've initialized the portrait map
        // values to 0 and 180, *AND* we purposely check for landscape so that if we guess
        // wrong, , we default to the assumption that portrait is the default orientation.
        // We use a threshold check below because on some platforms like iOS, the iPhone
        // form-factor can report a larger width than height if the user turns on the
        // developer console. The actual threshold value is somewhat arbitrary, we just
        // need to make sure it is large enough to exclude the developer console case.

        var ww = window.innerWidth || win.width(),
            wh = window.innerHeight || win.height(),
            landscape_threshold = 50;

        initial_orientation_is_landscape = ww > wh && ( ww - wh ) > landscape_threshold;


        // Now check to see if the current window.orientation is 0 or 180.
        initial_orientation_is_default = portrait_map[ window.orientation ];

        // If the initial orientation is landscape, but window.orientation reports 0 or 180, *OR*
        // if the initial orientation is portrait, but window.orientation reports 90 or -90, we
        // need to flip our portrait_map values because landscape is the default orientation for
        // this device/browser.
        if ( ( initial_orientation_is_landscape && initial_orientation_is_default ) || ( !initial_orientation_is_landscape && !initial_orientation_is_default ) ) {
            portrait_map = { "-90": true, "90": true };
        }
    }

    $.event.special.orientationchange = $.extend( {}, $.event.special.orientationchange, {
        setup: function() {
            // If the event is supported natively, return false so that jQuery
            // will bind to the event using DOM methods.
            if ( $.support.orientation && !$.event.special.orientationchange.disabled ) {
                return false;
            }

            // Get the current orientation to avoid initial double-triggering.
            last_orientation = get_orientation();

            // Because the orientationchange event doesn't exist, simulate the
            // event by testing window dimensions on resize.
            win.bind( "throttledresize", handler );
        },
        teardown: function() {
            // If the event is not supported natively, return false so that
            // jQuery will unbind the event using DOM methods.
            if ( $.support.orientation && !$.event.special.orientationchange.disabled ) {
                return false;
            }

            // Because the orientationchange event doesn't exist, unbind the
            // resize event handler.
            win.unbind( "throttledresize", handler );
        },
        add: function( handleObj ) {
            // Save a reference to the bound event handler.
            var old_handler = handleObj.handler;


            handleObj.handler = function( event ) {
                // Modify event object, adding the .orientation property.
                event.orientation = get_orientation();

                // Call the originally-bound event handler and return its result.
                return old_handler.apply( this, arguments );
            };
        }
    });

    // If the event is not supported natively, this handler will be bound to
    // the window resize event to simulate the orientationchange event.
    function handler() {
        // Get the current orientation.
        var orientation = get_orientation();

        if ( orientation !== last_orientation ) {
            // The orientation has changed, so trigger the orientationchange event.
            last_orientation = orientation;
            win.trigger( event_name );
        }
    }

    // Get the current page orientation. This method is exposed publicly, should it
    // be needed, as jQuery.event.special.orientationchange.orientation()
    $.event.special.orientationchange.orientation = get_orientation = function() {
        var isPortrait = true, elem = document.documentElement;

        // prefer window orientation to the calculation based on screensize as
        // the actual screen resize takes place before or after the orientation change event
        // has been fired depending on implementation (eg android 2.3 is before, iphone after).
        // More testing is required to determine if a more reliable method of determining the new screensize
        // is possible when orientationchange is fired. (eg, use media queries + element + opacity)
        if ( $.support.orientation ) {
            // if the window orientation registers as 0 or 180 degrees report
            // portrait, otherwise landscape
            isPortrait = portrait_map[ window.orientation ];
        } else {
            isPortrait = elem && elem.clientWidth / elem.clientHeight < 1.1;
        }

        return isPortrait ? "portrait" : "landscape";
    };

    $.fn[ event_name ] = function( fn ) {
        return fn ? this.bind( event_name, fn ) : this.trigger( event_name );
    };

    // jQuery < 1.8
    if ( $.attrFn ) {
        $.attrFn[ event_name ] = true;
    }

}( jQuery, this ));


    (function( $, undefined ) {
        var support = {
            touch: "ontouchend" in document
        };

        $.mobile.support = $.mobile.support || {};
        $.extend( $.support, support );
        $.extend( $.mobile.support, support );
    }( jQuery ));

(function( $, undefined ) {

// thx Modernizr
function propExists( prop ) {
    var uc_prop = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 ),
        props = ( prop + " " + vendors.join( uc_prop + " " ) + uc_prop ).split( " " );

    for ( var v in props ) {
        if ( fbCSS[ props[ v ] ] !== undefined ) {
            return true;
        }
    }
}

var fakeBody = $( "<body>" ).prependTo( "html" ),
    fbCSS = fakeBody[ 0 ].style,
    vendors = [ "Webkit", "Moz", "O" ],
    webos = "palmGetResource" in window, //only used to rule out scrollTop
    opera = window.opera,
    operamini = window.operamini && ({}).toString.call( window.operamini ) === "[object OperaMini]",
    bb = window.blackberry && !propExists( "-webkit-transform" ); //only used to rule out box shadow, as it's filled opaque on BB 5 and lower


function validStyle( prop, value, check_vend ) {
    var div = document.createElement( 'div' ),
        uc = function( txt ) {
            return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 );
        },
        vend_pref = function( vend ) {
            if( vend === "" ) {
                return "";
            } else {
                return  "-" + vend.charAt( 0 ).toLowerCase() + vend.substr( 1 ) + "-";
            }
        },
        check_style = function( vend ) {
            var vend_prop = vend_pref( vend ) + prop + ": " + value + ";",
                uc_vend = uc( vend ),
                propStyle = uc_vend + ( uc_vend === "" ? prop : uc( prop ) );

            div.setAttribute( "style", vend_prop );

            if ( !!div.style[ propStyle ] ) {
                ret = true;
            }
        },
        check_vends = check_vend ? check_vend : vendors,
        ret;

    for( var i = 0; i < check_vends.length; i++ ) {
        check_style( check_vends[i] );
    }
    return !!ret;
}

function transform3dTest() {
    var mqProp = "transform-3d",
        // Because the `translate3d` test below throws false positives in Android:
        ret = $.mobile.media( "(-" + vendors.join( "-" + mqProp + "),(-" ) + "-" + mqProp + "),(" + mqProp + ")" );

    if( ret ) {
        return !!ret;
    }

    var el = document.createElement( "div" ),
        transforms = {
            // We’re omitting Opera for the time being; MS uses unprefixed.
            'MozTransform':'-moz-transform',
            'transform':'transform'
        };

    fakeBody.append( el );

    for ( var t in transforms ) {
        if( el.style[ t ] !== undefined ){
            el.style[ t ] = 'translate3d( 100px, 1px, 1px )';
            ret = window.getComputedStyle( el ).getPropertyValue( transforms[ t ] );
        }
    }
    return ( !!ret && ret !== "none" );
}

// Test for dynamic-updating base tag support ( allows us to avoid href,src attr rewriting )
function baseTagTest() {
    var fauxBase = location.protocol + "//" + location.host + location.pathname + "ui-dir/",
        base = $( "head base" ),
        fauxEle = null,
        href = "",
        link, rebase;

    if ( !base.length ) {
        base = fauxEle = $( "<base>", { "href": fauxBase }).appendTo( "head" );
    } else {
        href = base.attr( "href" );
    }

    link = $( "<a href='testurl' />" ).prependTo( fakeBody );
    rebase = link[ 0 ].href;
    base[ 0 ].href = href || location.pathname;

    if ( fauxEle ) {
        fauxEle.remove();
    }
    return rebase.indexOf( fauxBase ) === 0;
}

// Thanks Modernizr
function cssPointerEventsTest() {
    var element = document.createElement( 'x' ),
        documentElement = document.documentElement,
        getComputedStyle = window.getComputedStyle,
        supports;

    if ( !( 'pointerEvents' in element.style ) ) {
        return false;
    }

    element.style.pointerEvents = 'auto';
    element.style.pointerEvents = 'x';
    documentElement.appendChild( element );
    supports = getComputedStyle &&
    getComputedStyle( element, '' ).pointerEvents === 'auto';
    documentElement.removeChild( element );
    return !!supports;
}

function boundingRect() {
    var div = document.createElement( "div" );
    return typeof div.getBoundingClientRect !== "undefined";
}

// non-UA-based IE version check by James Padolsey, modified by jdalton - from http://gist.github.com/527683
// allows for inclusion of IE 6+, including Windows Mobile 7
$.extend( $.mobile, { browser: {} } );
$.mobile.browser.oldIE = (function() {
    var v = 3,
        div = document.createElement( "div" ),
        a = div.all || [];

    do {
        div.innerHTML = "<!--[if gt IE " + ( ++v ) + "]><br><![endif]-->";
    } while( a[0] );

    return v > 4 ? v : !v;
})();

function fixedPosition() {
    var w = window,
        ua = navigator.userAgent,
        platform = navigator.platform,
        // Rendering engine is Webkit, and capture major version
        wkmatch = ua.match( /AppleWebKit\/([0-9]+)/ ),
        wkversion = !!wkmatch && wkmatch[ 1 ],
        ffmatch = ua.match( /Fennec\/([0-9]+)/ ),
        ffversion = !!ffmatch && ffmatch[ 1 ],
        operammobilematch = ua.match( /Opera Mobi\/([0-9]+)/ ),
        omversion = !!operammobilematch && operammobilematch[ 1 ];

    if(
        // iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
        ( ( platform.indexOf( "iPhone" ) > -1 || platform.indexOf( "iPad" ) > -1  || platform.indexOf( "iPod" ) > -1 ) && wkversion && wkversion < 534 ) ||
        // Opera Mini
        ( w.operamini && ({}).toString.call( w.operamini ) === "[object OperaMini]" ) ||
        ( operammobilematch && omversion < 7458 )   ||
        //Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
        ( ua.indexOf( "Android" ) > -1 && wkversion && wkversion < 533 ) ||
        // Firefox Mobile before 6.0 -
        ( ffversion && ffversion < 6 ) ||
        // WebOS less than 3
        ( "palmGetResource" in window && wkversion && wkversion < 534 ) ||
        // MeeGo
        ( ua.indexOf( "MeeGo" ) > -1 && ua.indexOf( "NokiaBrowser/8.5.0" ) > -1 ) ) {
        return false;
    }

    return true;
}

$.extend( $.support, {
    cssTransitions: "WebKitTransitionEvent" in window ||
        validStyle( 'transition', 'height 100ms linear', [ "Webkit", "Moz", "" ] ) &&
        !$.mobile.browser.oldIE && !opera,

    // Note, Chrome for iOS has an extremely quirky implementation of popstate.
    // We've chosen to take the shortest path to a bug fix here for issue #5426
    // See the following link for information about the regex chosen
    // https://developers.google.com/chrome/mobile/docs/user-agent#chrome_for_ios_user-agent
    pushState: "pushState" in history &&
        "replaceState" in history &&
        ( window.navigator.userAgent.search(/CriOS/) === -1 ),

    mediaquery: $.mobile.media( "only all" ),
    cssPseudoElement: !!propExists( "content" ),
    touchOverflow: !!propExists( "overflowScrolling" ),
    cssTransform3d: transform3dTest(),
    boxShadow: !!propExists( "boxShadow" ) && !bb,
    fixedPosition: fixedPosition(),
    scrollTop: ("pageXOffset" in window ||
        "scrollTop" in document.documentElement ||
        "scrollTop" in fakeBody[ 0 ]) && !webos && !operamini,

    dynamicBaseTag: baseTagTest(),
    cssPointerEvents: cssPointerEventsTest(),
    boundingRect: boundingRect()
});

fakeBody.remove();


// $.mobile.ajaxBlacklist is used to override ajaxEnabled on platforms that have known conflicts with hash history updates (BB5, Symbian)
// or that generally work better browsing in regular http for full page refreshes (Opera Mini)
// Note: This detection below is used as a last resort.
// We recommend only using these detection methods when all other more reliable/forward-looking approaches are not possible
var nokiaLTE7_3 = (function() {

    var ua = window.navigator.userAgent;

    //The following is an attempt to match Nokia browsers that are running Symbian/s60, with webkit, version 7.3 or older
    return ua.indexOf( "Nokia" ) > -1 &&
            ( ua.indexOf( "Symbian/3" ) > -1 || ua.indexOf( "Series60/5" ) > -1 ) &&
            ua.indexOf( "AppleWebKit" ) > -1 &&
            ua.match( /(BrowserNG|NokiaBrowser)\/7\.[0-3]/ );
})();

// Support conditions that must be met in order to proceed
// default enhanced qualifications are media query support OR IE 7+

$.mobile.gradeA = function() {
    return ( $.support.mediaquery || $.mobile.browser.oldIE && $.mobile.browser.oldIE >= 7 ) && ( $.support.boundingRect || $.fn.jquery.match(/1\.[0-7+]\.[0-9+]?/) !== null );
};

$.mobile.ajaxBlacklist =
            // BlackBerry browsers, pre-webkit
            window.blackberry && !window.WebKitPoint ||
            // Opera Mini
            operamini ||
            // Symbian webkits pre 7.3
            nokiaLTE7_3;

// Lastly, this workaround is the only way we've found so far to get pre 7.3 Symbian webkit devices
// to render the stylesheets when they're referenced before this script, as we'd recommend doing.
// This simply reappends the CSS in place, which for some reason makes it apply
if ( nokiaLTE7_3 ) {
    $(function() {
        $( "head link[rel='stylesheet']" ).attr( "rel", "alternate stylesheet" ).attr( "rel", "stylesheet" );
    });
}

// For ruling out shadows via css
if ( !$.support.boxShadow ) {
    $( "html" ).addClass( "ui-mobile-nosupport-boxshadow" );
}

})( jQuery );


(function( $, undefined ) {
    var $win = $.mobile.window, self, history;

    $.event.special.navigate = self = {
        bound: false,

        pushStateEnabled: true,

        originalEventName: undefined,

        // If pushstate support is present and push state support is defined to
        // be true on the mobile namespace.
        isPushStateEnabled: function() {
            return $.support.pushState &&
                $.mobile.pushStateEnabled === true &&
                this.isHashChangeEnabled();
        },

        // !! assumes mobile namespace is present
        isHashChangeEnabled: function() {
            return $.mobile.hashListeningEnabled === true;
        },

        // TODO a lot of duplication between popstate and hashchange
        popstate: function( event ) {
            var newEvent = new $.Event( "navigate" ),
                beforeNavigate = new $.Event( "beforenavigate" ),
                state = event.originalEvent.state || {},
                href = location.href;

            $win.trigger( beforeNavigate );

            if( beforeNavigate.isDefaultPrevented() ){
                return;
            }

            if( event.historyState ){
                $.extend(state, event.historyState);
            }

            // Make sure the original event is tracked for the end
            // user to inspect incase they want to do something special
            newEvent.originalEvent = event;

            // NOTE we let the current stack unwind because any assignment to
            //      location.hash will stop the world and run this event handler. By
            //      doing this we create a similar behavior to hashchange on hash
            //      assignment
            setTimeout(function() {
                $win.trigger( newEvent, {
                    state: state
                });
            }, 0);
        },

        hashchange: function( event, data ) {
            var newEvent = new $.Event( "navigate" ),
                beforeNavigate = new $.Event( "beforenavigate" );

            $win.trigger( beforeNavigate );

            if( beforeNavigate.isDefaultPrevented() ){
                return;
            }

            // Make sure the original event is tracked for the end
            // user to inspect incase they want to do something special
            newEvent.originalEvent = event;

            // Trigger the hashchange with state provided by the user
            // that altered the hash
            $win.trigger( newEvent, {
                // Users that want to fully normalize the two events
                // will need to do history management down the stack and
                // add the state to the event before this binding is fired
                // TODO consider allowing for the explicit addition of callbacks
                //      to be fired before this value is set to avoid event timing issues
                state: event.hashchangeState || {}
            });
        },

        // TODO We really only want to set this up once
        //      but I'm not clear if there's a beter way to achieve
        //      this with the jQuery special event structure
        setup: function( data, namespaces ) {
            if( self.bound ) {
                return;
            }

            self.bound = true;

            if( self.isPushStateEnabled() ) {
                self.originalEventName = "popstate";
                $win.bind( "popstate.navigate", self.popstate );
            } else if ( self.isHashChangeEnabled() ){
                self.originalEventName = "hashchange";
                $win.bind( "hashchange.navigate", self.hashchange );
            }
        }
    };
})( jQuery );


(function( $, window, undefined ) {

var createHandler = function( sequential ) {

    // Default to sequential
    if ( sequential === undefined ) {
        sequential = true;
    }

    return function( name, reverse, $to, $from ) {

        var deferred = new $.Deferred(),
            reverseClass = reverse ? " reverse" : "",
            active  = $.mobile.urlHistory.getActive(),
            toScroll = active.lastScroll || $.mobile.defaultHomeScroll,
            screenHeight = $.mobile.getScreenHeight(),
            maxTransitionOverride = $.mobile.maxTransitionWidth !== false && $.mobile.window.width() > $.mobile.maxTransitionWidth,
            none = !$.support.cssTransitions || maxTransitionOverride || !name || name === "none" || Math.max( $.mobile.window.scrollTop(), toScroll ) > $.mobile.getMaxScrollForTransition(),
            toPreClass = " ui-page-pre-in",
            toggleViewportClass = function() {
                $.mobile.pageContainer.toggleClass( "ui-mobile-viewport-transitioning viewport-" + name );
            },
            scrollPage = function() {
                // By using scrollTo instead of silentScroll, we can keep things better in order
                // Just to be precautios, disable scrollstart listening like silentScroll would
                $.event.special.scrollstart.enabled = false;

                window.scrollTo( 0, toScroll );

                // reenable scrollstart listening like silentScroll would
                setTimeout( function() {
                    $.event.special.scrollstart.enabled = true;
                }, 150 );
            },
            cleanFrom = function() {
                $from
                    .removeClass( $.mobile.activePageClass + " out in reverse " + name )
                    .height( "" );
            },
            startOut = function() {
                // if it's not sequential, call the doneOut transition to start the TO page animating in simultaneously
                if ( !sequential ) {
                    doneOut();
                }
                else {
                    $from.animationComplete( doneOut );
                }

                // Set the from page's height and start it transitioning out
                // Note: setting an explicit height helps eliminate tiling in the transitions
                $from
                    .height( screenHeight + $.mobile.window.scrollTop() )
                    .addClass( name + " out" + reverseClass );
            },

            doneOut = function() {

                if ( $from && sequential ) {
                    cleanFrom();
                }

                startIn();
            },

            startIn = function() {

                // Prevent flickering in phonegap container: see comments at #4024 regarding iOS
                $to.css( "z-index", -10 );

                $to.addClass( $.mobile.activePageClass + toPreClass );

                // Send focus to page as it is now display: block
                $.mobile.focusPage( $to );

                // Set to page height
                $to.height( screenHeight + toScroll );

                scrollPage();

                // Restores visibility of the new page: added together with $to.css( "z-index", -10 );
                $to.css( "z-index", "" );

                if ( !none ) {
                    $to.animationComplete( doneIn );
                }

                $to
                    .removeClass( toPreClass )
                    .addClass( name + " in" + reverseClass );

                if ( none ) {
                    doneIn();
                }

            },

            doneIn = function() {

                if ( !sequential ) {

                    if ( $from ) {
                        cleanFrom();
                    }
                }

                $to
                    .removeClass( "out in reverse " + name )
                    .height( "" );

                toggleViewportClass();

                // In some browsers (iOS5), 3D transitions block the ability to scroll to the desired location during transition
                // This ensures we jump to that spot after the fact, if we aren't there already.
                if ( $.mobile.window.scrollTop() !== toScroll ) {
                    scrollPage();
                }

                deferred.resolve( name, reverse, $to, $from, true );
            };

        toggleViewportClass();

        if ( $from && !none ) {
            startOut();
        }
        else {
            doneOut();
        }

        return deferred.promise();
    };
};

// generate the handlers from the above
var sequentialHandler = createHandler(),
    simultaneousHandler = createHandler( false ),
    defaultGetMaxScrollForTransition = function() {
        return $.mobile.getScreenHeight() * 3;
    };

// Make our transition handler the public default.
$.mobile.defaultTransitionHandler = sequentialHandler;

//transition handler dictionary for 3rd party transitions
$.mobile.transitionHandlers = {
    "default": $.mobile.defaultTransitionHandler,
    "sequential": sequentialHandler,
    "simultaneous": simultaneousHandler
};

$.mobile.transitionFallbacks = {};

// If transition is defined, check if css 3D transforms are supported, and if not, if a fallback is specified
$.mobile._maybeDegradeTransition = function( transition ) {
        if ( transition && !$.support.cssTransform3d && $.mobile.transitionFallbacks[ transition ] ) {
            transition = $.mobile.transitionFallbacks[ transition ];
        }

        return transition;
};

// Set the getMaxScrollForTransition to default if no implementation was set by user
$.mobile.getMaxScrollForTransition = $.mobile.getMaxScrollForTransition || defaultGetMaxScrollForTransition;
})( jQuery, this );

// This plugin is an experiment for abstracting away the touch and mouse
// events so that developers don't have to worry about which method of input
// the device their document is loaded on supports.
//
// The idea here is to allow the developer to register listeners for the
// basic mouse events, such as mousedown, mousemove, mouseup, and click,
// and the plugin will take care of registering the correct listeners
// behind the scenes to invoke the listener at the fastest possible time
// for that device, while still retaining the order of event firing in
// the traditional mouse environment, should multiple handlers be registered
// on the same element for different events.
//
// The current version exposes the following virtual events to jQuery bind methods:
// "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel"

(function( $, window, document, undefined ) {

var dataPropertyName = "virtualMouseBindings",
    touchTargetPropertyName = "virtualTouchID",
    virtualEventNames = "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split( " " ),
    touchEventProps = "clientX clientY pageX pageY screenX screenY".split( " " ),
    mouseHookProps = $.event.mouseHooks ? $.event.mouseHooks.props : [],
    mouseEventProps = $.event.props.concat( mouseHookProps ),
    activeDocHandlers = {},
    resetTimerID = 0,
    startX = 0,
    startY = 0,
    didScroll = false,
    clickBlockList = [],
    blockMouseTriggers = false,
    blockTouchTriggers = false,
    eventCaptureSupported = "addEventListener" in document,
    $document = $( document ),
    nextTouchID = 1,
    lastTouchID = 0, threshold;

$.vmouse = {
    moveDistanceThreshold: 10,
    clickDistanceThreshold: 10,
    resetTimerDuration: 1500
};

function getNativeEvent( event ) {

    while ( event && typeof event.originalEvent !== "undefined" ) {
        event = event.originalEvent;
    }
    return event;
}

function createVirtualEvent( event, eventType ) {

    var t = event.type,
        oe, props, ne, prop, ct, touch, i, j, len;

    event = $.Event( event );
    event.type = eventType;

    oe = event.originalEvent;
    props = $.event.props;

    // addresses separation of $.event.props in to $.event.mouseHook.props and Issue 3280
    // https://github.com/jquery/jquery-mobile/issues/3280
    if ( t.search( /^(mouse|click)/ ) > -1 ) {
        props = mouseEventProps;
    }

    // copy original event properties over to the new event
    // this would happen if we could call $.event.fix instead of $.Event
    // but we don't have a way to force an event to be fixed multiple times
    if ( oe ) {
        for ( i = props.length, prop; i; ) {
            prop = props[ --i ];
            event[ prop ] = oe[ prop ];
        }
    }

    // make sure that if the mouse and click virtual events are generated
    // without a .which one is defined
    if ( t.search(/mouse(down|up)|click/) > -1 && !event.which ) {
        event.which = 1;
    }

    if ( t.search(/^touch/) !== -1 ) {
        ne = getNativeEvent( oe );
        t = ne.touches;
        ct = ne.changedTouches;
        touch = ( t && t.length ) ? t[0] : ( ( ct && ct.length ) ? ct[ 0 ] : undefined );

        if ( touch ) {
            for ( j = 0, len = touchEventProps.length; j < len; j++) {
                prop = touchEventProps[ j ];
                event[ prop ] = touch[ prop ];
            }
        }
    }

    return event;
}

function getVirtualBindingFlags( element ) {

    var flags = {},
        b, k;

    while ( element ) {

        b = $.data( element, dataPropertyName );

        for (  k in b ) {
            if ( b[ k ] ) {
                flags[ k ] = flags.hasVirtualBinding = true;
            }
        }
        element = element.parentNode;
    }
    return flags;
}

function getClosestElementWithVirtualBinding( element, eventType ) {
    var b;
    while ( element ) {

        b = $.data( element, dataPropertyName );

        if ( b && ( !eventType || b[ eventType ] ) ) {
            return element;
        }
        element = element.parentNode;
    }
    return null;
}

function enableTouchBindings() {
    blockTouchTriggers = false;
}

function disableTouchBindings() {
    blockTouchTriggers = true;
}

function enableMouseBindings() {
    lastTouchID = 0;
    clickBlockList.length = 0;
    blockMouseTriggers = false;

    // When mouse bindings are enabled, our
    // touch bindings are disabled.
    disableTouchBindings();
}

function disableMouseBindings() {
    // When mouse bindings are disabled, our
    // touch bindings are enabled.
    enableTouchBindings();
}

function startResetTimer() {
    clearResetTimer();
    resetTimerID = setTimeout( function() {
        resetTimerID = 0;
        enableMouseBindings();
    }, $.vmouse.resetTimerDuration );
}

function clearResetTimer() {
    if ( resetTimerID ) {
        clearTimeout( resetTimerID );
        resetTimerID = 0;
    }
}

function triggerVirtualEvent( eventType, event, flags ) {
    var ve;

    if ( ( flags && flags[ eventType ] ) ||
                ( !flags && getClosestElementWithVirtualBinding( event.target, eventType ) ) ) {

        ve = createVirtualEvent( event, eventType );

        $( event.target).trigger( ve );
    }

    return ve;
}

function mouseEventCallback( event ) {
    var touchID = $.data( event.target, touchTargetPropertyName );

    if ( !blockMouseTriggers && ( !lastTouchID || lastTouchID !== touchID ) ) {
        var ve = triggerVirtualEvent( "v" + event.type, event );
        if ( ve ) {
            if ( ve.isDefaultPrevented() ) {
                event.preventDefault();
            }
            if ( ve.isPropagationStopped() ) {
                event.stopPropagation();
            }
            if ( ve.isImmediatePropagationStopped() ) {
                event.stopImmediatePropagation();
            }
        }
    }
}

function handleTouchStart( event ) {

    var touches = getNativeEvent( event ).touches,
        target, flags;

    if ( touches && touches.length === 1 ) {

        target = event.target;
        flags = getVirtualBindingFlags( target );

        if ( flags.hasVirtualBinding ) {

            lastTouchID = nextTouchID++;
            $.data( target, touchTargetPropertyName, lastTouchID );

            clearResetTimer();

            disableMouseBindings();
            didScroll = false;

            var t = getNativeEvent( event ).touches[ 0 ];
            startX = t.pageX;
            startY = t.pageY;

            triggerVirtualEvent( "vmouseover", event, flags );
            triggerVirtualEvent( "vmousedown", event, flags );
        }
    }
}

function handleScroll( event ) {
    if ( blockTouchTriggers ) {
        return;
    }

    if ( !didScroll ) {
        triggerVirtualEvent( "vmousecancel", event, getVirtualBindingFlags( event.target ) );
    }

    didScroll = true;
    startResetTimer();
}

function handleTouchMove( event ) {
    if ( blockTouchTriggers ) {
        return;
    }

    var t = getNativeEvent( event ).touches[ 0 ],
        didCancel = didScroll,
        moveThreshold = $.vmouse.moveDistanceThreshold,
        flags = getVirtualBindingFlags( event.target );

        didScroll = didScroll ||
            ( Math.abs( t.pageX - startX ) > moveThreshold ||
                Math.abs( t.pageY - startY ) > moveThreshold );


    if ( didScroll && !didCancel ) {
        triggerVirtualEvent( "vmousecancel", event, flags );
    }

    triggerVirtualEvent( "vmousemove", event, flags );
    startResetTimer();
}

function handleTouchEnd( event ) {
    if ( blockTouchTriggers ) {
        return;
    }

    disableTouchBindings();

    var flags = getVirtualBindingFlags( event.target ),
        t;
    triggerVirtualEvent( "vmouseup", event, flags );

    if ( !didScroll ) {
        var ve = triggerVirtualEvent( "vclick", event, flags );
        if ( ve && ve.isDefaultPrevented() ) {
            // The target of the mouse events that follow the touchend
            // event don't necessarily match the target used during the
            // touch. This means we need to rely on coordinates for blocking
            // any click that is generated.
            t = getNativeEvent( event ).changedTouches[ 0 ];
            clickBlockList.push({
                touchID: lastTouchID,
                x: t.clientX,
                y: t.clientY
            });

            // Prevent any mouse events that follow from triggering
            // virtual event notifications.
            blockMouseTriggers = true;
        }
    }
    triggerVirtualEvent( "vmouseout", event, flags);
    didScroll = false;

    startResetTimer();
}

function hasVirtualBindings( ele ) {
    var bindings = $.data( ele, dataPropertyName ),
        k;

    if ( bindings ) {
        for ( k in bindings ) {
            if ( bindings[ k ] ) {
                return true;
            }
        }
    }
    return false;
}

function dummyMouseHandler() {}

function getSpecialEventObject( eventType ) {
    var realType = eventType.substr( 1 );

    return {
        setup: function( data, namespace ) {
            // If this is the first virtual mouse binding for this element,
            // add a bindings object to its data.

            if ( !hasVirtualBindings( this ) ) {
                $.data( this, dataPropertyName, {} );
            }

            // If setup is called, we know it is the first binding for this
            // eventType, so initialize the count for the eventType to zero.
            var bindings = $.data( this, dataPropertyName );
            bindings[ eventType ] = true;

            // If this is the first virtual mouse event for this type,
            // register a global handler on the document.

            activeDocHandlers[ eventType ] = ( activeDocHandlers[ eventType ] || 0 ) + 1;

            if ( activeDocHandlers[ eventType ] === 1 ) {
                $document.bind( realType, mouseEventCallback );
            }

            // Some browsers, like Opera Mini, won't dispatch mouse/click events
            // for elements unless they actually have handlers registered on them.
            // To get around this, we register dummy handlers on the elements.

            $( this ).bind( realType, dummyMouseHandler );

            // For now, if event capture is not supported, we rely on mouse handlers.
            if ( eventCaptureSupported ) {
                // If this is the first virtual mouse binding for the document,
                // register our touchstart handler on the document.

                activeDocHandlers[ "touchstart" ] = ( activeDocHandlers[ "touchstart" ] || 0) + 1;

                if ( activeDocHandlers[ "touchstart" ] === 1 ) {
                    $document.bind( "touchstart", handleTouchStart )
                        .bind( "touchend", handleTouchEnd )

                        // On touch platforms, touching the screen and then dragging your finger
                        // causes the window content to scroll after some distance threshold is
                        // exceeded. On these platforms, a scroll prevents a click event from being
                        // dispatched, and on some platforms, even the touchend is suppressed. To
                        // mimic the suppression of the click event, we need to watch for a scroll
                        // event. Unfortunately, some platforms like iOS don't dispatch scroll
                        // events until *AFTER* the user lifts their finger (touchend). This means
                        // we need to watch both scroll and touchmove events to figure out whether
                        // or not a scroll happenens before the touchend event is fired.

                        .bind( "touchmove", handleTouchMove )
                        .bind( "scroll", handleScroll );
                }
            }
        },

        teardown: function( data, namespace ) {
            // If this is the last virtual binding for this eventType,
            // remove its global handler from the document.

            --activeDocHandlers[ eventType ];

            if ( !activeDocHandlers[ eventType ] ) {
                $document.unbind( realType, mouseEventCallback );
            }

            if ( eventCaptureSupported ) {
                // If this is the last virtual mouse binding in existence,
                // remove our document touchstart listener.

                --activeDocHandlers[ "touchstart" ];

                if ( !activeDocHandlers[ "touchstart" ] ) {
                    $document.unbind( "touchstart", handleTouchStart )
                        .unbind( "touchmove", handleTouchMove )
                        .unbind( "touchend", handleTouchEnd )
                        .unbind( "scroll", handleScroll );
                }
            }

            var $this = $( this ),
                bindings = $.data( this, dataPropertyName );

            // teardown may be called when an element was
            // removed from the DOM. If this is the case,
            // jQuery core may have already stripped the element
            // of any data bindings so we need to check it before
            // using it.
            if ( bindings ) {
                bindings[ eventType ] = false;
            }

            // Unregister the dummy event handler.

            $this.unbind( realType, dummyMouseHandler );

            // If this is the last virtual mouse binding on the
            // element, remove the binding data from the element.

            if ( !hasVirtualBindings( this ) ) {
                $this.removeData( dataPropertyName );
            }
        }
    };
}

// Expose our custom events to the jQuery bind/unbind mechanism.

for ( var i = 0; i < virtualEventNames.length; i++ ) {
    $.event.special[ virtualEventNames[ i ] ] = getSpecialEventObject( virtualEventNames[ i ] );
}

// Add a capture click handler to block clicks.
// Note that we require event capture support for this so if the device
// doesn't support it, we punt for now and rely solely on mouse events.
if ( eventCaptureSupported ) {
    document.addEventListener( "click", function( e ) {
        var cnt = clickBlockList.length,
            target = e.target,
            x, y, ele, i, o, touchID;

        if ( cnt ) {
            x = e.clientX;
            y = e.clientY;
            threshold = $.vmouse.clickDistanceThreshold;

            // The idea here is to run through the clickBlockList to see if
            // the current click event is in the proximity of one of our
            // vclick events that had preventDefault() called on it. If we find
            // one, then we block the click.
            //
            // Why do we have to rely on proximity?
            //
            // Because the target of the touch event that triggered the vclick
            // can be different from the target of the click event synthesized
            // by the browser. The target of a mouse/click event that is syntehsized
            // from a touch event seems to be implementation specific. For example,
            // some browsers will fire mouse/click events for a link that is near
            // a touch event, even though the target of the touchstart/touchend event
            // says the user touched outside the link. Also, it seems that with most
            // browsers, the target of the mouse/click event is not calculated until the
            // time it is dispatched, so if you replace an element that you touched
            // with another element, the target of the mouse/click will be the new
            // element underneath that point.
            //
            // Aside from proximity, we also check to see if the target and any
            // of its ancestors were the ones that blocked a click. This is necessary
            // because of the strange mouse/click target calculation done in the
            // Android 2.1 browser, where if you click on an element, and there is a
            // mouse/click handler on one of its ancestors, the target will be the
            // innermost child of the touched element, even if that child is no where
            // near the point of touch.

            ele = target;

            while ( ele ) {
                for ( i = 0; i < cnt; i++ ) {
                    o = clickBlockList[ i ];
                    touchID = 0;

                    if ( ( ele === target && Math.abs( o.x - x ) < threshold && Math.abs( o.y - y ) < threshold ) ||
                                $.data( ele, touchTargetPropertyName ) === o.touchID ) {
                        // XXX: We may want to consider removing matches from the block list
                        //      instead of waiting for the reset timer to fire.
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }
                ele = ele.parentNode;
            }
        }
    }, true);
}
})( jQuery, window, document );


(function( $, window, undefined ) {
    var $document = $( document );

    // add new event shortcuts
    $.each( ( "touchstart touchmove touchend " +
        "tap taphold " +
        "swipe swipeleft swiperight " +
        "scrollstart scrollstop" ).split( " " ), function( i, name ) {

        $.fn[ name ] = function( fn ) {
            return fn ? this.bind( name, fn ) : this.trigger( name );
        };

        // jQuery < 1.8
        if ( $.attrFn ) {
            $.attrFn[ name ] = true;
        }
    });

    var supportTouch = $.mobile.support.touch,
        scrollEvent = "touchmove scroll",
        touchStartEvent = supportTouch ? "touchstart" : "mousedown",
        touchStopEvent = supportTouch ? "touchend" : "mouseup",
        touchMoveEvent = supportTouch ? "touchmove" : "mousemove";

    function triggerCustomEvent( obj, eventType, event ) {
        var originalType = event.type;
        event.type = eventType;
        $.event.dispatch.call( obj, event );
        event.type = originalType;
    }

    // also handles scrollstop
    $.event.special.scrollstart = {

        enabled: true,

        setup: function() {

            var thisObject = this,
                $this = $( thisObject ),
                scrolling,
                timer;

            function trigger( event, state ) {
                scrolling = state;
                triggerCustomEvent( thisObject, scrolling ? "scrollstart" : "scrollstop", event );
            }

            // iPhone triggers scroll after a small delay; use touchmove instead
            $this.bind( scrollEvent, function( event ) {

                if ( !$.event.special.scrollstart.enabled ) {
                    return;
                }

                if ( !scrolling ) {
                    trigger( event, true );
                }

                clearTimeout( timer );
                timer = setTimeout( function() {
                    trigger( event, false );
                }, 50 );
            });
        }
    };

    // also handles taphold
    $.event.special.tap = {
        tapholdThreshold: 750,

        setup: function() {
            var thisObject = this,
                $this = $( thisObject );

            $this.bind( "vmousedown", function( event ) {

                if ( event.which && event.which !== 1 ) {
                    return false;
                }

                var origTarget = event.target,
                    origEvent = event.originalEvent,
                    timer;

                function clearTapTimer() {
                    clearTimeout( timer );
                }

                function clearTapHandlers() {
                    clearTapTimer();

                    $this.unbind( "vclick", clickHandler )
                        .unbind( "vmouseup", clearTapTimer );
                    $document.unbind( "vmousecancel", clearTapHandlers );
                }

                function clickHandler( event ) {
                    clearTapHandlers();

                    // ONLY trigger a 'tap' event if the start target is
                    // the same as the stop target.
                    if ( origTarget === event.target ) {
                        triggerCustomEvent( thisObject, "tap", event );
                    }
                }

                $this.bind( "vmouseup", clearTapTimer )
                    .bind( "vclick", clickHandler );
                $document.bind( "vmousecancel", clearTapHandlers );

                timer = setTimeout( function() {
                    triggerCustomEvent( thisObject, "taphold", $.Event( "taphold", { target: origTarget } ) );
                }, $.event.special.tap.tapholdThreshold );
            });
        }
    };

    // also handles swipeleft, swiperight
    $.event.special.swipe = {
        scrollSupressionThreshold: 30, // More than this horizontal displacement, and we will suppress scrolling.

        durationThreshold: 1000, // More time than this, and it isn't a swipe.

        horizontalDistanceThreshold: 30,  // Swipe horizontal displacement must be more than this.

        verticalDistanceThreshold: 75,  // Swipe vertical displacement must be less than this.

        start: function( event ) {
            var data = event.originalEvent.touches ?
                    event.originalEvent.touches[ 0 ] : event;
            return {
                        time: ( new Date() ).getTime(),
                        coords: [ data.pageX, data.pageY ],
                        origin: $( event.target )
                    };
        },

        stop: function( event ) {
            var data = event.originalEvent.touches ?
                    event.originalEvent.touches[ 0 ] : event;
            return {
                        time: ( new Date() ).getTime(),
                        coords: [ data.pageX, data.pageY ]
                    };
        },

        handleSwipe: function( start, stop ) {
            if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
                Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
                Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {

                start.origin.trigger( "swipe" )
                    .trigger( start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight" );
            }
        },

        setup: function() {
            var thisObject = this,
                $this = $( thisObject );

            $this.bind( touchStartEvent, function( event ) {
                var start = $.event.special.swipe.start( event ),
                    stop;

                function moveHandler( event ) {
                    if ( !start ) {
                        return;
                    }

                    stop = $.event.special.swipe.stop( event );

                    // prevent scrolling
                    if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
                        event.preventDefault();
                    }
                }

                $this.bind( touchMoveEvent, moveHandler )
                    .one( touchStopEvent, function() {
                        $this.unbind( touchMoveEvent, moveHandler );

                        if ( start && stop ) {
                            $.event.special.swipe.handleSwipe( start, stop );
                        }
                        start = stop = undefined;
                    });
            });
        }
    };
    $.each({
        scrollstop: "scrollstart",
        taphold: "tap",
        swipeleft: "swipe",
        swiperight: "swipe"
    }, function( event, sourceEvent ) {

        $.event.special[ event ] = {
            setup: function() {
                $( this ).bind( sourceEvent, $.noop );
            }
        };
    });

})( jQuery, this );


/*!
 * jQuery UI Widget v1.10.0pre - 2012-11-13 (ff055a0c353c3c8ce6e5bfa07ad7cb03e8885bc5)
 * http://jqueryui.com
 *
 * Copyright 2010, 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */
(function( $, undefined ) {

var uuid = 0,
    slice = Array.prototype.slice,
    _cleanData = $.cleanData;
$.cleanData = function( elems ) {
    for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
        try {
            $( elem ).triggerHandler( "remove" );
        // http://bugs.jquery.com/ticket/8235
        } catch( e ) {}
    }
    _cleanData( elems );
};

$.widget = function( name, base, prototype ) {
    var fullName, existingConstructor, constructor, basePrototype,
        namespace = name.split( "." )[ 0 ];

    name = name.split( "." )[ 1 ];
    fullName = namespace + "-" + name;

    if ( !prototype ) {
        prototype = base;
        base = $.Widget;
    }

    // create selector for plugin
    $.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
        return !!$.data( elem, fullName );
    };

    $[ namespace ] = $[ namespace ] || {};
    existingConstructor = $[ namespace ][ name ];
    constructor = $[ namespace ][ name ] = function( options, element ) {
        // allow instantiation without "new" keyword
        if ( !this._createWidget ) {
            return new constructor( options, element );
        }

        // allow instantiation without initializing for simple inheritance
        // must use "new" keyword (the code above always passes args)
        if ( arguments.length ) {
            this._createWidget( options, element );
        }
    };
    // extend with the existing constructor to carry over any static properties
    $.extend( constructor, existingConstructor, {
        version: prototype.version,
        // copy the object used to create the prototype in case we need to
        // redefine the widget later
        _proto: $.extend( {}, prototype ),
        // track widgets that inherit from this widget in case this widget is
        // redefined after a widget inherits from it
        _childConstructors: []
    });

    basePrototype = new base();
    // we need to make the options hash a property directly on the new instance
    // otherwise we'll modify the options hash on the prototype that we're
    // inheriting from
    basePrototype.options = $.widget.extend( {}, basePrototype.options );
    $.each( prototype, function( prop, value ) {
        if ( $.isFunction( value ) ) {
            prototype[ prop ] = (function() {
                var _super = function() {
                        return base.prototype[ prop ].apply( this, arguments );
                    },
                    _superApply = function( args ) {
                        return base.prototype[ prop ].apply( this, args );
                    };
                return function() {
                    var __super = this._super,
                        __superApply = this._superApply,
                        returnValue;

                    this._super = _super;
                    this._superApply = _superApply;

                    returnValue = value.apply( this, arguments );

                    this._super = __super;
                    this._superApply = __superApply;

                    return returnValue;
                };
            })();
        }
    });
    constructor.prototype = $.widget.extend( basePrototype, {
        // TODO: remove support for widgetEventPrefix
        // always use the name + a colon as the prefix, e.g., draggable:start
        // don't prefix for widgets that aren't DOM-based
        widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
    }, prototype, {
        constructor: constructor,
        namespace: namespace,
        widgetName: name,
        widgetFullName: fullName
    });

    // If this widget is being redefined then we need to find all widgets that
    // are inheriting from it and redefine all of them so that they inherit from
    // the new version of this widget. We're essentially trying to replace one
    // level in the prototype chain.
    if ( existingConstructor ) {
        $.each( existingConstructor._childConstructors, function( i, child ) {
            var childPrototype = child.prototype;

            // redefine the child widget using the same prototype that was
            // originally used, but inherit from the new version of the base
            $.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
        });
        // remove the list of existing child constructors from the old constructor
        // so the old child constructors can be garbage collected
        delete existingConstructor._childConstructors;
    } else {
        base._childConstructors.push( constructor );
    }

    $.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
    var input = slice.call( arguments, 1 ),
        inputIndex = 0,
        inputLength = input.length,
        key,
        value;
    for ( ; inputIndex < inputLength; inputIndex++ ) {
        for ( key in input[ inputIndex ] ) {
            value = input[ inputIndex ][ key ];
            if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
                // Clone objects
                if ( $.isPlainObject( value ) ) {
                    target[ key ] = $.isPlainObject( target[ key ] ) ?
                        $.widget.extend( {}, target[ key ], value ) :
                        // Don't extend strings, arrays, etc. with objects
                        $.widget.extend( {}, value );
                // Copy everything else by reference
                } else {
                    target[ key ] = value;
                }
            }
        }
    }
    return target;
};

$.widget.bridge = function( name, object ) {
    var fullName = object.prototype.widgetFullName || name;
    $.fn[ name ] = function( options ) {
        var isMethodCall = typeof options === "string",
            args = slice.call( arguments, 1 ),
            returnValue = this;

        // allow multiple hashes to be passed on init
        options = !isMethodCall && args.length ?
            $.widget.extend.apply( null, [ options ].concat(args) ) :
            options;

        if ( isMethodCall ) {
            this.each(function() {
                var methodValue,
                    instance = $.data( this, fullName );
                if ( !instance ) {
                    return $.error( "cannot call methods on " + name + " prior to initialization; " +
                        "attempted to call method '" + options + "'" );
                }
                if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
                    return $.error( "no such method '" + options + "' for " + name + " widget instance" );
                }
                methodValue = instance[ options ].apply( instance, args );
                if ( methodValue !== instance && methodValue !== undefined ) {
                    returnValue = methodValue && methodValue.jquery ?
                        returnValue.pushStack( methodValue.get() ) :
                        methodValue;
                    return false;
                }
            });
        } else {
            this.each(function() {
                var instance = $.data( this, fullName );
                if ( instance ) {
                    instance.option( options || {} )._init();
                } else {
                    $.data( this, fullName, new object( options, this ) );
                }
            });
        }

        return returnValue;
    };
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
    widgetName: "widget",
    widgetEventPrefix: "",
    defaultElement: "<div>",
    options: {
        disabled: false,

        // callbacks
        create: null
    },
    _createWidget: function( options, element ) {
        element = $( element || this.defaultElement || this )[ 0 ];
        this.element = $( element );
        this.uuid = uuid++;
        this.eventNamespace = "." + this.widgetName + this.uuid;
        this.options = $.widget.extend( {},
            this.options,
            this._getCreateOptions(),
            options );

        this.bindings = $();
        this.hoverable = $();
        this.focusable = $();

        if ( element !== this ) {
            $.data( element, this.widgetFullName, this );
            this._on( true, this.element, {
                remove: function( event ) {
                    if ( event.target === element ) {
                        this.destroy();
                    }
                }
            });
            this.document = $( element.style ?
                // element within the document
                element.ownerDocument :
                // element is window or document
                element.document || element );
            this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
        }

        this._create();
        this._trigger( "create", null, this._getCreateEventData() );
        this._init();
    },
    _getCreateOptions: $.noop,
    _getCreateEventData: $.noop,
    _create: $.noop,
    _init: $.noop,

    destroy: function() {
        this._destroy();
        // we can probably remove the unbind calls in 2.0
        // all event bindings should go through this._on()
        this.element
            .unbind( this.eventNamespace )
            // 1.9 BC for #7810
            // TODO remove dual storage
            .removeData( this.widgetName )
            .removeData( this.widgetFullName )
            // support: jquery <1.6.3
            // http://bugs.jquery.com/ticket/9413
            .removeData( $.camelCase( this.widgetFullName ) );
        this.widget()
            .unbind( this.eventNamespace )
            .removeAttr( "aria-disabled" )
            .removeClass(
                this.widgetFullName + "-disabled " +
                "ui-state-disabled" );

        // clean up events and states
        this.bindings.unbind( this.eventNamespace );
        this.hoverable.removeClass( "ui-state-hover" );
        this.focusable.removeClass( "ui-state-focus" );
    },
    _destroy: $.noop,

    widget: function() {
        return this.element;
    },

    option: function( key, value ) {
        var options = key,
            parts,
            curOption,
            i;

        if ( arguments.length === 0 ) {
            // don't return a reference to the internal hash
            return $.widget.extend( {}, this.options );
        }

        if ( typeof key === "string" ) {
            // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
            options = {};
            parts = key.split( "." );
            key = parts.shift();
            if ( parts.length ) {
                curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
                for ( i = 0; i < parts.length - 1; i++ ) {
                    curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
                    curOption = curOption[ parts[ i ] ];
                }
                key = parts.pop();
                if ( value === undefined ) {
                    return curOption[ key ] === undefined ? null : curOption[ key ];
                }
                curOption[ key ] = value;
            } else {
                if ( value === undefined ) {
                    return this.options[ key ] === undefined ? null : this.options[ key ];
                }
                options[ key ] = value;
            }
        }

        this._setOptions( options );

        return this;
    },
    _setOptions: function( options ) {
        var key;

        for ( key in options ) {
            this._setOption( key, options[ key ] );
        }

        return this;
    },
    _setOption: function( key, value ) {
        this.options[ key ] = value;

        if ( key === "disabled" ) {
            this.widget()
                .toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
                .attr( "aria-disabled", value );
            this.hoverable.removeClass( "ui-state-hover" );
            this.focusable.removeClass( "ui-state-focus" );
        }

        return this;
    },

    enable: function() {
        return this._setOption( "disabled", false );
    },
    disable: function() {
        return this._setOption( "disabled", true );
    },

    _on: function( suppressDisabledCheck, element, handlers ) {
        var delegateElement,
            instance = this;

        // no suppressDisabledCheck flag, shuffle arguments
        if ( typeof suppressDisabledCheck !== "boolean" ) {
            handlers = element;
            element = suppressDisabledCheck;
            suppressDisabledCheck = false;
        }

        // no element argument, shuffle and use this.element
        if ( !handlers ) {
            handlers = element;
            element = this.element;
            delegateElement = this.widget();
        } else {
            // accept selectors, DOM elements
            element = delegateElement = $( element );
            this.bindings = this.bindings.add( element );
        }

        $.each( handlers, function( event, handler ) {
            function handlerProxy() {
                // allow widgets to customize the disabled handling
                // - disabled as an array instead of boolean
                // - disabled class as method for disabling individual parts
                if ( !suppressDisabledCheck &&
                        ( instance.options.disabled === true ||
                            $( this ).hasClass( "ui-state-disabled" ) ) ) {
                    return;
                }
                return ( typeof handler === "string" ? instance[ handler ] : handler )
                    .apply( instance, arguments );
            }

            // copy the guid so direct unbinding works
            if ( typeof handler !== "string" ) {
                handlerProxy.guid = handler.guid =
                    handler.guid || handlerProxy.guid || $.guid++;
            }

            var match = event.match( /^(\w+)\s*(.*)$/ ),
                eventName = match[1] + instance.eventNamespace,
                selector = match[2];
            if ( selector ) {
                delegateElement.delegate( selector, eventName, handlerProxy );
            } else {
                element.bind( eventName, handlerProxy );
            }
        });
    },

    _off: function( element, eventName ) {
        eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
        element.unbind( eventName ).undelegate( eventName );
    },

    _delay: function( handler, delay ) {
        function handlerProxy() {
            return ( typeof handler === "string" ? instance[ handler ] : handler )
                .apply( instance, arguments );
        }
        var instance = this;
        return setTimeout( handlerProxy, delay || 0 );
    },

    _hoverable: function( element ) {
        this.hoverable = this.hoverable.add( element );
        this._on( element, {
            mouseenter: function( event ) {
                $( event.currentTarget ).addClass( "ui-state-hover" );
            },
            mouseleave: function( event ) {
                $( event.currentTarget ).removeClass( "ui-state-hover" );
            }
        });
    },

    _focusable: function( element ) {
        this.focusable = this.focusable.add( element );
        this._on( element, {
            focusin: function( event ) {
                $( event.currentTarget ).addClass( "ui-state-focus" );
            },
            focusout: function( event ) {
                $( event.currentTarget ).removeClass( "ui-state-focus" );
            }
        });
    },

    _trigger: function( type, event, data ) {
        var prop, orig,
            callback = this.options[ type ];

        data = data || {};
        event = $.Event( event );
        event.type = ( type === this.widgetEventPrefix ?
            type :
            this.widgetEventPrefix + type ).toLowerCase();
        // the original event may come from any element
        // so we need to reset the target on the new event
        event.target = this.element[ 0 ];

        // copy original event properties over to the new event
        orig = event.originalEvent;
        if ( orig ) {
            for ( prop in orig ) {
                if ( !( prop in event ) ) {
                    event[ prop ] = orig[ prop ];
                }
            }
        }

        this.element.trigger( event, data );
        return !( $.isFunction( callback ) &&
            callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
            event.isDefaultPrevented() );
    }
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
    $.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
        if ( typeof options === "string" ) {
            options = { effect: options };
        }
        var hasOptions,
            effectName = !options ?
                method :
                options === true || typeof options === "number" ?
                    defaultEffect :
                    options.effect || defaultEffect;
        options = options || {};
        if ( typeof options === "number" ) {
            options = { duration: options };
        }
        hasOptions = !$.isEmptyObject( options );
        options.complete = callback;
        if ( options.delay ) {
            element.delay( options.delay );
        }
        if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
            element[ method ]( options );
        } else if ( effectName !== method && element[ effectName ] ) {
            element[ effectName ]( options.duration, options.easing, callback );
        } else {
            element.queue(function( next ) {
                $( this )[ method ]();
                if ( callback ) {
                    callback.call( element[ 0 ] );
                }
                next();
            });
        }
    };
});

})( jQuery );

(function( $, undefined ) {

$.widget( "mobile.widget", {
    // decorate the parent _createWidget to trigger `widgetinit` for users
    // who wish to do post post `widgetcreate` alterations/additions
    //
    // TODO create a pull request for jquery ui to trigger this event
    // in the original _createWidget
    _createWidget: function() {
        $.Widget.prototype._createWidget.apply( this, arguments );
        this._trigger( 'init' );
    },

    _getCreateOptions: function() {

        var elem = this.element,
            options = {};

        $.each( this.options, function( option ) {

            var value = elem.jqmData( option.replace( /[A-Z]/g, function( c ) {
                            return "-" + c.toLowerCase();
                        })
                    );

            if ( value !== undefined ) {
                options[ option ] = value;
            }
        });

        return options;
    },

    enhanceWithin: function( target, useKeepNative ) {
        this.enhance( $( this.options.initSelector, $( target )), useKeepNative );
    },

    enhance: function( targets, useKeepNative ) {
        var page, keepNative, $widgetElements = $( targets ), self = this;

        // if ignoreContentEnabled is set to true the framework should
        // only enhance the selected elements when they do NOT have a
        // parent with the data-namespace-ignore attribute
        $widgetElements = $.mobile.enhanceable( $widgetElements );

        if ( useKeepNative && $widgetElements.length ) {
            // TODO remove dependency on the page widget for the keepNative.
            // Currently the keepNative value is defined on the page prototype so
            // the method is as well
            page = $.mobile.closestPageData( $widgetElements );
            keepNative = ( page && page.keepNativeSelector()) || "";

            $widgetElements = $widgetElements.not( keepNative );
        }

        $widgetElements[ this.widgetName ]();
    },

    raise: function( msg ) {
        throw "Widget [" + this.widgetName + "]: " + msg;
    }
});

})( jQuery );

(function( $ ) {
    var meta = $( "meta[name=viewport]" ),
        initialContent = meta.attr( "content" ),
        disabledZoom = initialContent + ",maximum-scale=1, user-scalable=no",
        enabledZoom = initialContent + ",maximum-scale=10, user-scalable=yes",
        disabledInitially = /(user-scalable[\s]*=[\s]*no)|(maximum-scale[\s]*=[\s]*1)[$,\s]/.test( initialContent );

    $.mobile.zoom = $.extend( {}, {
        enabled: !disabledInitially,
        locked: false,
        disable: function( lock ) {
            if ( !disabledInitially && !$.mobile.zoom.locked ) {
                meta.attr( "content", disabledZoom );
                $.mobile.zoom.enabled = false;
                $.mobile.zoom.locked = lock || false;
            }
        },
        enable: function( unlock ) {
            if ( !disabledInitially && ( !$.mobile.zoom.locked || unlock === true ) ) {
                meta.attr( "content", enabledZoom );
                $.mobile.zoom.enabled = true;
                $.mobile.zoom.locked = false;
            }
        },
        restore: function() {
            if ( !disabledInitially ) {
                meta.attr( "content", initialContent );
                $.mobile.zoom.enabled = true;
            }
        }
    });

}( jQuery ));

(function( $, window ) {

    $.mobile.iosorientationfixEnabled = true;

    // This fix addresses an iOS bug, so return early if the UA claims it's something else.
    var ua = navigator.userAgent;
    if( !( /iPhone|iPad|iPod/.test( navigator.platform ) && /OS [1-5]_[0-9_]* like Mac OS X/i.test( ua ) && ua.indexOf( "AppleWebKit" ) > -1 ) ){
        $.mobile.iosorientationfixEnabled = false;
        return;
    }

    var zoom = $.mobile.zoom,
        evt, x, y, z, aig;

    function checkTilt( e ) {
        evt = e.originalEvent;
        aig = evt.accelerationIncludingGravity;

        x = Math.abs( aig.x );
        y = Math.abs( aig.y );
        z = Math.abs( aig.z );

        // If portrait orientation and in one of the danger zones
        if ( !window.orientation && ( x > 7 || ( ( z > 6 && y < 8 || z < 8 && y > 6 ) && x > 5 ) ) ) {
                if ( zoom.enabled ) {
                    zoom.disable();
                }
        }   else if ( !zoom.enabled ) {
                zoom.enable();
        }
    }

    $.mobile.document.on( "mobileinit", function(){
        if( $.mobile.iosorientationfixEnabled ){
            $.mobile.window
                .bind( "orientationchange.iosorientationfix", zoom.enable )
                .bind( "devicemotion.iosorientationfix", checkTilt );
        }
    });

}( jQuery, this ));


(function( $, undefined ) {
        var path, documentBase, $base, dialogHashKey = "&ui-state=dialog";

        $.mobile.path = path = {
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

            // Abstraction to address xss (Issue #4787) by removing the authority in
            // browsers that auto   decode it. All references to location.href should be
            // replaced with a call to this method so that it can be dealt with properly here
            getLocation: function( url ) {
                var uri = url ? this.parseUrl( url ) : location,
                    hash = this.parseUrl( url || location.href ).hash;

                // mimic the browser with an empty string when the hash is empty
                hash = hash === "#" ? "" : hash;

                // Make sure to parse the url or the location object for the hash because using location.hash
                // is autodecoded in firefox, the rest of the url should be from the object (location unless
                // we're testing) to avoid the inclusion of the authority
                return uri.protocol + "//" + uri.host + uri.pathname + uri.search + hash;
            },

            parseLocation: function() {
                return this.parseUrl( this.getLocation() );
            },

            //Parse a URL into a structure that allows easy access to
            //all of the URL components by name.
            parseUrl: function( url ) {
                // If we're passed an object, we'll assume that it is
                // a parsed url object and just return it back to the caller.
                if ( $.type( url ) === "object" ) {
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

            //Returns true if both urls have the same domain.
            isSameDomain: function( absUrl1, absUrl2 ) {
                return path.parseUrl( absUrl1 ).domain === path.parseUrl( absUrl2 ).domain;
            },

            //Returns true for any relative variant.
            isRelativeUrl: function( url ) {
                // All relative Url variants have one thing in common, no protocol.
                return path.parseUrl( url ).protocol === "";
            },

            //Returns true for an absolute url.
            isAbsoluteUrl: function( url ) {
                return path.parseUrl( url ).protocol !== "";
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
            },

            //Add search (aka query) params to the specified url.
            addSearchParams: function( url, params ) {
                var u = path.parseUrl( url ),
                    p = ( typeof params === "object" ) ? $.param( params ) : params,
                    s = u.search || "?";
                return u.hrefNoSearch + s + ( s.charAt( s.length - 1 ) !== "?" ? "&" : "" ) + p + ( u.hash || "" );
            },

            convertUrlToDataUrl: function( absUrl ) {
                var u = path.parseUrl( absUrl );
                if ( path.isEmbeddedPage( u ) ) {
                    // For embedded pages, remove the dialog hash key as in getFilePath(),
                    // and remove otherwise the Data Url won't match the id of the embedded Page.
                    return u.hash
                        .split( dialogHashKey )[0]
                        .replace( /^#/, "" )
                        .replace( /\?.*$/, "" );
                } else if ( path.isSameDomain( u, this.documentBase ) ) {
                    return u.hrefNoHash.replace( this.documentBase.domain, "" ).split( dialogHashKey )[0];
                }

                return window.decodeURIComponent(absUrl);
            },

            //get path from current hash, or from a file path
            get: function( newPath ) {
                if ( newPath === undefined ) {
                    newPath = path.parseLocation().hash;
                }
                return path.stripHash( newPath ).replace( /[^\/]*\.[^\/*]+$/, '' );
            },

            //set location hash to path
            set: function( path ) {
                location.hash = path;
            },

            //test if a given url (string) is a path
            //NOTE might be exceptionally naive
            isPath: function( url ) {
                return ( /\// ).test( url );
            },

            //return a url path with the window's location protocol/hostname/pathname removed
            clean: function( url ) {
                return url.replace( this.documentBase.domain, "" );
            },

            //just return the url without an initial #
            stripHash: function( url ) {
                return url.replace( /^#/, "" );
            },

            stripQueryParams: function( url ) {
                return url.replace( /\?.*$/, "" );
            },

            //remove the preceding hash, any query params, and dialog notations
            cleanHash: function( hash ) {
                return path.stripHash( hash.replace( /\?.*$/, "" ).replace( dialogHashKey, "" ) );
            },

            isHashValid: function( hash ) {
                return ( /^#[^#]+$/ ).test( hash );
            },

            //check whether a url is referencing the same domain, or an external domain or different protocol
            //could be mailto, etc
            isExternal: function( url ) {
                var u = path.parseUrl( url );
                return u.protocol && u.domain !== this.documentUrl.domain ? true : false;
            },

            hasProtocol: function( url ) {
                return ( /^(:?\w+:)/ ).test( url );
            },

            isEmbeddedPage: function( url ) {
                var u = path.parseUrl( url );

                //if the path is absolute, then we need to compare the url against
                //both the this.documentUrl and the documentBase. The main reason for this
                //is that links embedded within external documents will refer to the
                //application document, whereas links embedded within the application
                //document will be resolved against the document base.
                if ( u.protocol !== "" ) {
                    return ( !this.isPath(u.hash) && u.hash && ( u.hrefNoHash === this.documentUrl.hrefNoHash || ( this.documentBaseDiffers && u.hrefNoHash === this.documentBase.hrefNoHash ) ) );
                }
                return ( /^#/ ).test( u.href );
            },

            squash: function( url, resolutionUrl ) {
                var state, href, cleanedUrl, search, stateIndex,
                    isPath = this.isPath( url ),
                    uri = this.parseUrl( url ),
                    preservedHash = uri.hash,
                    uiState = "";

                // produce a url against which we can resole the provided path
                resolutionUrl = resolutionUrl || (path.isPath(url) ? path.getLocation() : path.getDocumentUrl());

                // If the url is anything but a simple string, remove any preceding hash
                // eg #foo/bar -> foo/bar
                //    #foo -> #foo
                cleanedUrl = isPath ? path.stripHash( url ) : url;

                // If the url is a full url with a hash check if the parsed hash is a path
                // if it is, strip the #, and use it otherwise continue without change
                cleanedUrl = path.isPath( uri.hash ) ? path.stripHash( uri.hash ) : cleanedUrl;

                // Split the UI State keys off the href
                stateIndex = cleanedUrl.indexOf( this.uiStateKey );

                // store the ui state keys for use
                if( stateIndex > -1 ){
                    uiState = cleanedUrl.slice( stateIndex );
                    cleanedUrl = cleanedUrl.slice( 0, stateIndex );
                }

                // make the cleanedUrl absolute relative to the resolution url
                href = path.makeUrlAbsolute( cleanedUrl, resolutionUrl );

                // grab the search from the resolved url since parsing from
                // the passed url may not yield the correct result
                search = this.parseUrl( href ).search;

                // TODO all this crap is terrible, clean it up
                if ( isPath ) {
                    // reject the hash if it's a path or it's just a dialog key
                    if( path.isPath( preservedHash ) || preservedHash.replace("#", "").indexOf( this.uiStateKey ) === 0) {
                        preservedHash = "";
                    }

                    // Append the UI State keys where it exists and it's been removed
                    // from the url
                    if( uiState && preservedHash.indexOf( this.uiStateKey ) === -1){
                        preservedHash += uiState;
                    }

                    // make sure that pound is on the front of the hash
                    if( preservedHash.indexOf( "#" ) === -1 && preservedHash !== "" ){
                        preservedHash = "#" + preservedHash;
                    }

                    // reconstruct each of the pieces with the new search string and hash
                    href = path.parseUrl( href );
                    href = href.protocol + "//" + href.host + href.pathname + search + preservedHash;
                } else {
                    href += href.indexOf( "#" ) > -1 ? uiState : "#" + uiState;
                }

                return href;
            },

            isPreservableHash: function( hash ) {
                return hash.replace( "#", "" ).indexOf( this.uiStateKey ) === 0;
            }
        };

        path.documentUrl = path.parseLocation();

        $base = $( "head" ).find( "base" );

        path.documentBase = $base.length ?
            path.parseUrl( path.makeUrlAbsolute( $base.attr( "href" ), path.documentUrl.href ) ) :
            path.documentUrl;

        path.documentBaseDiffers = (path.documentUrl.hrefNoHash !== path.documentBase.hrefNoHash);

        //return the original document url
        path.getDocumentUrl = function( asParsedObject ) {
            return asParsedObject ? $.extend( {}, path.documentUrl ) : path.documentUrl.href;
        };

        //return the original document base url
        path.getDocumentBase = function( asParsedObject ) {
            return asParsedObject ? $.extend( {}, path.documentBase ) : path.documentBase.href;
        };
})( jQuery );



(function( $, undefined ) {
    var path = $.mobile.path;

    $.mobile.History = function( stack, index ) {
        this.stack = stack || [];
        this.activeIndex = index || 0;
    };

    $.extend($.mobile.History.prototype, {
        getActive: function() {
            return this.stack[ this.activeIndex ];
        },

        getLast: function() {
            return this.stack[ this.previousIndex ];
        },

        getNext: function() {
            return this.stack[ this.activeIndex + 1 ];
        },

        getPrev: function() {
            return this.stack[ this.activeIndex - 1 ];
        },

        // addNew is used whenever a new page is added
        add: function( url, data ){
            data = data || {};

            //if there's forward history, wipe it
            if ( this.getNext() ) {
                this.clearForward();
            }

            // if the hash is included in the data make sure the shape
            // is consistent for comparison
            if( data.hash && data.hash.indexOf( "#" ) === -1) {
                data.hash = "#" + data.hash;
            }

            data.url = url;
            this.stack.push( data );
            this.activeIndex = this.stack.length - 1;
        },

        //wipe urls ahead of active index
        clearForward: function() {
            this.stack = this.stack.slice( 0, this.activeIndex + 1 );
        },

        find: function( url, stack, earlyReturn ) {
            stack = stack || this.stack;

            var entry, i, length = stack.length, index;

            for ( i = 0; i < length; i++ ) {
                entry = stack[i];

                if ( decodeURIComponent(url) === decodeURIComponent(entry.url) ||
                    decodeURIComponent(url) === decodeURIComponent(entry.hash) ) {
                    index = i;

                    if( earlyReturn ) {
                        return index;
                    }
                }
            }

            return index;
        },

        closest: function( url ) {
            var closest, a = this.activeIndex;

            // First, take the slice of the history stack before the current index and search
            // for a url match. If one is found, we'll avoid avoid looking through forward history
            // NOTE the preference for backward history movement is driven by the fact that
            //      most mobile browsers only have a dedicated back button, and users rarely use
            //      the forward button in desktop browser anyhow
            closest = this.find( url, this.stack.slice(0, a) );

            // If nothing was found in backward history check forward. The `true`
            // value passed as the third parameter causes the find method to break
            // on the first match in the forward history slice. The starting index
            // of the slice must then be added to the result to get the element index
            // in the original history stack :( :(
            //
            // TODO this is hyper confusing and should be cleaned up (ugh so bad)
            if( closest === undefined ) {
                closest = this.find( url, this.stack.slice(a), true );
                closest = closest === undefined ? closest : closest + a;
            }

            return closest;
        },

        direct: function( opts ) {
            var newActiveIndex = this.closest( opts.url ), a = this.activeIndex;

            // save new page index, null check to prevent falsey 0 result
            // record the previous index for reference
            if( newActiveIndex !== undefined ) {
                this.activeIndex = newActiveIndex;
                this.previousIndex = a;
            }

            // invoke callbacks where appropriate
            //
            // TODO this is also convoluted and confusing
            if ( newActiveIndex < a ) {
                ( opts.present || opts.back || $.noop )( this.getActive(), 'back' );
            } else if ( newActiveIndex > a ) {
                ( opts.present || opts.forward || $.noop )( this.getActive(), 'forward' );
            } else if ( newActiveIndex === undefined && opts.missing ){
                opts.missing( this.getActive() );
            }
        }
    });
})( jQuery );


(function( $, undefined ) {
    var path = $.mobile.path;

    $.mobile.Navigator = function( history ) {
        this.history = history;
        this.ignoreInitialHashChange = true;

        // This ensures that browsers which don't fire the initial popstate
        // like opera don't have further hash assignment popstates blocked
        setTimeout($.proxy(function() {
            this.ignoreInitialHashChange = false;
        }, this), 200);

        $.mobile.window.bind({
            "popstate.history": $.proxy( this.popstate, this ),
            "hashchange.history": $.proxy( this.hashchange, this )
        });
    };

    $.extend($.mobile.Navigator.prototype, {
        squash: function( url, data ) {
            var state, href, hash = path.isPath(url) ? path.stripHash(url) : url;

            href = path.squash( url );

            // make sure to provide this information when it isn't explicitly set in the
            // data object that was passed to the squash method
            state = $.extend({
                hash: hash,
                url: href
            }, data);

            // replace the current url with the new href and store the state
            // Note that in some cases we might be replacing an url with the
            // same url. We do this anyways because we need to make sure that
            // all of our history entries have a state object associated with
            // them. This allows us to work around the case where $.mobile.back()
            // is called to transition from an external page to an embedded page.
            // In that particular case, a hashchange event is *NOT* generated by the browser.
            // Ensuring each history entry has a state object means that onPopState()
            // will always trigger our hashchange callback even when a hashchange event
            // is not fired.
            window.history.replaceState( state, state.title || document.title, href );

            return state;
        },

        hash: function( url, href ) {
            var parsed, loc, hash;

            // Grab the hash for recording. If the passed url is a path
            // we used the parsed version of the squashed url to reconstruct,
            // otherwise we assume it's a hash and store it directly
            parsed = path.parseUrl( url );
            loc = path.parseLocation();

            if( loc.pathname + loc.search === parsed.pathname + parsed.search ) {
                // If the pathname and search of the passed url is identical to the current loc
                // then we must use the hash. Otherwise there will be no event
                // eg, url = "/foo/bar?baz#bang", location.href = "http://example.com/foo/bar?baz"
                hash = parsed.hash ? parsed.hash : parsed.pathname + parsed.search;
            } else if ( path.isPath(url) ) {
                var resolved = path.parseUrl( href );
                // If the passed url is a path, make it domain relative and remove any trailing hash
                hash = resolved.pathname + resolved.search + (path.isPreservableHash( resolved.hash )? resolved.hash.replace( "#", "" ) : "");
            } else {
                hash = url;
            }

            return hash;
        },

        // TODO reconsider name
        go: function( url, data, noEvents ) {
            var state, href, hash, popstateEvent,
                isPopStateEvent = $.event.special.navigate.isPushStateEnabled();

            // Get the url as it would look squashed on to the current resolution url
            href = path.squash( url );

            // sort out what the hash sould be from the url
            hash = this.hash( url, href );

            // Here we prevent the next hash change or popstate event from doing any
            // history management. In the case of hashchange we don't swallow it
            // if there will be no hashchange fired (since that won't reset the value)
            // and will swallow the following hashchange
            if( noEvents && hash !== path.stripHash(path.parseLocation().hash) ) {
                this.preventNextHashChange = noEvents;
            }

            // IMPORTANT in the case where popstate is supported the event will be triggered
            //      directly, stopping further execution - ie, interupting the flow of this
            //      method call to fire bindings at this expression. Below the navigate method
            //      there is a binding to catch this event and stop its propagation.
            //
            //      We then trigger a new popstate event on the window with a null state
            //      so that the navigate events can conclude their work properly
            //
            // if the url is a path we want to preserve the query params that are available on
            // the current url.
            this.preventHashAssignPopState = true;
            window.location.hash = hash;

            // If popstate is enabled and the browser triggers `popstate` events when the hash
            // is set (this often happens immediately in browsers like Chrome), then the
            // this flag will be set to false already. If it's a browser that does not trigger
            // a `popstate` on hash assignement or `replaceState` then we need avoid the branch
            // that swallows the event created by the popstate generated by the hash assignment
            // At the time of this writing this happens with Opera 12 and some version of IE
            this.preventHashAssignPopState = false;

            state = $.extend({
                url: href,
                hash: hash,
                title: document.title
            }, data);

            if( isPopStateEvent ) {
                popstateEvent = new $.Event( "popstate" );
                popstateEvent.originalEvent = {
                    type: "popstate",
                    state: null
                };

                this.squash( url, state );

                // Trigger a new faux popstate event to replace the one that we
                // caught that was triggered by the hash setting above.
                if( !noEvents ) {
                    this.ignorePopState = true;
                    $.mobile.window.trigger( popstateEvent );
                }
            }

            // record the history entry so that the information can be included
            // in hashchange event driven navigate events in a similar fashion to
            // the state that's provided by popstate
            this.history.add( state.url, state );
        },


        // This binding is intended to catch the popstate events that are fired
        // when execution of the `$.navigate` method stops at window.location.hash = url;
        // and completely prevent them from propagating. The popstate event will then be
        // retriggered after execution resumes
        //
        // TODO grab the original event here and use it for the synthetic event in the
        //      second half of the navigate execution that will follow this binding
        popstate: function( event ) {
            var active, hash, state, closestIndex;

            // Partly to support our test suite which manually alters the support
            // value to test hashchange. Partly to prevent all around weirdness
            if( !$.event.special.navigate.isPushStateEnabled() ){
                return;
            }

            // If this is the popstate triggered by the actual alteration of the hash
            // prevent it completely. History is tracked manually
            if( this.preventHashAssignPopState ) {
                this.preventHashAssignPopState = false;
                event.stopImmediatePropagation();
                return;
            }

            // if this is the popstate triggered after the `replaceState` call in the go
            // method, then simply ignore it. The history entry has already been captured
            if( this.ignorePopState ) {
                this.ignorePopState = false;
                return;
            }

            // If there is no state, and the history stack length is one were
            // probably getting the page load popstate fired by browsers like chrome
            // avoid it and set the one time flag to false
            if( !event.originalEvent.state &&
                this.history.stack.length === 1 &&
                this.ignoreInitialHashChange ) {
                this.ignoreInitialHashChange = false;

                return;
            }

            // account for direct manipulation of the hash. That is, we will receive a popstate
            // when the hash is changed by assignment, and it won't have a state associated. We
            // then need to squash the hash. See below for handling of hash assignment that
            // matches an existing history entry
            // TODO it might be better to only add to the history stack
            //      when the hash is adjacent to the active history entry
            hash = path.parseLocation().hash;
            if( !event.originalEvent.state && hash ) {
                // squash the hash that's been assigned on the URL with replaceState
                // also grab the resulting state object for storage
                state = this.squash( hash );

                // record the new hash as an additional history entry
                // to match the browser's treatment of hash assignment
                this.history.add( state.url, state );

                // pass the newly created state information
                // along with the event
                event.historyState = state;

                // do not alter history, we've added a new history entry
                // so we know where we are
                return;
            }

            // If all else fails this is a popstate that comes from the back or forward buttons
            // make sure to set the state of our history stack properly, and record the directionality
            this.history.direct({
                url: (event.originalEvent.state || {}).url || hash,

                // When the url is either forward or backward in history include the entry
                // as data on the event object for merging as data in the navigate event
                present: function( historyEntry, direction ) {
                    // make sure to create a new object to pass down as the navigate event data
                    event.historyState = $.extend({}, historyEntry);
                    event.historyState.direction = direction;
                }
            });
        },

        // NOTE must bind before `navigate` special event hashchange binding otherwise the
        //      navigation data won't be attached to the hashchange event in time for those
        //      bindings to attach it to the `navigate` special event
        // TODO add a check here that `hashchange.navigate` is bound already otherwise it's
        //      broken (exception?)
        hashchange: function( event ) {
            var history, hash;

            // If hashchange listening is explicitly disabled or pushstate is supported
            // avoid making use of the hashchange handler.
            if(!$.event.special.navigate.isHashChangeEnabled() ||
                $.event.special.navigate.isPushStateEnabled() ) {
                return;
            }

            // On occasion explicitly want to prevent the next hash from propogating because we only
            // with to alter the url to represent the new state do so here
            if( this.preventNextHashChange ){
                this.preventNextHashChange = false;
                event.stopImmediatePropagation();
                return;
            }

            history = this.history;
            hash = path.parseLocation().hash;

            // If this is a hashchange caused by the back or forward button
            // make sure to set the state of our history stack properly
            this.history.direct({
                url: hash,

                // When the url is either forward or backward in history include the entry
                // as data on the event object for merging as data in the navigate event
                present: function( historyEntry, direction ) {
                    // make sure to create a new object to pass down as the navigate event data
                    event.hashchangeState = $.extend({}, historyEntry);
                    event.hashchangeState.direction = direction;
                },

                // When we don't find a hash in our history clearly we're aiming to go there
                // record the entry as new for future traversal
                //
                // NOTE it's not entirely clear that this is the right thing to do given that we
                //      can't know the users intention. It might be better to explicitly _not_
                //      support location.hash assignment in preference to $.navigate calls
                // TODO first arg to add should be the href, but it causes issues in identifying
                //      embeded pages
                missing: function() {
                    history.add( hash, {
                        hash: hash,
                        title: document.title
                    });
                }
            });
        }
    });
})( jQuery );



(function( $, undefined ) {
    // TODO consider queueing navigation activity until previous activities have completed
    //      so that end users don't have to think about it. Punting for now
    // TODO !! move the event bindings into callbacks on the navigate event
    $.mobile.navigate = function( url, data, noEvents ) {
        $.mobile.navigate.navigator.go( url, data, noEvents );
    };

    // expose the history on the navigate method in anticipation of full integration with
    // existing navigation functionalty that is tightly coupled to the history information
    $.mobile.navigate.history = new $.mobile.History();

    // instantiate an instance of the navigator for use within the $.navigate method
    $.mobile.navigate.navigator = new $.mobile.Navigator( $.mobile.navigate.history );

    var loc = $.mobile.path.parseLocation();
    $.mobile.navigate.history.add( loc.href, {hash: loc.hash} );
})( jQuery );


/*
* fallback transition for flip in non-3D supporting browsers (which tend to handle complex transitions poorly in general
*/

(function( $, window, undefined ) {

$.mobile.transitionFallbacks.flip = "fade";

})( jQuery, this );
/*
* fallback transition for flow in non-3D supporting browsers (which tend to handle complex transitions poorly in general
*/

(function( $, window, undefined ) {

$.mobile.transitionFallbacks.flow = "fade";

})( jQuery, this );
/*
* fallback transition for pop in non-3D supporting browsers (which tend to handle complex transitions poorly in general
*/

(function( $, window, undefined ) {

$.mobile.transitionFallbacks.pop = "fade";

})( jQuery, this );
/*
* fallback transition for slide in non-3D supporting browsers (which tend to handle complex transitions poorly in general
*/

(function( $, window, undefined ) {

// Use the simultaneous transitions handler for slide transitions
$.mobile.transitionHandlers.slide = $.mobile.transitionHandlers.simultaneous;

// Set the slide transitions's fallback to "fade"
$.mobile.transitionFallbacks.slide = "fade";

})( jQuery, this );
/*
* fallback transition for slidedown in non-3D supporting browsers (which tend to handle complex transitions poorly in general
*/

(function( $, window, undefined ) {

$.mobile.transitionFallbacks.slidedown = "fade";

})( jQuery, this );
/*
* fallback transition for slidefade in non-3D supporting browsers (which tend to handle complex transitions poorly in general
*/

(function( $, window, undefined ) {

// Set the slide transitions's fallback to "fade"
$.mobile.transitionFallbacks.slidefade = "fade";

})( jQuery, this );
/*
* fallback transition for slideup in non-3D supporting browsers (which tend to handle complex transitions poorly in general
*/

(function( $, window, undefined ) {

$.mobile.transitionFallbacks.slideup = "fade";

})( jQuery, this );
/*
* fallback transition for turn in non-3D supporting browsers (which tend to handle complex transitions poorly in general
*/

(function( $, window, undefined ) {

$.mobile.transitionFallbacks.turn = "fade";

})( jQuery, this );


(function( $, window ) {
    // DEPRECATED
    // NOTE global mobile object settings
    $.extend( $.mobile, {
        // DEPRECATED Should the text be visble in the loading message?
        loadingMessageTextVisible: undefined,

        // DEPRECATED When the text is visible, what theme does the loading box use?
        loadingMessageTheme: undefined,

        // DEPRECATED default message setting
        loadingMessage: undefined,

        // DEPRECATED
        // Turn on/off page loading message. Theme doubles as an object argument
        // with the following shape: { theme: '', text: '', html: '', textVisible: '' }
        // NOTE that the $.mobile.loading* settings and params past the first are deprecated
        showPageLoadingMsg: function( theme, msgText, textonly ) {
            $.mobile.loading( 'show', theme, msgText, textonly );
        },

        // DEPRECATED
        hidePageLoadingMsg: function() {
            $.mobile.loading( 'hide' );
        },

        loading: function() {
            this.loaderWidget.loader.apply( this.loaderWidget, arguments );
        }
    });

    // TODO move loader class down into the widget settings
    var loaderClass = "ui-loader", $html = $( "html" ), $window = $.mobile.window;

    $.widget( "mobile.loader", {
        // NOTE if the global config settings are defined they will override these
        //      options
        options: {
            // the theme for the loading message
            theme: "a",

            // whether the text in the loading message is shown
            textVisible: false,

            // custom html for the inner content of the loading message
            html: "",

            // the text to be displayed when the popup is shown
            text: "loading"
        },

        defaultHtml: "<div class='" + loaderClass + "'>" +
            "<span class='ui-icon ui-icon-loading'></span>" +
            "<h1></h1>" +
            "</div>",

        // For non-fixed supportin browsers. Position at y center (if scrollTop supported), above the activeBtn (if defined), or just 100px from top
        fakeFixLoader: function() {
            var activeBtn = $( "." + $.mobile.activeBtnClass ).first();

            this.element
                .css({
                    top: $.support.scrollTop && $window.scrollTop() + $window.height() / 2 ||
                        activeBtn.length && activeBtn.offset().top || 100
                });
        },

        // check position of loader to see if it appears to be "fixed" to center
        // if not, use abs positioning
        checkLoaderPosition: function() {
            var offset = this.element.offset(),
                scrollTop = $window.scrollTop(),
                screenHeight = $.mobile.getScreenHeight();

            if ( offset.top < scrollTop || ( offset.top - scrollTop ) > screenHeight ) {
                this.element.addClass( "ui-loader-fakefix" );
                this.fakeFixLoader();
                $window
                    .unbind( "scroll", this.checkLoaderPosition )
                    .bind( "scroll", $.proxy( this.fakeFixLoader, this ) );
            }
        },

        resetHtml: function() {
            this.element.html( $( this.defaultHtml ).html() );
        },

        // Turn on/off page loading message. Theme doubles as an object argument
        // with the following shape: { theme: '', text: '', html: '', textVisible: '' }
        // NOTE that the $.mobile.loading* settings and params past the first are deprecated
        // TODO sweet jesus we need to break some of this out
        show: function( theme, msgText, textonly ) {
            var textVisible, message, $header, loadSettings;

            this.resetHtml();

            // use the prototype options so that people can set them globally at
            // mobile init. Consistency, it's what's for dinner
            if ( $.type(theme) === "object" ) {
                loadSettings = $.extend( {}, this.options, theme );

                // prefer object property from the param then the old theme setting
                theme = loadSettings.theme || $.mobile.loadingMessageTheme;
            } else {
                loadSettings = this.options;

                // here we prefer the them value passed as a string argument, then
                // we prefer the global option because we can't use undefined default
                // prototype options, then the prototype option
                theme = theme || $.mobile.loadingMessageTheme || loadSettings.theme;
            }

            // set the message text, prefer the param, then the settings object
            // then loading message
            message = msgText || $.mobile.loadingMessage || loadSettings.text;

            // prepare the dom
            $html.addClass( "ui-loading" );

            if ( $.mobile.loadingMessage !== false || loadSettings.html ) {
                // boolean values require a bit more work :P, supports object properties
                // and old settings
                if ( $.mobile.loadingMessageTextVisible !== undefined ) {
                    textVisible = $.mobile.loadingMessageTextVisible;
                } else {
                    textVisible = loadSettings.textVisible;
                }

                // add the proper css given the options (theme, text, etc)
                // Force text visibility if the second argument was supplied, or
                // if the text was explicitly set in the object args
                this.element.attr("class", loaderClass +
                    " ui-corner-all ui-body-" + theme +
                    " ui-loader-" + ( textVisible || msgText || theme.text ? "verbose" : "default" ) +
                    ( loadSettings.textonly || textonly ? " ui-loader-textonly" : "" ) );

                // TODO verify that jquery.fn.html is ok to use in both cases here
                //      this might be overly defensive in preventing unknowing xss
                // if the html attribute is defined on the loading settings, use that
                // otherwise use the fallbacks from above
                if ( loadSettings.html ) {
                    this.element.html( loadSettings.html );
                } else {
                    this.element.find( "h1" ).text( message );
                }

                // attach the loader to the DOM
                this.element.appendTo( $.mobile.pageContainer );

                // check that the loader is visible
                this.checkLoaderPosition();

                // on scroll check the loader position
                $window.bind( "scroll", $.proxy( this.checkLoaderPosition, this ) );
            }
        },

        hide: function() {
            $html.removeClass( "ui-loading" );

            if ( $.mobile.loadingMessage ) {
                this.element.removeClass( "ui-loader-fakefix" );
            }

            $.mobile.window.unbind( "scroll", this.fakeFixLoader );
            $.mobile.window.unbind( "scroll", this.checkLoaderPosition );
        }
    });

    $window.bind( 'pagecontainercreate', function() {
        $.mobile.loaderWidget = $.mobile.loaderWidget || $( $.mobile.loader.prototype.defaultHtml ).loader();
    });
})(jQuery, this);


(function( $, undefined ) {

$.widget( "mobile.page", $.mobile.widget, {
    options: {
        theme: "c",
        domCache: false,
        keepNativeDefault: ":jqmData(role='none'), :jqmData(role='nojs')"
    },

    _create: function() {
        // if false is returned by the callbacks do not create the page
        if ( this._trigger( "beforecreate" ) === false ) {
            return false;
        }

        this.element
            .attr( "tabindex", "0" )
            .addClass( "ui-page ui-body-" + this.options.theme );

        this._on( this.element, {
            pagebeforehide: "removeContainerBackground",
            pagebeforeshow: "_handlePageBeforeShow"
        });
    },

    _handlePageBeforeShow: function( e ) {
        this.setContainerBackground();
    },

    removeContainerBackground: function() {
        $.mobile.pageContainer.removeClass( "ui-overlay-" + $.mobile.getInheritedTheme( this.element.parent() ) );
    },

    // set the page container background to the page theme
    setContainerBackground: function( theme ) {
        if ( this.options.theme ) {
            $.mobile.pageContainer.addClass( "ui-overlay-" + ( theme || this.options.theme ) );
        }
    },

    keepNativeSelector: function() {
        var options = this.options,
            keepNativeDefined = options.keepNative && $.trim( options.keepNative );

        if ( keepNativeDefined && options.keepNative !== options.keepNativeDefault ) {
            return [options.keepNative, options.keepNativeDefault].join( ", " );
        }

        return options.keepNativeDefault;
    }
});
})( jQuery );

(function( $, undefined ) {

    //define vars for interal use
    var $window = $.mobile.window,
        $html = $( 'html' ),
        $head = $( 'head' ),

        // NOTE: path extensions dependent on core attributes. Moved here to remove deps from
        //       $.mobile.path definition
        path = $.extend($.mobile.path, {

            //return the substring of a filepath before the sub-page key, for making a server request
            getFilePath: function( path ) {
                var splitkey = '&' + $.mobile.subPageUrlKey;
                return path && path.split( splitkey )[0].split( dialogHashKey )[0];
            },

            //check if the specified url refers to the first page in the main application document.
            isFirstPageUrl: function( url ) {
                // We only deal with absolute paths.
                var u = path.parseUrl( path.makeUrlAbsolute( url, this.documentBase ) ),

                    // Does the url have the same path as the document?
                    samePath = u.hrefNoHash === this.documentUrl.hrefNoHash || ( this.documentBaseDiffers && u.hrefNoHash === this.documentBase.hrefNoHash ),

                    // Get the first page element.
                    fp = $.mobile.firstPage,

                    // Get the id of the first page element if it has one.
                    fpId = fp && fp[0] ? fp[0].id : undefined;

                // The url refers to the first page if the path matches the document and
                // it either has no hash value, or the hash is exactly equal to the id of the
                // first page element.
                return samePath && ( !u.hash || u.hash === "#" || ( fpId && u.hash.replace( /^#/, "" ) === fpId ) );
            },

            // Some embedded browsers, like the web view in Phone Gap, allow cross-domain XHR
            // requests if the document doing the request was loaded via the file:// protocol.
            // This is usually to allow the application to "phone home" and fetch app specific
            // data. We normally let the browser handle external/cross-domain urls, but if the
            // allowCrossDomainPages option is true, we will allow cross-domain http/https
            // requests to go through our page loading logic.
            isPermittedCrossDomainRequest: function( docUrl, reqUrl ) {
                return $.mobile.allowCrossDomainPages &&
                    docUrl.protocol === "file:" &&
                    reqUrl.search( /^https?:/ ) !== -1;
            }
        }),

        // used to track last vclicked element to make sure its value is added to form data
        $lastVClicked = null,

        //will be defined when a link is clicked and given an active class
        $activeClickedLink = null,

        // resolved on domready
        domreadyDeferred = $.Deferred(),

        //urlHistory is purely here to make guesses at whether the back or forward button was clicked
        //and provide an appropriate transition
        urlHistory = $.mobile.navigate.history,

        //define first selector to receive focus when a page is shown
        focusable = "[tabindex],a,button:visible,select:visible,input",

        //queue to hold simultanious page transitions
        pageTransitionQueue = [],

        //indicates whether or not page is in process of transitioning
        isPageTransitioning = false,

        //nonsense hash change key for dialogs, so they create a history entry
        dialogHashKey = "&ui-state=dialog",

        //existing base tag?
        $base = $head.children( "base" ),

        //tuck away the original document URL minus any fragment.
        documentUrl = path.documentUrl,

        //if the document has an embedded base tag, documentBase is set to its
        //initial value. If a base tag does not exist, then we default to the documentUrl.
        documentBase = path.documentBase,

        //cache the comparison once.
        documentBaseDiffers = path.documentBaseDiffers,

        getScreenHeight = $.mobile.getScreenHeight;

        //base element management, defined depending on dynamic base tag support
        var base = $.support.dynamicBaseTag ? {

            //define base element, for use in routing asset urls that are referenced in Ajax-requested markup
            element: ( $base.length ? $base : $( "<base>", { href: documentBase.hrefNoHash } ).prependTo( $head ) ),

            //set the generated BASE element's href attribute to a new page's base path
            set: function( href ) {
                href = path.parseUrl(href).hrefNoHash;
                base.element.attr( "href", path.makeUrlAbsolute( href, documentBase ) );
            },

            //set the generated BASE element's href attribute to a new page's base path
            reset: function() {
                base.element.attr( "href", documentBase.hrefNoSearch );
            }

        } : undefined;


    //return the original document url
    $.mobile.getDocumentUrl = path.getDocumentUrl;

    //return the original document base url
    $.mobile.getDocumentBase = path.getDocumentBase;

    /* internal utility functions */

    // NOTE Issue #4950 Android phonegap doesn't navigate back properly
    //      when a full page refresh has taken place. It appears that hashchange
    //      and replacestate history alterations work fine but we need to support
    //      both forms of history traversal in our code that uses backward history
    //      movement
    $.mobile.back = function() {
        var nav = window.navigator;

        // if the setting is on and the navigator object is
        // available use the phonegap navigation capability
        if( this.phonegapNavigationEnabled &&
            nav &&
            nav.app &&
            nav.app.backHistory ){
            nav.app.backHistory();
        } else {
            window.history.back();
        }
    };

    //direct focus to the page title, or otherwise first focusable element
    $.mobile.focusPage = function ( page ) {
        var autofocus = page.find( "[autofocus]" ),
            pageTitle = page.find( ".ui-title:eq(0)" );

        if ( autofocus.length ) {
            autofocus.focus();
            return;
        }

        if ( pageTitle.length ) {
            pageTitle.focus();
        } else{
            page.focus();
        }
    };

    //remove active classes after page transition or error
    function removeActiveLinkClass( forceRemoval ) {
        if ( !!$activeClickedLink && ( !$activeClickedLink.closest( "." + $.mobile.activePageClass ).length || forceRemoval ) ) {
            $activeClickedLink.removeClass( $.mobile.activeBtnClass );
        }
        $activeClickedLink = null;
    }

    function releasePageTransitionLock() {
        isPageTransitioning = false;
        if ( pageTransitionQueue.length > 0 ) {
            $.mobile.changePage.apply( null, pageTransitionQueue.pop() );
        }
    }

    // Save the last scroll distance per page, before it is hidden
    var setLastScrollEnabled = true,
        setLastScroll, delayedSetLastScroll;

    setLastScroll = function() {
        // this barrier prevents setting the scroll value based on the browser
        // scrolling the window based on a hashchange
        if ( !setLastScrollEnabled ) {
            return;
        }

        var active = $.mobile.urlHistory.getActive();

        if ( active ) {
            var lastScroll = $window.scrollTop();

            // Set active page's lastScroll prop.
            // If the location we're scrolling to is less than minScrollBack, let it go.
            active.lastScroll = lastScroll < $.mobile.minScrollBack ? $.mobile.defaultHomeScroll : lastScroll;
        }
    };

    // bind to scrollstop to gather scroll position. The delay allows for the hashchange
    // event to fire and disable scroll recording in the case where the browser scrolls
    // to the hash targets location (sometimes the top of the page). once pagechange fires
    // getLastScroll is again permitted to operate
    delayedSetLastScroll = function() {
        setTimeout( setLastScroll, 100 );
    };

    // disable an scroll setting when a hashchange has been fired, this only works
    // because the recording of the scroll position is delayed for 100ms after
    // the browser might have changed the position because of the hashchange
    $window.bind( $.support.pushState ? "popstate" : "hashchange", function() {
        setLastScrollEnabled = false;
    });

    // handle initial hashchange from chrome :(
    $window.one( $.support.pushState ? "popstate" : "hashchange", function() {
        setLastScrollEnabled = true;
    });

    // wait until the mobile page container has been determined to bind to pagechange
    $window.one( "pagecontainercreate", function() {
        // once the page has changed, re-enable the scroll recording
        $.mobile.pageContainer.bind( "pagechange", function() {

            setLastScrollEnabled = true;

            // remove any binding that previously existed on the get scroll
            // which may or may not be different than the scroll element determined for
            // this page previously
            $window.unbind( "scrollstop", delayedSetLastScroll );

            // determine and bind to the current scoll element which may be the window
            // or in the case of touch overflow the element with touch overflow
            $window.bind( "scrollstop", delayedSetLastScroll );
        });
    });

    // bind to scrollstop for the first page as "pagechange" won't be fired in that case
    $window.bind( "scrollstop", delayedSetLastScroll );

    // No-op implementation of transition degradation
    $.mobile._maybeDegradeTransition = $.mobile._maybeDegradeTransition || function( transition ) {
        return transition;
    };

    //function for transitioning between two existing pages
    function transitionPages( toPage, fromPage, transition, reverse ) {
        if ( fromPage ) {
            //trigger before show/hide events
            fromPage.data( "mobile-page" )._trigger( "beforehide", null, { nextPage: toPage } );
        }

        toPage.data( "mobile-page" )._trigger( "beforeshow", null, { prevPage: fromPage || $( "" ) } );

        //clear page loader
        $.mobile.hidePageLoadingMsg();

        transition = $.mobile._maybeDegradeTransition( transition );

        //find the transition handler for the specified transition. If there
        //isn't one in our transitionHandlers dictionary, use the default one.
        //call the handler immediately to kick-off the transition.
        var th = $.mobile.transitionHandlers[ transition || "default" ] || $.mobile.defaultTransitionHandler,
            promise = th( transition, reverse, toPage, fromPage );

        promise.done(function() {
            //trigger show/hide events
            if ( fromPage ) {
                fromPage.data( "mobile-page" )._trigger( "hide", null, { nextPage: toPage } );
            }

            //trigger pageshow, define prevPage as either fromPage or empty jQuery obj
            toPage.data( "mobile-page" )._trigger( "show", null, { prevPage: fromPage || $( "" ) } );
        });

        return promise;
    }

    //simply set the active page's minimum height to screen height, depending on orientation
    $.mobile.resetActivePageHeight = function resetActivePageHeight( height ) {
        var aPage = $( "." + $.mobile.activePageClass ),
            aPagePadT = parseFloat( aPage.css( "padding-top" ) ),
            aPagePadB = parseFloat( aPage.css( "padding-bottom" ) ),
            aPageBorderT = parseFloat( aPage.css( "border-top-width" ) ),
            aPageBorderB = parseFloat( aPage.css( "border-bottom-width" ) );

        height = ( typeof height === "number" )? height : getScreenHeight();
        
        aPage.css( "min-height", height - aPagePadT - aPagePadB - aPageBorderT - aPageBorderB );
    };

    //shared page enhancements
    function enhancePage( $page, role ) {
        // If a role was specified, make sure the data-role attribute
        // on the page element is in sync.
        if ( role ) {
            $page.attr( "data-" + $.mobile.ns + "role", role );
        }

        //run page plugin
        $page.page();
    }

    // determine the current base url
    function findBaseWithDefault() {
        var closestBase = ( $.mobile.activePage && getClosestBaseUrl( $.mobile.activePage ) );
        return closestBase || documentBase.hrefNoHash;
    }

    /* exposed $.mobile methods */

    //animation complete callback
    $.fn.animationComplete = function( callback ) {
        if ( $.support.cssTransitions ) {
            return $( this ).one( 'webkitAnimationEnd animationend', callback );
        }
        else{
            // defer execution for consistency between webkit/non webkit
            setTimeout( callback, 0 );
            return $( this );
        }
    };

    //expose path object on $.mobile
    $.mobile.path = path;

    //expose base object on $.mobile
    $.mobile.base = base;

    //history stack
    $.mobile.urlHistory = urlHistory;

    $.mobile.dialogHashKey = dialogHashKey;

    //enable cross-domain page support
    $.mobile.allowCrossDomainPages = false;

    $.mobile._bindPageRemove = function() {
        var page = $( this );

        // when dom caching is not enabled or the page is embedded bind to remove the page on hide
        if ( !page.data( "mobile-page" ).options.domCache &&
            page.is( ":jqmData(external-page='true')" ) ) {

            page.bind( 'pagehide.remove', function( e ) {
                var $this = $( this ),
                    prEvent = new $.Event( "pageremove" );

                $this.trigger( prEvent );

                if ( !prEvent.isDefaultPrevented() ) {
                    $this.removeWithDependents();
                }
            });
        }
    };

    // Load a page into the DOM.
    $.mobile.loadPage = function( url, options ) {
        // This function uses deferred notifications to let callers
        // know when the page is done loading, or if an error has occurred.
        var deferred = $.Deferred(),

            // The default loadPage options with overrides specified by
            // the caller.
            settings = $.extend( {}, $.mobile.loadPage.defaults, options ),

            // The DOM element for the page after it has been loaded.
            page = null,

            // If the reloadPage option is true, and the page is already
            // in the DOM, dupCachedPage will be set to the page element
            // so that it can be removed after the new version of the
            // page is loaded off the network.
            dupCachedPage = null,

            // The absolute version of the URL passed into the function. This
            // version of the URL may contain dialog/subpage params in it.
            absUrl = path.makeUrlAbsolute( url, findBaseWithDefault() );

        // If the caller provided data, and we're using "get" request,
        // append the data to the URL.
        if ( settings.data && settings.type === "get" ) {
            absUrl = path.addSearchParams( absUrl, settings.data );
            settings.data = undefined;
        }

        // If the caller is using a "post" request, reloadPage must be true
        if ( settings.data && settings.type === "post" ) {
            settings.reloadPage = true;
        }

        // The absolute version of the URL minus any dialog/subpage params.
        // In otherwords the real URL of the page to be loaded.
        var fileUrl = path.getFilePath( absUrl ),

            // The version of the Url actually stored in the data-url attribute of
            // the page. For embedded pages, it is just the id of the page. For pages
            // within the same domain as the document base, it is the site relative
            // path. For cross-domain pages (Phone Gap only) the entire absolute Url
            // used to load the page.
            dataUrl = path.convertUrlToDataUrl( absUrl );

        // Make sure we have a pageContainer to work with.
        settings.pageContainer = settings.pageContainer || $.mobile.pageContainer;

        // Check to see if the page already exists in the DOM.
        // NOTE do _not_ use the :jqmData psuedo selector because parenthesis
        //      are a valid url char and it breaks on the first occurence
        page = settings.pageContainer.children( "[data-" + $.mobile.ns +"url='" + dataUrl + "']" );

        // If we failed to find the page, check to see if the url is a
        // reference to an embedded page. If so, it may have been dynamically
        // injected by a developer, in which case it would be lacking a data-url
        // attribute and in need of enhancement.
        if ( page.length === 0 && dataUrl && !path.isPath( dataUrl ) ) {
            page = settings.pageContainer.children( "#" + dataUrl )
                .attr( "data-" + $.mobile.ns + "url", dataUrl )
                .jqmData( "url", dataUrl );
        }

        // If we failed to find a page in the DOM, check the URL to see if it
        // refers to the first page in the application. If it isn't a reference
        // to the first page and refers to non-existent embedded page, error out.
        if ( page.length === 0 ) {
            if ( $.mobile.firstPage && path.isFirstPageUrl( fileUrl ) ) {
                // Check to make sure our cached-first-page is actually
                // in the DOM. Some user deployed apps are pruning the first
                // page from the DOM for various reasons, we check for this
                // case here because we don't want a first-page with an id
                // falling through to the non-existent embedded page error
                // case. If the first-page is not in the DOM, then we let
                // things fall through to the ajax loading code below so
                // that it gets reloaded.
                if ( $.mobile.firstPage.parent().length ) {
                    page = $( $.mobile.firstPage );
                }
            } else if ( path.isEmbeddedPage( fileUrl )  ) {
                deferred.reject( absUrl, options );
                return deferred.promise();
            }
        }

        // If the page we are interested in is already in the DOM,
        // and the caller did not indicate that we should force a
        // reload of the file, we are done. Otherwise, track the
        // existing page as a duplicated.
        if ( page.length ) {
            if ( !settings.reloadPage ) {
                enhancePage( page, settings.role );
                deferred.resolve( absUrl, options, page );
                return deferred.promise();
            }
            dupCachedPage = page;
        }

        var mpc = settings.pageContainer,
            pblEvent = new $.Event( "pagebeforeload" ),
            triggerData = { url: url, absUrl: absUrl, dataUrl: dataUrl, deferred: deferred, options: settings };

        // Let listeners know we're about to load a page.
        mpc.trigger( pblEvent, triggerData );

        // If the default behavior is prevented, stop here!
        if ( pblEvent.isDefaultPrevented() ) {
            return deferred.promise();
        }

        if ( settings.showLoadMsg ) {

            // This configurable timeout allows cached pages a brief delay to load without showing a message
            var loadMsgDelay = setTimeout(function() {
                    $.mobile.showPageLoadingMsg();
                }, settings.loadMsgDelay ),

                // Shared logic for clearing timeout and removing message.
                hideMsg = function() {

                    // Stop message show timer
                    clearTimeout( loadMsgDelay );

                    // Hide loading message
                    $.mobile.hidePageLoadingMsg();
                };
        }

        // Reset base to the default document base.
        if ( base ) {
            base.reset();
        }

        if ( !( $.mobile.allowCrossDomainPages || path.isSameDomain( documentUrl, absUrl ) ) ) {
            deferred.reject( absUrl, options );
        } else {
            // Load the new page.
            $.ajax({
                url: fileUrl,
                type: settings.type,
                data: settings.data,
                dataType: "html",
                success: function( html, textStatus, xhr ) {
                    //pre-parse html to check for a data-url,
                    //use it as the new fileUrl, base path, etc
                    var all = $( "<div></div>" ),

                        //page title regexp
                        newPageTitle = html.match( /<title[^>]*>([^<]*)/ ) && RegExp.$1,

                        // TODO handle dialogs again
                        pageElemRegex = new RegExp( "(<[^>]+\\bdata-" + $.mobile.ns + "role=[\"']?page[\"']?[^>]*>)" ),
                        dataUrlRegex = new RegExp( "\\bdata-" + $.mobile.ns + "url=[\"']?([^\"'>]*)[\"']?" );


                    // data-url must be provided for the base tag so resource requests can be directed to the
                    // correct url. loading into a temprorary element makes these requests immediately
                    if ( pageElemRegex.test( html ) &&
                            RegExp.$1 &&
                            dataUrlRegex.test( RegExp.$1 ) &&
                            RegExp.$1 ) {
                        url = fileUrl = path.getFilePath( $( "<div>" + RegExp.$1 + "</div>" ).text() );
                    }

                    if ( base ) {
                        base.set( fileUrl );
                    }

                    //workaround to allow scripts to execute when included in page divs
                    all.get( 0 ).innerHTML = html;
                    page = all.find( ":jqmData(role='page'), :jqmData(role='dialog')" ).first();

                    //if page elem couldn't be found, create one and insert the body element's contents
                    if ( !page.length ) {
                        page = $( "<div data-" + $.mobile.ns + "role='page'>" + ( html.split( /<\/?body[^>]*>/gmi )[1] || "" ) + "</div>" );
                    }

                    if ( newPageTitle && !page.jqmData( "title" ) ) {
                        if ( ~newPageTitle.indexOf( "&" ) ) {
                            newPageTitle = $( "<div>" + newPageTitle + "</div>" ).text();
                        }
                        page.jqmData( "title", newPageTitle );
                    }

                    //rewrite src and href attrs to use a base url
                    if ( !$.support.dynamicBaseTag ) {
                        var newPath = path.get( fileUrl );
                        page.find( "[src], link[href], a[rel='external'], :jqmData(ajax='false'), a[target]" ).each(function() {
                            var thisAttr = $( this ).is( '[href]' ) ? 'href' :
                                    $( this ).is( '[src]' ) ? 'src' : 'action',
                                thisUrl = $( this ).attr( thisAttr );

                            // XXX_jblas: We need to fix this so that it removes the document
                            //            base URL, and then prepends with the new page URL.
                            //if full path exists and is same, chop it - helps IE out
                            thisUrl = thisUrl.replace( location.protocol + '//' + location.host + location.pathname, '' );

                            if ( !/^(\w+:|#|\/)/.test( thisUrl ) ) {
                                $( this ).attr( thisAttr, newPath + thisUrl );
                            }
                        });
                    }

                    //append to page and enhance
                    // TODO taging a page with external to make sure that embedded pages aren't removed
                    //      by the various page handling code is bad. Having page handling code in many
                    //      places is bad. Solutions post 1.0
                    page
                        .attr( "data-" + $.mobile.ns + "url", path.convertUrlToDataUrl( fileUrl ) )
                        .attr( "data-" + $.mobile.ns + "external-page", true )
                        .appendTo( settings.pageContainer );

                    // wait for page creation to leverage options defined on widget
                    page.one( 'pagecreate', $.mobile._bindPageRemove );

                    enhancePage( page, settings.role );

                    // Enhancing the page may result in new dialogs/sub pages being inserted
                    // into the DOM. If the original absUrl refers to a sub-page, that is the
                    // real page we are interested in.
                    if ( absUrl.indexOf( "&" + $.mobile.subPageUrlKey ) > -1 ) {
                        page = settings.pageContainer.children( "[data-" + $.mobile.ns +"url='" + dataUrl + "']" );
                    }

                    // Remove loading message.
                    if ( settings.showLoadMsg ) {
                        hideMsg();
                    }

                    // Add the page reference and xhr to our triggerData.
                    triggerData.xhr = xhr;
                    triggerData.textStatus = textStatus;
                    triggerData.page = page;

                    // Let listeners know the page loaded successfully.
                    settings.pageContainer.trigger( "pageload", triggerData );

                    deferred.resolve( absUrl, options, page, dupCachedPage );
                },
                error: function( xhr, textStatus, errorThrown ) {
                    //set base back to current path
                    if ( base ) {
                        base.set( path.get() );
                    }

                    // Add error info to our triggerData.
                    triggerData.xhr = xhr;
                    triggerData.textStatus = textStatus;
                    triggerData.errorThrown = errorThrown;

                    var plfEvent = new $.Event( "pageloadfailed" );

                    // Let listeners know the page load failed.
                    settings.pageContainer.trigger( plfEvent, triggerData );

                    // If the default behavior is prevented, stop here!
                    // Note that it is the responsibility of the listener/handler
                    // that called preventDefault(), to resolve/reject the
                    // deferred object within the triggerData.
                    if ( plfEvent.isDefaultPrevented() ) {
                        return;
                    }

                    // Remove loading message.
                    if ( settings.showLoadMsg ) {

                        // Remove loading message.
                        hideMsg();

                        // show error message
                        $.mobile.showPageLoadingMsg( $.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true );

                        // hide after delay
                        setTimeout( $.mobile.hidePageLoadingMsg, 1500 );
                    }

                    deferred.reject( absUrl, options );
                }
            });
        }

        return deferred.promise();
    };

    $.mobile.loadPage.defaults = {
        type: "get",
        data: undefined,
        reloadPage: false,
        role: undefined, // By default we rely on the role defined by the @data-role attribute.
        showLoadMsg: false,
        pageContainer: undefined,
        loadMsgDelay: 50 // This delay allows loads that pull from browser cache to occur without showing the loading message.
    };

    // Show a specific page in the page container.
    $.mobile.changePage = function( toPage, options ) {
        // If we are in the midst of a transition, queue the current request.
        // We'll call changePage() once we're done with the current transition to
        // service the request.
        if ( isPageTransitioning ) {
            pageTransitionQueue.unshift( arguments );
            return;
        }

        var settings = $.extend( {}, $.mobile.changePage.defaults, options ), isToPageString;

        // Make sure we have a pageContainer to work with.
        settings.pageContainer = settings.pageContainer || $.mobile.pageContainer;

        // Make sure we have a fromPage.
        settings.fromPage = settings.fromPage || $.mobile.activePage;

        isToPageString = (typeof toPage === "string");

        var mpc = settings.pageContainer,
            pbcEvent = new $.Event( "pagebeforechange" ),
            triggerData = { toPage: toPage, options: settings };

        // NOTE: preserve the original target as the dataUrl value will be simplified
        //       eg, removing ui-state, and removing query params from the hash
        //       this is so that users who want to use query params have access to them
        //       in the event bindings for the page life cycle See issue #5085
        if ( isToPageString ) {
            // if the toPage is a string simply convert it
            triggerData.absUrl = path.makeUrlAbsolute( toPage, findBaseWithDefault() );
        } else {
            // if the toPage is a jQuery object grab the absolute url stored
            // in the loadPage callback where it exists
            triggerData.absUrl = toPage.data( 'absUrl' );
        }

        // Let listeners know we're about to change the current page.
        mpc.trigger( pbcEvent, triggerData );

        // If the default behavior is prevented, stop here!
        if ( pbcEvent.isDefaultPrevented() ) {
            return;
        }

        // We allow "pagebeforechange" observers to modify the toPage in the trigger
        // data to allow for redirects. Make sure our toPage is updated.
        //
        // We also need to re-evaluate whether it is a string, because an object can
        // also be replaced by a string

        toPage = triggerData.toPage;
        isToPageString = (typeof toPage === "string");

        // Set the isPageTransitioning flag to prevent any requests from
        // entering this method while we are in the midst of loading a page
        // or transitioning.
        isPageTransitioning = true;

        // If the caller passed us a url, call loadPage()
        // to make sure it is loaded into the DOM. We'll listen
        // to the promise object it returns so we know when
        // it is done loading or if an error ocurred.
        if ( isToPageString ) {
            // preserve the original target as the dataUrl value will be simplified
            // eg, removing ui-state, and removing query params from the hash
            // this is so that users who want to use query params have access to them
            // in the event bindings for the page life cycle See issue #5085
            settings.target = toPage;

            $.mobile.loadPage( toPage, settings )
                .done(function( url, options, newPage, dupCachedPage ) {
                    isPageTransitioning = false;
                    options.duplicateCachedPage = dupCachedPage;

                    // store the original absolute url so that it can be provided
                    // to events in the triggerData of the subsequent changePage call
                    newPage.data( 'absUrl', triggerData.absUrl );
                    $.mobile.changePage( newPage, options );
                })
                .fail(function( url, options ) {
                    isPageTransitioning = false;

                    //clear out the active button state
                    removeActiveLinkClass( true );

                    //release transition lock so navigation is free again
                    releasePageTransitionLock();
                    settings.pageContainer.trigger( "pagechangefailed", triggerData );
                });
            return;
        }

        // If we are going to the first-page of the application, we need to make
        // sure settings.dataUrl is set to the application document url. This allows
        // us to avoid generating a document url with an id hash in the case where the
        // first-page of the document has an id attribute specified.
        if ( toPage[ 0 ] === $.mobile.firstPage[ 0 ] && !settings.dataUrl ) {
            settings.dataUrl = documentUrl.hrefNoHash;
        }

        // The caller passed us a real page DOM element. Update our
        // internal state and then trigger a transition to the page.
        var fromPage = settings.fromPage,
            url = ( settings.dataUrl && path.convertUrlToDataUrl( settings.dataUrl ) ) || toPage.jqmData( "url" ),
            // The pageUrl var is usually the same as url, except when url is obscured as a dialog url. pageUrl always contains the file path
            pageUrl = url,
            fileUrl = path.getFilePath( url ),
            active = urlHistory.getActive(),
            activeIsInitialPage = urlHistory.activeIndex === 0,
            historyDir = 0,
            pageTitle = document.title,
            isDialog = settings.role === "dialog" || toPage.jqmData( "role" ) === "dialog";


        // By default, we prevent changePage requests when the fromPage and toPage
        // are the same element, but folks that generate content manually/dynamically
        // and reuse pages want to be able to transition to the same page. To allow
        // this, they will need to change the default value of allowSamePageTransition
        // to true, *OR*, pass it in as an option when they manually call changePage().
        // It should be noted that our default transition animations assume that the
        // formPage and toPage are different elements, so they may behave unexpectedly.
        // It is up to the developer that turns on the allowSamePageTransitiona option
        // to either turn off transition animations, or make sure that an appropriate
        // animation transition is used.
        if ( fromPage && fromPage[0] === toPage[0] && !settings.allowSamePageTransition ) {
            isPageTransitioning = false;
            mpc.trigger( "pagechange", triggerData );

            // Even if there is no page change to be done, we should keep the urlHistory in sync with the hash changes
            if ( settings.fromHashChange ) {
                urlHistory.direct({ url: url });
            }

            return;
        }

        // We need to make sure the page we are given has already been enhanced.
        enhancePage( toPage, settings.role );

        // If the changePage request was sent from a hashChange event, check to see if the
        // page is already within the urlHistory stack. If so, we'll assume the user hit
        // the forward/back button and will try to match the transition accordingly.
        if ( settings.fromHashChange ) {
            historyDir = options.direction === "back" ? -1 : 1;
        }

        // Kill the keyboard.
        // XXX_jblas: We need to stop crawling the entire document to kill focus. Instead,
        //            we should be tracking focus with a delegate() handler so we already have
        //            the element in hand at this point.
        // Wrap this in a try/catch block since IE9 throw "Unspecified error" if document.activeElement
        // is undefined when we are in an IFrame.
        try {
            if ( document.activeElement && document.activeElement.nodeName.toLowerCase() !== 'body' ) {
                $( document.activeElement ).blur();
            } else {
                $( "input:focus, textarea:focus, select:focus" ).blur();
            }
        } catch( e ) {}

        // Record whether we are at a place in history where a dialog used to be - if so, do not add a new history entry and do not change the hash either
        var alreadyThere = false;

        // If we're displaying the page as a dialog, we don't want the url
        // for the dialog content to be used in the hash. Instead, we want
        // to append the dialogHashKey to the url of the current page.
        if ( isDialog && active ) {
            // on the initial page load active.url is undefined and in that case should
            // be an empty string. Moving the undefined -> empty string back into
            // urlHistory.addNew seemed imprudent given undefined better represents
            // the url state

            // If we are at a place in history that once belonged to a dialog, reuse
            // this state without adding to urlHistory and without modifying the hash.
            // However, if a dialog is already displayed at this point, and we're
            // about to display another dialog, then we must add another hash and
            // history entry on top so that one may navigate back to the original dialog
            if ( active.url &&
                active.url.indexOf( dialogHashKey ) > -1 &&
                $.mobile.activePage &&
                !$.mobile.activePage.is( ".ui-dialog" ) &&
                urlHistory.activeIndex > 0 ) {
                settings.changeHash = false;
                alreadyThere = true;
            }

            // Normally, we tack on a dialog hash key, but if this is the location of a stale dialog,
            // we reuse the URL from the entry
            url = ( active.url || "" );

            // account for absolute urls instead of just relative urls use as hashes
            if( !alreadyThere && url.indexOf("#") > -1 ) {
                url += dialogHashKey;
            } else {
                url += "#" + dialogHashKey;
            }

            // tack on another dialogHashKey if this is the same as the initial hash
            // this makes sure that a history entry is created for this dialog
            if ( urlHistory.activeIndex === 0 && url === urlHistory.initialDst ) {
                url += dialogHashKey;
            }
        }

        // if title element wasn't found, try the page div data attr too
        // If this is a deep-link or a reload ( active === undefined ) then just use pageTitle
        var newPageTitle = ( !active )? pageTitle : toPage.jqmData( "title" ) || toPage.children( ":jqmData(role='header')" ).find( ".ui-title" ).getEncodedText();
        if ( !!newPageTitle && pageTitle === document.title ) {
            pageTitle = newPageTitle;
        }
        if ( !toPage.jqmData( "title" ) ) {
            toPage.jqmData( "title", pageTitle );
        }

        // Make sure we have a transition defined.
        settings.transition = settings.transition ||
            ( ( historyDir && !activeIsInitialPage ) ? active.transition : undefined ) ||
            ( isDialog ? $.mobile.defaultDialogTransition : $.mobile.defaultPageTransition );

        //add page to history stack if it's not back or forward
        if ( !historyDir && alreadyThere ) {
            urlHistory.getActive().pageUrl = pageUrl;
        }

        // Set the location hash.
        if ( url && !settings.fromHashChange ) {
            var params;

            // rebuilding the hash here since we loose it earlier on
            // TODO preserve the originally passed in path
            if( !path.isPath( url ) && url.indexOf( "#" ) < 0 ) {
                url = "#" + url;
            }

            // TODO the property names here are just silly
            params = {
                transition: settings.transition,
                title: pageTitle,
                pageUrl: pageUrl,
                role: settings.role
            };

            if ( settings.changeHash !== false && $.mobile.hashListeningEnabled ) {
                $.mobile.navigate( url, params, true);
            } else if ( toPage[ 0 ] !== $.mobile.firstPage[ 0 ] ) {
                $.mobile.navigate.history.add( url, params );
            }
        }

        //set page title
        document.title = pageTitle;

        //set "toPage" as activePage
        $.mobile.activePage = toPage;

        // If we're navigating back in the URL history, set reverse accordingly.
        settings.reverse = settings.reverse || historyDir < 0;

        transitionPages( toPage, fromPage, settings.transition, settings.reverse )
            .done(function( name, reverse, $to, $from, alreadyFocused ) {
                removeActiveLinkClass();

                //if there's a duplicateCachedPage, remove it from the DOM now that it's hidden
                if ( settings.duplicateCachedPage ) {
                    settings.duplicateCachedPage.remove();
                }

                // Send focus to the newly shown page. Moved from promise .done binding in transitionPages
                // itself to avoid ie bug that reports offsetWidth as > 0 (core check for visibility)
                // despite visibility: hidden addresses issue #2965
                // https://github.com/jquery/jquery-mobile/issues/2965
                if ( !alreadyFocused ) {
                    $.mobile.focusPage( toPage );
                }

                releasePageTransitionLock();
                mpc.trigger( "pagechange", triggerData );
            });
    };

    $.mobile.changePage.defaults = {
        transition: undefined,
        reverse: false,
        changeHash: true,
        fromHashChange: false,
        role: undefined, // By default we rely on the role defined by the @data-role attribute.
        duplicateCachedPage: undefined,
        pageContainer: undefined,
        showLoadMsg: true, //loading message shows by default when pages are being fetched during changePage
        dataUrl: undefined,
        fromPage: undefined,
        allowSamePageTransition: false
    };

/* Event Bindings - hashchange, submit, and click */
    function findClosestLink( ele )
    {
        while ( ele ) {
            // Look for the closest element with a nodeName of "a".
            // Note that we are checking if we have a valid nodeName
            // before attempting to access it. This is because the
            // node we get called with could have originated from within
            // an embedded SVG document where some symbol instance elements
            // don't have nodeName defined on them, or strings are of type
            // SVGAnimatedString.
            if ( ( typeof ele.nodeName === "string" ) && ele.nodeName.toLowerCase() === "a" ) {
                break;
            }
            ele = ele.parentNode;
        }
        return ele;
    }

    // The base URL for any given element depends on the page it resides in.
    function getClosestBaseUrl( ele )
    {
        // Find the closest page and extract out its url.
        var url = $( ele ).closest( ".ui-page" ).jqmData( "url" ),
            base = documentBase.hrefNoHash;

        if ( !url || !path.isPath( url ) ) {
            url = base;
        }

        return path.makeUrlAbsolute( url, base);
    }

    //The following event bindings should be bound after mobileinit has been triggered
    //the following deferred is resolved in the init file
    $.mobile.navreadyDeferred = $.Deferred();
    $.mobile._registerInternalEvents = function() {
        var getAjaxFormData = function( $form, calculateOnly ) {
            var type, target, url, ret = true, formData, vclickedName;
            if ( !$.mobile.ajaxEnabled ||
                    // test that the form is, itself, ajax false
                    $form.is( ":jqmData(ajax='false')" ) ||
                    // test that $.mobile.ignoreContentEnabled is set and
                    // the form or one of it's parents is ajax=false
                    !$form.jqmHijackable().length ) {
                return false;
            }

            target = $form.attr( "target" );
            url = $form.attr( "action" );

            // If no action is specified, browsers default to using the
            // URL of the document containing the form. Since we dynamically
            // pull in pages from external documents, the form should submit
            // to the URL for the source document of the page containing
            // the form.
            if ( !url ) {
                // Get the @data-url for the page containing the form.
                url = getClosestBaseUrl( $form );
                if ( url === documentBase.hrefNoHash ) {
                    // The url we got back matches the document base,
                    // which means the page must be an internal/embedded page,
                    // so default to using the actual document url as a browser
                    // would.
                    url = documentUrl.hrefNoSearch;
                }
            }

            url = path.makeUrlAbsolute(  url, getClosestBaseUrl( $form ) );

            if ( ( path.isExternal( url ) && !path.isPermittedCrossDomainRequest( documentUrl, url ) ) || target ) {
                return false;
            }

            if ( !calculateOnly ) {
                type = $form.attr( "method" );
                formData = $form.serializeArray();

                if ( $lastVClicked && $lastVClicked[ 0 ].form === $form[ 0 ] ) {
                    vclickedName = $lastVClicked.attr( "name" );
                    if ( vclickedName ) {
                        // Make sure the last clicked element is included in the form
                        $.each( formData, function( key, value ) {
                            if ( value.name === vclickedName ) {
                                // Unset vclickedName - we've found it in the serialized data already
                                vclickedName = "";
                                return false;
                            }
                        });
                        if ( vclickedName ) {
                            formData.push( { name: vclickedName, value: $lastVClicked.attr( "value" ) } );
                        }
                    }
                }

                ret = {
                    url: url,
                    options: {
                        type:       type && type.length && type.toLowerCase() || "get",
                        data:       $.param( formData ),
                        transition: $form.jqmData( "transition" ),
                        reverse:    $form.jqmData( "direction" ) === "reverse",
                        reloadPage: true
                    }
                };
            }

            return ret;
        };

        //bind to form submit events, handle with Ajax
        $.mobile.document.delegate( "form", "submit", function( event ) {
            var formData = getAjaxFormData( $( this ) );

            if ( formData ) {
                $.mobile.changePage( formData.url, formData.options );
                event.preventDefault();
            }
        });

        //add active state on vclick
        $.mobile.document.bind( "vclick", function( event ) {
            var $btn, btnEls, target = event.target, needClosest = false;
            // if this isn't a left click we don't care. Its important to note
            // that when the virtual event is generated it will create the which attr
            if ( event.which > 1 || !$.mobile.linkBindingEnabled ) {
                return;
            }

            // Record that this element was clicked, in case we need it for correct
            // form submission during the "submit" handler above
            $lastVClicked = $( target );

            // Try to find a target element to which the active class will be applied
            if ( $.data( target, "mobile-button" ) ) {
                // If the form will not be submitted via AJAX, do not add active class
                if ( !getAjaxFormData( $( target ).closest( "form" ), true ) ) {
                    return;
                }
                // We will apply the active state to this button widget - the parent
                // of the input that was clicked will have the associated data
                if ( target.parentNode ) {
                    target = target.parentNode;
                }
            } else {
                target = findClosestLink( target );
                if ( !( target && path.parseUrl( target.getAttribute( "href" ) || "#" ).hash !== "#" ) ) {
                    return;
                }

                // TODO teach $.mobile.hijackable to operate on raw dom elements so the
                // link wrapping can be avoided
                if ( !$( target ).jqmHijackable().length ) {
                    return;
                }
            }

            // Avoid calling .closest by using the data set during .buttonMarkup()
            // List items have the button data in the parent of the element clicked
            if ( !!~target.className.indexOf( "ui-link-inherit" ) ) {
                if ( target.parentNode ) {
                    btnEls = $.data( target.parentNode, "buttonElements" );
                }
            // Otherwise, look for the data on the target itself
            } else {
                btnEls = $.data( target, "buttonElements" );
            }
            // If found, grab the button's outer element
            if ( btnEls ) {
                target = btnEls.outer;
            } else {
                needClosest = true;
            }

            $btn = $( target );
            // If the outer element wasn't found by the our heuristics, use .closest()
            if ( needClosest ) {
                $btn = $btn.closest( ".ui-btn" );
            }

            if ( $btn.length > 0 && !$btn.hasClass( "ui-disabled" ) ) {
                removeActiveLinkClass( true );
                $activeClickedLink = $btn;
                $activeClickedLink.addClass( $.mobile.activeBtnClass );
            }
        });

        // click routing - direct to HTTP or Ajax, accordingly
        $.mobile.document.bind( "click", function( event ) {
            if ( !$.mobile.linkBindingEnabled || event.isDefaultPrevented() ) {
                return;
            }

            var link = findClosestLink( event.target ), $link = $( link ), httpCleanup;

            // If there is no link associated with the click or its not a left
            // click we want to ignore the click
            // TODO teach $.mobile.hijackable to operate on raw dom elements so the link wrapping
            // can be avoided
            if ( !link || event.which > 1 || !$link.jqmHijackable().length ) {
                return;
            }

            //remove active link class if external (then it won't be there if you come back)
            httpCleanup = function() {
                window.setTimeout(function() { removeActiveLinkClass( true ); }, 200 );
            };

            //if there's a data-rel=back attr, go back in history
            if ( $link.is( ":jqmData(rel='back')" ) ) {
                $.mobile.back();
                return false;
            }

            var baseUrl = getClosestBaseUrl( $link ),

                //get href, if defined, otherwise default to empty hash
                href = path.makeUrlAbsolute( $link.attr( "href" ) || "#", baseUrl );

            //if ajax is disabled, exit early
            if ( !$.mobile.ajaxEnabled && !path.isEmbeddedPage( href ) ) {
                httpCleanup();
                //use default click handling
                return;
            }

            // XXX_jblas: Ideally links to application pages should be specified as
            //            an url to the application document with a hash that is either
            //            the site relative path or id to the page. But some of the
            //            internal code that dynamically generates sub-pages for nested
            //            lists and select dialogs, just write a hash in the link they
            //            create. This means the actual URL path is based on whatever
            //            the current value of the base tag is at the time this code
            //            is called. For now we are just assuming that any url with a
            //            hash in it is an application page reference.
            if ( href.search( "#" ) !== -1 ) {
                href = href.replace( /[^#]*#/, "" );
                if ( !href ) {
                    //link was an empty hash meant purely
                    //for interaction, so we ignore it.
                    event.preventDefault();
                    return;
                } else if ( path.isPath( href ) ) {
                    //we have apath so make it the href we want to load.
                    href = path.makeUrlAbsolute( href, baseUrl );
                } else {
                    //we have a simple id so use the documentUrl as its base.
                    href = path.makeUrlAbsolute( "#" + href, documentUrl.hrefNoHash );
                }
            }

                // Should we handle this link, or let the browser deal with it?
            var useDefaultUrlHandling = $link.is( "[rel='external']" ) || $link.is( ":jqmData(ajax='false')" ) || $link.is( "[target]" ),

                // Some embedded browsers, like the web view in Phone Gap, allow cross-domain XHR
                // requests if the document doing the request was loaded via the file:// protocol.
                // This is usually to allow the application to "phone home" and fetch app specific
                // data. We normally let the browser handle external/cross-domain urls, but if the
                // allowCrossDomainPages option is true, we will allow cross-domain http/https
                // requests to go through our page loading logic.

                //check for protocol or rel and its not an embedded page
                //TODO overlap in logic from isExternal, rel=external check should be
                //     moved into more comprehensive isExternalLink
                isExternal = useDefaultUrlHandling || ( path.isExternal( href ) && !path.isPermittedCrossDomainRequest( documentUrl, href ) );

            if ( isExternal ) {
                httpCleanup();
                //use default click handling
                return;
            }

            //use ajax
            var transition = $link.jqmData( "transition" ),
                reverse = $link.jqmData( "direction" ) === "reverse" ||
                            // deprecated - remove by 1.0
                            $link.jqmData( "back" ),

                //this may need to be more specific as we use data-rel more
                role = $link.attr( "data-" + $.mobile.ns + "rel" ) || undefined;

            $.mobile.changePage( href, { transition: transition, reverse: reverse, role: role, link: $link } );
            event.preventDefault();
        });

        //prefetch pages when anchors with data-prefetch are encountered
        $.mobile.document.delegate( ".ui-page", "pageshow.prefetch", function() {
            var urls = [];
            $( this ).find( "a:jqmData(prefetch)" ).each(function() {
                var $link = $( this ),
                    url = $link.attr( "href" );

                if ( url && $.inArray( url, urls ) === -1 ) {
                    urls.push( url );

                    $.mobile.loadPage( url, { role: $link.attr( "data-" + $.mobile.ns + "rel" ) } );
                }
            });
        });

        $.mobile._handleHashChange = function( url, data ) {
            //find first page via hash
            var to = path.stripHash(url),
                //transition is false if it's the first page, undefined otherwise (and may be overridden by default)
                transition = $.mobile.urlHistory.stack.length === 0 ? "none" : undefined,

                // default options for the changPage calls made after examining the current state
                // of the page and the hash, NOTE that the transition is derived from the previous
                // history entry
                changePageOptions = {
                    changeHash: false,
                    fromHashChange: true,
                    reverse: data.direction === "back"
                };

            $.extend( changePageOptions, data, {
                transition: (urlHistory.getLast() || {}).transition || transition
            });

            // special case for dialogs
            if ( urlHistory.activeIndex > 0 && to.indexOf( dialogHashKey ) > -1 && urlHistory.initialDst !== to ) {

                // If current active page is not a dialog skip the dialog and continue
                // in the same direction
                if ( $.mobile.activePage && !$.mobile.activePage.is( ".ui-dialog" ) ) {
                    //determine if we're heading forward or backward and continue accordingly past
                    //the current dialog
                    if( data.direction === "back" ) {
                        $.mobile.back();
                    } else {
                        window.history.forward();
                    }

                    // prevent changePage call
                    return;
                } else {
                    // if the current active page is a dialog and we're navigating
                    // to a dialog use the dialog objected saved in the stack
                    to = data.pageUrl;
                    var active = $.mobile.urlHistory.getActive();

                    // make sure to set the role, transition and reversal
                    // as most of this is lost by the domCache cleaning
                    $.extend( changePageOptions, {
                        role: active.role,
                        transition: active.transition,
                        reverse: data.direction === "back"
                    });
                }
            }

            //if to is defined, load it
            if ( to ) {
                // At this point, 'to' can be one of 3 things, a cached page element from
                // a history stack entry, an id, or site-relative/absolute URL. If 'to' is
                // an id, we need to resolve it against the documentBase, not the location.href,
                // since the hashchange could've been the result of a forward/backward navigation
                // that crosses from an external page/dialog to an internal page/dialog.
                to = !path.isPath( to ) ? ( path.makeUrlAbsolute( '#' + to, documentBase ) ) : to;

                // If we're about to go to an initial URL that contains a reference to a non-existent
                // internal page, go to the first page instead. We know that the initial hash refers to a
                // non-existent page, because the initial hash did not end up in the initial urlHistory entry
                if ( to === path.makeUrlAbsolute( '#' + urlHistory.initialDst, documentBase ) &&
                    urlHistory.stack.length && urlHistory.stack[0].url !== urlHistory.initialDst.replace( dialogHashKey, "" ) ) {
                    to = $.mobile.firstPage;
                }

                $.mobile.changePage( to, changePageOptions );
            }   else {

                //there's no hash, go to the first page in the dom
                $.mobile.changePage( $.mobile.firstPage, changePageOptions );
            }
        };

        // TODO roll the logic here into the handleHashChange method
        $window.bind( "navigate", function( e, data ) {
            var url = $.event.special.navigate.originalEventName.indexOf( "hashchange" ) > -1 ? data.state.hash : data.state.url;

            if( !url ) {
                url = $.mobile.path.parseLocation().hash;
            }

            if( !url || url === "#" || url.indexOf( "#" + $.mobile.path.uiStateKey ) === 0 ){
                url = location.href;
            }

            $.mobile._handleHashChange( url, data.state );
        });

        //set page min-heights to be device specific
        $.mobile.document.bind( "pageshow", $.mobile.resetActivePageHeight );
        $.mobile.window.bind( "throttledresize", $.mobile.resetActivePageHeight );

    };//navreadyDeferred done callback

    $( function() { domreadyDeferred.resolve(); } );

    $.when( domreadyDeferred, $.mobile.navreadyDeferred ).done( function() { $.mobile._registerInternalEvents(); } );
})( jQuery );

(function( $, undefined ) {

$.mobile.page.prototype.options.backBtnText  = "Back";
$.mobile.page.prototype.options.addBackBtn   = false;
$.mobile.page.prototype.options.backBtnTheme = null;
$.mobile.page.prototype.options.headerTheme  = "a";
$.mobile.page.prototype.options.footerTheme  = "a";
$.mobile.page.prototype.options.contentTheme = null;

// NOTE bind used to force this binding to run before the buttonMarkup binding
//      which expects .ui-footer top be applied in its gigantic selector
// TODO remove the buttonMarkup giant selector and move it to the various modules
//      on which it depends
$.mobile.document.bind( "pagecreate", function( e ) {
    var $page = $( e.target ),
        o = $page.data( "mobile-page" ).options,
        pageRole = $page.jqmData( "role" ),
        pageTheme = o.theme;

    $( ":jqmData(role='header'), :jqmData(role='footer'), :jqmData(role='content')", $page )
        .jqmEnhanceable()
        .each(function() {

        var $this = $( this ),
            role = $this.jqmData( "role" ),
            theme = $this.jqmData( "theme" ),
            contentTheme = theme || o.contentTheme || ( pageRole === "dialog" && pageTheme ),
            $headeranchors,
            leftbtn,
            rightbtn,
            backBtn;

        $this.addClass( "ui-" + role );

        //apply theming and markup modifications to page,header,content,footer
        if ( role === "header" || role === "footer" ) {

            var thisTheme = theme || ( role === "header" ? o.headerTheme : o.footerTheme ) || pageTheme;

            $this
                //add theme class
                .addClass( "ui-bar-" + thisTheme )
                // Add ARIA role
                .attr( "role", role === "header" ? "banner" : "contentinfo" );

            if ( role === "header") {
                // Right,left buttons
                $headeranchors  = $this.children( "a, button" );
                leftbtn = $headeranchors.hasClass( "ui-btn-left" );
                rightbtn = $headeranchors.hasClass( "ui-btn-right" );

                leftbtn = leftbtn || $headeranchors.eq( 0 ).not( ".ui-btn-right" ).addClass( "ui-btn-left" ).length;

                rightbtn = rightbtn || $headeranchors.eq( 1 ).addClass( "ui-btn-right" ).length;
            }

            // Auto-add back btn on pages beyond first view
            if ( o.addBackBtn &&
                role === "header" &&
                $( ".ui-page" ).length > 1 &&
                $page.jqmData( "url" ) !== $.mobile.path.stripHash( location.hash ) &&
                !leftbtn ) {

                backBtn = $( "<a href='javascript:void(0);' class='ui-btn-left' data-"+ $.mobile.ns +"rel='back' data-"+ $.mobile.ns +"icon='arrow-l'>"+ o.backBtnText +"</a>" )
                    // If theme is provided, override default inheritance
                    .attr( "data-"+ $.mobile.ns +"theme", o.backBtnTheme || thisTheme )
                    .prependTo( $this );
            }

            // Page title
            $this.children( "h1, h2, h3, h4, h5, h6" )
                .addClass( "ui-title" )
                // Regardless of h element number in src, it becomes h1 for the enhanced page
                .attr({
                    "role": "heading",
                    "aria-level": "1"
                });

        } else if ( role === "content" ) {
            if ( contentTheme ) {
                $this.addClass( "ui-body-" + ( contentTheme ) );
            }

            // Add ARIA role
            $this.attr( "role", "main" );
        }
    });
});

})( jQuery );

}));

﻿/*!
 * artTemplate - Template Engine
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 * Email: 1987.tangbin@gmail.com
 */
 

/**
 * 模板引擎路由函数
 * 若第二个参数类型为 Object 则执行 render 方法, 否则 compile 方法
 * @name    template
 * @param   {String}            模板ID (可选)
 * @param   {Object, String}    数据或者模板字符串
 * @return  {String, Function}  渲染好的HTML字符串或者渲染方法
 */
var template = function (id, content) {
    return template[
        typeof content === 'object' ? 'render' : 'compile'
    ].apply(template, arguments);
};




(function (exports, global) {


"use strict";
exports.version = '1.4.0';
exports.openTag = '<%';
exports.closeTag = '%>';
exports.parser = null;



/**
 * 渲染模板
 * @name    template.render
 * @param   {String}    模板ID
 * @param   {Object}    数据
 * @return  {String}    渲染好的HTML字符串
 */
exports.render = function (id, data) {

    var cache = _getCache(id);
    
    if (cache === undefined) {

        return _debug({
            id: id,
            name: 'Render Error',
            message: 'Not Cache'
        });
        
    }
    
    return cache(data); 
};



/**
 * 编译模板
 * 2012-6-6:
 * define 方法名改为 compile,
 * 与 Node Express 保持一致,
 * 感谢 TooBug 提供帮助!
 * @name    template.compile
 * @param   {String}    模板ID (可选)
 * @param   {String}    模板字符串
 * @return  {Function}  渲染方法
 */
exports.compile = function (id, source) {
    
    var debug = arguments[2];
    
    
    if (typeof source !== 'string') {
        debug = source;
        source = id;
        id = null;
    }

    
    try {
        
        var Render = _compile(source, debug);
        
    } catch (e) {
    
        e.id = id || source;
        e.name = 'Syntax Error';
        return _debug(e);
        
    }
    
    
    function render (data) {
        
        try {
            
            return new Render(data).template;
            
        } catch (e) {
            
            if (!debug) {
                return exports.compile(id, source, true)(data);
            }

            e.id = id || source;
            e.name = 'Render Error';
            e.source = source;
            
            return _debug(e);
            
        };
        
    };
    
    render.prototype = Render.prototype;
    render.toString = function () {
        return Render.toString();
    };
    
    
    if (id) {
        _cache[id] = render;
    }

    
    return render;

};




/**
 * 扩展模板公用辅助方法
 * @name    template.helper
 * @param   {String}    名称
 * @param   {Function}  方法
 */
exports.helper = function (name, helper) {
    _helpers[name] = helper;
};




var _cache = {};
var _isNewEngine = ''.trim;
var _isServer = _isNewEngine && !global.document;
var _keyWordsMap = {};



var _forEach = function () {
    var forEach =  Array.prototype.forEach || function (block, thisObject) {
        var len = this.length >>> 0;
        
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
        
    };
    
    return function (array, callback) {
        forEach.call(array, callback);
    };
}();


var _create = Object.create || function (object) {
    function Fn () {};
    Fn.prototype = object;
    return new Fn;
};



var _helpers = exports.prototype = {
    $forEach: _forEach,
    $render: exports.render,
    $getValue: function (value) {
        return value === undefined ? '' : value;
    }
};



// javascript 关键字表
_forEach((

    // 关键字
    'break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if'
    + ',in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with'
    
    // 保留字
    + ',abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto'
    + ',implements,import,int,interface,long,native,package,private,protected,public,short'
    + ',static,super,synchronized,throws,transient,volatile'
    
    // ECMA 5 - use strict
    + ',arguments,let,yield'
    
).split(','), function (key) {
    _keyWordsMap[key] = true;
});




// 模板编译器
var _compile = function (source, debug) {
    

    var openTag = exports.openTag;
    var closeTag = exports.closeTag;
    var parser = exports.parser;

    
    var code = source;
    var tempCode = '';
    var line = 1;
    var uniq = {$out:true,$line:true};
    
    var variables = "var $helpers=this,"
    + (debug ? "$line=0," : "");


    var replaces = _isNewEngine
    ? ["$out='';", "$out+=", ";", "$out"]
    : ["$out=[];", "$out.push(", ");", "$out.join('')"];

    var concat = _isNewEngine
        ? "if(content!==undefined){$out+=content;return content}"
        : "$out.push(content);";
          
    var print = "function(content){" + concat + "}";

    var include = "function(id,data){"
    +     "if(data===undefined){data=$data}"
    +     "var content=$helpers.$render(id,data);"
    +     concat
    + "}";
    
    
    // html与逻辑语法分离
    _forEach(code.split(openTag), function (code, i) {
        code = code.split(closeTag);
        
        var $0 = code[0];
        var $1 = code[1];
        
        // code: [html]
        if (code.length === 1) {
            
            tempCode += html($0);
         
        // code: [logic, html]
        } else {
            
            tempCode += logic($0);
            
            if ($1) {
                tempCode += html($1);
            }
        }
        

    });
    
    
    
    code = tempCode;
    
    
    // 调试语句
    if (debug) {
        code = 'try{' + code + '}catch(e){'
        +       'e.line=$line;'
        +       'throw e'
        + '}';
    }
    
    
    code = variables + replaces[0] + code + 'this.template=' + replaces[3];
    
    
    try {
        
        var render = new Function('$data', code);
        var proto = render.prototype = _create(_helpers);
        proto.toString = function () {
            return this.template;
        };

        return render;
        
    } catch (e) {
        e.temp = 'function anonymous($data) {' + code + '}';
        throw e;
    };
    
    
    
    // 处理 HTML 语句
    function html (code) {
        
        // 记录行号
        line += code.split(/\n/).length - 1;
        
        code = code
        // 单双引号与反斜杠转义
        .replace(/('|"|\\)/g, '\\$1')
        // 换行符转义(windows + linux)
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
        
        code = replaces[1] + "'" + code + "'" + replaces[2];
        
        return code + '\n';
    };
    
    
    // 处理逻辑语句
    function logic (code) {

        var thisLine = line;
       
        if (parser) {
        
             // 语法转换器
            code = parser(code);
            
        } else if (debug) {
        
            // 记录行号
            code = code.replace(/\n/g, function () {
                line ++;
                return '$line=' + line +  ';';
            });
            
        }
        
        
        // 输出语句
        if (code.indexOf('=') === 0) {

            code = code.substring(1).replace(/[\s;]*$/, '');
            
            if (_isNewEngine) {
                // $getValue: undefined 转化为空字符串
                code = '$getValue(' + code + ')';
            }

            code = replaces[1] + code + replaces[2];

        }
        
        if (debug) {
            code = '$line=' + thisLine + ';' + code;
        }

        getKey(code);
        
        return code + '\n';
    };
    
    
    // 提取模板中的变量名
    function getKey (code) {
        
        // 过滤注释、字符串、方法名
        code = code.replace(/\/\*.*?\*\/|'[^']*'|"[^"]*"|\.[\$\w]+/g, '');

        // 分词
        _forEach(code.split(/[^\$\w\d]+/), function (name) {
         
            // 沙箱强制语法规范：禁止通过套嵌函数的 this 关键字获取全局权限
            if (/^this$/.test(name)) {
                throw {
                    message: 'Prohibit the use of the "' + name + '"'
                };
            }

            // 过滤关键字与数字
            if (!name || _keyWordsMap.hasOwnProperty(name) || /^\d/.test(name)) {
                return;
            }
            
            // 除重
            if (!uniq.hasOwnProperty(name)) {
                setValue(name);
                uniq[name] = true;
            }
            
        });
        
    };
    
    
    // 声明模板变量
    // 赋值优先级: 内置特权方法(include, print) > 公用模板辅助方法 > 数据
    function setValue (name) {  
        var value;

        if (name === 'print') {

            value = print;

        } else
        if (name === 'include') {
        
            value = include;
            
        } else
        if (_helpers.hasOwnProperty(name)) {
            
            value = '$helpers.' + name;
            
        } else {
        
            value = '$data.' + name;

        }
        
        variables += name + '=' + value + ',';
    };
    

};



// 获取模板缓存
var _getCache = function (id) {

    var cache = _cache[id];
    
    if (cache === undefined && !_isServer) {
        var elem = document.getElementById(id);
        
        if (elem) {
            exports.compile(id, elem.value || elem.innerHTML);
        }
        
        return _cache[id];
        
    } else if (_cache.hasOwnProperty(id)) {
    
        return cache;
    }
};



// 模板调试器
var _debug = function (e) {

    var content = '[template]:\n'
        + e.id
        + '\n\n[name]:\n'
        + e.name;
    
    if (e.message) {
        content += '\n\n[message]:\n'
        + e.message;
    }
    
    if (e.line) {
        content += '\n\n[line]:\n'
        + e.line;
        content += '\n\n[source]:\n'
        + e.source.split(/\n/)[e.line - 1].replace(/^[\s\t]+/, '');
    }
    
    if (e.temp) {
        content += '\n\n[temp]:\n'
        + e.temp;
    }
    
    if (global.console) {
        console.error(content);
    }
    
    function error () {
        return error + '';
    };
    
    error.toString = function () {
        return '{Template Error}';
    };
    
    return error;
};



})(template, this);


if (typeof module !== 'undefined' && module.exports) {
    module.exports = template;    
}
/**
 * @class MX
 */
window.MX = {
    /**
     * The version of the framework
     */
    version: '0.1.1'
};

(function(X) {
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString,
        $ = window.jQuery,
        artTemplate = window.template,
        iScroll = window.iScroll,
        ua = window.navigator.userAgent,
        webkit = ua.match(/WebKit\/([\d.]+)/),
        android = ua.match(/(Android)[\/\s+]([\d.]+)/),
        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
        iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        touchpad = webos && ua.match(/TouchPad/),
        kindle = ua.match(/Kindle\/([\d.]+)/),
        blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
        os;
    
    /**
     * 声明命名空间
     */
    X.namespace = function() {
        var len1 = arguments.length,
            i = 0,
            len2,
            j,
            main,
            ns,
            sub,
            current;
        
        for(; i < len1; ++i) {
            main = arguments[i];
            ns = arguments[i].split('.');
            current = window[ns[0]];
            if (current === undefined) {
                current = window[ns[0]] = {};
            }
            sub = ns.slice(1);
            len2 = sub.length;
            for(j = 0; j < len2; ++j) {
                current = current[sub[j]] = current[sub[j]] || {};
            }
        }
        return current;
    };
    
    // 命名空间函数的简写
    X.ns = X.namespace;
    X.ns('MX.lib', 'MX.klass', 'MX.app', 'MX.lib', 'MX.util');
    
    $.extend(X.lib, {
        jQuery: $,
        artTemplate: artTemplate,
        iScroll: iScroll
    });
    if (artTemplate) {
        artTemplate.openTag = '<#';
        artTemplate.closeTag = '#>';
    }
    
    $.extend(X, {
        /**
         * A reusable empty function
         */
        emptyFn: $.noop,

        /**
         * Returns true if the passed value is defined.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isDefined: function(value) {
            return typeof value !== 'undefined';
        },

        /**
         * Returns true if the passed value is a JavaScript 'primitive', a string, number or boolean.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isPrimitive: function(value) {
            var type = typeof value;

            return type === 'string' || type === 'number' || type === 'boolean';
        },
        
        /**
         * Returns true if the passed value is empty, false otherwise. The value is deemed to be empty if it is either:
         *
         * - `null`
         * - `undefined`
         * - a zero-length array
         * - a zero-length string (Unless the `allowEmptyString` parameter is set to `true`)
         *
         * @param {Object} value The value to test
         * @param {Boolean} allowEmptyString (optional) true to allow empty strings (defaults to false)
         * @return {Boolean}
         */
        isEmpty: function(value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (X.isArray(value) && value.length === 0);
        },

        /**
         * Returns true if the passed value is a JavaScript Array, false otherwise.
         *
         * @param {Object} target The target to test
         * @return {Boolean}
         */
        isArray: $.isArray,

        /**
         * Returns true if the passed value is a JavaScript Date object, false otherwise.
         * @param {Object} object The object to test
         * @return {Boolean}
         */
        isDate: function(value) {
            return $.type(value) === 'date';
        },

        /**
         * Returns true if the passed value is a JavaScript Object, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isObject: $.isPlainObject,

        /**
         * Returns true if the passed value is a JavaScript Function, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isFunction: $.isFunction,

        /**
         * Returns true if the passed value is a number. Returns false for non-finite numbers.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isNumber: function(value) {
            return $.type(value) === 'number';
        },

        /**
         * Validates that a value is numeric.
         * @param {Object} value Examples: 1, '1', '2.34'
         * @return {Boolean} True if numeric, false otherwise
         */
        isNumeric: $.isNumeric,

        /**
         * Returns true if the passed value is a string.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isString: function(value) {
            return $.type(value) === 'string';
        },

        /**
         * Returns true if the passed value is a boolean.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isBoolean: function(value) {
            return $.type(value) === 'boolean';
        },

        /**
         * Returns true if the passed value is an HTMLElement
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },

        /**
         * Returns true if the passed value is a TextNode
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        }
    });
    
    os = {};
    if (android) {
        os.android = true;
        os.version = android[2];
    }
    if (iphone) {
        os.ios = os.iphone = true;
        os.version = iphone[2].replace(/_/g, '.');
    }
    if (ipad) {
        os.ios = os.ipad = true;
        os.version = ipad[2].replace(/_/g, '.');
    }
    if (webos) {
        os.webos = true;
        os.version = webos[2];
    }
    if (touchpad) {
        os.touchpad = true;
    }
    if (blackberry) {
        os.blackberry = true;
        os.version = blackberry[2];
    }
    if (kindle) {
        os.kindle = true;
        os.version = kindle[1];
    }
    
    $.extend(X, {
        /**
         * 操作系统信息
         */
        os: os,
        
        /**
         * 将config包含的属性，合并到object对象，如果object已存在相同的属性名，则忽略合并
         * @param {Object} object
         * @param {Object} config
         */
        applyIf: function(object, config) {
            var property;

            if (object) {
                for (property in config) {
                    if (object[property] === undefined) {
                        object[property] = config[property];
                    }
                }
            }

            return object;
        },
        
        /**
         * 将对象转换成数组
         */
        toArray: function(obj) {
            if (!obj) {
                return [];
            } else if (X.isArray(obj)) {
                return slice.call(obj);
            } else if (toString.call(obj) == '[object Arguments]') {
                return slice.call(obj);
            } else {
                return slice.call(arguments, 0);
            }
        },
        
        /**
         * 遍历一个$.each的封装类，允许指定回调函数的作用域
         * 
         * @param {Element/Array} obj 遍历的对象或数组
         * @param {Function} fn 遍历对象的回调函数
         * @param {Object} scope 回调函数作用域
         */
        each: function(obj, fn, scope) {
            if (!obj || !fn) {
                return;
            }
            if (X.isDefined(scope)) {
                $.each(obj, $.proxy(fn, scope));
            } else {
                $.each(obj, fn);
            }
        },
        
        /**
         * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
         * <pre><code>
         *  var sayHi = function(name){
         *      alert('Hi, ' + name);
         *  }
         *  
         *  // executes immediately:
         *  sayHi('max');
         *  
         *  // executes after 2 seconds:
         *  MX.defer(sayHi, 2000, this, ['max']);
         * </code></pre>
         * @param {Function} fn The function to defer.
         * @param {Number} millis The number of milliseconds for the setTimeout call (if less than or equal to 0 the function is executed immediately)
         * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the function is executed.
         * <b>If omitted, defaults to the browser window.</b>
         * @return {Number} The timeout id that can be used with clearTimeout
         */
        defer: function(fn, millis, scope, args) {
            scope = scope || window;
            if (millis > 0) {
                return setTimeout(function() {
                    fn.apply(scope, args);
                }, millis);
            }
            fn.apply(scope, args);
            return 0;
        }
    });
    
    $.extend(X, {
        /**
         * Specify a function to execute
         */
        kindle: function() {
            var args = X.toArray(arguments),
                len = args.length,
                fnArgs = args.slice(0, len - 1),
                fn = args[len - 1];
            
            fnArgs.forEach(function(alias, i) {
                fnArgs[i] = X.klass.KlassManager.get(alias);
            });
            fn.apply(window, [X].concat(fnArgs));
        },
        
        /**
         * 代理$.ready()函数，并引入MX.kindle类依赖机制
         */
        ready: function() {
            var args = X.toArray(arguments);
            $(document).ready(function() {
                X.kindle.apply(window, args);
            });
        }
    });
})(MX);
/**
 * @class MX.klass.KlassManager
 */
(function(X) {
    X.klass.KlassManager = function() {
        var classes = {};
        
        var pub = {
            register: function(alias, klass) {
                classes[alias] = klass;
            },
            
            get: function(alias) {
                return X.isString(alias) ? classes[alias] : alias;
            },
            
            create: function(alias, config) {
                var cls = pub.get(alias);
                return new cls(config);
            }
        };
        
        return pub;
    }();
    
    /**
     * @memberOf MX
     */
    X.reg = X.klass.KlassManager.register;
    
    /**
     * @memberOf MX
     */
    X.create = X.klass.KlassManager.create;
    
    X.reg('$', X.lib.jQuery);
    X.reg('jquery', X.lib.jQuery);
    X.lib.artTemplate && X.reg('arttemplate', X.lib.artTemplate);
    X.lib.iScroll && X.reg('iscroll', X.lib.iScroll);
    
    X.reg('klassmanager', X.klass.KlassManager);
})(MX);
/**
 * @class MX.klass.Base
 * 
 * 所有使用Class.define()方法声明类的基类
 */
MX.kindle('jquery', function(X, $) {
    var enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'],
        noArgs = [],
        TemplateClass = function() {},
        chain = function(object) {
            TemplateClass.prototype = object;
            var result = new TemplateClass();
            TemplateClass.prototype = null;
            return result;
        };
    
    var Base = function() {};
    $.extend(Base, {
        $isClass: true,
        
        addMembers: function(members) {
            var prototype = this.prototype,
                names = [],
                i, ln, name, member;

            for (name in members) {
                names.push(name);
            }

            if (enumerables) {
                names.push.apply(names, enumerables);
            }

            for (i = 0,ln = names.length; i < ln; i++) {
                name = names[i];

                if (members.hasOwnProperty(name)) {
                    member = members[name];

                    if (typeof member == 'function' && !member.$isClass) {
                        member.$owner = this;
                        member.$name = name;
                    }

                    prototype[name] = member;
                }
            }

            return this;
        },
        
        extend: function(SuperClass) {
            var superPrototype = SuperClass.prototype,
                basePrototype, prototype, name;

            prototype = this.prototype = chain(superPrototype);
            this.superclass = prototype.superclass = superPrototype;

            if (!SuperClass.$isClass) {
                basePrototype = Base.prototype;
                for (name in basePrototype) {
                    if (name in prototype) {
                        prototype[name] = basePrototype[name];
                    }
                }
            }
        }
    });
    
    // Base类的prototype属性
    $.extend(Base.prototype, {
        $isInstance: true,
        
        /**
         * 调用当前方法的父类方法，例子：
         * <code>
         *  var Cls1 = Klass.define({
         *      constructor: function(name) {
         *          this.name = name;
         *      },
         *      
         *      say: function() {
         *          alert(this.name + ' say: hello, world!');
         *      }
         *  });
         *  
         *  var Cls2 = Klass.define({
         *      extend: Cls1,
         *      
         *      constructor: function() {
         *          thia.callParent(['Max']); // 调用父类的构造函数
         *      }
         *  });
         *  
         *  var cls2 = new Cls2();
         *  cls2.say(); // 输出 'Max say: hello, world!'
         * </code>
         * 
         * @param {Array/Arguments} args 传递给父类方法的形参
         * @return {Object} 返回父类方法的执行结果
         */
        callParent: function(args) {
            var method,
                superMethod = (method = this.callParent.caller) && 
                              (method = method.$owner ? method : method.caller) &&
                               method.$owner.superclass[method.$name];
            
            return superMethod.apply(this, X.toArray(args) || noArgs);
        },
        
        // Default constructor, simply returns `this`
        constructor: function() {
            return this;
        }
    });
    
    X.klass.Base = Base;
    X.reg('base', Base);
});
/**
 * @class MX.klass.Klass
 * 
 * 声明类，类的继承，重写类方法
 */
MX.kindle('base', 'klassmanager', function(X, Base, KlassManager) {
    var makeCtor = function() {
        function constructor() {
            return this.constructor.apply(this, arguments) || null;
        }
        return constructor;
    };
    
    var extend = function(newClass, overrides) {
        var basePrototype = Base.prototype,
            newClassExtend = overrides.extend,
            SuperClass, superPrototype, name;

        delete overrides.extend;
        if (X.isString(newClassExtend)) {
            newClassExtend = KlassManager.get(newClassExtend);
        }
        if (newClassExtend && newClassExtend !== Object) {
            SuperClass = newClassExtend;
        } else {
            SuperClass = Base;
        }

        superPrototype = SuperClass.prototype;

        if (!SuperClass.$isClass) {
            for (name in basePrototype) {
                if (!superPrototype[name]) {
                    superPrototype[name] = basePrototype[name];
                }
            }
        }

        newClass.extend(SuperClass);
    };
    
    X.klass.Klass = {
        /**
         * 声明一个类，或继承自一个父类，子类拥有父类的所有prototype定义的特性，
         * 如未定义extend属性，默认继承class.Base类，例子：
         * <code>
         *  var Cls1 = Klass.define({
         *      constructor: function(name) {
         *          this.name = name;
         *      },
         *      
         *      say: function() {
         *          alert(this.name + ' say: hello, world!');
         *      }
         *  });
         *  
         *  var Cls2 = Klass.define({
         *      extend: Cls1,
         *      
         *      constructor: function() {
         *          thia.callParent(['Max']); // 调用父类的构造函数
         *      }
         *  });
         *  
         *  var cls2 = new Cls2();
         *  cls2.say(); // 输出 'Max say: hello, world!'
         * </code>
         * 
         * @param {Object} overrides 类的属性和方法
         * @return {Klass} The new class
         */
        define: function(overrides) {
            var newClass, name;
            
            if (!overrides) {
                overrides = {};
            }
            
            newClass = makeCtor();
            for (name in Base) {
                newClass[name] = Base[name];
            }
            
            extend(newClass, overrides);
            newClass.addMembers(overrides);
            
            if (overrides.alias) {
                X.reg(overrides.alias, newClass);
            }
            
            return newClass;
        },
        
        /**
         * 重写类的属性或方法，例子：
         * <code>
         *  var Cls1 = Klass.define({
         *      constructor: function(name) {
         *          this.name = name;
         *      },
         *      
         *      say: function() {
         *          alert(this.name + ' say: hello, world!');
         *      }
         *  });
         *  
         *  Klass.override(Cls1, {
         *      say: function() {
         *          alert(this.name + ' say: hello, I'm Max, nice to meet you!');
         *      },
         *      
         *      sayHello: function() {
         *          alert('hello, world!');
         *      }
         *  });
         *  
         *  var cls1 = new Cls1();
         *  cls1.say(); // 输出 'Max say: hello, I'm Max, nice to meet you!'
         *  cls1.sayHello(); // 输出 'hello world!'
         * </code>
         * 
         * 如果要为函数的某个方法定义别名，切忌使用override，应该像下面这样处理：
         * <code>
         *  $.extend(Cls1.prototype, {
         *      speak: Cls1.prototype.say
         *  });
         *  
         *  var cls1 = new Cls1();
         *  cls1.speak(); // 输出 'Max  say: hello, I'm Max, nice to meet you!'
         * </code>
         * 
         * @param {Klass} Cls
         * @param {Object} overrides 被添加到类的属性或方法 
         */
        override: function(Cls, overrides) {
            Cls.addMembers(overrides);
        }
    };
    
    X.reg('klass', X.klass.Klass);
});
/**
 * @class MX.util.Dispatcher
 * 
 * 事件派发者，使用方法如下：
 * 
 * <code>
 *  MX.kindle('dispatcher', function(Dispatcher) {
 *      // 实例化一个派发者
 *      var ob = new Dispatcher();
 *      
 *      // 添加事件类型
 *      ob.addEvents('init');
 *  
 *      // 添加事件监听
 *      ob.addListener('init', function() {
 *          // 监听回调函数
 *          // 当执行ob.fireEvent('init');时，被调用
 *      });
 *  });
 * </code>
 *  
 * 构造函数有两个参数：
 *  {Object} : listeners 实例化派发者时，增加事件监听
 *  {Object} : defaultScope 事件监听函数的执行作用域，如果未定义，则默认为window
 * 
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    var eventPropRe = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/;
    
    function createSingle(e, en, fn, scope){
        return function(){
            e.removeListener(en, fn, scope);
            return fn.apply(scope, arguments);
        };
    };
    
    var Dispatcher = Klass.define({
        // private
        alias: 'dispatcher',
        
        // private
        constructor: function(listeners, defaultScope) {
            this.events = {};
            this.defaultScope = defaultScope || window;
            
            if (listeners) {
                this.addListener(listeners);
            }
        },
        
        /**
         * 声明事件类型，调用方式如下：
         * 
         * <code>
         *  ob.addEvents('event1', 'event2');
         *  
         *  // 或
         *  
         *  ob.addEvents({
         *      'event1': true,
         *      'event2': true,
         *  });
         * </code>
         * 
         * @param {String/Object} eventName 事件名称
         * @param {String...} eventName1...n (optional)
         */
        addEvents: function(o) {
            var args,
                len,
                i,
                events = this.events;
    
            if (X.isString(o)) {
                args = arguments;
                i = args.length;
    
                while (i--) {
                    events[args[i]] = events[args[i]] || [];
                }
            } else {
                X.each(o, function(eventName, v) {
                    events[eventName] = events[eventName] || [];
                });
            }
        },
        
        /**
         * 增加事件监听
         * @param {String} eventName 事件名称
         * @param {String} fireFn 事件监听回调函数
         * @param {String} scope 回调函数作用域
         */
        addListener: function(eventName, fireFn, scope, options) {
            if (!X.isString(eventName)) {
                var scope = eventName['scope'],
                    listener,
                    eName;
                for (eName in eventName) {
                    if (eventPropRe.test(eName)) {
                        continue;
                    }
                    listener = eventName[eName];
                    if (X.isFunction(listener)) {
                        this.addListener(eName, listener, scope);
                    } else {
                        this.addListener(eName, listener.fireFn, listener.scope || scope);
                    }
                }
                return;
            }
            
            var events = this.events;
            eventName = eventName.toLowerCase();
            events[eventName] = events[eventName] || [];
            scope = scope || this.defaultScope;
            options = options || {};
            
            events[eventName].push({
                single: options.single,
                fireFn: fireFn,
                listenerFn: this.createListener(eventName, fireFn, scope, options),
                scope: scope
            });
        },
        
        /**
         * 移除事件监听
         * @param {String} eventName 事件名称
         * @param {String} fireFn 事件监听回调函数
         * @param {String} scope 回调函数作用域
         */
        removeListener: function(eventName, fireFn, scope) {
            eventName = eventName.toLowerCase();
            var listeners = this.events[eventName];
            if (X.isArray(listeners)) {
                scope = scope || this.defaultScope;
                for (var i = 0, len = listeners.length; i < len; i++) {
                    if (listeners[i].fireFn == fireFn && scope == listeners[i].scope) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            }
        },
        
        /**
         * 清空某一个事件的所有监听
         * @param {String} eventName 事件名称
         */
        clearListeners: function(eventName) {
            this.events[eventName.toLowerCase()] = [];
        },
        
        /**
         * 清空所有事件的监听
         */
        purgeListeners: function() {
            for (var eventName in this.events) {
                this.clearListeners(eventName);
            }
        },
        
        /**
         * 校验一个是否包含监听函数，返回true则表示此事件有监听
         * @param {String} eventName 事件名称
         * @return {Booolean} 
         */
        hasListener: function(eventName) {
            var listeners = this.events[eventName.toLowerCase()];
            return X.isArray(listeners) && listeners.length > 0;
        },
        
        /**
         * fire某一个事件，调用监听回调
         * @param {String} eventName 事件名称
         */
        fireEvent: function(eventName) {
            var listeners = this.events[eventName.toLowerCase()];
            if (X.isArray(listeners)) {
                var args = Array.prototype.slice.call(arguments, 1),
                    len = listeners.length,
                    i = 0,
                    l;
                if (len > 0) {
                    for (; i < len; i++) {
                        l = listeners[i];
                        if (l) {
                            if (l.single === true) {
                                i--;
                            }
                            if (X.Console && X.Console.chrome) {
                                if (l.listenerFn.apply(l.scope, args) === false) {
                                    return false;
                                }
                            } else {
                                try {
                                    if (l.listenerFn.apply(l.scope, args) === false) {
                                        return false;
                                    }
                                } catch(e) {
                                    X.Console.error('Fire event callback error: the event name is "' + eventName + '": ' + e.message);
                                }
                            }
                        }
                    }
                }
            }
        },
        
        // private
        createListener: function(eventName, fireFn, scope, options) {
            var h = fireFn;
            options = options || {};
            if (options.single) {
                h = createSingle(this, eventName, fireFn, scope);
            }
            return h;
        }
    });
    
    $.extend(Dispatcher.prototype, {
        /**
         * 增加事件监听
         * @param {String} eventName 事件名称
         * @param {String} fireFn 事件监听回调函数
         * @param {String} scope 回调函数作用域
         */
        on: Dispatcher.prototype.addListener,
        
        /**
         * 移除事件监听
         * @param {String} eventName 事件名称
         * @param {String} fireFn 事件监听回调函数
         * @param {String} scope 回调函数作用域
         */
        un: Dispatcher.prototype.removeListener
    });
    
    X.util.Dispatcher = Dispatcher;
});
/**
 * @class MX.klass.Utility
 * 
 * 抽象类，实现了类事件，对象实例化与销毁生命周期
 */
MX.kindle('jquery', 'klass', 'dispatcher', function(X, $, Klass, Dispatcher) {
    var idSeed = 1000,
        eventPropRe = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/;
    
    function makeId(prefix) {
        return (prefix || 'gen-id') + (++idSeed);
    };
    
    function createSingle(obj, item, types, selector, fn, scope){
        return function(){
            obj.mun(item, types, selector, fn, scope);
            return fn.apply(scope, arguments);
        };
    };
    
    X.klass.Utility = Klass.define({
        // private
        alias: 'utility',
        
        /**
         * @cfg {String} idPrefix
         * id前缀，默认'gen-id'
         */
        
        /*
         * @private
         * 构造函数，AbstractClass实现了类实例化的生命周期，实例化的几个过程：
         *  1、初始化配置参数
         *  2、实例化ob对象，注册事件
         *  3、调用init()方法
         *  4、调用initEvents()方法
         * 
         * @cfg {Object} config 配置参数
         */
        constructor: function(config) {
            config = config || {};
            $.extend(this, config);
            
            /**
             * @property {Object} initialConfig
             * 初始化配置参数
             */
            this.initialConfig = config;
            
            if (!this.id) {
                this.id = makeId(this.idPrefix || '');
            }
            
            this.ob = new Dispatcher(this.listeners, this);
            delete this.listeners;
            this.relayMethod(this.ob, 'addEvents', 'fireEvent', 'addListener', 'removeListener', 'on', 'un');
            
            this.addEvents(
                /**
                 * @event beforedestroy
                 * 当调用destroy方法时触发，返回true则中断销毁动作
                 * @param {Class} this
                 */
                'beforedestroy', 
                /**
                 * @event destroy
                 * 当调用destroy方法时触发
                 * @param {Class} this
                 */
                'destroy'
            );
            
            this.init();
            this.initEvents();
        },
        
        // private
        init: X.emptyFn,
        
        // private
        initEvents: X.emptyFn,
        
        /**
         * 将指定对象的方法映射给this实例，使this实例也拥有指定的方法，例如：
         * @param {Object} obj 指定映射方法的对象
         * @param {Array} methods 方法名称
         */
        relayMethod: function(obj) {
            var methods = Array.prototype.slice.call(arguments, 1),
                method,
                fn,
                i, 
                len;
            for (i = 0, len = methods.length; i < len; i++) {
                method = methods[i];
                fn = obj[method];
                if (!this[method] && fn) {
                    this[method] = function(proxyFn) {
                        return function() {
                            return proxyFn.apply(obj, arguments);
                        };
                    }(fn);
                }
            }
        },
        
        // private
        createEventCache: function() {
            if (!this.eventCaches) {
                this.eventCaches = [];
            }
        },
        
        // private
        clearEventCache: function() {
            if (this.eventCaches) {
                var i = this.eventCaches.length - 1,
                    item;
                for (; i >= 0; i--) {
                    item = this.eventCaches[i];
                    this.mun(item, item.type, item.selector, item.fn, item.scope);
                };
            }
        },
        
        /**
         * 为指定Element绑定一个dom事件处理函数，例如：
         * <code>
         *  this.mon(this.el, 'mouseenter', function() {
         *      // 如果未指定scope，回调函数的scope默认为模型实例对象
         *  });
         *  
         *  // 同时绑定多个监听
         *  this.mon(this.el, {
         *      'mouseenter': function() {
         *      },
         *      'mouseleave': function() {
         *      },
         *      scope: this // 定义回调函数scope
         *  })
         *  
         *  // 同时也可以绑定委托事件
         *  this.mon(this.el, 'mouseenter', 'a.btn', function() {
         *      
         *  }, this);
         * </code>
         * 
         * @param {Element/Object} item
         * @param {String/Object} events 事件类型，当为Object时，表示绑定一组处理事件
         * @param {String} selector (options) 一个选择器字符串
         * @param {Function} handler (optional) 事件处理函数
         * @param {Object} scope (optional) 处理函数作用域
         * @param {Object} options (optional) 
         */
        mon: function(item, types, selector, fn, scope, options) {
            var event,
                type,
                proxyFn,
                isClass = true;
            
            this.createEventCache();
            
            if (X.isObject(types)) {
                scope = types.scope || this;
                for (type in types) {
                    if (eventPropRe.test(type)) {
                        continue;
                    }
                    event = types[type];
                    if (X.isFunction(event)) {
                        this.mon(item, type, undefined, event, scope, undefined);
                    } else {
                        this.mon(item, type, event.selector, event.fn, event.scope || scope, options);
                    }
                }
                return;
            }
            
            if (X.isFunction(selector)) {
                // (item, type, fn, scope, options)
                fn = selector;
                scope = fn;
                options = scope;
                selector = undefined;
                scope = undefined;
            }
            
            if (!item.$isInstance) {
                isClass = false;
                item = $(item);
                if (item.length > 1) {
                    X.each(item, function(i, el) {
                        this.mon(el, types, selector, fn, scope, options);
                    }, this);
                    return;
                }
            }
            
            scope = scope || this;
            options = options || {};
            if (!isClass) {
                proxyFn = this.createListener(item, types, selector, fn, scope, options);
            }
            this.eventCaches.push({
                isClass: isClass,
                item: item,
                type: types,
                selector: selector,
                fn: fn,
                proxyFn: proxyFn,
                scope: scope,
                options: options
            });
            
            if (isClass) {
                item.on && item.on(types, fn, scope, options);
            } else {
                item.on(types, selector, undefined, proxyFn);
            }
        },
        
        // private
        createListener: function(item, types, selector, fn, scope, options) {
            var fireFn = $.proxy(fn, scope);
            options = options || {};
            if (options.single) {
                fireFn = createSingle(this, item, types, selector, fn, scope);
            }
            return fireFn;
        },
         
        /**
         * 为指定元素取消一个已绑定的处理事件
         * @param {String/Element} el 指定元素
         * @param {String/Object} eventType 事件类型，当为Object时，表示取消一组处理事件
         * @param {Function} handler (optional) 事件处理函数
         * @param {Object} scope (optional) 处理函数作用域
         */
        mun: function(item, types, selector, fn, scope) {
            var isClass = item.$isInstance,
                event,
                type,
                i, len;
            
            this.createEventCache();
            
            if (!isClass) {
                item = $(item);
            }
            if (!types) {
                for (i = 0, len = this.eventCaches.length; i < len; i++) {
                    event = this.eventCaches[i];
                    if (isClass ? item == event.item :  item.is(event.item)) {
                        this.mun(item, event.type, event.selector, event.fn, event.scope);
                    }
                }
                return;
            } else if (X.isObject(types)) {
                scope = types.scope || this;
                for (type in types) {
                    if (eventPropRe.test(type)) {
                        continue;
                    }
                    event = types[type];
                    if (X.isFunction(event)) {
                        this.mun(item, type, undefined, event, scope);
                    } else {
                        this.mun(item, type, event.selector, event.fn, event.scope || scope);
                    }
                }
                return;
            }
            
            if (X.isFunction(selector)) {
                // (item, type, fn, scope)
                fn = selector;
                scope = fn;
                selector = undefined;
                scope = undefined;
            }
            
            scope = scope || this;
            for (i = 0, len = this.eventCaches.length; i < len; i++) {
                event = this.eventCaches[i];
                if ((isClass ? item == event.item : item.is(event.item)) && types == event.type && selector == event.selector && fn == event.fn && scope == event.scope) {
                    this.eventCaches.splice(i, 1);
                    if (isClass) {
                        item.un && item.un(types, fn, scope);
                    } else {
                        item.off(types, selector, undefined, event.proxyFn);
                    }
                    break;
                }
            }
        },
        
        // private
        beforeDestroy: X.emptyFn,
        
        // private
        onDestroy: X.emptyFn,
        
        /**
         * 调用destroy()方法，进入销毁生命周期，如下：
         *  1、fire事件'beforedestroy'
         *  2、调用beforeDestroy()方法
         *  3、移除dom对象绑定的事件
         *  4、调用onDestroy()方法
         *  5、fire事件'destroy'
         *  6、清空ob绑定的事件
         */
        destroy: function() {
            if (!this.isDestroyed) {
                if (this.fireEvent('beforedestroy', this) !== false) {
                    this.destroying = true;
                    this.beforeDestroy();
                    
                    this.clearEventCache();
                    
                    this.onDestroy();
                    this.fireEvent('destroy', this);
                    
                    this.ob.purgeListeners();
                    this.destroying = false;
                    this.isDestroyed = true;
                }
            }
        }
    });
});
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
/**
 * @class MX.util.Format
 */
MX.kindle('jquery', function(X, $) {
    var formatRe = /\{(\d+)\}/g,
        escapeRe = /('|\\)/g,
        escapeRegexRe = /([-.*+?\^${}()|\[\]\/\\])/g,
        isToFixedBroken = (0.9).toFixed() !== '1';
    
    var toCamelCase = function(str) {
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
    };
    
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
         * 
         * <code>
         *  var str = MX.util.Format.format('Hi, {0}! {1}!', 'Max', 'Welcome');
         *  
         *  // 输出 “Hi, Max! Welcome!”
         *  alert(str);
         * </code>
         * 
         * @param {String} formateString 被格式化的字符串
         * @param {String} value1 被替换的值
         * @param {String...} value2...n (optional)
         * @return {String} string 格式化完成的字符串
         */
        format: function(format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(formatRe, function(m, i) {
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
         * 将一个data-info-text类型的字符串转换成，一个符合驼峰命名法的字符串并返回
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
         * @param {String/Object} string
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
/**
 * @class MX.util.DateFormatFormat
 * 
 * DateFormat来自Ext3.4.0的源码
 * 
 * A set of useful static methods to deal with date
 * Note that if MX.util.DateFormat is required and loaded, it will copy all methods / properties to
 * this object for convenience
 *
 * The date parsing and formatting syntax contains a subset of
 * <a href="http://www.php.net/date">PHP's date() function</a>, and the formats that are
 * supported will provide results equivalent to their PHP versions.
 *
 * The following is a list of all currently supported formats:
 * <pre class="">
Format  Description                                                               Example returned values
------  -----------------------------------------------------------------------   -----------------------
  d     Day of the month, 2 digits with leading zeros                             01 to 31
  D     A short textual representation of the day of the week                     Mon to Sun
  j     Day of the month without leading zeros                                    1 to 31
  l     A full textual representation of the day of the week                      Sunday to Saturday
  N     ISO-8601 numeric representation of the day of the week                    1 (for Monday) through 7 (for Sunday)
  S     English ordinal suffix for the day of the month, 2 characters             st, nd, rd or th. Works well with j
  w     Numeric representation of the day of the week                             0 (for Sunday) to 6 (for Saturday)
  z     The day of the year (starting from 0)                                     0 to 364 (365 in leap years)
  W     ISO-8601 week number of year, weeks starting on Monday                    01 to 53
  F     A full textual representation of a month, such as January or March        January to December
  m     Numeric representation of a month, with leading zeros                     01 to 12
  M     A short textual representation of a month                                 Jan to Dec
  n     Numeric representation of a month, without leading zeros                  1 to 12
  t     Number of days in the given month                                         28 to 31
  L     Whether it&#39;s a leap year                                                  1 if it is a leap year, 0 otherwise.
  o     ISO-8601 year number (identical to (Y), but if the ISO week number (W)    Examples: 1998 or 2004
        belongs to the previous or next year, that year is used instead)
  Y     A full numeric representation of a year, 4 digits                         Examples: 1999 or 2003
  y     A two digit representation of a year                                      Examples: 99 or 03
  a     Lowercase Ante meridiem and Post meridiem                                 am or pm
  A     Uppercase Ante meridiem and Post meridiem                                 AM or PM
  g     12-hour format of an hour without leading zeros                           1 to 12
  G     24-hour format of an hour without leading zeros                           0 to 23
  h     12-hour format of an hour with leading zeros                              01 to 12
  H     24-hour format of an hour with leading zeros                              00 to 23
  i     Minutes, with leading zeros                                               00 to 59
  s     Seconds, with leading zeros                                               00 to 59
  u     Decimal fraction of a second                                              Examples:
        (minimum 1 digit, arbitrary number of digits allowed)                     001 (i.e. 0.001s) or
                                                                                  100 (i.e. 0.100s) or
                                                                                  999 (i.e. 0.999s) or
                                                                                  999876543210 (i.e. 0.999876543210s)
  O     Difference to Greenwich time (GMT) in hours and minutes                   Example: +1030
  P     Difference to Greenwich time (GMT) with colon between hours and minutes   Example: -08:00
  T     Timezone abbreviation of the machine running the code                     Examples: EST, MDT, PDT ...
  Z     Timezone offset in seconds (negative if west of UTC, positive if east)    -43200 to 50400
  c     ISO 8601 date
        Notes:                                                                    Examples:
        1) If unspecified, the month / day defaults to the current month / day,   1991 or
           the time defaults to midnight, while the timezone defaults to the      1992-10 or
           browser's timezone. If a time is specified, it must include both hours 1993-09-20 or
           and minutes. The "T" delimiter, seconds, milliseconds and timezone     1994-08-19T16:20+01:00 or
           are optional.                                                          1995-07-18T17:21:28-02:00 or
        2) The decimal fraction of a second, if specified, must contain at        1996-06-17T18:22:29.98765+03:00 or
           least 1 digit (there is no limit to the maximum number                 1997-05-16T19:23:30,12345-0400 or
           of digits allowed), and may be delimited by either a '.' or a ','      1998-04-15T20:24:31.2468Z or
        Refer to the examples on the right for the various levels of              1999-03-14T20:24:32Z or
        date-time granularity which are supported, or see                         2000-02-13T21:25:33
        http://www.w3.org/TR/NOTE-datetime for more info.                         2001-01-12 22:26:34
  U     Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)                1193432466 or -2138434463
  MS    Microsoft AJAX serialized dates                                           \/Date(1238606590509)\/ (i.e. UTC milliseconds since epoch) or
                                                                                  \/Date(1238606590509+0800)\/
</pre>
 *
 * Example usage (note that you must escape format specifiers with '\\' to render them as character literals):
 * <pre><code>
// Sample date:
// 'Wed Jan 10 2007 15:05:01 GMT-0600 (Central Standard Time)'

var dt = new Date('1/10/2007 03:05:01 PM GMT-0600');
console.log(MX.util.DateFormat.format(dt, 'Y-m-d'));                          // 2007-01-10
console.log(MX.util.DateFormat.format(dt, 'F j, Y, g:i a'));                  // January 10, 2007, 3:05 pm
console.log(MX.util.DateFormat.format(dt, 'l, \\t\\he jS \\of F Y h:i:s A')); // Wednesday, the 10th of January 2007 03:05:01 PM
</code></pre>
 *
 * Here are some standard date/time patterns that you might find helpful.  They
 * are not part of the source of MX.util.DateFormat, but to use them you can simply copy this
 * block of code into any script that is included after MX.util.DateFormat and they will also become
 * globally available on the Date object.  Feel free to add or remove patterns as needed in your code.
 * <pre><code>
MX.util.DateFormat.patterns = {
    ISO8601Long:"Y-m-d H:i:s",
    ISO8601Short:"Y-m-d",
    ShortDate: "n/j/Y",
    LongDate: "l, F d, Y",
    FullDateTime: "l, F d, Y g:i:s A",
    MonthDay: "F d",
    ShortTime: "g:i A",
    LongTime: "g:i:s A",
    SortableDateTime: "Y-m-d\\TH:i:s",
    UniversalSortableDateTime: "Y-m-d H:i:sO",
    YearMonth: "F, Y"
};
</code></pre>
 *
 * Example usage:
 * <pre><code>
var dt = new Date();
console.log(MX.util.DateFormat.format(dt, MX.util.DateFormat.patterns.ShortDate));
</code></pre>
 * <p>Developer-written, custom formats may be used by supplying both a formatting and a parsing function
 * which perform to specialized requirements. The functions are stored in {@link #parseFunctions} and {@link #formatFunctions}.</p>
 * @singleton
 */

/*
 * Most of the date-formatting functions below are the excellent work of Baron Schwartz.
 * (see http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/)
 * They generate precompiled functions from format patterns instead of parsing and
 * processing each pattern every time a date is formatted. These functions are available
 * on every Date object.
 */

(function() {

// create private copy of MX's MX.util.Format.format() method
// - to remove unnecessary dependency
// - to resolve namespace conflict with MS-Ajax's implementation
function xf(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/\{(\d+)\}/g, function(m, i) {
        return args[i];
    });
}

MX.util.DateFormat = {
    /**
     * Returns the current timestamp
     * @return {Number} The current timestamp
     * @method
     */
    now: Date.now || function() {
        return +new Date();
    },

    /**
     * @private
     * Private for now
     */
    toString: function(date) {
        var pad = MX.util.Format.leftPad;

        return date.getFullYear() + "-"
            + pad(date.getMonth() + 1, 2, '0') + "-"
            + pad(date.getDate(), 2, '0') + "T"
            + pad(date.getHours(), 2, '0') + ":"
            + pad(date.getMinutes(), 2, '0') + ":"
            + pad(date.getSeconds(), 2, '0');
    },

    /**
     * Returns the number of milliseconds between two dates
     * @param {Date} dateA The first date
     * @param {Date} dateB (optional) The second date, defaults to now
     * @return {Number} The difference in milliseconds
     */
    getElapsed: function(dateA, dateB) {
        return Math.abs(dateA - (dateB || new Date()));
    },

    /**
     * Global flag which determines if strict date parsing should be used.
     * Strict date parsing will not roll-over invalid dates, which is the
     * default behaviour of javascript Date objects.
     * (see {@link #parse} for more information)
     * Defaults to <tt>false</tt>.
     * @type Boolean
    */
    useStrict: false,

    // private
    formatCodeToRegex: function(character, currentGroup) {
        // Note: currentGroup - position in regex result array (see notes for MX.util.DateFormat.parseCodes below)
        var p = utilDate.parseCodes[character];

        if (p) {
          p = typeof p == 'function'? p() : p;
          utilDate.parseCodes[character] = p; // reassign function result to prevent repeated execution
        }

        return p ? MX.applyIf({
          c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
        }, p) : {
            g: 0,
            c: null,
            s: MX.util.Format.escapeRegex(character) // treat unrecognised characters as literals
        };
    },

    /**
     * <p>An object hash in which each property is a date parsing function. The property name is the
     * format string which that function parses.</p>
     * <p>This object is automatically populated with date parsing functions as
     * date formats are requested for MX standard formatting strings.</p>
     * <p>Custom parsing functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #parse}.<p>
     * <p>Example:</p><pre><code>
MX.util.DateFormat.parseFunctions['x-date-format'] = myDateParser;
</code></pre>
     * <p>A parsing function should return a Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : String<div class="sub-desc">The date string to parse.</div></li>
     * <li><code>strict</code> : Boolean<div class="sub-desc">True to validate date strings while parsing
     * (i.e. prevent javascript Date "rollover") (The default must be false).
     * Invalid date strings should return null when parsed.</div></li>
     * </ul></div></p>
     * <p>To enable Dates to also be <i>formatted</i> according to that format, a corresponding
     * formatting function must be placed into the {@link #formatFunctions} property.
     * @property parseFunctions
     * @type Object
     */
    parseFunctions: {
        "MS": function(input, strict) {
            // note: the timezone offset is ignored since the MS Ajax server sends
            // a UTC milliseconds-since-Unix-epoch value (negative values are allowed)
            var re = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/'),
                r = (input || '').match(re);
            return r? new Date(((r[1] || '') + r[2]) * 1) : null;
        }
    },
    parseRegexes: [],

    /**
     * <p>An object hash in which each property is a date formatting function. The property name is the
     * format string which corresponds to the produced formatted date string.</p>
     * <p>This object is automatically populated with date formatting functions as
     * date formats are requested for MX standard formatting strings.</p>
     * <p>Custom formatting functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #format}. Example:</p><pre><code>
MX.util.DateFormat.formatFunctions['x-date-format'] = myDateFormatter;
</code></pre>
     * <p>A formatting function should return a string representation of the passed Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : Date<div class="sub-desc">The Date to format.</div></li>
     * </ul></div></p>
     * <p>To enable date strings to also be <i>parsed</i> according to that format, a corresponding
     * parsing function must be placed into the {@link #parseFunctions} property.
     * @property formatFunctions
     * @type Object
     */
    formatFunctions: {
        "MS": function() {
            // UTC milliseconds since Unix epoch (MS-AJAX serialized date format (MRSF))
            return '\\/Date(' + this.getTime() + ')\\/';
        }
    },

    y2kYear : 50,

    /**
     * Date interval constant
     * @type String
     */
    MILLI : "ms",

    /**
     * Date interval constant
     * @type String
     */
    SECOND : "s",

    /**
     * Date interval constant
     * @type String
     */
    MINUTE : "mi",

    /** Date interval constant
     * @type String
     */
    HOUR : "h",

    /**
     * Date interval constant
     * @type String
     */
    DAY : "d",

    /**
     * Date interval constant
     * @type String
     */
    MONTH : "mo",

    /**
     * Date interval constant
     * @type String
     */
    YEAR : "y",

    /**
     * <p>An object hash containing default date values used during date parsing.</p>
     * <p>The following properties are available:<div class="mdetail-params"><ul>
     * <li><code>y</code> : Number<div class="sub-desc">The default year value. (defaults to undefined)</div></li>
     * <li><code>m</code> : Number<div class="sub-desc">The default 1-based month value. (defaults to undefined)</div></li>
     * <li><code>d</code> : Number<div class="sub-desc">The default day value. (defaults to undefined)</div></li>
     * <li><code>h</code> : Number<div class="sub-desc">The default hour value. (defaults to undefined)</div></li>
     * <li><code>i</code> : Number<div class="sub-desc">The default minute value. (defaults to undefined)</div></li>
     * <li><code>s</code> : Number<div class="sub-desc">The default second value. (defaults to undefined)</div></li>
     * <li><code>ms</code> : Number<div class="sub-desc">The default millisecond value. (defaults to undefined)</div></li>
     * </ul></div></p>
     * <p>Override these properties to customize the default date values used by the {@link #parse} method.</p>
     * <p><b>Note: In countries which experience Daylight Saving Time (i.e. DST), the <tt>h</tt>, <tt>i</tt>, <tt>s</tt>
     * and <tt>ms</tt> properties may coincide with the exact time in which DST takes effect.
     * It is the responsiblity of the developer to account for this.</b></p>
     * Example Usage:
     * <pre><code>
// set default day value to the first day of the month
MX.util.DateFormat.defaults.d = 1;

// parse a February date string containing only year and month values.
// setting the default day value to 1 prevents weird date rollover issues
// when attempting to parse the following date string on, for example, March 31st 2009.
MX.util.DateFormat.parse('2009-02', 'Y-m'); // returns a Date object representing February 1st 2009
</code></pre>
     * @property defaults
     * @type Object
     */
    defaults: {},

    //<locale type="array">
    /**
     * @property {String[]} dayNames
     * An array of textual day names.
     * Override these values for international dates.
     * Example:
     * <pre><code>
MX.util.DateFormat.dayNames = [
    'SundayInYourLang',
    'MondayInYourLang',
    ...
];
</code></pre>
     */
    dayNames : [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ],
    //</locale>

    //<locale type="array">
    /**
     * @property {String[]} monthNames
     * An array of textual month names.
     * Override these values for international dates.
     * Example:
     * <pre><code>
MX.util.DateFormat.monthNames = [
    'JanInYourLang',
    'FebInYourLang',
    ...
];
</code></pre>
     */
    monthNames : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],
    //</locale>

    //<locale type="object">
    /**
     * @property {Object} monthNumbers
     * An object hash of zero-based javascript month numbers (with short month names as keys. note: keys are case-sensitive).
     * Override these values for international dates.
     * Example:
     * <pre><code>
MX.util.DateFormat.monthNumbers = {
    'LongJanNameInYourLang': 0,
    'ShortJanNameInYourLang':0,
    'LongFebNameInYourLang':1,
    'ShortFebNameInYourLang':1,
    ...
};
</code></pre>
     */
    monthNumbers : {
        January: 0,
        Jan: 0,
        February: 1,
        Feb: 1,
        March: 2,
        Mar: 2,
        April: 3,
        Apr: 3,
        May: 4,
        June: 5,
        Jun: 5,
        July: 6,
        Jul: 6,
        August: 7,
        Aug: 7,
        September: 8,
        Sep: 8,
        October: 9,
        Oct: 9,
        November: 10,
        Nov: 10,
        December: 11,
        Dec: 11
    },
    //</locale>
    
    //<locale>
    /**
     * @property {String} defaultFormat
     * <p>The date format string that the {@link MX.util.Format#dateRenderer}
     * and {@link MX.util.Format#date} functions use.  See {@link MX.util.DateFormat} for details.</p>
     * <p>This may be overridden in a locale file.</p>
     */
    defaultFormat : "m/d/Y",
    //</locale>
    //<locale type="function">
    /**
     * Get the short month name for the given month number.
     * Override this function for international dates.
     * @param {Number} month A zero-based javascript month number.
     * @return {String} The short month name.
     */
    getShortMonthName : function(month) {
        return MX.util.DateFormat.monthNames[month].substring(0, 3);
    },
    //</locale>

    //<locale type="function">
    /**
     * Get the short day name for the given day number.
     * Override this function for international dates.
     * @param {Number} day A zero-based javascript day number.
     * @return {String} The short day name.
     */
    getShortDayName : function(day) {
        return MX.util.DateFormat.dayNames[day].substring(0, 3);
    },
    //</locale>

    //<locale type="function">
    /**
     * Get the zero-based javascript month number for the given short/full month name.
     * Override this function for international dates.
     * @param {String} name The short/full month name.
     * @return {Number} The zero-based javascript month number.
     */
    getMonthNumber : function(name) {
        // handle camel casing for english month names (since the keys for the MX.util.DateFormat.monthNumbers hash are case sensitive)
        return MX.util.DateFormat.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
    },
    //</locale>

    /**
     * Checks if the specified format contains hour information
     * @param {String} format The format to check
     * @return {Boolean} True if the format contains hour information
     * @method
     */
    formatContainsHourInfo : (function(){
        var stripEscapeRe = /(\\.)/g,
            hourInfoRe = /([gGhHisucUOPZ]|MS)/;
        return function(format){
            return hourInfoRe.test(format.replace(stripEscapeRe, ''));
        };
    }()),

    /**
     * Checks if the specified format contains information about
     * anything other than the time.
     * @param {String} format The format to check
     * @return {Boolean} True if the format contains information about
     * date/day information.
     * @method
     */
    formatContainsDateInfo : (function(){
        var stripEscapeRe = /(\\.)/g,
            dateInfoRe = /([djzmnYycU]|MS)/;

        return function(format){
            return dateInfoRe.test(format.replace(stripEscapeRe, ''));
        };
    }()),
    
    /**
     * Removes all escaping for a date format string. In date formats,
     * using a '\' can be used to escape special characters.
     * @param {String} format The format to unescape
     * @return {String} The unescaped format
     * @method
     */
    unescapeFormat: (function() { 
        var slashRe = /\\/gi;
        return function(format) {
            // Escape the format, since \ can be used to escape special
            // characters in a date format. For example, in a spanish
            // locale the format may be: 'd \\de F \\de Y'
            return format.replace(slashRe, '');
        }
    }()),

    /**
     * The base format-code to formatting-function hashmap used by the {@link #format} method.
     * Formatting functions are strings (or functions which return strings) which
     * will return the appropriate value when evaluated in the context of the Date object
     * from which the {@link #format} method is called.
     * Add to / override these mappings for custom date formatting.
     * Note: MX.util.DateFormat.format() treats characters as literals if an appropriate mapping cannot be found.
     * Example:
     * <pre><code>
MX.util.DateFormat.formatCodes.x = "MX.util.Format.leftPad(this.getDate(), 2, '0')";
console.log(MX.util.DateFormat.format(new Date(), 'X'); // returns the current day of the month
</code></pre>
     * @type Object
     */
    formatCodes : {
        d: "MX.util.Format.leftPad(this.getDate(), 2, '0')",
        D: "MX.util.DateFormat.getShortDayName(this.getDay())", // get localised short day name
        j: "this.getDate()",
        l: "MX.util.DateFormat.dayNames[this.getDay()]",
        N: "(this.getDay() ? this.getDay() : 7)",
        S: "MX.util.DateFormat.getSuffix(this)",
        w: "this.getDay()",
        z: "MX.util.DateFormat.getDayOfYear(this)",
        W: "MX.util.Format.leftPad(MX.util.DateFormat.getWeekOfYear(this), 2, '0')",
        F: "MX.util.DateFormat.monthNames[this.getMonth()]",
        m: "MX.util.Format.leftPad(this.getMonth() + 1, 2, '0')",
        M: "MX.util.DateFormat.getShortMonthName(this.getMonth())", // get localised short month name
        n: "(this.getMonth() + 1)",
        t: "MX.util.DateFormat.getDaysInMonth(this)",
        L: "(MX.util.DateFormat.isLeapYear(this) ? 1 : 0)",
        o: "(this.getFullYear() + (MX.util.DateFormat.getWeekOfYear(this) == 1 && this.getMonth() > 0 ? +1 : (MX.util.DateFormat.getWeekOfYear(this) >= 52 && this.getMonth() < 11 ? -1 : 0)))",
        Y: "MX.util.Format.leftPad(this.getFullYear(), 4, '0')",
        y: "('' + this.getFullYear()).substring(2, 4)",
        a: "(this.getHours() < 12 ? 'am' : 'pm')",
        A: "(this.getHours() < 12 ? 'AM' : 'PM')",
        g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
        G: "this.getHours()",
        h: "MX.util.Format.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
        H: "MX.util.Format.leftPad(this.getHours(), 2, '0')",
        i: "MX.util.Format.leftPad(this.getMinutes(), 2, '0')",
        s: "MX.util.Format.leftPad(this.getSeconds(), 2, '0')",
        u: "MX.util.Format.leftPad(this.getMilliseconds(), 3, '0')",
        O: "MX.util.DateFormat.getGMTOffset(this)",
        P: "MX.util.DateFormat.getGMTOffset(this, true)",
        T: "MX.util.DateFormat.getTimezone(this)",
        Z: "(this.getTimezoneOffset() * -60)",

        c: function() { // ISO-8601 -- GMT format
            var c, code, i, l, e;
            for (c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
                e = c.charAt(i);
                code.push(e == "T" ? "'T'" : utilDate.getFormatCode(e)); // treat T as a character literal
            }
            return code.join(" + ");
        },
        /*
        c: function() { // ISO-8601 -- UTC format
            return [
              "this.getUTCFullYear()", "'-'",
              "MX.util.Format.leftPad(this.getUTCMonth() + 1, 2, '0')", "'-'",
              "MX.util.Format.leftPad(this.getUTCDate(), 2, '0')",
              "'T'",
              "MX.util.Format.leftPad(this.getUTCHours(), 2, '0')", "':'",
              "MX.util.Format.leftPad(this.getUTCMinutes(), 2, '0')", "':'",
              "MX.util.Format.leftPad(this.getUTCSeconds(), 2, '0')",
              "'Z'"
            ].join(" + ");
        },
        */

        U: "Math.round(this.getTime() / 1000)"
    },

    /**
     * Checks if the passed Date parameters will cause a javascript Date "rollover".
     * @param {Number} year 4-digit year
     * @param {Number} month 1-based month-of-year
     * @param {Number} day Day of month
     * @param {Number} hour (optional) Hour
     * @param {Number} minute (optional) Minute
     * @param {Number} second (optional) Second
     * @param {Number} millisecond (optional) Millisecond
     * @return {Boolean} true if the passed parameters do not cause a Date "rollover", false otherwise.
     */
    isValid : function(y, m, d, h, i, s, ms) {
        // setup defaults
        h = h || 0;
        i = i || 0;
        s = s || 0;
        ms = ms || 0;

        // Special handling for year < 100
        var dt = utilDate.add(new Date(y < 100 ? 100 : y, m - 1, d, h, i, s, ms), utilDate.YEAR, y < 100 ? y - 100 : 0);

        return y == dt.getFullYear() &&
            m == dt.getMonth() + 1 &&
            d == dt.getDate() &&
            h == dt.getHours() &&
            i == dt.getMinutes() &&
            s == dt.getSeconds() &&
            ms == dt.getMilliseconds();
    },

    /**
     * Parses the passed string using the specified date format.
     * Note that this function expects normal calendar dates, meaning that months are 1-based (i.e. 1 = January).
     * The {@link #defaults} hash will be used for any date value (i.e. year, month, day, hour, minute, second or millisecond)
     * which cannot be found in the passed string. If a corresponding default date value has not been specified in the {@link #defaults} hash,
     * the current date's year, month, day or DST-adjusted zero-hour time value will be used instead.
     * Keep in mind that the input date string must precisely match the specified format string
     * in order for the parse operation to be successful (failed parse operations return a null value).
     * <p>Example:</p><pre><code>
//dt = Fri May 25 2007 (current date)
var dt = new Date();

//dt = Thu May 25 2006 (today&#39;s month/day in 2006)
dt = MX.util.DateFormat.parse("2006", "Y");

//dt = Sun Jan 15 2006 (all date parts specified)
dt = MX.util.DateFormat.parse("2006-01-15", "Y-m-d");

//dt = Sun Jan 15 2006 15:20:01
dt = MX.util.DateFormat.parse("2006-01-15 3:20:01 PM", "Y-m-d g:i:s A");

// attempt to parse Sun Feb 29 2006 03:20:01 in strict mode
dt = MX.util.DateFormat.parse("2006-02-29 03:20:01", "Y-m-d H:i:s", true); // returns null
</code></pre>
     * @param {String} input The raw date string.
     * @param {String} format The expected date string format.
     * @param {Boolean} strict (optional) True to validate date strings while parsing (i.e. prevents javascript Date "rollover")
                        (defaults to false). Invalid date strings will return null when parsed.
     * @return {Date} The parsed Date.
     */
    parse : function(input, format, strict) {
        var p = utilDate.parseFunctions;
        if (p[format] == null) {
            utilDate.createParser(format);
        }
        return p[format](input, MX.isDefined(strict) ? strict : utilDate.useStrict);
    },

    // Backwards compat
    parseDate: function(input, format, strict){
        return utilDate.parse(input, format, strict);
    },


    // private
    getFormatCode : function(character) {
        var f = utilDate.formatCodes[character];

        if (f) {
          f = typeof f == 'function'? f() : f;
          utilDate.formatCodes[character] = f; // reassign function result to prevent repeated execution
        }

        // note: unknown characters are treated as literals
        return f || ("'" + MX.util.Format.escape(character) + "'");
    },

    // private
    createFormat : function(format) {
        var code = [],
            special = false,
            ch = '',
            i;

        for (i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else if (special) {
                special = false;
                code.push("'" + MX.util.Format.escape(ch) + "'");
            } else {
                code.push(utilDate.getFormatCode(ch));
            }
        }
        utilDate.formatFunctions[format] = Function.prototype.constructor.apply(Function.prototype, ["return " + code.join('+')]);
    },

    // private
    createParser : (function() {
        var code = [
            "var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,",
                "def = MX.util.DateFormat.defaults,",
                "results = String(input).match(MX.util.DateFormat.parseRegexes[{0}]);", // either null, or an array of matched strings

            "if(results){",
                "{1}",

                "if(u != null){", // i.e. unix time is defined
                    "v = new Date(u * 1000);", // give top priority to UNIX time
                "}else{",
                    // create Date object representing midnight of the current day;
                    // this will provide us with our date defaults
                    // (note: clearTime() handles Daylight Saving Time automatically)
                    "dt = MX.util.DateFormat.clearTime(new Date);",

                    // date calculations (note: these calculations create a dependency on MX.util.Format.from())
                    "y = MX.util.Format.from(y, MX.util.Format.from(def.y, dt.getFullYear()));",
                    "m = MX.util.Format.from(m, MX.util.Format.from(def.m - 1, dt.getMonth()));",
                    "d = MX.util.Format.from(d, MX.util.Format.from(def.d, dt.getDate()));",

                    // time calculations (note: these calculations create a dependency on MX.util.Format.from())
                    "h  = MX.util.Format.from(h, MX.util.Format.from(def.h, dt.getHours()));",
                    "i  = MX.util.Format.from(i, MX.util.Format.from(def.i, dt.getMinutes()));",
                    "s  = MX.util.Format.from(s, MX.util.Format.from(def.s, dt.getSeconds()));",
                    "ms = MX.util.Format.from(ms, MX.util.Format.from(def.ms, dt.getMilliseconds()));",

                    "if(z >= 0 && y >= 0){",
                        // both the year and zero-based day of year are defined and >= 0.
                        // these 2 values alone provide sufficient info to create a full date object

                        // create Date object representing January 1st for the given year
                        // handle years < 100 appropriately
                        "v = MX.util.DateFormat.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), MX.util.DateFormat.YEAR, y < 100 ? y - 100 : 0);",

                        // then add day of year, checking for Date "rollover" if necessary
                        "v = !strict? v : (strict === true && (z <= 364 || (MX.util.DateFormat.isLeapYear(v) && z <= 365))? MX.util.DateFormat.add(v, MX.util.DateFormat.DAY, z) : null);",
                    "}else if(strict === true && !MX.util.DateFormat.isValid(y, m + 1, d, h, i, s, ms)){", // check for Date "rollover"
                        "v = null;", // invalid date, so return null
                    "}else{",
                        // plain old Date object
                        // handle years < 100 properly
                        "v = MX.util.DateFormat.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), MX.util.DateFormat.YEAR, y < 100 ? y - 100 : 0);",
                    "}",
                "}",
            "}",

            "if(v){",
                // favour UTC offset over GMT offset
                "if(zz != null){",
                    // reset to UTC, then add offset
                    "v = MX.util.DateFormat.add(v, MX.util.DateFormat.SECOND, -v.getTimezoneOffset() * 60 - zz);",
                "}else if(o){",
                    // reset to GMT, then add offset
                    "v = MX.util.DateFormat.add(v, MX.util.DateFormat.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
                "}",
            "}",

            "return v;"
        ].join('\n');

        return function(format) {
            var regexNum = utilDate.parseRegexes.length,
                currentGroup = 1,
                calc = [],
                regex = [],
                special = false,
                ch = "",
                i = 0,
                len = format.length,
                atEnd = [],
                obj;

            for (; i < len; ++i) {
                ch = format.charAt(i);
                if (!special && ch == "\\") {
                    special = true;
                } else if (special) {
                    special = false;
                    regex.push(MX.util.Format.escape(ch));
                } else {
                    obj = utilDate.formatCodeToRegex(ch, currentGroup);
                    currentGroup += obj.g;
                    regex.push(obj.s);
                    if (obj.g && obj.c) {
                        if (obj.calcAtEnd) {
                            atEnd.push(obj.c);
                        } else {
                            calc.push(obj.c);
                        }
                    }
                }
            }
            
            calc = calc.concat(atEnd);

            utilDate.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", 'i');
            utilDate.parseFunctions[format] = Function.prototype.constructor.apply(Function.prototype, ["input", "strict", xf(code, regexNum, calc.join(''))]);
        };
    }()),

    // private
    parseCodes : {
        /*
         * Notes:
         * g = {Number} calculation group (0 or 1. only group 1 contributes to date calculations.)
         * c = {String} calculation method (required for group 1. null for group 0. {0} = currentGroup - position in regex result array)
         * s = {String} regex pattern. all matches are stored in results[], and are accessible by the calculation mapped to 'c'
         */
        d: {
            g:1,
            c:"d = parseInt(results[{0}], 10);\n",
            s:"(3[0-1]|[1-2][0-9]|0[1-9])" // day of month with leading zeroes (01 - 31)
        },
        j: {
            g:1,
            c:"d = parseInt(results[{0}], 10);\n",
            s:"(3[0-1]|[1-2][0-9]|[1-9])" // day of month without leading zeroes (1 - 31)
        },
        D: function() {
            for (var a = [], i = 0; i < 7; a.push(utilDate.getShortDayName(i)), ++i); // get localised short day names
            return {
                g:0,
                c:null,
                s:"(?:" + a.join("|") +")"
            };
        },
        l: function() {
            return {
                g:0,
                c:null,
                s:"(?:" + utilDate.dayNames.join("|") + ")"
            };
        },
        N: {
            g:0,
            c:null,
            s:"[1-7]" // ISO-8601 day number (1 (monday) - 7 (sunday))
        },
        //<locale type="object" property="parseCodes">
        S: {
            g:0,
            c:null,
            s:"(?:st|nd|rd|th)"
        },
        //</locale>
        w: {
            g:0,
            c:null,
            s:"[0-6]" // javascript day number (0 (sunday) - 6 (saturday))
        },
        z: {
            g:1,
            c:"z = parseInt(results[{0}], 10);\n",
            s:"(\\d{1,3})" // day of the year (0 - 364 (365 in leap years))
        },
        W: {
            g:0,
            c:null,
            s:"(?:\\d{2})" // ISO-8601 week number (with leading zero)
        },
        F: function() {
            return {
                g:1,
                c:"m = parseInt(MX.util.DateFormat.getMonthNumber(results[{0}]), 10);\n", // get localised month number
                s:"(" + utilDate.monthNames.join("|") + ")"
            };
        },
        M: function() {
            for (var a = [], i = 0; i < 12; a.push(utilDate.getShortMonthName(i)), ++i); // get localised short month names
            return MX.applyIf({
                s:"(" + a.join("|") + ")"
            }, utilDate.formatCodeToRegex("F"));
        },
        m: {
            g:1,
            c:"m = parseInt(results[{0}], 10) - 1;\n",
            s:"(1[0-2]|0[1-9])" // month number with leading zeros (01 - 12)
        },
        n: {
            g:1,
            c:"m = parseInt(results[{0}], 10) - 1;\n",
            s:"(1[0-2]|[1-9])" // month number without leading zeros (1 - 12)
        },
        t: {
            g:0,
            c:null,
            s:"(?:\\d{2})" // no. of days in the month (28 - 31)
        },
        L: {
            g:0,
            c:null,
            s:"(?:1|0)"
        },
        o: function() {
            return utilDate.formatCodeToRegex("Y");
        },
        Y: {
            g:1,
            c:"y = parseInt(results[{0}], 10);\n",
            s:"(\\d{4})" // 4-digit year
        },
        y: {
            g:1,
            c:"var ty = parseInt(results[{0}], 10);\n"
                + "y = ty > MX.util.DateFormat.y2kYear ? 1900 + ty : 2000 + ty;\n", // 2-digit year
            s:"(\\d{1,2})"
        },
        /*
         * In the am/pm parsing routines, we allow both upper and lower case
         * even though it doesn't exactly match the spec. It gives much more flexibility
         * in being able to specify case insensitive regexes.
         */
        //<locale type="object" property="parseCodes">
        a: {
            g:1,
            c:"if (/(am)/i.test(results[{0}])) {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s:"(am|pm|AM|PM)",
            calcAtEnd: true
        },
        //</locale>
        //<locale type="object" property="parseCodes">
        A: {
            g:1,
            c:"if (/(am)/i.test(results[{0}])) {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s:"(AM|PM|am|pm)",
            calcAtEnd: true
        },
        //</locale>
        g: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(1[0-2]|[0-9])" //  12-hr format of an hour without leading zeroes (1 - 12)
        },
        G: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(2[0-3]|1[0-9]|[0-9])" // 24-hr format of an hour without leading zeroes (0 - 23)
        },
        h: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(1[0-2]|0[1-9])" //  12-hr format of an hour with leading zeroes (01 - 12)
        },
        H: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(2[0-3]|[0-1][0-9])" //  24-hr format of an hour with leading zeroes (00 - 23)
        },
        i: {
            g:1,
            c:"i = parseInt(results[{0}], 10);\n",
            s:"([0-5][0-9])" // minutes with leading zeros (00 - 59)
        },
        s: {
            g:1,
            c:"s = parseInt(results[{0}], 10);\n",
            s:"([0-5][0-9])" // seconds with leading zeros (00 - 59)
        },
        u: {
            g:1,
            c:"ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
            s:"(\\d+)" // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
        },
        O: {
            g:1,
            c:[
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(3,5) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + MX.util.Format.leftPad(hr, 2, '0') + MX.util.Format.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{4})" // GMT offset in hrs and mins
        },
        P: {
            g:1,
            c:[
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(4,6) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + MX.util.Format.leftPad(hr, 2, '0') + MX.util.Format.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{2}:\\d{2})" // GMT offset in hrs and mins (with colon separator)
        },
        T: {
            g:0,
            c:null,
            s:"[A-Z]{1,4}" // timezone abbrev. may be between 1 - 4 chars
        },
        Z: {
            g:1,
            c:"zz = results[{0}] * 1;\n" // -43200 <= UTC offset <= 50400
                  + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
            s:"([+-]?\\d{1,5})" // leading '+' sign is optional for UTC offset
        },
        c: function() {
            var calc = [],
                arr = [
                    utilDate.formatCodeToRegex("Y", 1), // year
                    utilDate.formatCodeToRegex("m", 2), // month
                    utilDate.formatCodeToRegex("d", 3), // day
                    utilDate.formatCodeToRegex("H", 4), // hour
                    utilDate.formatCodeToRegex("i", 5), // minute
                    utilDate.formatCodeToRegex("s", 6), // second
                    {c:"ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"}, // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
                    {c:[ // allow either "Z" (i.e. UTC) or "-0530" or "+08:00" (i.e. UTC offset) timezone delimiters. assumes local timezone if no timezone is specified
                        "if(results[8]) {", // timezone specified
                            "if(results[8] == 'Z'){",
                                "zz = 0;", // UTC
                            "}else if (results[8].indexOf(':') > -1){",
                                utilDate.formatCodeToRegex("P", 8).c, // timezone offset with colon separator
                            "}else{",
                                utilDate.formatCodeToRegex("O", 8).c, // timezone offset without colon separator
                            "}",
                        "}"
                    ].join('\n')}
                ],
                i,
                l;

            for (i = 0, l = arr.length; i < l; ++i) {
                calc.push(arr[i].c);
            }

            return {
                g:1,
                c:calc.join(""),
                s:[
                    arr[0].s, // year (required)
                    "(?:", "-", arr[1].s, // month (optional)
                        "(?:", "-", arr[2].s, // day (optional)
                            "(?:",
                                "(?:T| )?", // time delimiter -- either a "T" or a single blank space
                                arr[3].s, ":", arr[4].s,  // hour AND minute, delimited by a single colon (optional). MUST be preceded by either a "T" or a single blank space
                                "(?::", arr[5].s, ")?", // seconds (optional)
                                "(?:(?:\\.|,)(\\d+))?", // decimal fraction of a second (e.g. ",12345" or ".98765") (optional)
                                "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", // "Z" (UTC) or "-0530" (UTC offset without colon delimiter) or "+08:00" (UTC offset with colon delimiter) (optional)
                            ")?",
                        ")?",
                    ")?"
                ].join("")
            };
        },
        U: {
            g:1,
            c:"u = parseInt(results[{0}], 10);\n",
            s:"(-?\\d+)" // leading minus sign indicates seconds before UNIX epoch
        }
    },

    //Old MX.util.DateFormat prototype methods.
    // private
    dateFormat: function(date, format) {
        return utilDate.format(date, format);
    },

    /**
     * Compares if two dates are equal by comparing their values.
     * @param {Date} date1
     * @param {Date} date2
     * @return {Boolean} True if the date values are equal
     */
    isEqual: function(date1, date2) {
        // check we have 2 date objects
        if (date1 && date2) {
            return (date1.getTime() === date2.getTime());
        }
        // one or both isn't a date, only equal if both are falsey
        return !(date1 || date2);
    },

    /**
     * Formats a date given the supplied format string.
     * @param {Date} date The date to format
     * @param {String} format The format string
     * @return {String} The formatted date or an empty string if date parameter is not a JavaScript Date object
     */
    format: function(date, format) {
        var formatFunctions = utilDate.formatFunctions;

        if (!MX.isDate(date)) {
            return '';
        }

        if (formatFunctions[format] == null) {
            utilDate.createFormat(format);
        }

        return formatFunctions[format].call(date) + '';
    },

    /**
     * Get the timezone abbreviation of the current date (equivalent to the format specifier 'T').
     *
     * Note: The date string returned by the javascript Date object's toString() method varies
     * between browsers (e.g. FF vs IE) and system region settings (e.g. IE in Asia vs IE in America).
     * For a given date string e.g. "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)",
     * getTimezone() first tries to get the timezone abbreviation from between a pair of parentheses
     * (which may or may not be present), failing which it proceeds to get the timezone abbreviation
     * from the GMT offset portion of the date string.
     * @param {Date} date The date
     * @return {String} The abbreviated timezone name (e.g. 'CST', 'PDT', 'EDT', 'MPST' ...).
     */
    getTimezone : function(date) {
        // the following list shows the differences between date strings from different browsers on a WinXP SP2 machine from an Asian locale:
        //
        // Opera  : "Thu, 25 Oct 2007 22:53:45 GMT+0800" -- shortest (weirdest) date string of the lot
        // Safari : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone (same as FF)
        // FF     : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone
        // IE     : "Thu Oct 25 22:54:35 UTC+0800 2007" -- (Asian system setting) look for 3-4 letter timezone abbrev
        // IE     : "Thu Oct 25 17:06:37 PDT 2007" -- (American system setting) look for 3-4 letter timezone abbrev
        //
        // this crazy regex attempts to guess the correct timezone abbreviation despite these differences.
        // step 1: (?:\((.*)\) -- find timezone in parentheses
        // step 2: ([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?) -- if nothing was found in step 1, find timezone from timezone offset portion of date string
        // step 3: remove all non uppercase characters found in step 1 and 2
        return date.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
    },

    /**
     * Get the offset from GMT of the current date (equivalent to the format specifier 'O').
     * @param {Date} date The date
     * @param {Boolean} colon (optional) true to separate the hours and minutes with a colon (defaults to false).
     * @return {String} The 4-character offset string prefixed with + or - (e.g. '-0600').
     */
    getGMTOffset : function(date, colon) {
        var offset = date.getTimezoneOffset();
        return (offset > 0 ? "-" : "+")
            + MX.util.Format.leftPad(Math.floor(Math.abs(offset) / 60), 2, "0")
            + (colon ? ":" : "")
            + MX.util.Format.leftPad(Math.abs(offset % 60), 2, "0");
    },

    /**
     * Get the numeric day number of the year, adjusted for leap year.
     * @param {Date} date The date
     * @return {Number} 0 to 364 (365 in leap years).
     */
    getDayOfYear: function(date) {
        var num = 0,
            d = MX.util.DateFormat.clone(date),
            m = date.getMonth(),
            i;

        for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
            num += utilDate.getDaysInMonth(d);
        }
        return num + date.getDate() - 1;
    },

    /**
     * Get the numeric ISO-8601 week number of the year.
     * (equivalent to the format specifier 'W', but without a leading zero).
     * @param {Date} date The date
     * @return {Number} 1 to 53
     * @method
     */
    getWeekOfYear : (function() {
        // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
        var ms1d = 864e5, // milliseconds in a day
            ms7d = 7 * ms1d; // milliseconds in a week

        return function(date) { // return a closure so constants get calculated only once
            var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d, // an Absolute Day Number
                AWN = Math.floor(DC3 / 7), // an Absolute Week Number
                Wyr = new Date(AWN * ms7d).getUTCFullYear();

            return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
        };
    }()),

    /**
     * Checks if the current date falls within a leap year.
     * @param {Date} date The date
     * @return {Boolean} True if the current date falls within a leap year, false otherwise.
     */
    isLeapYear : function(date) {
        var year = date.getFullYear();
        return !!((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    },

    /**
     * Get the first day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     * Example:
     * <pre><code>
var dt = new Date('1/10/2007'),
    firstDay = MX.util.DateFormat.getFirstDayOfMonth(dt);
console.log(MX.util.DateFormat.dayNames[firstDay]); //output: 'Monday'
     * </code></pre>
     * @param {Date} date The date
     * @return {Number} The day number (0-6).
     */
    getFirstDayOfMonth : function(date) {
        var day = (date.getDay() - (date.getDate() - 1)) % 7;
        return (day < 0) ? (day + 7) : day;
    },

    /**
     * Get the last day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     * Example:
     * <pre><code>
var dt = new Date('1/10/2007'),
    lastDay = MX.util.DateFormat.getLastDayOfMonth(dt);
console.log(MX.util.DateFormat.dayNames[lastDay]); //output: 'Wednesday'
     * </code></pre>
     * @param {Date} date The date
     * @return {Number} The day number (0-6).
     */
    getLastDayOfMonth : function(date) {
        return utilDate.getLastDateOfMonth(date).getDay();
    },


    /**
     * Get the date of the first day of the month in which this date resides.
     * @param {Date} date The date
     * @return {Date}
     */
    getFirstDateOfMonth : function(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    /**
     * Get the date of the last day of the month in which this date resides.
     * @param {Date} date The date
     * @return {Date}
     */
    getLastDateOfMonth : function(date) {
        return new Date(date.getFullYear(), date.getMonth(), utilDate.getDaysInMonth(date));
    },

    /**
     * Get the number of days in the current month, adjusted for leap year.
     * @param {Date} date The date
     * @return {Number} The number of days in the month.
     * @method
     */
    getDaysInMonth: (function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function(date) { // return a closure for efficiency
            var m = date.getMonth();

            return m == 1 && utilDate.isLeapYear(date) ? 29 : daysInMonth[m];
        };
    }()),

    //<locale type="function">
    /**
     * Get the English ordinal suffix of the current day (equivalent to the format specifier 'S').
     * @param {Date} date The date
     * @return {String} 'st, 'nd', 'rd' or 'th'.
     */
    getSuffix : function(date) {
        switch (date.getDate()) {
            case 1:
            case 21:
            case 31:
                return "st";
            case 2:
            case 22:
                return "nd";
            case 3:
            case 23:
                return "rd";
            default:
                return "th";
        }
    },
    //</locale>

    /**
     * Creates and returns a new Date instance with the exact same date value as the called instance.
     * Dates are copied and passed by reference, so if a copied date variable is modified later, the original
     * variable will also be changed.  When the intention is to create a new variable that will not
     * modify the original instance, you should create a clone.
     *
     * Example of correctly cloning a date:
     * <pre><code>
//wrong way:
var orig = new Date('10/1/2006');
var copy = orig;
copy.setDate(5);
console.log(orig);  //returns 'Thu Oct 05 2006'!

//correct way:
var orig = new Date('10/1/2006'),
    copy = MX.util.DateFormat.clone(orig);
copy.setDate(5);
console.log(orig);  //returns 'Thu Oct 01 2006'
     * </code></pre>
     * @param {Date} date The date
     * @return {Date} The new Date instance.
     */
    clone : function(date) {
        return new Date(date.getTime());
    },

    /**
     * Checks if the current date is affected by Daylight Saving Time (DST).
     * @param {Date} date The date
     * @return {Boolean} True if the current date is affected by DST.
     */
    isDST : function(date) {
        // adapted from http://sencha.com/forum/showthread.php?p=247172#post247172
        // courtesy of @geoffrey.mcgill
        return new Date(date.getFullYear(), 0, 1).getTimezoneOffset() != date.getTimezoneOffset();
    },

    /**
     * Attempts to clear all time information from this Date by setting the time to midnight of the same day,
     * automatically adjusting for Daylight Saving Time (DST) where applicable.
     * (note: DST timezone information for the browser's host operating system is assumed to be up-to-date)
     * @param {Date} date The date
     * @param {Boolean} clone true to create a clone of this date, clear the time and return it (defaults to false).
     * @return {Date} this or the clone.
     */
    clearTime : function(date, clone) {
        if (clone) {
            return MX.util.DateFormat.clearTime(MX.util.DateFormat.clone(date));
        }

        // get current date before clearing time
        var d = date.getDate(),
            hr,
            c;

        // clear time
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        if (date.getDate() != d) { // account for DST (i.e. day of month changed when setting hour = 0)
            // note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
            // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule

            // increment hour until cloned date == current date
            for (hr = 1, c = utilDate.add(date, MX.util.DateFormat.HOUR, hr); c.getDate() != d; hr++, c = utilDate.add(date, MX.util.DateFormat.HOUR, hr));

            date.setDate(d);
            date.setHours(c.getHours());
        }

        return date;
    },

    /**
     * Provides a convenient method for performing basic date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     *
     * Examples:
     * <pre><code>
// Basic usage:
var dt = MX.util.DateFormat.add(new Date('10/29/2006'), MX.util.DateFormat.DAY, 5);
console.log(dt); //returns 'Fri Nov 03 2006 00:00:00'

// Negative values will be subtracted:
var dt2 = MX.util.DateFormat.add(new Date('10/1/2006'), MX.util.DateFormat.DAY, -5);
console.log(dt2); //returns 'Tue Sep 26 2006 00:00:00'

     * </code></pre>
     *
     * @param {Date} date The date to modify
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to add to the current date.
     * @return {Date} The new Date instance.
     */
    add : function(date, interval, value) {
        var d = MX.util.DateFormat.clone(date),
            Date = MX.util.DateFormat,
            day;
        if (!interval || value === 0) {
            return d;
        }

        switch(interval.toLowerCase()) {
            case MX.util.DateFormat.MILLI:
                d.setMilliseconds(d.getMilliseconds() + value);
                break;
            case MX.util.DateFormat.SECOND:
                d.setSeconds(d.getSeconds() + value);
                break;
            case MX.util.DateFormat.MINUTE:
                d.setMinutes(d.getMinutes() + value);
                break;
            case MX.util.DateFormat.HOUR:
                d.setHours(d.getHours() + value);
                break;
            case MX.util.DateFormat.DAY:
                d.setDate(d.getDate() + value);
                break;
            case MX.util.DateFormat.MONTH:
                day = date.getDate();
                if (day > 28) {
                    day = Math.min(day, MX.util.DateFormat.getLastDateOfMonth(MX.util.DateFormat.add(MX.util.DateFormat.getFirstDateOfMonth(date), MX.util.DateFormat.MONTH, value)).getDate());
                }
                d.setDate(day);
                d.setMonth(date.getMonth() + value);
                break;
            case MX.util.DateFormat.YEAR:
                day = date.getDate();
                if (day > 28) {
                    day = Math.min(day, MX.util.DateFormat.getLastDateOfMonth(MX.util.DateFormat.add(MX.util.DateFormat.getFirstDateOfMonth(date), MX.util.DateFormat.YEAR, value)).getDate());
                }
                d.setDate(day);
                d.setFullYear(date.getFullYear() + value);
                break;
        }
        return d;
    },

    /**
     * Checks if a date falls on or between the given start and end dates.
     * @param {Date} date The date to check
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} true if this date falls on or between the given start and end dates.
     */
    between : function(date, start, end) {
        var t = date.getTime();
        return start.getTime() <= t && t <= end.getTime();
    },

    //Maintains compatibility with old static and prototype window.Date methods.
    compat: function() {
        var nativeDate = window.Date,
            p, u,
            statics = ['useStrict', 'formatCodeToRegex', 'parseFunctions', 'parseRegexes', 'formatFunctions', 'y2kYear', 'MILLI', 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'defaults', 'dayNames', 'monthNames', 'monthNumbers', 'getShortMonthName', 'getShortDayName', 'getMonthNumber', 'formatCodes', 'isValid', 'parseDate', 'getFormatCode', 'createFormat', 'createParser', 'parseCodes'],
            proto = ['dateFormat', 'format', 'getTimezone', 'getGMTOffset', 'getDayOfYear', 'getWeekOfYear', 'isLeapYear', 'getFirstDayOfMonth', 'getLastDayOfMonth', 'getDaysInMonth', 'getSuffix', 'clone', 'isDST', 'clearTime', 'add', 'between'],
            sLen    = statics.length,
            pLen    = proto.length,
            stat, prot, s;

        //Append statics
        for (s = 0; s < sLen; s++) {
            stat = statics[s];
            nativeDate[stat] = utilDate[stat];
        }

        //Append to prototype
        for (p = 0; p < pLen; p++) {
            prot = proto[p];
            nativeDate.prototype[prot] = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                return utilDate[prot].apply(utilDate, args);
            };
        }
    }
};

var utilDate = MX.util.DateFormat;

MX.reg('dateformat', MX.util.DateFormat);

})();
/**
 * @class MX.util.Collection
 * 
 * Collection来自Ext3.4.0的源码
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    var escapeRe = function(s) {
        return s.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
    };
    
    X.util.Collection = Klass.define({
        // private
        alias: 'collection',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Boolean} allowFunctions Specify <tt>true</tt> if the {@link #addAll}
         * function should add function references to the collection. Defaults to
         * <tt>false</tt>.
         */
        allowFunctions: false,
        
        /**
         * @cfg {Function} getKey A function that can accept an item of the type(s) stored in this Collection
         * and return the key value for that item.  This is used when available to look up the key on items that
         * were passed without an explicit key parameter to a Collection method.  Passing this parameter is
         * equivalent to providing an implementation for the {@link #getKey} method.
         */
        
        // private
        init: function() {
            this.items = [];
            this.map = {};
            this.keys = [];
            this.length = 0;
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event clear
                 * Fires when the collection is cleared.
                 */
                'clear',
                /**
                 * @event add
                 * Fires when an item is added to the collection.
                 * @param {Number} index The index at which the item was added.
                 * @param {Object} o The item added.
                 * @param {String} key The key associated with the added item.
                 */
                'add',
                /**
                 * @event replace
                 * Fires when an item is replaced in the collection.
                 * @param {String} key he key associated with the new added.
                 * @param {Object} old The item being replaced.
                 * @param {Object} new The new item.
                 */
                'replace',
                /**
                 * @event remove
                 * Fires when an item is removed from the collection.
                 * @param {Object} o The item being removed.
                 * @param {String} key (optional) The key associated with the removed item.
                 */
                'remove',
                'sort'
            );
        },
        
        /**
         * Adds an item to the collection. Fires the {@link #add} event when complete.
         * @param {String} key <p>The key to associate with the item, or the new item.</p>
         * <p>If a {@link #getKey} implementation was specified for this Collection,
         * or if the key of the stored items is in a property called <tt><b>id</b></tt>,
         * the Collection will be able to <i>derive</i> the key for the new item.
         * In this case just pass the new item in this parameter.</p>
         * @param {Object} o The item to add.
         * @return {Object} The item added.
         */
        add: function(key, o) {
            if (arguments.length == 1) {
                o = arguments[0];
                key = this.getKey(o);
            }
            if (typeof key != 'undefined' && key !== null) {
                var old = this.map[key];
                if (typeof old != 'undefined') {
                    return this.replace(key, o);
                }
                this.map[key] = o;
            }
            this.length++;
            this.items.push(o);
            this.keys.push(key);
            this.fireEvent('add', this.length - 1, o, key);
            return o;
        },
    
        /**
         * Collection has a generic way to fetch keys if you implement getKey.  The default implementation
         * simply returns <b><code>item.id</code></b> but you can provide your own implementation
         * to return a different value as in the following examples:<pre><code>
         *     // normal way
         *     var mc = new MX.util.Collection();
         *     mc.add(someEl.dom.id, someEl);
         *     mc.add(otherEl.dom.id, otherEl);
         *     //and so on
         *     
         *     // using getKey
         *     var mc = new MX.util.Collection();
         *     mc.getKey = function(el){
         *        return el.dom.id;
         *     };
         *     mc.add(someEl);
         *     mc.add(otherEl);
         *     
         *     // or via the constructor
         *     var mc = new MX.util.Collection(false, function(el){
         *        return el.dom.id;
         *     });
         *     mc.add(someEl);
         *     mc.add(otherEl);
         * </code></pre>
         * @param {Object} item The item for which to find the key.
         * @return {Object} The key for the passed item.
         */
        getKey : function(o){
             return o.id;
        },
    
        /**
         * Replaces an item in the collection. Fires the {@link #replace} event when complete.
         * @param {String} key <p>The key associated with the item to replace, or the replacement item.</p>
         * <p>If you supplied a {@link #getKey} implementation for this Collection, or if the key
         * of your stored items is in a property called <tt><b>id</b></tt>, then the Collection
         * will be able to <i>derive</i> the key of the replacement item. If you want to replace an item
         * with one having the same key value, then just pass the replacement item in this parameter.</p>
         * @param o {Object} o (optional) If the first parameter passed was a key, the item to associate
         * with that key.
         * @return {Object}  The new item.
         */
        replace: function(key, o) {
            if (arguments.length == 1) {
                o = arguments[0];
                key = this.getKey(o);
            }
            var old = this.map[key];
            if (typeof key == 'undefined' || key === null || typeof old == 'undefined') {
                return this.add(key, o);
            }
            var index = this.indexOfKey(key);
            this.items[index] = o;
            this.map[key] = o;
            this.fireEvent('replace', key, old, o);
            return o;
        },
    
        /**
         * Adds all elements of an Array or an Object to the collection.
         * @param {Object/Array} objs An Object containing properties which will be added
         * to the collection, or an Array of values, each of which are added to the collection.
         * Functions references will be added to the collection if <code>{@link #allowFunctions}</code>
         * has been set to <tt>true</tt>.
         */
        addAll: function(objs) {
            if (arguments.length > 1 || X.isArray(objs)) {
                var args = arguments.length > 1 ? arguments : objs;
                for (var i = 0, len = args.length; i < len; i++) {
                    this.add(args[i]);
                }
            } else {
                for (var key in objs) {
                    if (this.allowFunctions || typeof objs[key] != 'function') {
                        this.add(key, objs[key]);
                    }
                }
            }
        },
    
        /**
         * Executes the specified function once for every item in the collection, passing the following arguments:
         * <div class="mdetail-params"><ul>
         * <li><b>item</b> : Mixed<p class="sub-desc">The collection item</p></li>
         * <li><b>index</b> : Number<p class="sub-desc">The item's index</p></li>
         * <li><b>length</b> : Number<p class="sub-desc">The total number of items in the collection</p></li>
         * </ul></div>
         * The function should return a boolean value. Returning false from the function will stop the iteration.
         * @param {Function} fn The function to execute for each item.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current item in the iteration.
         */
        each: function(fn, scope) {
            var items = [].concat(this.items); // each safe for removal
            for (var i = 0, len = items.length; i < len; i++) {
                if (fn.call(scope || items[i], items[i], i, len) === false) {
                    break;
                }
            }
        },
    
        /**
         * Executes the specified function once for every key in the collection, passing each
         * key, and its associated item as the first two parameters.
         * @param {Function} fn The function to execute for each item.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
         */
        eachKey: function(fn, scope) {
            for (var i = 0, len = this.keys.length; i < len; i++) {
                fn.call(scope || window, this.keys[i], this.items[i], i, len);
            }
        },
    
        /**
         * Returns the first item in the collection which elicits a true return value from the
         * passed selection function.
         * @param {Function} fn The selection function to execute for each item.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
         * @return {Object} The first item in the collection which returned true from the selection function.
         */
        find: function(fn, scope) {
            for (var i = 0, len = this.items.length; i < len; i++) {
                if (fn.call(scope || window, this.items[i], this.keys[i])) {
                    return this.items[i];
                }
            }
            return null;
        },
    
        /**
         * Inserts an item at the specified index in the collection. Fires the {@link #add} event when complete.
         * @param {Number} index The index to insert the item at.
         * @param {String} key The key to associate with the new item, or the item itself.
         * @param {Object} o (optional) If the second parameter was a key, the new item.
         * @return {Object} The item inserted.
         */
        insert: function(index, key, o) {
            if (arguments.length == 2) {
                o = arguments[1];
                key = this.getKey(o);
            }
            if (this.containsKey(key)) {
                this.suspendEvents();
                this.removeKey(key);
                this.resumeEvents();
            }
            if (index >= this.length) {
                return this.add(key, o);
            }
            this.length++;
            this.items.splice(index, 0, o);
            if (typeof key != 'undefined' && key !== null) {
                this.map[key] = o;
            }
            this.keys.splice(index, 0, key);
            this.fireEvent('add', index, o, key);
            return o;
        },
    
        /**
         * Remove an item from the collection.
         * @param {Object} o The item to remove.
         * @return {Object} The item removed or false if no item was removed.
         */
        remove: function(o) {
            return this.removeAt(this.indexOf(o));
        },
    
        /**
         * Remove an item from a specified index in the collection. Fires the {@link #remove} event when complete.
         * @param {Number} index The index within the collection of the item to remove.
         * @return {Object} The item removed or false if no item was removed.
         */
        removeAt: function(index) {
            if (index < this.length && index >= 0) {
                this.length--;
                var o = this.items[index];
                this.items.splice(index, 1);
                var key = this.keys[index];
                if (typeof key != 'undefined') {
                    delete this.map[key];
                }
                this.keys.splice(index, 1);
                this.fireEvent('remove', o, key);
                return o;
            }
            return false;
        },
    
        /**
         * Removed an item associated with the passed key fom the collection.
         * @param {String} key The key of the item to remove.
         * @return {Object} The item removed or false if no item was removed.
         */
        removeKey: function(key) {
            return this.removeAt(this.indexOfKey(key));
        },
    
        /**
         * Returns the number of items in the collection.
         * @return {Number} the number of items in the collection.
         */
        getCount: function() {
            return this.length;
        },
    
        /**
         * Returns index within the collection of the passed Object.
         * @param {Object} o The item to find the index of.
         * @return {Number} index of the item. Returns -1 if not found.
         */
        indexOf: function(o) {
            return this.items.indexOf(o);
        },
    
        /**
         * Returns index within the collection of the passed key.
         * @param {String} key The key to find the index of.
         * @return {Number} index of the key.
         */
        indexOfKey: function(key) {
            return this.keys.indexOf(key);
        },
    
        /**
         * Returns the item associated with the passed key OR index.
         * Key has priority over index.  This is the equivalent
         * of calling {@link #key} first, then if nothing matched calling {@link #itemAt}.
         * @param {String/Number} key The key or index of the item.
         * @return {Object} If the item is found, returns the item.  If the item was not found, returns <tt>undefined</tt>.
         * If an item was found, but is a Class, returns <tt>null</tt>.
         */
        item: function(key) {
            var mk = this.map[key], item = mk !== undefined ? mk : (typeof key == 'number') ? this.items[key] : undefined;
            return typeof item != 'function' || this.allowFunctions ? item : null; // for prototype!
        },
    
        /**
         * Returns the item at the specified index.
         * @param {Number} index The index of the item.
         * @return {Object} The item at the specified index.
         */
        itemAt: function(index) {
            return this.items[index];
        },
    
        /**
         * Returns the item associated with the passed key.
         * @param {String/Number} key The key of the item.
         * @return {Object} The item associated with the passed key.
         */
        key: function(key) {
            return this.map[key];
        },
    
        /**
         * Returns true if the collection contains the passed Object as an item.
         * @param {Object} o  The Object to look for in the collection.
         * @return {Boolean} True if the collection contains the Object as an item.
         */
        contains: function(o) {
            return this.indexOf(o) != -1;
        },
    
        /**
         * Returns true if the collection contains the passed Object as a key.
         * @param {String} key The key to look for in the collection.
         * @return {Boolean} True if the collection contains the Object as a key.
         */
        containsKey: function(key) {
            return typeof this.map[key] != 'undefined';
        },
    
        /**
         * Removes all items from the collection.  Fires the {@link #clear} event when complete.
         */
        clear: function() {
            this.length = 0;
            this.items = [];
            this.keys = [];
            this.map = {};
            this.fireEvent('clear');
        },
    
        /**
         * Returns the first item in the collection.
         * @return {Object} the first item in the collection..
         */
        first: function() {
            return this.items[0];
        },
    
        /**
         * Returns the last item in the collection.
         * @return {Object} the last item in the collection..
         */
        last: function() {
            return this.items[this.length - 1];
        },
    
        /**
         * @private
         * Performs the actual sorting based on a direction and a sorting function. Internally,
         * this creates a temporary array of all items in the Collection, sorts it and then writes
         * the sorted array data back into this.items and this.keys
         * @param {String} property Property to sort by ('key', 'value', or 'index')
         * @param {String} dir (optional) Direction to sort 'ASC' or 'DESC'. Defaults to 'ASC'.
         * @param {Function} fn (optional) Comparison function that defines the sort order.
         * Defaults to sorting by numeric value.
         */
        _sort: function(property, dir, fn) {
            var i, len, dsc = String(dir).toUpperCase() == 'DESC' ? -1 : 1,

            //this is a temporary array used to apply the sorting function
            c = [], keys = this.keys, items = this.items;

            //default to a simple sorter function if one is not provided
            fn = fn || function(a, b) {
                return a - b;
            };

            //copy all the items into a temporary array, which we will sort
            for (i = 0, len = items.length; i < len; i++) {
                c[c.length] = {
                    key: keys[i],
                    value: items[i],
                    index: i
                };
            }

            //sort the temporary array
            c.sort(function(a, b) {
                var v = fn(a[property], b[property]) * dsc;
                if (v === 0) {
                    v = (a.index < b.index ? -1 : 1);
                }
                return v;
            });

            //copy the temporary array back into the main this.items and this.keys objects
            for (i = 0, len = c.length; i < len; i++) {
                items[i] = c[i].value;
                keys[i] = c[i].key;
            }

            this.fireEvent('sort', this);
        },
    
        /**
         * Sorts this collection by <b>item</b> value with the passed comparison function.
         * @param {String} direction (optional) 'ASC' or 'DESC'. Defaults to 'ASC'.
         * @param {Function} fn (optional) Comparison function that defines the sort order.
         * Defaults to sorting by numeric value.
         */
        sort: function(dir, fn) {
            this._sort('value', dir, fn);
        },
    
        /**
         * Reorders each of the items based on a mapping from old index to new index. Internally this
         * just translates into a sort. The 'sort' event is fired whenever reordering has occured.
         * @param {Object} mapping Mapping from old item index to new item index
         */
        reorder: function(mapping) {
            this.suspendEvents();

            var items = this.items, index = 0, length = items.length, order = [], remaining = [], oldIndex;

            //object of {oldPosition: newPosition} reversed to {newPosition: oldPosition}
            for (oldIndex in mapping) {
                order[mapping[oldIndex]] = items[oldIndex];
            }

            for (index = 0; index < length; index++) {
                if (mapping[index] == undefined) {
                    remaining.push(items[index]);
                }
            }

            for (index = 0; index < length; index++) {
                if (order[index] == undefined) {
                    order[index] = remaining.shift();
                }
            }

            this.clear();
            this.addAll(order);

            this.resumeEvents();
            this.fireEvent('sort', this);
        },
    
        /**
         * Sorts this collection by <b>key</b>s.
         * @param {String} direction (optional) 'ASC' or 'DESC'. Defaults to 'ASC'.
         * @param {Function} fn (optional) Comparison function that defines the sort order.
         * Defaults to sorting by case insensitive string.
         */
        keySort: function(dir, fn) {
            this._sort('key', dir, fn || function(a, b) {
                var v1 = String(a).toUpperCase(), v2 = String(b).toUpperCase();
                return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
            });
        },
    
        /**
         * Returns a range of items in this collection
         * @param {Number} startIndex (optional) The starting index. Defaults to 0.
         * @param {Number} endIndex (optional) The ending index. Defaults to the last item.
         * @return {Array} An array of items
         */
        getRange: function(start, end) {
            var items = this.items;
            if (items.length < 1) {
                return [];
            }
            start = start || 0;
            end = Math.min(typeof end == 'undefined' ? this.length - 1 : end, this.length - 1);
            var i, r = [];
            if (start <= end) {
                for (i = start; i <= end; i++) {
                    r[r.length] = items[i];
                }
            } else {
                for (i = start; i >= end; i--) {
                    r[r.length] = items[i];
                }
            }
            return r;
        },
    
        /**
         * Filter the <i>objects</i> in this collection by a specific property.
         * Returns a new collection that has been filtered.
         * @param {String} property A property on your objects
         * @param {String/RegExp} value Either string that the property values
         * should start with or a RegExp to test against the property
         * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning
         * @param {Boolean} caseSensitive (optional) True for case sensitive comparison (defaults to False).
         * @return {Collection} The new filtered collection
         */
        filter: function(property, value, anyMatch, caseSensitive) {
            if (X.isEmpty(value, false)) {
                return this.clone();
            }
            value = this.createValueMatcher(value, anyMatch, caseSensitive);
            return this.filterBy(function(o) {
                return o && value.test(o[property]);
            });
        },
    
        /**
         * Filter by a function. Returns a <i>new</i> collection that has been filtered.
         * The passed function will be called with each object in the collection.
         * If the function returns true, the value is included otherwise it is filtered.
         * @param {Function} fn The function to be called, it will receive the args o (the object), k (the key)
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Collection.
         * @return {Collection} The new filtered collection
         */
        filterBy: function(fn, scope) {
            var r = new X.util.Collection();
            r.getKey = this.getKey;
            var k = this.keys, it = this.items;
            for (var i = 0, len = it.length; i < len; i++) {
                if (fn.call(scope || this, it[i], k[i])) {
                    r.add(k[i], it[i]);
                }
            }
            return r;
        },
    
        /**
         * Finds the index of the first matching object in this collection by a specific property/value.
         * @param {String} property The name of a property on your objects.
         * @param {String/RegExp} value A string that the property values
         * should start with or a RegExp to test against the property.
         * @param {Number} start (optional) The index to start searching at (defaults to 0).
         * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning.
         * @param {Boolean} caseSensitive (optional) True for case sensitive comparison.
         * @return {Number} The matched index or -1
         */
        findIndex: function(property, value, start, anyMatch, caseSensitive) {
            if (X.isEmpty(value, false)) {
                return -1;
            }
            value = this.createValueMatcher(value, anyMatch, caseSensitive);
            return this.findIndexBy(function(o) {
                return o && value.test(o[property]);
            }, null, start);
        },
    
        /**
         * Find the index of the first matching object in this collection by a function.
         * If the function returns <i>true</i> it is considered a match.
         * @param {Function} fn The function to be called, it will receive the args o (the object), k (the key).
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Collection.
         * @param {Number} start (optional) The index to start searching at (defaults to 0).
         * @return {Number} The matched index or -1
         */
        findIndexBy: function(fn, scope, start) {
            var k = this.keys, it = this.items;
            for (var i = (start || 0), len = it.length; i < len; i++) {
                if (fn.call(scope || this, it[i], k[i])) {
                    return i;
                }
            }
            return -1;
        },
    
        /**
         * Returns a regular expression based on the given value and matching options. This is used internally for finding and filtering,
         * and by Ext.data.Store#filter
         * @private
         * @param {String} value The value to create the regex for. This is escaped using escapeRe
         * @param {Boolean} anyMatch True to allow any match - no regex start/end line anchors will be added. Defaults to false
         * @param {Boolean} caseSensitive True to make the regex case sensitive (adds 'i' switch to regex). Defaults to false.
         * @param {Boolean} exactMatch True to force exact match (^ and $ characters added to the regex). Defaults to false. Ignored if anyMatch is true.
         */
        createValueMatcher: function(value, anyMatch, caseSensitive, exactMatch) {
            if (!value.exec) { // not a regex
                value = String(value);

                if (anyMatch === true) {
                    value = escapeRe(value);
                } else {
                    value = '^' + escapeRe(value);
                    if (exactMatch === true) {
                        value += '$';
                    }
                }
                value = new RegExp(value, caseSensitive ? '' : 'i');
            }
            return value;
        },
    
        /**
         * Creates a shallow copy of this collection
         * @return {Collection}
         */
        clone: function() {
            var r = new X.util.Collection();
            var k = this.keys, it = this.items;
            for (var i = 0, len = it.length; i < len; i++) {
                r.add(k[i], it[i]);
            }
            r.getKey = this.getKey;
            return r;
        }
    });
});
/**
 * @class MX.app.Template
 */
MX.kindle('jquery', 'arttemplate', 'klass', function(X, $, artTemplate, Klass) {
    X.app.Template = Klass.define({
        // private
        alias: 'template',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {String} container 模版渲染的容器
         */
        
        /**
         * @cfg {String} target 获取模版的Selector
         */
        
        /**
         * @cfg {String} template 模版HTML String
         */
        
        // private
        init: function() {
            if (!this.template) {
                this.template = artTemplate($(this.target || ('#' + this.id)).html());
            } else if (X.isString(this.template)) {
                this.template = artTemplate(this.template);
            }
        },
        
        /**
         * 获得应用模版生成的HTML代码片段
         */
        applyTemplate: function(data) {
            if (this.template) {
                return this.template(data || {});
            }
            return '';
        },
        
        /**
         * 渲染模版
         */
        render: function(container, data) {
            container = container || this.container;
            container.html(this.applyTemplate(data));
        }
    });
});
/**
 * @class MX.app.Model
 */
MX.kindle('klass', 'dateformat', function(X, Klass, DateFormat) {
    X.app.Model = Klass.define({
        // private
        alias: 'model',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Boolean} useWebDatabase true启动web sql database缓存数据，默认true
         */
        useWebDatabase: true,
        
        /**
         * @cfg {String} tableName 数据表名
         */
        
        /**
         * @cfg {Boolean} useCache 当网络离线或本地数据库有数据时，优先使用本地数据
         */
        useCache: false,
        
        /**
         * @cfg {Number} cacheExpires 缓存过期时间，单位毫秒，默认60 * 60 * 1000（1小时）
         */
        cacheExpires: 60 * 60 * 1000,
        
        /**
         * @cfg {Array} fields 开启useCache时，必须设置fields字段
         */
        
        /**
         * @cfg {String/Object} restful AJAX请求API
         */
        
        /**
         * @cfg {String} requestMethod AJAX请求类型，默认'GET'
         */
        requestMethod: 'GET',
        
        /**
         * @cfg {Object} baseParams AJAX请求提交给服务端的默认参数
         */
        
        /**
         * @cfg {String} idProperty model的id属性名，默认'id'
         */
        idProperty: 'id',
        
        /**
         * @cfg {String} dataProperty AJAX接收服务端响应JSON数据的属性名，默认'data'
         */
        dataProperty: 'data',
        
        /**
         * @cfg {Object} values 初始值
         */
        
        // private
        init: function() {
            this.baseParams = this.baseParams || {};
            
            this.initRestful();
            this.initFields();
            this.initTable();
            
            /**
             * @property dirty
             * true表示model的值被修改
             */
            this.dirty = false;
            
            /**
             * @property fetched
             * true表示已从服务器取值
             */
            this.fetched = false;
            
            /**
             * @property removed
             * true表示当前model数据已删除
             */
            this.removed = false;
            
            this.modified = {}; // model被修改的值
            this.data = {};
            
            if (this.values) {
                this.set(this.values);
                delete this.values;
            }
        },
        
        // private
        initRestful: function() {
            var actions = {
                create: 'create',
                read: 'read',
                update: 'update',
                destroy: 'destroy'
            }, rest, rests;
            
            this.restful = this.restful || {};
            
            if (X.isString(this.restful)) {
                this.restful = {
                    create: this.restful,
                    read: this.restful,
                    update: this.restful,
                    destroy: this.restful
                };
            }
            
            rests = {};
            X.each(actions, function(i, action) {
                rest = this.restful[action];
                if (X.isString(rest)) {
                    rest = {
                        url: rest,
                        type: this.requestMethod
                    };
                } else {
                    rest = $.extend({
                        type: this.requestMethod
                    }, rest)
                }
                rests[action] = rest;
            }, this);
            
            this.restful = rests;
        },
        
        // private
        initFields: function() {
            if (this.fields) {
                var fields = {};
                X.each(this.fields, function(i, field) {
                    if (X.isString(field)) {
                        field = {
                            name: field
                        };
                        fields[field.name] = field;
                    }
                }, this);
                if (!fields[this.idProperty]) {
                    fields[this.idProperty] = {
                        name: this.idProperty
                    };
                }
                this.fields = fields;
            }
        },
        
        // private
        initTable: function() {
            var me = this;
            if (!me.fields || !me.db || !me.tableName) {
                me.useWebDatabase = false;
            }
            if (me.useWebDatabase) {
                var name, fields = me.fields,
                    columnName = [],
                    columns = [];
                    
                columns.push(me.idProperty + ' UNIQUE');
                for (name in fields) {
                    if (name != me.idProperty) {
                        columns.push(name);
                        columnName.push(name);
                    }
                }
                columns.push('_last_updated TIMESTAMP');
                
                columns = columns.join(', ');
                columnName = columnName.join(',');
                
                me.db.transaction(function(t) {
                    t.executeSql('CREATE TABLE IF NOT EXISTS ' + me.tableName + ' (' + columns + ')', [], function(t, result) {
                        // 清理过期数据
                        t.executeSql('DELETE FROM ' + me.tableName + ' WHERE _last_updated < ?', [$.now() - me.cacheExpires]);
                        t.executeSql('SELECT * FROM systables WHERE table_name = ?', [me.tableName], function(t, result) {
                            if (result.rows.length == 0) {
                                t.executeSql('INSERT INTO systables VALUES (?)', [me.tableName]);
                            }
                        });
                        t.executeSql('SELECT column_name FROM syscolumns WHERE table_name = ?', [me.tableName], function(t, result) {
                            var resetTable = true;
                            if (result.rows.length == 0) {
                                t.executeSql('INSERT INTO syscolumns VALUES (?, ?)', [me.tableName, columnName]);
                            } else if (result.rows.item(0)['column_name'] != columnName) { // 更新表字段
                                t.executeSql('UPDATE syscolumns SET column_name = ? WHERE table_name = ?', [columnName, me.tableName]);
                            } else {
                                resetTable = false;
                            }
                            if (resetTable) {
                                t.executeSql('DROP TABLE ' + me.tableName, []);
                                t.executeSql('CREATE TABLE IF NOT EXISTS ' + me.tableName + ' (' + columns + ')', []);
                            }
                        });
                    });
                }, function(error) {
                    // database error
                });
            }
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event datachanged
                 */
                'datachanged',
                /**
                 * @event idchanged
                 */
                'idchanged',
                /**
                 * @event beforeload
                 */
                'beforeload',
                /**
                 * @event load
                 */
                'load',
                /**
                 * @event loadfailed
                 */
                'loadfailed'
            );
        },
        
        /**
         * 给model赋值，触发datachanged事件
         */
        set: function(name, value) {
            var data = this.data,
                modified = this.modified,
                currentValue, key, isDirty,
                idChanged, oldId, newId,
                changed = {},
                currValues = {},
                values, fields;
            
            if (X.isString(name)) {
                values = {};
                values[name] = value;
            } else {
                values = name;
            }
            
            fields = this.fields || values;
            
            for (name in fields) {
                if (values.hasOwnProperty(name)) {
                    value = values[name] || '';
                    currentValue = data[name];
                    
                    if (modified[name] === value) {
                        data[name] = value;
                        changed[name] = value;
                        currValues[name] = currentValue;
                        delete modified[name];
                        isDirty = false;
                        for (key in modified) {
                            this.dirty = true;
                            isDirty = true;
                        }
                        if (!isDirty) {
                            this.dirty = false;
                        }
                    } else if (currentValue !== value) {
                        data[name] = value;
                        changed[name] = value;
                        currValues[name] = currentValue;
                        if (!X.isDefined(modified[name])) {
                            modified[name] = currentValue;
                            this.dirty = true;
                        }
                    }
                    if (name == this.idProperty && currentValue !== value) {
                        idChanged = true;
                        oldId = currentValue;
                        newId = value;
                    }
                }
            }
            
            if (idChanged) {
                this.fireEvent('idchanged', this, newId, oldId);
            }
            this.fireEvent('datachanged', this, changed, currValues);
        },
        
        /**
         * 获取数据
         */
        get: function(name, raw) {
            var data = this.data,
                fields = this.fields,
                rs;
            if (X.isBoolean(name)) {
                raw = name;
                name = null;
            }
            if (raw === true || !fields) {
                rs = name ? data[name] : $.extend({}, data);
            } else {
                if (name) {
                    rs = this.renderData(fields[name], data[name]);
                } else {
                    rs = {};
                    for (name in fields) {
                        rs[name] = this.renderData(fields[name], data[name]);
                    }
                }
            }
            return rs;
        },
        
        // private
        renderData: function(field, value) {
            if (field) {
                var dateFormat = 'Y-m-d H:i:s',
                    renderer = field.renderer,
                    type = field.type,
                    dt;
                try {
                    if (renderer && X.isFunction(renderer)) {
                        value = renderer.call(this, value);
                    } else {
                        if (type == 'number') {
                            value = parseInt(value);
                        } else if (type == 'float') {
                            value = parseFloat(value);
                        } else if (type == 'date') {
                            value = DateFormat.parse(value, field.format || dateFormat);
                        } else if (type == 'timestampToDateString') {
                            dt = new Date();
                            dt.setTime(value);
                            value = DateFormat.format(dt, field.format || dateFormat);
                        } else if (type == 'string') {
                            value = '' + value;
                        }
                    }
                } catch (e) {
                }
            }
            return value;
        },
        
        /**
         * 加载数据
         */
        load: function(params) {
            if (!this.removed) {
                if (this.useWebDatabase && this.useCache) {
                    this.loadStorage(params);
                } else {
                    this.fetch(params);
                }
            }
        },
        
        /**
         * 强制从服务端取得数据，并更新本地缓存
         */
        fetch: function(params) {
            if (!this.removed && !this.loading && this.fireEvent('beforeload', this) !== false) {
                this.loading = true;
                
                params = params || {};
                params.data = params.data || {};
                params.data = $.extend({}, this.baseParams, this.getFetchParams() || {}, params.data, {'_dt': $.now()});
                params = $.extend({
                    type: this.requestMethod
                }, this.restful.read, params, {
                    dataType: 'json'
                });
                
                this.cancelFetch();
                this.lastXmlRequest = $.ajax(params)
                                       .done($.proxy(this.onFetchSuccess, this))
                                       .fail($.proxy(this.handleLoadFailed, this))
                                       .always($.proxy(this.handleRequestComplete, this));
            }
        },
        
        // private
        getFetchParams: function() {
            var params = {};
            params[this.idProperty] = this.get(this.idProperty, true);
            return params;
        },
        
        // private
        cancelFetch: function() {
            if (this.lastXmlRequest) {
                this.lastXmlRequest.abort();
                this.lastXmlRequest = null;
            }
        },
        
        // private
        onFetchSuccess: function(data, status, xhr) {
            if (!data) { // ajax请求被取消，abort
                return;
            }
            data = this.dataProperty ? data[this.dataProperty] : data;
            this.handleLoadSuccess(data);
            this.updateStorage();
        },
        
        // private
        handleLoadSuccess: function(data) {
            this.fetched = true;
            this.set(data || {});
            this.modified = {};
            this.dirty = false;
            this.fireEvent('load', this);
        },
        
        // private
        handleLoadFailed: function() {
            for (var name in this.data) {
                if (this.data.hasOwnProperty(name) && name != this.idProperty) {
                    this.data[name] = '';
                }
            }
            this.modified = {};
            this.dirty = false;
            this.fireEvent('loadfailed', this);
        },
        
        // private
        handleRequestComplete: function() {
            this.loading = false;
            this.lastXmlRequest = null;
        },
        
        /**
         * 与服务端同步数据，将本地修改的数据提交给服务端
         */
        sync: function() {
            // TODO model同步
        },
        
        /**
         * 移除model对象，同时将服务端数据移除
         */
        remove: function(params) {
            // TODO model移除
        },
        
        // private
        getStorageKey: function() {
            return this.get(this.idProperty, true);
        },
        
        // private
        loadStorage: function(params) {
            var me = this, 
                id = me.getStorageKey();
            if (me.useWebDatabase && id) {
                me.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + me.tableName + ' WHERE ' + me.idProperty + ' = ?', [id], function(t, result) {
                        if (result.rows.length > 0) {
                            var name, field, rs = {}, item = result.rows.item(0);
                            if ((item['_last_updated'] + me.cacheExpires) < $.now()) {
                                // 本地数据过期，从服务端重新加载
                                me.fetch(params);
                            } else {
                                for (name in me.fields) {
                                    if (me.fields.hasOwnProperty(name)) {
                                        rs[name] = JSON.parse(item[name]);
                                    }
                                }
                                me.handleLoadSuccess(rs);
                            }
                        } else {
                            me.handleLoadFailed();
                        }
                    });
                }, function(error) {
                    me.handleLoadFailed();
                });
            } else {
                me.fetch(params);
            }
        },
        
        // private
        updateStorage: function() {
            var me = this,
                id = me.getStorageKey();
            if (me.useWebDatabase && id) {
                me.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + me.tableName + ' WHERE ' + me.idProperty + ' = ?', [id], function(t, result) {
                        var name, field, fields = me.fields,
                            data = me.data,
                            sql,
                            columns = [],
                            values = [],
                            props = [],
                            val;
                        
                        if (result.rows.length > 0) { // 更新数据
                            for (name in fields) {
                                if (name != me.idProperty) {
                                    columns.push(name + ' = ?');
                                    props.push(JSON.stringify(data[name]));
                                }
                            }
                            columns.push('_last_updated = ?');
                            props.push($.now());
                            props.push(id);
                            sql = 'UPDATE ' + me.tableName + ' SET ' + columns.join(', ') + ' WHERE ' + me.idProperty + ' = ?';
                        } else {
                            columns.push(me.idProperty);
                            values.push('?');
                            props.push(id);
                            for (name in fields) {
                                if (name != me.idProperty) {
                                    columns.push(name);
                                    values.push('?');
                                    props.push(JSON.stringify(data[name]));
                                }
                            }
                            columns.push('_last_updated');
                            values.push('?');
                            props.push($.now());
                            sql = 'INSERT INTO ' + me.tableName + ' (' + columns.join(', ') + ') VALUES (' + values.join(', ') + ')';
                        }
                        
                        t.executeSql(sql, props);
                    });
                }, function(error) {
                    // database error
                });
            }
        },
        
        // private
        onDestroy: function() {
            this.db = null;
        }
    });
});
/**
 * @class MX.app.Store
 */
MX.kindle('jquery', 'klass', 'collection', function(X, $, Klass, Collection) {
    X.app.Store = Klass.define({
        // private
        alias: 'store',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Boolean} useWebDatabase true启动web sql database缓存数据，默认true
         */
        useWebDatabase: true,
        
        /**
         * @cfg {String} tableName 数据表名，默认'storepaging'
         */
        tableName: 'storepaging',
        
        /**
         * @cfg {Boolean} useCache 当网络离线或本地数据库有数据时，优先使用本地数据
         */
        useCache: false,
        
        /**
         * @cfg {Number} 缓存过期时间，单位毫秒，默认60 * 60 * 1000（1小时）
         */
        cacheExpires: 60 * 60 * 1000,
        
        /**
         * @cfg {String} storageKey 数据存储时，data record primary key
         * record的pk值一般有两部分，storageKey+pageNumber，例如：list-1
         * 如果为设定storageKey，那么会默认设置为Store.alias值
         */
        
        /**
         * @cfg {String} idProperty 赋值给model
         */
        idProperty: 'id',
        
        /**
         * @cfg {Array} fields 赋值给model
         */
        
        /**
         * @cfg {String/Object} restful AJAX请求API
         */
        
        /**
         * @cfg {String} requestMethod AJAX请求类型，默认'GET'
         */
        requestMethod: 'GET',
        
        /**
         * @cfg {Object} baseParams AJAX请求提交给服务端的默认参数
         */
        
        /**
         * @cfg {String} dataProperty AJAX接收服务端响应JSON数据的属性名，默认'data'
         */
        dataProperty: 'data',

        /**
         * @cfg {Object} meta 服务端响应数据json属性名映射
         * 
         *      {String} pageNumberProperty 翻页请求，提交参数名，默认'pageNumber'
         *      pageNumberProperty: 'pageNumber',
         * 
         *      {String} pageSizeProperty 翻页请求，提交参数名，默认'pageSize'
         *      pageSizeProperty: 'pageSize',
         * 
         *      {String} pageStartProperty 翻页请求，提交参数名，默认'pageStart'
         *      pageStartProperty: 'pageStart',
         * 
         *      {String} totalProperty 翻页请求，服务端响应数据，JSON参数名，默认'total'
         *      totalProperty: 'total',
         */

        /**
         * @cfg {Number} pageSize 每页记录数，默认20
         */
        pageSize: 20,
        
        /**
         * @cfg {Number} maxPage store翻页的最大页数
         */
        maxPage: Number.MAX_VALUE,
        
        // private
        init: function() {
            this.baseParams = this.baseParams || {};
            this.storageKey = this.storageKey || this.alias;
            this.meta = this.meta || {};
            X.applyIf(this.meta, {
                pageNumberProperty: 'page',
                pageSizeProperty: 'pageSize',
                pageStartProperty: 'pageStart',
                totalProperty: 'total'
            });
            
            this.initRestful();
            this.initTable();
            
            /**
             * @property {Number} currentPage 当前页
             */
            this.currentPage = 1;
            
            /**
             * @property {Number} total 总记录数
             */
            this.total = undefined;
            
            /**
             * @property fetched
             * true表示已从服务器取值
             */
            this.fetched = false;
            
            this.data = new Collection({
                getKey: function(o) {
                    return o.data[o.idProperty];
                }
            });
        },
        
        // private
        initRestful: function() {
            var actions = {
                create: 'create',
                read: 'read',
                update: 'update',
                destroy: 'destroy'
            }, rest, rests;
            
            this.restful = this.restful || {};
            
            if (X.isString(this.restful)) {
                this.restful = {
                    create: this.restful,
                    read: this.restful,
                    update: this.restful,
                    destroy: this.restful
                };
            }
            
            rests = {};
            X.each(actions, function(i, action) {
                rest = this.restful[action];
                if (X.isString(rest)) {
                    rest = {
                        url: rest,
                        type: this.requestMethod
                    };
                } else {
                    rest = $.extend({
                        type: this.requestMethod
                    }, rest)
                }
                rests[action] = rest;
            }, this);
            
            this.restful = rests;
        },
        
        // private
        initTable: function() {
            var me = this;
            if (!me.db || !me.tableName || !me.storageKey) {
                me.useWebDatabase = false;
            }
            if (me.useWebDatabase) {
                me.db.transaction(function(t) {
                    t.executeSql('CREATE TABLE IF NOT EXISTS ' + me.tableName + ' (id UNIQUE, value, _last_updated TIMESTAMP)', [], function(t, result) {
                        // 清理过期数据
                        t.executeSql('DELETE FROM ' + me.tableName + ' WHERE _last_updated < ?', [$.now() - me.cacheExpires]);
                        t.executeSql('SELECT * FROM systables WHERE table_name = ?', [me.tableName], function(t, result) {
                            if (result.rows.length == 0) {
                                t.executeSql('INSERT INTO systables VALUES (?)', [me.tableName]);
                            }
                        });
                    });
                }, function(error) {
                    // database error
                });
            }
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event datachanged
                 */
                'datachanged',
                /**
                 * @event beforeload
                 */
                'beforeload',
                /**
                 * @event load
                 */
                'load',
                /**
                 * @event loadfailed
                 */
                'loadfailed'
            );
        },
        
        /**
         * 加载数据
         */
        load: function(params) {
            if (!this.removed) {
                params = params || {};
                params.data = params.data || {};
                params.data.page = params.data.page || this.currentPage;
                if (this.useWebDatabase && this.useCache) {
                    this.loadStorage(params);
                } else {
                    this.fetch(params);
                }
            }
        },
        
        /**
         * 强制从服务端取得数据，并更新本地缓存
         */
        fetch: function(params) {
            var me = this,
                meta = me.meta,
                maxPage = me.maxPage,
                pageNumber;
            
            params = params || {};
            params.data = params.data || {};
            pageNumber = params.data.page || me.currentPage;
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            params.data.page = pageNumber;
            
            if (!me.loading && pageNumber <= maxPage && me.fireEvent('beforeload', me, pageNumber) !== false) {
                me.loading = true;
                me.toPage = pageNumber;
                
                params.data[meta.pageNumberProperty] = pageNumber;
                params.data[meta.pageSizeProperty] = me.pageSize;
                params.data[meta.pageStartProperty] = (pageNumber - 1) * me.pageSize;
                params.data['_dt'] = $.now(); // 时间戳，防止缓存
                params.data = $.extend({}, me.baseParams, params.data);
                params = $.extend({
                    type: me.requestMethod
                }, me.restful.read, params, {
                    dataType: 'json'
                });
                
                me.cancelFetch();
                me.lastXmlRequest = $.ajax(params)
                                     .done($.proxy(me.onFetchSuccess, me))
                                     .fail($.proxy(me.handleLoadFailed, me))
                                     .always($.proxy(me.handleRequestComplete, me));
            }
        },
        
        // private
        cancelFetch: function() {
            if (this.lastXmlRequest) {
                this.lastXmlRequest.abort();
                this.lastXmlRequest = null;
            }
        },
        
        // private
        onFetchSuccess: function(data, status, xhr) {
            if (!data) { // ajax请求被取消，abort
                return;
            }
            var rs = this.dataProperty ? data[this.dataProperty] : data;
            this.handleLoadSuccess(rs);
            this.updateStorage();
        },
        
        // private
        handleLoadSuccess: function(rs) {
            rs = rs || [];
            this.lastPage = this.currentPage; // 记录上一次翻页的页码
            this.currentPage = this.toPage;
            if (rs.length > 0) {
                var meta = this.meta;
                if (X.isDefined(rs[meta.totalProperty])) {
                    this.total = rs[meta.totalProperty];
                }
                this.data.clear();
                this.appendData(rs);
                this.fireEvent('datachanged', this);
            } else {
                this.data.clear();
                this.fireEvent('datachanged', this);
            }
            this.fireEvent('load', this);
        },
        
        // private
        handleLoadFailed: function() {
            this.data.clear();
            this.fireEvent('loadfailed', this);
        },
        
        // private
        handleRequestComplete: function() {
            this.loading = false;
            delete this.lastXhr;
        },
        
        // private
        appendData: function(rs) {
            X.each(rs, function(key, value) {
                this.data.add(this.createModel(value));
            }, this);
        },
        
        // private
        createModel: function(value) {
            return X.create('model', {
                useWebDatabase: false,
                idProperty: this.idProperty,
                fields: this.fields,
                values: value,
                listeners: {
                    scope: this,
                    'destroy': function(model) {
                        this.data.remove(model);
                    }
                }
            });
        },
        
        /**
         * 获取第一页
         */
        first: function() {
            this.load({
                data: {
                    page: 1
                }
            });
        },
        
        /**
         * 获取最后一页
         */
        last: function() {
            if (X.isDefined(this.total)) {
                var pageCount = this.getPageData().pageCount;
                this.load({
                    data: {
                        page: pageCount
                    }
                });
            }
        },
        
        /**
         * 获取前一页
         */
        prev: function() {
            this.load({
                data: {
                    page: this.currentPage - 1
                }
            });
        },
        
        /**
         * 获取后一页
         */
        next: function() {
            if (this.currentPage == 1 && this.get().length == 0) {
                // 如果第一页没有加载到数据，则重新load第一页
                this.first();
            } else {
                this.load({
                    data: {
                        page: this.currentPage + 1
                    }
                });
            }
        },
        
        /**
         * 增加数据
         */
        add: function(record) {
            this.appendData(X.toArray(record));
        },
        
        /**
         * 插入一条数据
         */
        insert: function(index, record) {
            this.data.insert(index, this.createModel(record));
            this.fireEvent('datachanged', this);
        },
        
        /**
         * 移除数据
         */
        remove: function(id) {
            var r = this.data.item(id);
            if (r) {
                r.destroy();
            }
        },
        
        /**
         * 递归
         */
        each: function(fn, scope) {
            this.data.each(fn, scope || this);
        },
        
        /**
         * 获取store数据
         */
        get: function(id, raw) {
            var rs, model;
            if (X.isBoolean(id)) {
                raw = id;
                id = null;
            }
            if (id) {
                model = this.data.item(id);
                if (model) {
                    rs = model.get(raw); 
                }
            } else {
                rs = [];
                this.each(function(model) {
                    rs.push(model.get(raw));
                });
            }
            return rs;
        },

        // private
        getPageData: function() {
            return {
                total: this.total,
                maxPage: this.maxPage,
                currentPage: this.currentPage,
                pageCount: X.isDefined(this.total) ? Math.ceil(this.total / this.pageSize) : 1,
                fromRecord: ((this.currentPage - 1) * this.pageSize) + 1,
                toRecord: X.isDefined(this.total) ? Math.min(this.currentPage * this.pageSize, this.total) : this.pageSize
            };
        },
        
        /**
         * 将model修改同步到服务端
         */
        sync: function() {
            // TODO
        },
        
        // private
        getStorageKey: function(pageNumber) {
            return this.storageKey + '-' + pageNumber;
        },
        
        // private
        loadStorage: function(params) {
            var me = this, 
                pageNumber = params.data.page,
                id;
            if (me.useWebDatabase) {
                me.toPage = pageNumber; // 记录翻页页码
                id = me.getStorageKey(pageNumber);
                me.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + me.tableName + ' WHERE id = ?', [id], function(t, result) {
                        if (result.rows.length > 0) {
                            var item = result.rows.item(0);
                            if ((item['_last_updated'] + me.cacheExpires) < $.now()) {
                                // 本地数据过期，刷新数据
                                me.fetch(params);
                            } else {
                                try {
                                    me.handleLoadSuccess(JSON.parse(item['value']));
                                } catch (e) {
                                    me.handleLoadFailed();
                                }
                            }
                        } else {
                            me.handleLoadFailed();
                        }
                    });
                }, function(error) {
                    me.handleLoadFailed();
                });
            } else {
                me.fetch(params);
            }
        },
        
        // private
        updateStorage: function() {
            var me = this, 
                id;
            if (me.useWebDatabase) {
                id = me.getStorageKey(me.currentPage);
                me.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + me.tableName + ' WHERE id = ?', [id], function(t, result) {
                        try {
                            var props = [],
                                value = JSON.stringify(me.get(null, true));
                            
                            if (result.rows.length > 0) { // 更新数据
                                sql = 'UPDATE ' + me.tableName + ' SET value = ?, _last_updated = ? WHERE id = ?';
                                props.push(value);
                                props.push($.now());
                                props.push(id);
                            } else {
                                sql = 'INSERT INTO ' + me.tableName + ' (id, value, _last_updated) VALUES (?, ?, ?)';
                                props.push(id);
                                props.push(value);
                                props.push($.now());
                            }
                            
                            t.executeSql(sql, props);
                        } catch(e) {
                            // ignore
                        }
                    });
                }, function(error) {
                    // database error
                });
            }
        },
        
        // private
        onDestroy: function() {
            this.db = null;
        }
    });
});
/**
 * @class MX.app.View
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    X.app.View = Klass.define({
        // private
        alias: 'view',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {String} headerCls 添加到header元素上的扩展CSS样式
         */
        
        /**
         * @cfg {String} footerCls 添加到footer元素上的扩展CSS样式
         */
        
        /**
         * @cfg {String} bodyCls 添加到body元素上的扩展CSS样式
         */
        
        // private
        init: function() {
            this.initTemplate();
        },
        
        // private
        initTemplate: function() {
            var templates = {}, tmpl;
            X.each(this.templates, function(i, config) {
                tmpl = X.create('template', $.extend({}, config));
                if (tmpl.renderToBody) {
                    this.renderBodyTmpl = tmpl;
                } else if (tmpl.renderToHeader) {
                    this.renderHeaderTmpl = tmpl;
                } else if (tmpl.renderToFooter) {
                    this.renderFooterTmpl = tmpl;
                }
                templates[tmpl.id] = tmpl;
            }, this);
            this.templates = templates; 
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 */
                'beforerender',
                /**
                 * @event render
                 */
                'render'
            );
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                this.rendered = true;
                
                this.container = container = $(container);
                
                if (this.renderHeaderTmpl) {
                    this.header = $(document.createElement('div'));
                    this.header.attr('id', 'mx-app-page-header-' + this.id)
                               .attr('data' + $.mobile.ns + '-role', 'header');
                    if (this.headerCls) {
                        this.header.addClass(this.headerCls);
                    }
                    this.renderHeaderTmpl.container = this.header;
                    this.renderHeaderTmpl.render();
                    container.append(this.header);
                }
                
                if (this.renderFooterTmpl) {
                    this.footer = $(document.createElement('div'));
                    this.footer.attr('id', 'mx-app-page-footer-' + this.id)
                               .attr('data' + $.mobile.ns + '-role', 'footer');
                    if (this.footerCls) {
                        this.footer.addClass(this.footerCls);
                    }
                    this.renderFooterTmpl.container = this.header;
                    this.renderFooterTmpl.render();
                    container.append(this.header);
                }
                
                this.body = $(document.createElement('div'));
                this.body.attr('id', 'mx-app-page-body-' + this.id)
                         .attr('data' + $.mobile.ns + '-role', 'content');
                if (this.bodyCls) {
                    this.body.addClass(this.bodyCls);
                }
                if (this.renderBodyTmpl) {
                    this.renderBodyTmpl.container = this.body;
                    this.renderBodyTmpl.render();
                }
                container.append(this.body);
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,
        
        /**
         * 获取模版
         * @param {String} id
         * @return {Object} template
         */
        getTemplate: function(id) {
            return this.templates[id];
        },
        
        // private
        onDestory: function() {
            if (this.header) {
                this.header.remove();
                this.header = null;
            }
            if (this.footer) {
                this.footer.remove();
                this.footer = null;
            }
            if (this.body) {
                this.body.remove();
                this.body = null;
            }
            this.container = null;
        }
    });
});
/**
 * @class MX.app.Controller
 */
MX.kindle('klass', function(X, Klass) {
    X.app.Controller = Klass.define({
        // private
        alias: 'controller',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Object} delegates 委托事件
         */
        
        // private
        init: function() {
            this.relayMethod(this.view, 'getTemplate', 'getComponent');
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event pagebeforeshow
                 */
                'pagebeforeshow',
                /**
                 * @event pageshow
                 */
                'pageshow',
                /**
                 * @event pagebeforehide
                 */
                'pagebeforehide',
                /**
                 * @event pagehide
                 */
                'pagehide'
            );
            
            this.mon(this.view, 'render', function() {
                if (this.delegates) {
                    this.delegateEvent(this.view.container, this.delegates);
                    delete this.delegates;
                }
            });
        },
        
        /**
         * 绑定委托事件
         * 
         * delegateEvent(root, eventName)
         *  {
         *      scope: scope,
         *      'click ul > li': callbackFn
         *  }
         * 
         * delegateEvent(root, eventName, selector, callbackFn)
         * 
         * delegateEvent(root, eventName, selector, callbackFn, scope)
         * 
         */
        delegateEvent: function(root, eventName, selector, callbackFn, scope) {
            var len = arguments.length;
            
            if (X.isObject(eventName)) {
                var p, eName, index, selector, fn;
                scope = eventName.scope || this;
                delete eventName.scope;
                for (p in eventName) {
                    index = p.indexOf(' ');
                    selector = p.substring(index + 1);
                    eName = p.substring(0, index);
                    fn = eventName[p];
                    fn = X.isString(fn) ? this[fn] : fn;
                    this.delegateEvent(root, eName, selector, fn, scope);
                }
                return;
            }
            
            this.mon(root, eventName, selector, callbackFn, scope);
        },
        
        // private
        beforePageShow: X.emptyFn,
        
        // private
        onPageShow: X.emptyFn,
        
        // private
        beforePageHide: X.emptyFn,
        
        // private
        onPageHide: X.emptyFn,
        
        /**
         * 获取Model
         * @param {String} modelId
         */
        getModel: function(id) {
            return this.models[id];
        },
        
        /**
         * 获取Store
         * @param {String} storeId
         */
        getStore: function(id) {
            return this.stores[id];
        },
        
        /**
         * 获取header element
         */
        getHeader: function() {
            return this.view.header;
        },
        
        /**
         * 获取footer element
         */
        getFooter: function() {
            return this.view.footer;
        },
        
        /**
         * 获取body element
         */
        getBody: function() {
            return this.view.body;
        },
        
        /**
         * 获取container element
         */
        getContainer: function() {
            return this.view.container;
        },
        
        /**
         * 获取container element
         */
        getCt: function() {
            return this.getContainer();
        },
        
        // private
        onDestroy: function() {
            this.view = null;
            this.models = this.stores = null;
        }
    });
});
/**
 * @class MX.app.Pagelet
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    var paramNameRe = /(:|\*)\w+/g; // 匹配URL中的参数名
    
    X.app.Pagelet = Klass.define({
        // private
        alias: 'pagelet',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Boolean} singleton true单例，默认false
         */
        singleton: false,
        
        /**
         * @cfg {Boolean} noCache true缓存pagelet实例，false当退出页面时立即销毁pagelet，默认false
         */
        noCache: false,
        
        /**
         * @cfg {String} hash pagelet绑定的hash
         */
        
        /**
         * @cfg {String/View} view 绑定View
         */
        
        /**
         * @cfg {String/Controller} controller 绑定Controller
         */
        
        /**
         * @cfg {Array/Model} models 绑定model，允许绑定多个model
         */
        
        /**
         * @cfg {Array/Store} stores 绑定store，允许绑定多个store
         */
        
        /**
         * @cfg {String} cls 添加到el元素上的扩展CSS样式
         */
        
        // private
        init: function() {
            // 匹配URL中包含的参数名
            this.urlParamNames = this.url.match(paramNameRe);
            
            // 解析URL中包含的参数值
            this.parseParams();
            
            this.initView();
            this.initController();
        },
        
        // private
        // 将hash中包含的参数解析出来
        parseParams: function() {
            var values = this.urlRe.exec(this.hash).slice(1),
                params = {};
            
            X.each(this.urlParamNames, function(i, param) {
                params[param.substr(1)] = values[i];
            }, this);
            
            this.params = params;
            return params;
        },
        
        // private
        initEvent: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 */
                'beforerender',
                /**
                 * @event render
                 */
                'render'
            );
        },
        
        // private
        initView: function() {
            this.view = X.create(this.view || 'view', {});
        },
        
        // private
        initController: function() {
            this.controller = X.create(this.controller || 'controller', {
                pagelet: this,
                view: this.view,
                models: this.models,
                stores: this.stores
            });
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                this.rendered = true;
                
                this.container = container = $(container);
                
                this.el = $(document.createElement('div'));
                this.el.attr('id', 'mx-app-page-' + this.id)
                       .attr('data' + $.mobile.ns + '-role', 'page')
                       .attr('data' + $.mobile.ns + '-url', '#/' + this.hash);
                if (this.cls) {
                    this.el.addClass(this.cls);
                }
                container.append(this.el);
                
                if (this.view) {
                    this.view.render(this.el);
                }
                
                this.mon(this.el, {
                    'pagebeforeshow': this.beforePageShow,
                    'pageshow': this.onPageShow,
                    'pagebeforehide': this.beforePageHide,
                    'pagehide': this.onPageHide
                });
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,
        
        // private
        beforePageShow: function() {
            if (this.controller) {
                this.controller.beforePageShow();
                this.controller.fireEvent('pagebeforeshow', this.controller);
            }
        },
        
        // private
        onPageShow: function() {
            if (this.controller) {
                this.controller.onPageShow();
                this.controller.fireEvent('pageshow', this.controller);
            }
        },
        
        // private
        beforePageHide: function() {
            this.cancelFetch();
            if (this.controller) {
                this.controller.beforePageHide();
                this.controller.fireEvent('pagebeforehide', this.controller);
            }
        },
        
        // private
        onPageHide: function() {
            if (this.controller) {
                this.controller.onPageHide();
                this.controller.fireEvent('pagehide', this.controller);
            }
        },
        
        // private
        // 取消所有model、store的AJAX fetch动作
        cancelFetch: function() {
            X.each(this.models, function(id, model) {
                model.cancelFetch();
            }, this);
            X.each(this.stores, function(id, store) {
                store.cancelFetch();
            }, this);
        },
        
        /**
         * 获得view对象
         */
        getView: function() {
            return this.view;
        },
        
        /**
         * 获得controller对象
         */
        getController: function() {
            return this.controller;
        },
        
        // private
        onDestory: function() {
            if (this.models && X.isObject(this.models)) {
                X.each(this.models, function(i, model) {
                    model.destroy();
                });
            }
            if (this.stores && X.isObject(this.stores)) {
                X.each(this.stores, function(i, store) {
                    store.destroy();
                });
            }
            if (this.controller) {
                this.controller.destroy();
                this.controller = null;
            }
            if (this.view) {
                this.view.destroy();
                this.view = null;
            }
            if (this.el) {
                this.el.remove();
                this.el = null;
            }
            this.container = null;
        }
    });
});
/**
 * @class MX.app.Application
 */
MX.kindle('jquery', 'klass', 'localstorage', 'pagelet', function(X, $, Klass, LocalStorage, Pagelet) {
    var $window = $(window),
        location = window.location,
        matchHashRe = /#(.*)$/, // 匹配url中的hash部分
        hashStripperRe = /^[#\/]/, // 移除hash碎片中的"#/"标识符
        namedParamRe = /:\w+/g, // 匹配hash中的parameter
        splatParamRe = /\*\w+/g, // 匹配hash一段url字符串
        escapeRe = /[-[\]{}()+?.,\\^$|#\s]/g; // 过滤hash中的特殊字符
    
    X.app.Application = Klass.define({
        // private
        alias: 'application',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {String} templateVersion 模版库版本号
         */
        
        /**
         * @cfg {String} templateUrl 模版更新URL
         */
        
        /**
         * @cfg {Boolean} useWebDatabase true启动Web SQL Database缓存，全局配置参数，影响model、store调用db接口
         */
        useWebDatabase: true,
        
        /**
         * @cfg {Number} databaseSize 数据库大小，默认50M
         */
        databaseSize: 50 * 1024 * 1024,
        
        /**
         * @cfg {String} databaseName 数据库名称，默认'matrix_data'
         */
        databaseName: 'matrix_database',
        
        /**
         * @cfg {String} databaseVersion 数据库版本，默认'1.0'
         */
        databaseVersion: '1.0',
        
        /**
         * @cfg {String} databaseDescription 数据库描述
         */
        databaseDescription: 'offline database',
        
        /**
         * @cfg {Number} databaseExpires 数据过期时间，单位ms，默认 3 * 24 * 60 * 60 * 1000，3天后过期
         */
        databaseExpires: 3 * 24 * 60 * 60 * 1000,
        
        /**
         * @cfg {String} startUpSelector 启动画面selector
         */
        startUpSelector: 'div#startUpView',
        
        /**
         * @cfg {Number} pageletCacheSize pagelet缓存大小，默认为30
         */
        pageletCacheSize: 30,
        
        // private
        init: function() {
            this.models = {};
            this.stores = {};
            this.pagelets = {};
            
            // pagelet缓存池
            this.pageletCaches = this.pageletCaches || [];
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event beforelaunch
                 */
                'beforelaunch',
                /**
                 * @event launch
                 */
                'launch',
                /**
                 * @event pagebeforechange
                 */
                'pagebeforechange',
                /**
                 * @event pagechange
                 */
                'pagechange',
                /**
                 * @event pageafterchange
                 */
                'pageafterchange',
                /**
                 * @event pagechangefailed
                 */
                'pagechangefailed'
            );
            
            // 监听hashchange，当hash发生改变时，切换Pagelet
            this.mon(window, 'hashchange', this.onHashChange);
        },
        
        /**
         * 运行WebApp
         * @param {Object} config
         */
        launch: function(config) {
            config = config || {};
            this.setConfig(config);
            
            var templates = LocalStorage.get('mx-app/templates'),
                lastTemplateVersion = LocalStorage.get('mx-app/template-version'),
                dt = $.now();
            if ((lastTemplateVersion != this.templateVersion || !templates) && this.templateUrl) {
                $.ajax({
                    url: this.templateUrl,
                    type: 'GET',
                    dataType: 'text',
                    context: this
                }).done(function(response) {
                    LocalStorage.set('mx-app/template-version', this.templateVersion);
                    LocalStorage.set('mx-app/templates', response);
                    this.createTemplateElement(response);
                    
                    if ($.now() - dt > 200) {
                        this._launch(config);
                    } else {
                        X.defer(this._launch, 200, this, [config]);
                    }
                }).fail(function() {
                    // TODO 加载模版失败
                });
            } else {
                this.createTemplateElement(templates);
                
                // iScroll加载需要延迟200毫秒，防止iScroll加载失败
                X.defer(this._launch, 200, this, [config]);
            }
        },
        
        // private
        _launch: function(config) {
            if (!this.isLaunched && this.beforeLaunch() !== false && this.fireEvent('beforelaunch', this) !== false) {
                this.isLaunched = true;
                
                this.startUpView = $(this.startUpSelector);
                if (this.startUpView.length == 0) {
                    this.startUpView = null;
                } else {
                    /*
                     * 初始化启动画面状态，jquery mobile changePage()会使用到
                     */
                    this.startUpView.page();
                    this.startUpView.css('min-height', window.innerHeight + 'px');
                }
            
                // 初始化jquery mobile配置
                // start ---------------------------------------------------
                $.extend($.mobile, {
                    firstPage: this.startUpView || $(''),
                    activePage: this.startUpView,
                    pageContainer: this.pageContainer
                });
                $window.trigger('pagecontainercreate');
                this.mon(this.pageContainer, {
                    'pagechange': this.onPageChange,
                    'pagechangefailed': this.onPageChangeFailed
                });
                // end -----------------------------------------------------
                
                this.initDatabase();
                
                this.addModel(config.models);
                this.addStore(config.stores);
                this.addPagelet(config.pagelets);
                
                this.onLaunch();
                this.fireEvent('launch', this);
                
                var hash = this.getHash(),
                    pagelet = this.matchPagelet(hash);
                if (pagelet) {
                    pagelet = this.createPagelet(pagelet, hash);
                    this.changePage(pagelet);
                } else {
                    this.go(this.welcome);
                }
            }
        },
        
        // private
        beforeLaunch: X.emptyFn,
        
        // private
        onLaunch: X.emptyFn,
        
        // private
        createTemplateElement: function(templates) {
            this.templateCt = $(document.createElement('div'));
            this.templateCt.attr('id', 'mx-app-templates').hide();
            this.templateCt.html(templates);
            $('body').append(this.templateCt);
        },
        
        // private
        setConfig: function(config) {
            config = $.extend({}, config);
            delete config.models;
            delete config.stores;
            delete config.pagelets;
            $.extend(this, config);
            
            this.pageContainer = $('body');
            
            if (this.useWebDatabase) {
                // 没有设置数据库名称，则禁用web sql database
                this.useWebDatabase = !!this.databaseName;
            }
            this.welcome = this.welcome || '';
        },
        
        // private
        initDatabase: function() {
            var me = this, isErr = false;
            if (me.useWebDatabase) {
                if (window.openDatabase) {
                    try {
                        me.db = window.openDatabase(me.databaseName, me.databaseVersion, me.databaseDescription, me.databaseSize, function(db) {
                            // ignore
                        });
                    } catch(e) {
                        // 在iOS下提示增加数据库容量时，如果选择“取消”，那么会抛异常“无权限访问数据库”
                        isErr = true;
                    }
                } else {
                    // web sql database not supported
                    isErr = true;
                }
                if (!me.db) {
                    // 创建database失败，无法访问浏览器database对象
                    isErr = true;
                } else {
                    me.db.transaction(function(t) {
                        // 创建系统表systables，保存表名称
                        t.executeSql('CREATE TABLE IF NOT EXISTS systables (table_name)', [], function(t, result) {
                            var lastClear = LocalStorage.get('mx-app/database-last-cleaned'),
                                isToday = false,
                                now = new Date(),
                                date,
                                expires;
                            if (lastClear) {
                                date = new Date();
                                date.setTime(lastClear);
                                isToday = now.getFullYear() == date.getFullYear() && now.getMonth() == date.getMonth() && now.getDate() == date.getDate();
                            }
                            if (X.isDefined(me.databaseExpires) && me.databaseExpires > 0 && !isToday) {
                                // 清理过期的数据
                                now = now.getTime();
                                expires = now - me.databaseExpires;
                                t.executeSql('SELECT table_name FROM systables', [], function(t, result) {
                                    var rows = result.rows,
                                        i, len,
                                        tableName;
                                    for (i = 0, len = rows.length; i < len; i++) {
                                        tableName = rows.item(i)['table_name'];
                                        t.executeSql('DELETE FROM ' + tableName + ' WHERE _last_updated < ?', [expires]);
                                    }
                                });
                                LocalStorage.set('mx-app/database-last-cleaned', now);
                            }
                        });
                        // 创建系统表syscolumns，保存每个表的字段名
                        t.executeSql('CREATE TABLE IF NOT EXISTS syscolumns (table_name, column_name)', []);
                    }, function(error) {
                        // 发生错误禁用database
                        isErr = true;
                    });
                }
                me.useWebDatabase = !isErr;
            }
        },
        
        // private
        addModel: function(models) {
            if (models) {
                if (X.isArray(models)) {
                    X.each(models, function(i, model) {
                        this.addModel(model);
                    }, this);
                    return;
                }
                
                var props = $.extend({}, models, { id: null }),
                    id = models.id;
                props.useWebDatabase = this.useWebDatabase ? props.useWebDatabase : false;
                props.db = this.db;
                this.models[id] = props;
            }
        },
        
        // private
        addStore: function(stores) {
            if (stores) {
                if (X.isArray(stores)) {
                    X.each(stores, function(i, store) {
                        this.addStore(store);
                    }, this);
                    return;
                }
                
                var props = $.extend({}, stores, { id: null }),
                    id = stores.id;
                props.useWebDatabase = this.useWebDatabase ? props.useWebDatabase : false;
                props.db = this.db;
                this.stores[id] = props;
            }
        },
        
        // private
        addPagelet: function(pagelets) {
            if (pagelets) {
                if (X.isArray(pagelets)) {
                    X.each(pagelets, function(i, pagelet) {
                        this.addPagelet(pagelet);
                    }, this);
                    return;
                }
                
                var props = $.extend({}, pagelets);
                
                /*
                 * For example, a route of "search/:query/p:page" will match a fragment of #/search/obama/p2,
                 * passing "obama" and "2" to the action. A route of "file/*path" will match #file/nested/folder/file.txt, 
                 * passing "nested/folder/file.txt" to the action.
                 */
                props.urlRe = new RegExp('^' + props.url.replace(escapeRe, '\\$&').replace(namedParamRe, '([^\/]+)').replace(splatParamRe, '(.*?)') + '$');
                
                this.pagelets[props.id] = props;
            }
        },
        
        // private
        getHash: function() {
            var match = location.href.match(matchHashRe);
            return match ? match[1].replace(hashStripperRe, '') : '';
        },
        
        // private
        // 使用hash匹配pagelet
        matchPagelet: function(hash) {
            var pagelet;
            X.each(this.pagelets, function(i, p) {
                if (p.urlRe && p.urlRe.test(hash)) {
                    pagelet = p;
                    return false;
                }
            });
            return pagelet;
        },
        
        /*
         * @private
         * 创建pagelet，系统维持一个pagelet缓冲池，缓冲池仅包含非单例的pagelet，
         * 单例pagelet始终存在，不包括在缓冲池中
         */
        createPagelet: function(config, hash) {
            var pagelet, p, i, len;
            
            config.hash = hash;
            
            if (config.singleton) {
                if (!config.instance) {
                    config.instance = new Pagelet(this.preparePageletConfig($.extend({}, config)));
                }
                pagelet = config.instance;
            } else if (config.noCache) {
                pagelet = new Pagelet(this.preparePageletConfig($.extend({}, config, { id: null })));
            } else {
                for (len = this.pageletCaches.length, i = len - 1; i >= 0; i--) {
                    p = this.pageletCaches[i];
                    if (p.isDestroyed || p.destroying) {
                        this.pageletCaches.splice(i, 1);
                        i--;
                        continue;
                    } else if (p.hash == hash) {
                        this.pageletCaches.splice(i, 1);
                        pagelet = p;
                        break;
                    }
                }
                if (!pagelet) {
                    pagelet = new Pagelet(this.preparePageletConfig($.extend({}, config, { id: null })));
                }
                this.pageletCaches.push(pagelet);
                len = this.pageletCaches.length;
                if (len > this.pageletCacheSize && len > 3) {
                    /*
                     * pagelet缓存池最大数量不超过pageletCacheSize，超出长度的pagelet进行销毁
                     */
                    for (i = 0; i < len; i++) {
                        p = this.pageletCacheSize[i];
                        if (pagelet != p) {
                            this.pageletCaches.splice(i, 1);
                            p.destroy();
                            break;
                        }
                    }
                }
            }
            
            return pagelet;
        },
        
        // private
        preparePageletConfig: function(config) {
            var models, model,
                stores, store;
            if (config.models) {
                models = config.models;
                config.models = {};
                X.each(X.toArray(models), function(i, id) {
                    model = this.models[id];
                    config.models[id] = X.create(model.cls || 'model', $.extend({}, model));
                }, this);
            }
            if (config.stores) {
                stores = config.stores;
                config.stores = {};
                X.each(X.toArray(stores), function(i, id) {
                    store = this.stores[id];
                    config.stores[id] = X.create(store.cls || 'store', $.extend({}, store));
                }, this);
            }
            return config;
        },
        
        // private
        getPagelet: function(hash) {
            var p, i, len;
            for (len = this.pageletCaches.length, i = len - 1; i >= 0; i--) {
                p = this.pageletCaches[i];
                if (p.isDestroyed || p.destroying) {
                    this.pageletCaches.splice(i, 1);
                    i--;
                    continue;
                } else if (p.hash == hash) {
                    return p;
                }
            }
            return null;
        },
        
        // private
        existPagelet: function(hash) {
            return !!this.getPagelet(hash);
        },
        
        /**
         * 转向到hash
         * @param {String} hash
         */
        go: function(hash) {
            window.location.hash = '#/' + hash;
        },
        
        /**
         * 回退
         * @param {String} (optional) defaultHash 当访问路径历史没有上一页时，默认跳转hash
         */
        back: function(defaultHash) {
            $.mobile.back();
        },
        
        // private
        onHashChange: function() {
            var hash = this.getHash(),
                pagelet = this.matchPagelet(hash);
            if (pagelet) {
                pagelet = this.createPagelet(pagelet, hash);
                this.changePage(pagelet);
            }
        },
        
        // private
        changePage: function(pagelet) {
            if (this.fireEvent('beforepagechange', this, pagelet) !== false) {
                var lp = this.lastPagelet,
                    np = this.nextPagelet = pagelet;
                
                np.render(this.pageContainer);
                np.el.css('min-height', window.innerHeight + 'px');
                
                $.mobile.changePage(np.el, {
                    transition: this.startUpView ? 'fade' : np.transition,
                    fromHashChange: true
                });
            }
        },
        
        // private
        onPageChange: function() {
            this.fireEvent('pagechange', this, this.nextPagelet, this.lastPagelet);
            this.afterChangePage();
        },
        
        // private
        onPageChangeFailed: function() {
            this.fireEvent('pagechangefailed', this, this.nextPagelet, this.lastPagelet);
        },
        
        // private
        afterChangePage: function() {
            if (this.startUpView) {
                this.startUpView.remove();
                this.startUpView = null;
            }
            
            this.lastPagelet = this.nextPagelet;
            this.nextPagelet = null;
            this.fireEvent('pageafterchange', this, this.lastPagelet);
        },
        
        // private
        onDestroy: function() {
            X.each(this.pageletCaches, function(i, pagelet) {
                pagelet.destroy();
            }, this);
            this.pageletCaches = null;
            this.pageContainer = null;
        }
    });
    
    /**
     * @class MX.App
     * @singleton
     * 
     * Application类的单例对象。在大多数应用场景中，不需要单独对Application实例化，直接使用X.App单例对象既可。
     */
    X.App = new X.app.Application();
});

// 初始化jquery mobile配置
if ($ && $.mobile) {
    $('html').addClass( "ui-mobile" );
    
    window.scrollTo( 0, 1 );
    
    $.extend($.mobile, {
        autoInitializePage: false,
        pushStateEnabled: false,
        hashListeningEnabled: false,
        
        // if defaultHomeScroll hasn't been set yet, see if scrollTop is 1
        // it should be 1 in most browsers, but android treats 1 as 0 (for hiding addr bar)
        // so if it's 1, use 0 from now on
        defaultHomeScroll: ( !$.support.scrollTop || $(window).scrollTop() === 1 ) ? 0 : 1
    });
}