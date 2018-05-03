var http = require('http');
var https = require('https');
var url = require('url');
var querystring = require('querystring');

var iconv = require('iconv-lite');
var objectMerge = require('object-merge');
var cookieParser = require('cookie');

var request = (function() {
    // Класс запроса
    var Request = (function() {
        /**
         * Класс для работы с запросами
         * @class Request
         * @param {object} opts                 - параметры конструктора
         * @param {boolean} opts.saveCookies    - хранить ли Cookie
         * @param {object} opts.headers         - постоянные заголовки запроса
         */
        function Request(opts) {
            this.cookies        = null;
            this.headers        = opts.headers      != undefined ? opts.headers     : null;
            this.saveCookies    = opts.saveCookies  != undefined ? opts.saveCookies : true;
        }

        /**
         * Аналог запроса
         * @memberOf Request
         * @method _request
         * @see  {function} _request
         */
        Request.prototype._request = function(method, siteurl, callback, opts) {
            var self = this;
            opts = opts || {};
            opts.cookies = opts.cookies != undefined ? opts.cookies : null;
            opts.headers = opts.headers != undefined ? opts.headers : null;

            if( opts.cookies ){
                self.cookies = mergeResCookie( self.cookies, toResCookie( opts.cookies ) );
            }

            // Headers
            if(self.headers) {
                if(opts.headers)
                    opts.headers = objectMerge(self.headers, opts.headers);
                else
                    opts.headers = self.headers;
            }

            // Cookie
            // Если это не первое соединение
            if(self.saveCookies && self.cookies){
                var parsedUrl = url.parse( siteurl );
                var host = parsedUrl.host;
                var path = parsedUrl.pathname;

                var reqCookies = {};
                for (var i in self.cookies){
                    var cookie = self.cookies[i];
                    var cookieHost      = cookie.domain    != undefined ? cookie.domain  : undefined;
                    var cookiePath      = cookie.path      != undefined ? cookie.path    : undefined;
                    var cookieExpires   = cookie.expires   != undefined ? cookie.expires : undefined;

                    var isValidHost = false;

                    // Добавление www.
                    if(cookieHost){
                        var reg = /^(?:.*?\/\/)?(?:www)?(?:\.)?(.*?)$/;

                        var siteMatches = host.match( reg );
                        var cookMatches = cookieHost.match( reg );;
                        if(siteMatches && cookMatches && siteMatches[1] == cookMatches[1])
                            isValidHost = true;
                    }

                    if(cookieExpires)
                        var cookieExpiresTimestamp = new Date( cookieExpires ).getTime();
                    else
                        var cookieExpiresTimestamp = undefined;

                    var key = Object.keys( cookie )[0];
                    var val = cookie[key];

                    // Проверка домена
                    if(!cookieHost || isValidHost){
                        // Проверка пути
                        var reg = new RegExp('^'+cookiePath, 'i');
                        var matches = path.match(reg);

                        if(!cookiePath || matches && matches[0]) {
                            // Проверка срока годности
                            if(!cookieExpiresTimestamp || cookieExpiresTimestamp > new Date().getTime()) {
                                reqCookies[key] = val;
                            }
                        }
                    }
                }

                if(opts.cookies)
                    opts.cookies = objectMerge(reqCookies, opts.cookies);
                else
                    opts.cookies = reqCookies;
            }

            _request(method, siteurl, function( res ) {
                if( self.saveCookies ){
                    if(self.cookies)
                        self.cookies = mergeResCookie( self.cookies, res.cookies );
                    else if( res.cookies )
                        self.cookies = res.cookies;
                }

                callback(res);
            }, opts );
        };

        /**
         * Аналог Post
         * @memberOf Request
         * @method post
         * @see  {function} _request
         */
        Request.prototype.post = function(siteurl, callback, opts) {
            this._request('post', siteurl, callback, opts);
        }

        /**
         * Аналог Get
         * @memberOf Request
         * @method get
         * @see  {function} _request
         */
        Request.prototype.get = function(siteurl, callback, opts) {
            this._request('get', siteurl, callback, opts);
        }

        /**
         * Получение и установка header
         * @memberOf Request
         * @method header
         * @param {Object|Null} first    - Устанавливаемые header 
         * @return {Object}              - Текущие header
         */
        Request.prototype.header = function() {
            var self = this;

            switch(arguments.length){
                // Set
                case 1:
                    var headers = arguments[0];
                    if(self.headers)
                        self.headers = objectMerge( self.headers, headers );
                    else
                        self.headers = headers;
                    return self.headers;
                    break;

                // Get
                case 0:
                default:
                    return self.headers;
                    break;
            }
        }

        /**
         * Отчестка header'ов. В случае, если аргумент не установлен удалятся все header.
         * @memberOf Request
         * @param {String} first        - Имя удаляемой Header
         * @return {Object|Null}        - Успешное ли удаление
         */
        Request.prototype.clearHeader = function() {
            var self = this;

            switch(arguments.length){
                // One
                case 1:
                    var name = arguments[0];
                    return removeHeader( self.headers, name );
                    break;

                // All
                case 0:
                default:
                    return self.headers = null;
                    break;
            }
        }

        /**
         * Получение и установка cookie
         * @memberOf Request
         * @method cookie
         * @param {Array|Null} first    - Устанавливаемые cookie 
         * @param {Boolean|Null} second - Конвертировать ли cookie
         * @return {Array}              - Текущие cookie
         */
        Request.prototype.cookie = function() {
            var self = this;

            switch(arguments.length){
                // Set
                case 2:
                case 1:
                    var cookies = arguments[0] != undefined ? arguments[0] : null;
                    var convert = arguments[1] != undefined ? arguments[1] : true;

                    if ( convert ){
                        cookies = toResCookie( cookies );
                    }

                    if(self.cookies)
                        self.cookies = mergeResCookie( self.cookies, cookies );
                    else
                        self.cookies = cookies;

                    return self.cookies;
                    break;

                // Get
                case 0:
                default:
                    return self.cookies;
                    break;
            }
        }

        /**
         * Отчестка cookie. В случае, если аргумент не установлен удалятся все cookie.
         * @memberOf Request
         * @param {String} first        - Имя удаляемой Cookie
         * @return {Array|Null}         - Успешное ли удаление
         */
        Request.prototype.clearCookie = function() {
            var self = this;

            switch(arguments.length){
                // One
                case 1:
                    var name = arguments[0];
                    return removeResCookie( self.cookies, name );
                    break;

                // All
                case 0:
                default:
                    return self.cookies = null;
                    break;
            }
        }

        return Request;
    })();

    // Удаление header
    function removeHeader( headers, name ) {
        if(headers[ name ]){
            delete headers[ name ];
        }

        return headers;
    }

    // Перевод cookie в вид ответа
    function toReqCookie(cookies) {
        var reqCookies = {};
        for (var i in cookies){
            var key = Object.keys(cookies[i])[0];
            var val = cookies[i][key];
            reqCookies[key] = val;
        }

        return reqCookies;
    }

    // Перевод cookie в вид запроса
    function toResCookie(cookies) {
        var resCookies = [];
        for (var key in cookies){
            var val = cookies[key];

            var obj = {};
            obj[ key ] = val;

            resCookies.push(obj);
        }

        return resCookies;
    }

    // Удаление cookie
    function removeResCookie( cookies, name ) {
        for (var i in cookies) {
            var cookie = cookies[ i ];
            var key = Object.keys(cookie)[0];

            if(key == name){
                cookies.splice(i, 1);

                return cookies;
                break;
            }
        };

        return cookies;
    }

    // Объединение cookie запроса
    function mergeResCookie() {
        // arguments
        var resCookies = [];

        // Обход аргументов
        for (var i in arguments){
            var cookie = arguments[i];
            if(cookie instanceof Object){

                // Обход кук
                for (var x in cookie) {
                    var cook = cookie[x];
                    var key = Object.keys(cook)[0];
                    var val = cook[key];

                    var found = false;

                    // Поиск уже имеющихся cookie
                    for (var resI in resCookies) {
                        var resCookie = resCookies[ resI ];

                        var resKey = Object.keys(resCookie)[0];
                        var resVal = resCookie[resKey];

                        if(resKey == key){
                            found = true;

                            resCookies.splice(resI, 1);
                            resCookies.push( cook );

                            break;
                        }
                    };

                    if(!found)
                        resCookies.push( cook );
                };
            }
        }

        return resCookies;
    }

    // Общий запрос
    function _request(method, siteurl, callback, opts){
        // Default
        opts            = opts          || {};
        opts.data       = opts.data     != undefined ? opts.data    : null;
        opts.headers    = opts.headers  != undefined ? opts.headers : null;
        opts.cookies    = opts.cookies  != undefined ? opts.cookies : null;
        opts.charset    = opts.charset  != undefined ? opts.charset : null;

        var queryData = querystring.stringify( opts.data );
        var parsedUrl = url.parse( siteurl );

        var host = parsedUrl.host;
        var path = parsedUrl.pathname;

        if(method == 'get'){
            if(opts.data) {
                path += "?" + queryData;
            }
        }

        var options = {
            hostname: host,
            path: path,
            method: method.toUpperCase(),
            encoding: 'binary'
        };

        // Добавление заголовков POST
        if( method == 'get' ){
        } else {
            options = objectMerge(options, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': queryData.length
                }
            });
        }

        // Merge заголовков с запросом
        if( opts.headers ){
            options = objectMerge(options, {
                headers: opts.headers
            });
        }

        // Cookie заголовков с запросом
        if( opts.cookies ){
            var cookies = '';
            var step = 0;
            for( key in opts.cookies ){
                if(step > 0)
                    cookies += '; '
                var val = opts.cookies[ key ];

                // cookies += cookieParser.serialize( key, decodeURIComponent(val) ); //TODO: не всегда cookie поступают в encode виде
                cookies += key+'='+val;
                step++;
            }

            options = objectMerge(options, {
                headers: { 
                    'Cookie': cookies
                }
            });
        }

        // Установка протокола
        if( (parsedUrl.protocol == 'https:' && !opts.protocol) || opts.protocol == 'https'){
            options.port = 443;
            var _http = https;
        } else {
            options.port = 80;
            var _http = http;
        }

        var req = _http.request(options, function(res) {
            var data = '';
            var status = res.statusCode;
            var headers = res.headers;
            var cookies = [];
            var parsedCookies = [];

            for( var key in res.headers['set-cookie'] ){
                var cookie = cookieParser.parse( res.headers['set-cookie'][ key ] );
                cookies.push(cookie);
            }

            parsedCookies = toReqCookie( cookies );

            res.setEncoding( 'binary' );
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                // Проверка кодировки
                var charset = opts.charset;
                var contentType = headers['content-type'];
                if(contentType && !charset){
                    var reg = /charset=([a-zA-Z0-9\-]+)(?:;|$|\ )/;
                    var mathes = contentType.match(reg);
                    if(mathes)
                        charset = mathes[1];
                }

                data = new Buffer(data, 'binary');
                if(charset)
                    data = iconv.decode(data, charset).toString();
                else
                    data = data.toString();

                callback({
                    status: status,
                    data: data, 
                    headers: headers,
                    cookies: cookies,
                    parsedCookies: parsedCookies,
                    charset: charset
                });
            });
        });

        // Отправка POST даты
        if( method == 'get' ){
        } else {
            req.write(queryData);
        }
        req.end();
    }

    /**
     * Post запрос
     * @param  {String}   siteurl           - Адрес запроса
     * @param  {Function} callback          - Callback функция
     * @param  {Object}   opts              - Опции
     * @param  {Object}   opts.data         - POST параметры
     * @param  {Object}   opts.headers      - Заголовки
     * @param  {Object}   opts.cookies      - Cookies
     * @param  {String}   opts.charset      - Кодировка ответа
     * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
     */
    function post(siteurl, callback, opts) {
        _request('post', siteurl, callback, opts);
    }

    /**
     * Get запрос
     * @param  {String}   siteurl           - Адрес запроса
     * @param  {Function} callback          - Callback функция
     * @param  {Object}   opts              - Опции
     * @param  {Object}   opts.data         - GET параметры
     * @param  {Object}   opts.headers      - Заголовки
     * @param  {Object}   opts.cookies      - Cookies
     * @param  {String}   opts.charset      - Кодировка ответа
     * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
     */
    function get(siteurl, callback, opts) {
        _request('get', siteurl, callback, opts);
    }

    return {
        post: post,
        get: get,
        Request: Request
    }
})();

module.exports = request;