# Node.js module for POST / GET http requests

## Installation
```sh
npm install fd-http-request --save
```

## Usage Example | method GET (VK.com API)
```js
var httpRequest = require('fd-http-request');

// Get request
httpRequest.get('https://api.vk.com/method/users.get', function(res){
    console.log( res );
    /* RESPONSE:
        {
            status: 200,
            data: '{"response":[{"uid":205387401,"first_name":"Tom","last_name":"Cruise","city":5331,"photo_50":"http:\/\/cs402330.vk.me\/v402330401\/9760\/pV6sZ5wRGxE.jpg","verified":0}]}',
            headers: {
                server: 'Apache',
                date: 'Sat, 12 Sep 2015 02:13:31 GMT',
                'content-type': 'application/json; charset=utf-8',
                'content-length': 169,
                connection: 'close',
                'x-powered-by': 'PHP/3.17046',
                'set-cookie':[
                    'remixlang=0; expires=Sun, 18 Sep 2016 03:04:05 GMT; path=/; domain=.vk.com'
                ],
                pragma: 'no-cache',
                'cache-control': 'no-store'
            },
            cookies: [
                {
                    remixlang: 0,
                    expires: 'Sun, 18 Sep 2016 03:04:05 GMT',
                    path: '/',
                    domain: '.vk.com'
                }
            ],
            parsedCookies: {
                remixlang: 0
            },
            charset: 'utf-8'
        }
    */
}, {
    charset: 'utf-8',
    protocol: 'https',
    data: {
        user_ids: 205387401,
        fields: 'photo_50,city,verified',
        version: 5.37
    }
});
```

## Usage Example | Request class (VK.com API)
```js
var Request = require('fd-http-request').Request;
var request = new Request({
    saveCookies: true,
    headers: {
        'x-message': 'hi, mom!'
    }
});

request.get('https://api.vk.com/method/users.get', function( res ) {
    console.log( res );
    /* RESPONSE:
        {
            status: 200,
            ...
        }
    */
    
    console.log( request.cookie() );
    /* SAVED COOKIES:
        {
            remixlang: '0',
            ...
            domain: '.vk.com'
        }
    */
    
    console.log( request.header({
        'x-studio': 'FlatDev'
    }) );
    /* PERMANENT HEADERS:
        {
            'x-message': 'hi, mom!',
            'x-studio': 'FlatDev'
        }
    */
    
    console.log( request.header({
        'x-message': 'hi, son!'
    }) );
    /* PERMANENT HEADERS:
        {
            'x-message': 'hi, son!',
            'x-studio': 'FlatDev'
        }
    */
    
    console.log( request.clearHeader('x-message') );
    /* PERMANENT HEADERS:
        {
            'x-studio': 'FlatDev'
        }
    */
}, {
    data: {
        user_ids: 205387401,
        fields: 'photo_50,city,verified',
        version: 5.37
    }
});
```

------------------------------------

## Methods
### get(url, callback, opts)
**Makes a GET request**
* `string` url - the requested address
* `callback` callback - **function(res)** callback function after a request
    * `object` res - response from server
        * `integer` status - response status
        * `string` data - response text from server
        * `object` headers - response headers
        * `array` cookies - response cookies
        * `object` parsedCookies - parsed response cookies. Valid for the request
        * `string` charset - response charset
* `object` opts - request options **[optional]**
    * `object` data - GET data. _default: `null`_ . _example: `{user_ids: 205387401}`_
    * `object` headers - request headers. _default: `null`_ . _example: `{'User-Agent': 'Mozilla/5.0'}`_
    * `object` cookies - request cookies. _default: `null`_ . _example: `{foo: 'bar'}`_
    * `string` charset - response encoding. _default: `autodetect from the header`_ . _example: `'cp1251'`_
    * `string` protocol - request protocol . _default: `autodetect from the protocol`_ . [ _`'http'` or `'https'`_ ]

------------------------------------

### post(url, callback, opts)
**Makes a POST request**
* `string` url - the requested address
* `callback` callback - **function(res)** callback function after a request
    * `object` res - response from server
        * `integer` status - response status
        * `string` data - response text from server
        * `object` headers - response headers
        * `object` parsedCookies - parsed response cookies. Valid for the request
        * `array` cookies - response cookies
        * `string` charset - response charset
* `object` opts - request options **[optional]**
    * `object` data - POST data. _default: `null`_ . _example: `{user_ids: 205387401}`_
    * `object` headers - request headers. _default: `null`_ . _example: `{'User-Agent': 'Mozilla/5.0'}`_
    * `object` cookies - request cookies. _default: `null`_ . _example: `{foo: 'bar'}`_
    * `string` charset - response encoding. _default: `autodetect from the header`_ . _example: `'cp1251'`_
    * `string` protocol - request protocol . _default: `autodetect from the protocol`_ . [ _`'http'` or `'https'`_ ]

------------------------------------

## Classes
### Request(opts)
* `object` opts - class options
    * `boolean` saveCookies - whether to save response cookies. _default: `true`_
    * `object` headers - permanent headers. _default: `null`_ . _example: `{'User-Agent': 'Mozilla/5.0'}`_

#### Request# get(url, callback, opts)
Full copy of the [ `get` ]( #get-url-callback-opts ) method. If set `opts.saveCookies` merge and save `opts.cookies` and merge `opts.headers`, if they set.

#### Request# post(url, callback, opts)
Full copy of the [ `post` ]( #post-url-callback-opts ) method. If set `opts.saveCookies` merge and save `opts.cookies` and merge `opts.headers`, if they set.

#### Request# header()
**Returns current permanent headers**
* return `object` - permanent headers

#### Request# header( headers )
**Updates permanent headers**
* `object` headers - add new or change current permanent headers. _example: `{'User-Agent': 'Mozilla/5.0'}`_
* return `object` - current permanent headers

#### Request# clearHeader()
**Removes all permanent headers**
* return `object` - current permanent headers

#### Request# clearHeader( name )
**Removes permanent header**
* `string` name - the name of removed header. _example: `'User-Agent'`_
* return `object` - current permanent headers

#### Request# cookie()
**Returns saved cookies**
* return `object` - saved cookies

#### Request# cookie( cookies )
**Updates saved cookies**
* `object` cookies - add new or change saved cookies. _example: `{foo: 'bar'}`_
* return `object` - current saved cookies

#### Request# cookie( cookies, convert )
**Make valid input cookies and updates saved cookies**
* `object` cookies - add new or change saved cookies. _example: `{foo: 'bar'}`_
* `boolean` convert - whether to convert cookies. if cookies look like `[{foo: 'bar'}, {doo: 'gar'}]` set it to `false`, if look like `{foo: 'bar', doo: 'gar'}` set it to `true`. _default: `true`_ 
* return `object` - current saved cookies

#### Request# clearCookie()
**Removes all saved cookies**
* return `object` - current saved cookies

#### Request# clearCookie( name )
**Removes saved cookie**
* `string` name - the name of removed cookie. _example: `'foo'`_
* return `object` - current saved cookies

------------------------------------

## Changelog
### 1.1.2 [ Unstable ]
* `Change` - fixed stylistic errors that could lead to errors
* `Bugfix` - second argument `convert` Request# cookie(). If it set, make valid first argument cookies for request style

### 1.1.1 [ Unstable ]
* `Add` - second argument `convert` Request# cookie(). If it set, make valid first argument cookies for request style

### 1.1.0 [ Unstable ]
* `Add` - response parsed cookies `res.parsedCookies` to the callback. It is valid сookies for the request in `opts.cookies`
* `Add` - method [ `Request` ](#Request) returns class **Request(opts)** . It intelligent class based on `post` and `get` methods. It can _set permanent headers_, _save response cookies_, _get current cookies and headers_ and more.

### 0.5.0 [ `Stable` ]
* `Add` - dependence on the [iconv-lite](https://www.npmjs.com/package/iconv-lite)
* `Add` - autodetect body charset from header `content-type` and convert it
* `Add` - response charset argument `res.charset` to the callback
* `Change` - rename `opts.encode` to `opts.charset`

### 0.4.0 [ Unstable ]
* `Add` - dependence on the [cookie](https://www.npmjs.com/package/cookie)
* `Add` - custom cookie `opts.cookies`
* `Change` - callback function. Now it called with `object` res argument

### 0.3.0 [ Unstable ]
* `Add` - dependence on the [object-merge](https://www.npmjs.com/package/object-merge)
* `Add` - custom headers `opts.headers`
* `Change` - moved 2-nd `data` argument to `opts.data`
* `Other` - make code less

### 0.2.0 [ Unstable ]
* `Add` - autodetect protocol `http` or `https`
* `Change` - 4-th argument from the `string` _encode_ to the `object` _opts_