(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.directoryOpen = directoryOpen;

var $$1 = _interopRequireDefault(require("./legacy/directory-open.mjs"));

var $$0 = _interopRequireDefault(require("./fs-access/directory-open.mjs"));

var _supported = _interopRequireDefault(require("./supported.mjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
const o = _supported.default ? Promise.resolve($$0) : Promise.resolve($$1);

async function directoryOpen(...r) {
  return (await o).default(...r);
}

},{"./fs-access/directory-open.mjs":5,"./legacy/directory-open.mjs":9,"./supported.mjs":12}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fileOpen = fileOpen;

var $$5 = _interopRequireDefault(require("./legacy/file-open.mjs"));

var $$4 = _interopRequireDefault(require("./fs-access/file-open.mjs"));

var _supported = _interopRequireDefault(require("./supported.mjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
const o = _supported.default ? Promise.resolve($$4) : Promise.resolve($$5);

async function fileOpen(...e) {
  return (await o).default(...e);
}

},{"./fs-access/file-open.mjs":6,"./legacy/file-open.mjs":10,"./supported.mjs":12}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fileSave = fileSave;

var $$3 = _interopRequireDefault(require("./legacy/file-save.mjs"));

var $$2 = _interopRequireDefault(require("./fs-access/file-save.mjs"));

var _supported = _interopRequireDefault(require("./supported.mjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
const s = _supported.default ? Promise.resolve($$2) : Promise.resolve($$3);

async function fileSave(...e) {
  return (await s).default(...e);
}

},{"./fs-access/file-save.mjs":7,"./legacy/file-save.mjs":11,"./supported.mjs":12}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
const e = async (t, r, a = t.name) => {
  const i = [],
        n = [];

  for await (const s of t.values()) {
    const o = `${a}/${s.name}`;
    "file" === s.kind ? n.push(s.getFile().then(e => (e.directoryHandle = t, Object.defineProperty(e, "webkitRelativePath", {
      configurable: !0,
      enumerable: !0,
      get: () => o
    })))) : "directory" === s.kind && r && i.push(e(s, r, o));
  }

  return [...(await Promise.all(i)).flat(), ...(await Promise.all(n))];
};

var _default = async (t = {}) => {
  t.recursive = t.recursive || !1;
  const r = await window.showDirectoryPicker({
    id: t.id,
    startIn: t.startIn
  });
  return e(r, t.recursive);
};

exports.default = _default;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
const e = async e => {
  const t = await e.getFile();
  return t.handle = e, t;
};

var _default = async (t = [{}]) => {
  Array.isArray(t) || (t = [t]);
  const i = [];
  t.forEach((e, t) => {
    i[t] = {
      description: e.description || "",
      accept: {}
    }, e.mimeTypes ? e.mimeTypes.map(c => {
      i[t].accept[c] = e.extensions || [];
    }) : i[t].accept["*/*"] = e.extensions || [];
  });
  const c = await window.showOpenFilePicker({
    id: t[0].id,
    startIn: t[0].startIn,
    types: i,
    multiple: t[0].multiple || !1,
    excludeAcceptAllOption: t[0].excludeAcceptAllOption || !1
  }),
        a = await Promise.all(c.map(e));
  return t[0].multiple ? a : a[0];
};

exports.default = _default;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
var _default = async (e, t = [{}], i = null, a = !1) => {
  Array.isArray(t) || (t = [t]), t[0].fileName = t[0].fileName || "Untitled";
  const c = [];
  if (t.forEach((t, i) => {
    c[i] = {
      description: t.description || "",
      accept: {}
    }, t.mimeTypes ? (0 === i && t.mimeTypes.push(e.type), t.mimeTypes.map(e => {
      c[i].accept[e] = t.extensions || [];
    })) : c[i].accept[e.type] = t.extensions || [];
  }), i) try {
    await i.getFile();
  } catch (e) {
    if (i = null, a) throw e;
  }
  const s = i || (await window.showSaveFilePicker({
    suggestedName: t[0].fileName,
    id: t[0].id,
    startIn: t[0].startIn,
    types: c,
    excludeAcceptAllOption: t[0].excludeAcceptAllOption || !1
  })),
        l = await s.createWritable();
  return await l.write(e), await l.close(), s;
};

exports.default = _default;

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "fileOpen", {
  enumerable: true,
  get: function () {
    return _fileOpen.fileOpen;
  }
});
Object.defineProperty(exports, "directoryOpen", {
  enumerable: true,
  get: function () {
    return _directoryOpen.directoryOpen;
  }
});
Object.defineProperty(exports, "fileSave", {
  enumerable: true,
  get: function () {
    return _fileSave.fileSave;
  }
});
Object.defineProperty(exports, "supported", {
  enumerable: true,
  get: function () {
    return _supported.default;
  }
});

var _fileOpen = require("./file-open.mjs");

var _directoryOpen = require("./directory-open.mjs");

var _fileSave = require("./file-save.mjs");

var _supported = _interopRequireDefault(require("./supported.mjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./directory-open.mjs":2,"./file-open.mjs":3,"./file-save.mjs":4,"./supported.mjs":12}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
var _default = async (e = [{}]) => (Array.isArray(e) || (e = [e]), e[0].recursive = e[0].recursive || !1, new Promise((t, r) => {
  const i = document.createElement("input");
  let n;
  i.type = "file", i.webkitdirectory = !0;

  const c = () => n(r);

  e[0].setupLegacyCleanupAndRejection && (n = e[0].setupLegacyCleanupAndRejection(c)), i.addEventListener("change", () => {
    "function" == typeof n && n();
    let r = Array.from(i.files);
    e[0].recursive || (r = r.filter(e => 2 === e.webkitRelativePath.split("/").length)), t(r);
  }), i.click();
}));

exports.default = _default;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
var _default = async (e = [{}]) => (Array.isArray(e) || (e = [e]), new Promise((n, t) => {
  const i = document.createElement("input");
  i.type = "file";
  const c = [...e.map(e => e.mimeTypes || []).join(), e.map(e => e.extensions || []).join()].join();
  let a;
  i.multiple = e[0].multiple || !1, i.accept = c || "";

  const l = () => a(t);

  e[0].setupLegacyCleanupAndRejection && (a = e[0].setupLegacyCleanupAndRejection(l)), i.addEventListener("change", () => {
    "function" == typeof a && a(), n(i.multiple ? Array.from(i.files) : i.files[0]);
  }), i.click();
}));

exports.default = _default;

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
var _default = async (e, t = {}) => {
  Array.isArray(t) && (t = t[0]);
  const c = document.createElement("a");
  let n;
  c.download = t.fileName || "Untitled", c.href = URL.createObjectURL(e);

  const a = () => n(reject);

  t.setupLegacyCleanupAndRejection && (n = t.setupLegacyCleanupAndRejection(a)), c.addEventListener("click", () => {
    "function" == typeof n && n(), setTimeout(() => URL.revokeObjectURL(c.href), 3e4);
  }), c.click();
};

exports.default = _default;

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
const e = (() => {
  if ("undefined" == typeof self) return !1;
  if ("top" in self && self !== top) try {
    top.location;
  } catch {
    return !1;
  } else if ("showOpenFilePicker" in self) return "showOpenFilePicker";
  return !1;
})();

var _default = e;
exports.default = _default;

},{}],13:[function(require,module,exports){

},{}],14:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":14,"ieee754":16}],15:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}],16:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],17:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],18:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],19:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":20}],20:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],21:[function(require,module,exports){

/* global ReadableStream */

module.exports = nodeToWeb
module.exports.WEBSTREAM_SUPPORT = typeof ReadableStream !== 'undefined'

function nodeToWeb (nodeStream) {
  // Assumes the nodeStream has not ended/closed
  if (!module.exports.WEBSTREAM_SUPPORT) throw new Error('No web ReadableStream support')

  var destroyed = false
  var listeners = {}

  function start (controller) {
    listeners['data'] = onData
    listeners['end'] = onData
    listeners['end'] = onDestroy
    listeners['close'] = onDestroy
    listeners['error'] = onDestroy
    for (var name in listeners) nodeStream.on(name, listeners[name])

    nodeStream.pause()

    function onData (chunk) {
      if (destroyed) return
      controller.enqueue(chunk)
      nodeStream.pause()
    }

    function onDestroy (err) {
      if (destroyed) return
      destroyed = true

      for (var name in listeners) nodeStream.removeListener(name, listeners[name])

      if (err) controller.error(err)
      else controller.close()
    }
  }

  function pull () {
    if (destroyed) return
    nodeStream.resume()
  }

  function cancel () {
    destroyed = true

    for (var name in listeners) nodeStream.removeListener(name, listeners[name])

    nodeStream.push(null)
    nodeStream.pause()
    if (nodeStream.destroy) nodeStream.destroy()
    else if (nodeStream.close) nodeStream.close()
  }

  return new ReadableStream({start: start, pull: pull, cancel: cancel})
}

},{}],22:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;

},{}],23:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.
'use strict';
/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  }

  return keys;
};
/*</replacement>*/


module.exports = Duplex;

var Readable = require('./_stream_readable');

var Writable = require('./_stream_writable');

require('inherits')(Duplex, Readable);

{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);

  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;

  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;

    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
}); // the no-half-open enforcer

function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return; // no more data can be written.
  // But allow more writes to happen in this tick.

  process.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }

    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});
}).call(this)}).call(this,require('_process'))
},{"./_stream_readable":25,"./_stream_writable":27,"_process":20,"inherits":17}],24:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.
'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

require('inherits')(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":26,"inherits":17}],25:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';

module.exports = Readable;
/*<replacement>*/

var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;
/*<replacement>*/

var EE = require('events').EventEmitter;

var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/


var Stream = require('./internal/streams/stream');
/*</replacement>*/


var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*<replacement>*/


var debugUtil = require('util');

var debug;

if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/


var BufferList = require('./internal/streams/buffer_list');

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT; // Lazy loaded to improve the startup performance.


var StringDecoder;
var createReadableStreamAsyncIterator;
var from;

require('inherits')(Readable, Stream);

var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.

  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"

  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex); // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()

  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false; // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.

  this.sync = true; // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.

  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'end' (and potentially 'finish')

  this.autoDestroy = !!options.autoDestroy; // has it been destroyed

  this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // the number of writers that are awaiting a drain event in .pipe()s

  this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;

  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');
  if (!(this instanceof Readable)) return new Readable(options); // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex); // legacy

  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }

    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;

Readable.prototype._destroy = function (err, cb) {
  cb(err);
}; // Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.


Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;

      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }

      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
}; // Unshift should *always* be something directly out of read()


Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;

  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);

    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;

        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  } // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.


  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }

  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;

  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }

  return er;
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
}; // backwards compatibility.


Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder; // If setEncoding(null), decoder.encoding equals utf8

  this._readableState.encoding = this._readableState.decoder.encoding; // Iterate over current buffer to convert already stored Buffers:

  var p = this._readableState.buffer.head;
  var content = '';

  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }

  this._readableState.buffer.clear();

  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
}; // Don't raise the hwm > 1GB


var MAX_HWM = 0x40000000;

function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }

  return n;
} // This function is designed to be inlinable, so please take care when making
// changes to the function body.


function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;

  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  } // If we're asking for more than the current hwm, then raise the hwm.


  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n; // Don't have enough

  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }

  return state.length;
} // you can override either this method, or the async _read(n) below.


Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.

  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state); // if we've ended, and we're now clear, then finish it up.

  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  } // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.
  // if we need a readable event, then we need to do some reading.


  var doRead = state.needReadable;
  debug('need readable', doRead); // if we currently have less than the highWaterMark, then also read some

  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  } // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.


  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true; // if the length is currently zero, then we *need* a readable event.

    if (state.length === 0) state.needReadable = true; // call internal read method

    this._read(state.highWaterMark);

    state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.

    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);
  return ret;
};

function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;

  if (state.decoder) {
    var chunk = state.decoder.end();

    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }

  state.ended = true;

  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;

    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
} // Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.


function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;

  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}

function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);

  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  } // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.


  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
} // at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.


function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length) // didn't get any data, stop spinning.
      break;
  }

  state.readingMore = false;
} // abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.


Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;

    case 1:
      state.pipes = [state.pipes, dest];
      break;

    default:
      state.pipes.push(dest);
      break;
  }

  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);

  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');

    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  } // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.


  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;

  function cleanup() {
    debug('cleanup'); // cleanup event handlers once the pipe is broken

    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true; // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.

    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  src.on('data', ondata);

  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);

    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }

      src.pause();
    }
  } // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.


  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  } // Make sure our error handler is attached before userland ones.


  prependListener(dest, 'error', onerror); // Both close and finish should trigger unpipe, but only once.

  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }

  dest.once('close', onclose);

  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }

  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  } // tell the dest that it's being piped to


  dest.emit('pipe', src); // start the flow if it hasn't been started already.

  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;

    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  }; // if we're not piping anywhere, then do nothing.

  if (state.pipesCount === 0) return this; // just one destination.  most common case.

  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes; // got a match.

    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  } // slow case. multiple pipe destinations.


  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, {
        hasUnpiped: false
      });
    }

    return this;
  } // try to find the right one.


  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
}; // set up data events if they are asked for
// Ensure readable listeners eventually get something


Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;

  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0; // Try start flowing on next tick if stream isn't explicitly paused

    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);

      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }

  return res;
};

Readable.prototype.addListener = Readable.prototype.on;

Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);

  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);

  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;

  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true; // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
} // pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.


Readable.prototype.resume = function () {
  var state = this._readableState;

  if (!state.flowing) {
    debug('resume'); // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()

    state.flowing = !state.readableListening;
    resume(this, state);
  }

  state.paused = false;
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  debug('resume', state.reading);

  if (!state.reading) {
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);

  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }

  this._readableState.paused = true;
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);

  while (state.flowing && stream.read() !== null) {
    ;
  }
} // wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.


Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');

    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);

    if (!ret) {
      paused = true;
      stream.pause();
    }
  }); // proxy all the other methods.
  // important when wrapping filters and duplexes.

  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  } // proxy certain important events.


  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  } // when we try to consume some more bytes, simply unpause the
  // underlying stream.


  this._read = function (n) {
    debug('wrapped _read', n);

    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = require('./internal/streams/async_iterator');
    }

    return createReadableStreamAsyncIterator(this);
  };
}

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
}); // exposed for testing purposes only.

Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
}); // Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.

function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length); // Check that we didn't get one last unshift.

  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');

    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;

      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}

if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = require('./internal/streams/from');
    }

    return from(Readable, iterable, opts);
  };
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }

  return -1;
}
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":22,"./_stream_duplex":23,"./internal/streams/async_iterator":28,"./internal/streams/buffer_list":29,"./internal/streams/destroy":30,"./internal/streams/from":32,"./internal/streams/state":34,"./internal/streams/stream":35,"_process":20,"buffer":14,"events":15,"inherits":17,"string_decoder/":38,"util":13}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.
'use strict';

module.exports = Transform;

var _require$codes = require('../errors').codes,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
    ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;

var Duplex = require('./_stream_duplex');

require('inherits')(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;

  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }

  ts.writechunk = null;
  ts.writecb = null;
  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;

  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  }; // start out asking for a readable event once data is transformed.

  this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.

  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  } // When the writable side finishes, then flush out anything remaining.


  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
}; // This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.


Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;

  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
}; // Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.


Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;

    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided

  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}
},{"../errors":22,"./_stream_duplex":23,"inherits":17}],27:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.
'use strict';

module.exports = Writable;
/* <replacement> */

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
} // It seems a linked list but it is not
// there will be only 2 of these for each stream


function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/


var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;
/*<replacement>*/

var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/

var Stream = require('./internal/streams/stream');
/*</replacement>*/


var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
    ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

var errorOrDestroy = destroyImpl.errorOrDestroy;

require('inherits')(Writable, Stream);

function nop() {}

function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag to indicate whether or not this stream
  // contains buffers or objects.

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()

  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex); // if _final has been called

  this.finalCalled = false; // drain event flag.

  this.needDrain = false; // at the start of calling end()

  this.ending = false; // when end() has been called, and returned

  this.ended = false; // when 'finish' is emitted

  this.finished = false; // has it been destroyed

  this.destroyed = false; // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.

  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.

  this.length = 0; // a flag to see when we're in the middle of a write.

  this.writing = false; // when true all writes will be buffered until .uncork() call

  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.

  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

  this.onwrite = function (er) {
    onwrite(stream, er);
  }; // the callback that the user supplies to write(chunk,encoding,cb)


  this.writecb = null; // the amount that is being written when _write is called.

  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted

  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams

  this.prefinished = false; // True if the error was already emitted and should not be thrown again

  this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'finish' (and potentially 'end')

  this.autoDestroy = !!options.autoDestroy; // count buffered requests

  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two

  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})(); // Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.


var realHasInstance;

if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex'); // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.
  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex); // legacy.

  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
} // Otherwise people can pipe Writable streams, which is just wrong.


Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};

function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
} // Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.


function validChunk(stream, state, chunk, cb) {
  var er;

  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }

  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }

  return true;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  this._writableState.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }

  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
}); // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);

    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }

  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er); // this can emit finish, and it will always happen
    // after error

    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er); // this can emit finish, but finish must
    // always follow error

    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.


function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
} // if there's something in the buffer waiting, then process it


function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;

    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }

    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite

    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }

    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  } // ignore unnecessary end() calls.


  if (!state.ending) endWritable(this, state, cb);
  return this;
};

Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;

    if (err) {
      errorOrDestroy(stream, err);
    }

    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}

function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    prefinish(stream, state);

    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');

      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;

        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;

  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  } // reuse the free corkReq.


  state.corkedRequestsFree.next = corkReq;
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }

    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;

Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":22,"./_stream_duplex":23,"./internal/streams/destroy":30,"./internal/streams/state":34,"./internal/streams/stream":35,"_process":20,"buffer":14,"inherits":17,"util-deprecate":39}],28:[function(require,module,exports){
(function (process){(function (){
'use strict';

var _Object$setPrototypeO;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var finished = require('./end-of-stream');

var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');

function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}

function readAndResolve(iter) {
  var resolve = iter[kLastResolve];

  if (resolve !== null) {
    var data = iter[kStream].read(); // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'

    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}

function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}

function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }

      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}

var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },

  next: function next() {
    var _this = this;

    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];

    if (error !== null) {
      return Promise.reject(error);
    }

    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }

    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    } // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time


    var lastPromise = this[kLastPromise];
    var promise;

    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();

      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }

      promise = new Promise(this[kHandlePromise]);
    }

    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;

  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);

var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;

  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();

      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject]; // reject if we are waiting for data in the Promise
      // returned by next() and store the error

      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }

      iterator[kError] = err;
      return;
    }

    var resolve = iterator[kLastResolve];

    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }

    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};

module.exports = createReadableStreamAsyncIterator;
}).call(this)}).call(this,require('_process'))
},{"./end-of-stream":31,"_process":20}],29:[function(require,module,exports){
'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('buffer'),
    Buffer = _require.Buffer;

var _require2 = require('util'),
    inspect = _require2.inspect;

var custom = inspect && inspect.custom || 'inspect';

function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}

module.exports =
/*#__PURE__*/
function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;

      while (p = p.next) {
        ret += s + p.data;
      }

      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;

      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }

      return ret;
    } // Consumes a specified amount of bytes or characters from the buffered data.

  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;

      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }

      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    } // Consumes a specified amount of characters from the buffered data.

  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;

      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;

        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Consumes a specified amount of bytes from the buffered data.

  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;

      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;

        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Make sure the linked list only shows the minimal necessary information.

  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread({}, options, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);

  return BufferList;
}();
},{"buffer":14,"util":13}],30:[function(require,module,exports){
(function (process){(function (){
'use strict'; // undocumented cb() API, needed for core, not for public API

function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  } // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks


  if (this._readableState) {
    this._readableState.destroyed = true;
  } // if this is a duplex stream mark the writable part as destroyed as well


  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });

  return this;
}

function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}

function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.
  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};
}).call(this)}).call(this,require('_process'))
},{"_process":20}],31:[function(require,module,exports){
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).
'use strict';

var ERR_STREAM_PREMATURE_CLOSE = require('../../../errors').codes.ERR_STREAM_PREMATURE_CLOSE;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    callback.apply(this, args);
  };
}

function noop() {}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;

  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };

  var writableEnded = stream._writableState && stream._writableState.finished;

  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };

  var readableEnded = stream._readableState && stream._readableState.endEmitted;

  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };

  var onerror = function onerror(err) {
    callback.call(stream, err);
  };

  var onclose = function onclose() {
    var err;

    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }

    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };

  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };

  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}

module.exports = eos;
},{"../../../errors":22}],32:[function(require,module,exports){
module.exports = function () {
  throw new Error('Readable.from is not available in the browser')
};

},{}],33:[function(require,module,exports){
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).
'use strict';

var eos;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}

var _require$codes = require('../../../errors').codes,
    ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;

function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = require('./end-of-stream');
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true; // request.destroy just do .end - .abort is what we want

    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}

function call(fn) {
  fn();
}

function pipe(from, to) {
  return from.pipe(to);
}

function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}

function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];

  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}

module.exports = pipeline;
},{"../../../errors":22,"./end-of-stream":31}],34:[function(require,module,exports){
'use strict';

var ERR_INVALID_OPT_VALUE = require('../../../errors').codes.ERR_INVALID_OPT_VALUE;

function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}

function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }

    return Math.floor(hwm);
  } // Default value


  return state.objectMode ? 16 : 16 * 1024;
}

module.exports = {
  getHighWaterMark: getHighWaterMark
};
},{"../../../errors":22}],35:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":15}],36:[function(require,module,exports){
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":14}],37:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/lib/_stream_readable.js');
Stream.Writable = require('readable-stream/lib/_stream_writable.js');
Stream.Duplex = require('readable-stream/lib/_stream_duplex.js');
Stream.Transform = require('readable-stream/lib/_stream_transform.js');
Stream.PassThrough = require('readable-stream/lib/_stream_passthrough.js');
Stream.finished = require('readable-stream/lib/internal/streams/end-of-stream.js')
Stream.pipeline = require('readable-stream/lib/internal/streams/pipeline.js')

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":15,"inherits":17,"readable-stream/lib/_stream_duplex.js":23,"readable-stream/lib/_stream_passthrough.js":24,"readable-stream/lib/_stream_readable.js":25,"readable-stream/lib/_stream_transform.js":26,"readable-stream/lib/_stream_writable.js":27,"readable-stream/lib/internal/streams/end-of-stream.js":31,"readable-stream/lib/internal/streams/pipeline.js":33}],38:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":36}],39:[function(require,module,exports){
(function (global){(function (){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],40:[function(require,module,exports){
(function (Buffer){(function (){
'use strict';
const nodeStream = require('stream');
const isNodeStream = require('is-stream');
const conversions = require('./lib/conversions');

module.exports = require('web-streams-ponyfill');

/**
 * Convert Web streams to Node streams. Until WritableStream / TransformStream
 * is finalized, only ReadableStream is supported.
 *
 * @param {ReadableStream} stream, a web stream.
 * @return {stream.Readable}, a Node Readable stream.
 */
module.exports.toNodeReadable = function(stream) {
    if (stream instanceof module.exports.ReadableStream
        || stream && typeof stream.getReader === 'function') {
        return conversions.readable.webToNode(stream);
    } else {
        throw new TypeError("Expected a ReadableStream.");
    }
};

/**
 * Convert Node Readable streams, an Array, Buffer or String to a Web
 * ReadableStream.
 *
 * @param {Readable|Array|Buffer|String} stream, a Node Readable stream,
 * Array, Buffer or String.
 * @return {ReadableStream}, a web ReadableStream.
 */
module.exports.toWebReadableStream = function(stream) {
    if (isNodeStream(stream) && stream.readable) {
        return conversions.readable.nodeToWeb(stream);
    } else if (Array.isArray(stream)) {
        return conversions.readable.arrayToWeb(stream);
    } else if (Buffer.isBuffer(stream) || typeof stream === 'string') {
        return conversions.readable.arrayToWeb([stream]);
    } else {
        throw new TypeError("Expected a Node streams.Readable, an Array, Buffer or String.");
    }
};

}).call(this)}).call(this,{"isBuffer":require("../is-buffer/index.js")})
},{"../is-buffer/index.js":18,"./lib/conversions":41,"is-stream":42,"stream":37,"web-streams-ponyfill":43}],41:[function(require,module,exports){
(function (global){(function (){
'use strict';

const Readable = require('stream').Readable;
const ReadableStream = require('web-streams-ponyfill').ReadableStream;

/**
 * Web / node stream conversion functions
 */
global.ReadableStream = global.ReadableStream || ReadableStream;
// TODO: The module 'readable-stream-node-to-web' expects `ReadableStream` in globals
const readableNodeToWeb = require('readable-stream-node-to-web');

/**
 * ReadableStream wrapping an array.
 *
 * @param {Array} arr, the array to wrap into a stream.
 * @return {ReadableStream}
 */
function arrayToWeb(arr) {
    return new ReadableStream({
        start(controller) {
            for (var i = 0; i < arr.length; i++) {
                controller.enqueue(arr[i]);
            }
            controller.close();
        }
    });
}


class NodeReadable extends Readable {
    constructor(webStream, options) {
        super(options);
        this._webStream = webStream;
        this._reader = webStream.getReader();
        this._reading = false;
    }

    _read(size) {
        if (this._reading) {
            return;
        }
        this._reading = true;
        const doRead = () => {
            this._reader.read()
                .then(res => {
                    if (this._doneReading) {
                        this._reading = false;
                        this._reader.releaseLock();
                        this._doneReading();
                    }
                    if (res.done) {
                        this.push(null);
                        this._reading = false;
                        this._reader.releaseLock();
                        return;
                    }
                    if (this.push(res.value)) {
                        return doRead(size);
                    } else {
                        this._reading = false;
                        this._reader.releaseLock();
                    }
                });
        };
        doRead();
    }
    
    _destroy(err, callback) {
        if (this._reading) {
            const promise = new Promise(resolve => {
                this._doneReading = resolve;
            });
            promise.then(() => this._handleDestroy(err, callback));
        } else {
            this._handleDestroy(err, callback);
        }
    }
        
    _handleDestroy(err, callback) {
        this._webStream.cancel();
        super._destroy(err, callback);
    }
}

function readableWebToNode(webStream) {
    return new NodeReadable(webStream);
}

module.exports = {
    readable: {
        nodeToWeb: readableNodeToWeb,
        arrayToWeb: arrayToWeb,
        webToNode: readableWebToNode,
    },
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"readable-stream-node-to-web":21,"stream":37,"web-streams-ponyfill":43}],42:[function(require,module,exports){
'use strict';

var isStream = module.exports = function (stream) {
	return stream !== null && typeof stream === 'object' && typeof stream.pipe === 'function';
};

isStream.writable = function (stream) {
	return isStream(stream) && stream.writable !== false && typeof stream._write === 'function' && typeof stream._writableState === 'object';
};

isStream.readable = function (stream) {
	return isStream(stream) && stream.readable !== false && typeof stream._read === 'function' && typeof stream._readableState === 'object';
};

isStream.duplex = function (stream) {
	return isStream.writable(stream) && isStream.readable(stream);
};

isStream.transform = function (stream) {
	return isStream.duplex(stream) && typeof stream._transform === 'function' && typeof stream._transformState === 'object';
};

},{}],43:[function(require,module,exports){
(function (global){(function (){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.default = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _require=_dereq_("./spec/reference-implementation/lib/readable-stream"),ReadableStream=_require.ReadableStream,_require2=_dereq_("./spec/reference-implementation/lib/writable-stream"),WritableStream=_require2.WritableStream,ByteLengthQueuingStrategy=_dereq_("./spec/reference-implementation/lib/byte-length-queuing-strategy"),CountQueuingStrategy=_dereq_("./spec/reference-implementation/lib/count-queuing-strategy"),_require3=_dereq_("./spec/reference-implementation/lib/transform-stream"),TransformStream=_require3.TransformStream;exports.ByteLengthQueuingStrategy=ByteLengthQueuingStrategy,exports.CountQueuingStrategy=CountQueuingStrategy,exports.ReadableStream=ReadableStream,exports.WritableStream=WritableStream,exports.TransformStream=TransformStream;var interfaces={ReadableStream:ReadableStream,WritableStream:WritableStream,ByteLengthQueuingStrategy:ByteLengthQueuingStrategy,CountQueuingStrategy:CountQueuingStrategy,TransformStream:TransformStream};exports.default=interfaces;

},{"./spec/reference-implementation/lib/byte-length-queuing-strategy":8,"./spec/reference-implementation/lib/count-queuing-strategy":9,"./spec/reference-implementation/lib/readable-stream":12,"./spec/reference-implementation/lib/transform-stream":13,"./spec/reference-implementation/lib/writable-stream":15}],2:[function(_dereq_,module,exports){
(function (global){
"use strict";function compare(t,e){if(t===e)return 0;for(var r=t.length,n=e.length,i=0,a=Math.min(r,n);i<a;++i)if(t[i]!==e[i]){r=t[i],n=e[i];break}return r<n?-1:n<r?1:0}function isBuffer(t){return global.Buffer&&"function"==typeof global.Buffer.isBuffer?global.Buffer.isBuffer(t):!(null==t||!t._isBuffer)}function pToString(t){return Object.prototype.toString.call(t)}function isView(t){return!isBuffer(t)&&("function"==typeof global.ArrayBuffer&&("function"==typeof ArrayBuffer.isView?ArrayBuffer.isView(t):!!t&&(t instanceof DataView||!!(t.buffer&&t.buffer instanceof ArrayBuffer))))}function getName(t){if(util.isFunction(t)){if(functionsHaveNames)return t.name;var e=t.toString().match(regex);return e&&e[1]}}function truncate(t,e){return"string"==typeof t?t.length<e?t:t.slice(0,e):t}function inspect(t){if(functionsHaveNames||!util.isFunction(t))return util.inspect(t);var e=getName(t);return"[Function"+(e?": "+e:"")+"]"}function getMessage(t){return truncate(inspect(t.actual),128)+" "+t.operator+" "+truncate(inspect(t.expected),128)}function fail(t,e,r,n,i){throw new assert.AssertionError({message:r,actual:t,expected:e,operator:n,stackStartFunction:i})}function ok(t,e){t||fail(t,!0,e,"==",assert.ok)}function _deepEqual(t,e,r,n){if(t===e)return!0;if(isBuffer(t)&&isBuffer(e))return 0===compare(t,e);if(util.isDate(t)&&util.isDate(e))return t.getTime()===e.getTime();if(util.isRegExp(t)&&util.isRegExp(e))return t.source===e.source&&t.global===e.global&&t.multiline===e.multiline&&t.lastIndex===e.lastIndex&&t.ignoreCase===e.ignoreCase;if(null!==t&&"object"==typeof t||null!==e&&"object"==typeof e){if(isView(t)&&isView(e)&&pToString(t)===pToString(e)&&!(t instanceof Float32Array||t instanceof Float64Array))return 0===compare(new Uint8Array(t.buffer),new Uint8Array(e.buffer));if(isBuffer(t)!==isBuffer(e))return!1;var i=(n=n||{actual:[],expected:[]}).actual.indexOf(t);return-1!==i&&i===n.expected.indexOf(e)||(n.actual.push(t),n.expected.push(e),objEquiv(t,e,r,n))}return r?t===e:t==e}function isArguments(t){return"[object Arguments]"==Object.prototype.toString.call(t)}function objEquiv(t,e,r,n){if(null===t||void 0===t||null===e||void 0===e)return!1;if(util.isPrimitive(t)||util.isPrimitive(e))return t===e;if(r&&Object.getPrototypeOf(t)!==Object.getPrototypeOf(e))return!1;var i=isArguments(t),a=isArguments(e);if(i&&!a||!i&&a)return!1;if(i)return t=pSlice.call(t),e=pSlice.call(e),_deepEqual(t,e,r);var o,s,u=objectKeys(t),f=objectKeys(e);if(u.length!==f.length)return!1;for(u.sort(),f.sort(),s=u.length-1;s>=0;s--)if(u[s]!==f[s])return!1;for(s=u.length-1;s>=0;s--)if(o=u[s],!_deepEqual(t[o],e[o],r,n))return!1;return!0}function notDeepStrictEqual(t,e,r){_deepEqual(t,e,!0)&&fail(t,e,r,"notDeepStrictEqual",notDeepStrictEqual)}function expectedException(t,e){if(!t||!e)return!1;if("[object RegExp]"==Object.prototype.toString.call(e))return e.test(t);try{if(t instanceof e)return!0}catch(t){}return!Error.isPrototypeOf(e)&&!0===e.call({},t)}function _tryBlock(t){var e;try{t()}catch(t){e=t}return e}function _throws(t,e,r,n){var i;if("function"!=typeof e)throw new TypeError('"block" argument must be a function');"string"==typeof r&&(n=r,r=null),i=_tryBlock(e),n=(r&&r.name?" ("+r.name+").":".")+(n?" "+n:"."),t&&!i&&fail(i,r,"Missing expected exception"+n);var a="string"==typeof n,o=!t&&util.isError(i),s=!t&&i&&!r;if((o&&a&&expectedException(i,r)||s)&&fail(i,r,"Got unwanted exception"+n),t&&i&&r&&!expectedException(i,r)||!t&&i)throw i}var util=_dereq_("util/"),hasOwn=Object.prototype.hasOwnProperty,pSlice=Array.prototype.slice,functionsHaveNames="foo"===function foo(){}.name,assert=module.exports=ok,regex=/\s*function\s+([^\(\s]*)\s*/;assert.AssertionError=function AssertionError(t){this.name="AssertionError",this.actual=t.actual,this.expected=t.expected,this.operator=t.operator,t.message?(this.message=t.message,this.generatedMessage=!1):(this.message=getMessage(this),this.generatedMessage=!0);var e=t.stackStartFunction||fail;if(Error.captureStackTrace)Error.captureStackTrace(this,e);else{var r=new Error;if(r.stack){var n=r.stack,i=getName(e),a=n.indexOf("\n"+i);if(a>=0){var o=n.indexOf("\n",a+1);n=n.substring(o+1)}this.stack=n}}},util.inherits(assert.AssertionError,Error),assert.fail=fail,assert.ok=ok,assert.equal=function equal(t,e,r){t!=e&&fail(t,e,r,"==",assert.equal)},assert.notEqual=function notEqual(t,e,r){t==e&&fail(t,e,r,"!=",assert.notEqual)},assert.deepEqual=function deepEqual(t,e,r){_deepEqual(t,e,!1)||fail(t,e,r,"deepEqual",assert.deepEqual)},assert.deepStrictEqual=function deepStrictEqual(t,e,r){_deepEqual(t,e,!0)||fail(t,e,r,"deepStrictEqual",assert.deepStrictEqual)},assert.notDeepEqual=function notDeepEqual(t,e,r){_deepEqual(t,e,!1)&&fail(t,e,r,"notDeepEqual",assert.notDeepEqual)},assert.notDeepStrictEqual=notDeepStrictEqual,assert.strictEqual=function strictEqual(t,e,r){t!==e&&fail(t,e,r,"===",assert.strictEqual)},assert.notStrictEqual=function notStrictEqual(t,e,r){t===e&&fail(t,e,r,"!==",assert.notStrictEqual)},assert.throws=function(t,e,r){_throws(!0,t,e,r)},assert.doesNotThrow=function(t,e,r){_throws(!1,t,e,r)},assert.ifError=function(t){if(t)throw t};var objectKeys=Object.keys||function(t){var e=[];for(var r in t)hasOwn.call(t,r)&&e.push(r);return e};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"util/":7}],3:[function(_dereq_,module,exports){

},{}],4:[function(_dereq_,module,exports){
function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}function runTimeout(e){if(cachedSetTimeout===setTimeout)return setTimeout(e,0);if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout)return cachedSetTimeout=setTimeout,setTimeout(e,0);try{return cachedSetTimeout(e,0)}catch(t){try{return cachedSetTimeout.call(null,e,0)}catch(t){return cachedSetTimeout.call(this,e,0)}}}function runClearTimeout(e){if(cachedClearTimeout===clearTimeout)return clearTimeout(e);if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout)return cachedClearTimeout=clearTimeout,clearTimeout(e);try{return cachedClearTimeout(e)}catch(t){try{return cachedClearTimeout.call(null,e)}catch(t){return cachedClearTimeout.call(this,e)}}}function cleanUpNextTick(){draining&&currentQueue&&(draining=!1,currentQueue.length?queue=currentQueue.concat(queue):queueIndex=-1,queue.length&&drainQueue())}function drainQueue(){if(!draining){var e=runTimeout(cleanUpNextTick);draining=!0;for(var t=queue.length;t;){for(currentQueue=queue,queue=[];++queueIndex<t;)currentQueue&&currentQueue[queueIndex].run();queueIndex=-1,t=queue.length}currentQueue=null,draining=!1,runClearTimeout(e)}}function Item(e,t){this.fun=e,this.array=t}function noop(){}var cachedSetTimeout,cachedClearTimeout,process=module.exports={};!function(){try{cachedSetTimeout="function"==typeof setTimeout?setTimeout:defaultSetTimout}catch(e){cachedSetTimeout=defaultSetTimout}try{cachedClearTimeout="function"==typeof clearTimeout?clearTimeout:defaultClearTimeout}catch(e){cachedClearTimeout=defaultClearTimeout}}();var currentQueue,queue=[],draining=!1,queueIndex=-1;process.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];queue.push(new Item(e,t)),1!==queue.length||draining||runTimeout(drainQueue)},Item.prototype.run=function(){this.fun.apply(null,this.array)},process.title="browser",process.browser=!0,process.env={},process.argv=[],process.version="",process.versions={},process.on=noop,process.addListener=noop,process.once=noop,process.off=noop,process.removeListener=noop,process.removeAllListeners=noop,process.emit=noop,process.prependListener=noop,process.prependOnceListener=noop,process.listeners=function(e){return[]},process.binding=function(e){throw new Error("process.binding is not supported")},process.cwd=function(){return"/"},process.chdir=function(e){throw new Error("process.chdir is not supported")},process.umask=function(){return 0};

},{}],5:[function(_dereq_,module,exports){
"function"==typeof Object.create?module.exports=function inherits(t,e){t.super_=e,t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}})}:module.exports=function inherits(t,e){t.super_=e;var o=function(){};o.prototype=e.prototype,t.prototype=new o,t.prototype.constructor=t};

},{}],6:[function(_dereq_,module,exports){
module.exports=function isBuffer(o){return o&&"object"==typeof o&&"function"==typeof o.copy&&"function"==typeof o.fill&&"function"==typeof o.readUInt8};

},{}],7:[function(_dereq_,module,exports){
(function (process,global){
function inspect(e,r){var t={seen:[],stylize:stylizeNoColor};return arguments.length>=3&&(t.depth=arguments[2]),arguments.length>=4&&(t.colors=arguments[3]),isBoolean(r)?t.showHidden=r:r&&exports._extend(t,r),isUndefined(t.showHidden)&&(t.showHidden=!1),isUndefined(t.depth)&&(t.depth=2),isUndefined(t.colors)&&(t.colors=!1),isUndefined(t.customInspect)&&(t.customInspect=!0),t.colors&&(t.stylize=stylizeWithColor),formatValue(t,e,t.depth)}function stylizeWithColor(e,r){var t=inspect.styles[r];return t?"["+inspect.colors[t][0]+"m"+e+"["+inspect.colors[t][1]+"m":e}function stylizeNoColor(e,r){return e}function arrayToHash(e){var r={};return e.forEach(function(e,t){r[e]=!0}),r}function formatValue(e,r,t){if(e.customInspect&&r&&isFunction(r.inspect)&&r.inspect!==exports.inspect&&(!r.constructor||r.constructor.prototype!==r)){var n=r.inspect(t,e);return isString(n)||(n=formatValue(e,n,t)),n}var i=formatPrimitive(e,r);if(i)return i;var o=Object.keys(r),s=arrayToHash(o);if(e.showHidden&&(o=Object.getOwnPropertyNames(r)),isError(r)&&(o.indexOf("message")>=0||o.indexOf("description")>=0))return formatError(r);if(0===o.length){if(isFunction(r)){var u=r.name?": "+r.name:"";return e.stylize("[Function"+u+"]","special")}if(isRegExp(r))return e.stylize(RegExp.prototype.toString.call(r),"regexp");if(isDate(r))return e.stylize(Date.prototype.toString.call(r),"date");if(isError(r))return formatError(r)}var c="",a=!1,l=["{","}"];if(isArray(r)&&(a=!0,l=["[","]"]),isFunction(r)&&(c=" [Function"+(r.name?": "+r.name:"")+"]"),isRegExp(r)&&(c=" "+RegExp.prototype.toString.call(r)),isDate(r)&&(c=" "+Date.prototype.toUTCString.call(r)),isError(r)&&(c=" "+formatError(r)),0===o.length&&(!a||0==r.length))return l[0]+c+l[1];if(t<0)return isRegExp(r)?e.stylize(RegExp.prototype.toString.call(r),"regexp"):e.stylize("[Object]","special");e.seen.push(r);var p;return p=a?formatArray(e,r,t,s,o):o.map(function(n){return formatProperty(e,r,t,s,n,a)}),e.seen.pop(),reduceToSingleString(p,c,l)}function formatPrimitive(e,r){if(isUndefined(r))return e.stylize("undefined","undefined");if(isString(r)){var t="'"+JSON.stringify(r).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return e.stylize(t,"string")}return isNumber(r)?e.stylize(""+r,"number"):isBoolean(r)?e.stylize(""+r,"boolean"):isNull(r)?e.stylize("null","null"):void 0}function formatError(e){return"["+Error.prototype.toString.call(e)+"]"}function formatArray(e,r,t,n,i){for(var o=[],s=0,u=r.length;s<u;++s)hasOwnProperty(r,String(s))?o.push(formatProperty(e,r,t,n,String(s),!0)):o.push("");return i.forEach(function(i){i.match(/^\d+$/)||o.push(formatProperty(e,r,t,n,i,!0))}),o}function formatProperty(e,r,t,n,i,o){var s,u,c;if((c=Object.getOwnPropertyDescriptor(r,i)||{value:r[i]}).get?u=c.set?e.stylize("[Getter/Setter]","special"):e.stylize("[Getter]","special"):c.set&&(u=e.stylize("[Setter]","special")),hasOwnProperty(n,i)||(s="["+i+"]"),u||(e.seen.indexOf(c.value)<0?(u=isNull(t)?formatValue(e,c.value,null):formatValue(e,c.value,t-1)).indexOf("\n")>-1&&(u=o?u.split("\n").map(function(e){return"  "+e}).join("\n").substr(2):"\n"+u.split("\n").map(function(e){return"   "+e}).join("\n")):u=e.stylize("[Circular]","special")),isUndefined(s)){if(o&&i.match(/^\d+$/))return u;(s=JSON.stringify(""+i)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(s=s.substr(1,s.length-2),s=e.stylize(s,"name")):(s=s.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),s=e.stylize(s,"string"))}return s+": "+u}function reduceToSingleString(e,r,t){var n=0;return e.reduce(function(e,r){return n++,r.indexOf("\n")>=0&&n++,e+r.replace(/\u001b\[\d\d?m/g,"").length+1},0)>60?t[0]+(""===r?"":r+"\n ")+" "+e.join(",\n  ")+" "+t[1]:t[0]+r+" "+e.join(", ")+" "+t[1]}function isArray(e){return Array.isArray(e)}function isBoolean(e){return"boolean"==typeof e}function isNull(e){return null===e}function isNullOrUndefined(e){return null==e}function isNumber(e){return"number"==typeof e}function isString(e){return"string"==typeof e}function isSymbol(e){return"symbol"==typeof e}function isUndefined(e){return void 0===e}function isRegExp(e){return isObject(e)&&"[object RegExp]"===objectToString(e)}function isObject(e){return"object"==typeof e&&null!==e}function isDate(e){return isObject(e)&&"[object Date]"===objectToString(e)}function isError(e){return isObject(e)&&("[object Error]"===objectToString(e)||e instanceof Error)}function isFunction(e){return"function"==typeof e}function isPrimitive(e){return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||void 0===e}function objectToString(e){return Object.prototype.toString.call(e)}function pad(e){return e<10?"0"+e.toString(10):e.toString(10)}function timestamp(){var e=new Date,r=[pad(e.getHours()),pad(e.getMinutes()),pad(e.getSeconds())].join(":");return[e.getDate(),months[e.getMonth()],r].join(" ")}function hasOwnProperty(e,r){return Object.prototype.hasOwnProperty.call(e,r)}var formatRegExp=/%[sdj%]/g;exports.format=function(e){if(!isString(e)){for(var r=[],t=0;t<arguments.length;t++)r.push(inspect(arguments[t]));return r.join(" ")}for(var t=1,n=arguments,i=n.length,o=String(e).replace(formatRegExp,function(e){if("%%"===e)return"%";if(t>=i)return e;switch(e){case"%s":return String(n[t++]);case"%d":return Number(n[t++]);case"%j":try{return JSON.stringify(n[t++])}catch(e){return"[Circular]"}default:return e}}),s=n[t];t<i;s=n[++t])isNull(s)||!isObject(s)?o+=" "+s:o+=" "+inspect(s);return o},exports.deprecate=function(e,r){if(isUndefined(global.process))return function(){return exports.deprecate(e,r).apply(this,arguments)};if(!0===process.noDeprecation)return e;var t=!1;return function deprecated(){if(!t){if(process.throwDeprecation)throw new Error(r);process.traceDeprecation?console.trace(r):console.error(r),t=!0}return e.apply(this,arguments)}};var debugEnviron,debugs={};exports.debuglog=function(e){if(isUndefined(debugEnviron)&&(debugEnviron=process.env.NODE_DEBUG||""),e=e.toUpperCase(),!debugs[e])if(new RegExp("\\b"+e+"\\b","i").test(debugEnviron)){var r=process.pid;debugs[e]=function(){var t=exports.format.apply(exports,arguments);console.error("%s %d: %s",e,r,t)}}else debugs[e]=function(){};return debugs[e]},exports.inspect=inspect,inspect.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},inspect.styles={special:"cyan",number:"yellow",boolean:"yellow",undefined:"grey",null:"bold",string:"green",date:"magenta",regexp:"red"},exports.isArray=isArray,exports.isBoolean=isBoolean,exports.isNull=isNull,exports.isNullOrUndefined=isNullOrUndefined,exports.isNumber=isNumber,exports.isString=isString,exports.isSymbol=isSymbol,exports.isUndefined=isUndefined,exports.isRegExp=isRegExp,exports.isObject=isObject,exports.isDate=isDate,exports.isError=isError,exports.isFunction=isFunction,exports.isPrimitive=isPrimitive,exports.isBuffer=_dereq_("./support/isBuffer");var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];exports.log=function(){console.log("%s - %s",timestamp(),exports.format.apply(exports,arguments))},exports.inherits=_dereq_("inherits"),exports._extend=function(e,r){if(!r||!isObject(r))return e;for(var t=Object.keys(r),n=t.length;n--;)e[t[n]]=r[t[n]];return e};

}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":6,"_process":4,"inherits":5}],8:[function(_dereq_,module,exports){
"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(e,t,r){return t&&defineProperties(e.prototype,t),r&&defineProperties(e,r),e}}(),_require=_dereq_("./helpers.js"),createDataProperty=_require.createDataProperty;module.exports=function(){function ByteLengthQueuingStrategy(e){var t=e.highWaterMark;_classCallCheck(this,ByteLengthQueuingStrategy),createDataProperty(this,"highWaterMark",t)}return _createClass(ByteLengthQueuingStrategy,[{key:"size",value:function size(e){return e.byteLength}}]),ByteLengthQueuingStrategy}();

},{"./helpers.js":10}],9:[function(_dereq_,module,exports){
"use strict";function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function defineProperties(e,r){for(var t=0;t<r.length;t++){var a=r[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(e,r,t){return r&&defineProperties(e.prototype,r),t&&defineProperties(e,t),e}}(),_require=_dereq_("./helpers.js"),createDataProperty=_require.createDataProperty;module.exports=function(){function CountQueuingStrategy(e){var r=e.highWaterMark;_classCallCheck(this,CountQueuingStrategy),createDataProperty(this,"highWaterMark",r)}return _createClass(CountQueuingStrategy,[{key:"size",value:function size(){return 1}}]),CountQueuingStrategy}();

},{"./helpers.js":10}],10:[function(_dereq_,module,exports){
"use strict";function IsPropertyKey(e){return"string"==typeof e||"symbol"===(void 0===e?"undefined":_typeof(e))}function Call(e,r,t){if("function"!=typeof e)throw new TypeError("Argument is not a function");return Function.prototype.apply.call(e,r,t)}function PromiseCall(e,r,t){try{return Promise.resolve(Call(e,r,t))}catch(e){return Promise.reject(e)}}var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},assert=_dereq_("better-assert"),isFakeDetached=Symbol('is "detached" for our purposes');exports.typeIsObject=function(e){return"object"===(void 0===e?"undefined":_typeof(e))&&null!==e||"function"==typeof e},exports.createDataProperty=function(e,r,t){Object.defineProperty(e,r,{value:t,writable:!0,enumerable:!0,configurable:!0})},exports.createArrayFromList=function(e){return e.slice()},exports.ArrayBufferCopy=function(e,r,t,n,o){new Uint8Array(e).set(new Uint8Array(t,n,o),r)},exports.CreateIterResultObject=function(e,r){var t={};return Object.defineProperty(t,"value",{value:e,enumerable:!0,writable:!0,configurable:!0}),Object.defineProperty(t,"done",{value:r,enumerable:!0,writable:!0,configurable:!0}),t},exports.IsFiniteNonNegativeNumber=function(e){return!1!==exports.IsNonNegativeNumber(e)&&e!==1/0},exports.IsNonNegativeNumber=function(e){return"number"==typeof e&&(!Number.isNaN(e)&&!(e<0))},exports.Call=Call,exports.CreateAlgorithmFromUnderlyingMethod=function(e,r,t,n){var o=e[r];if(void 0!==o){if("function"!=typeof o)throw new TypeError(o+" is not a method");switch(t){case 0:return function(){return PromiseCall(o,e,n)};case 1:return function(r){var t=[r].concat(n);return PromiseCall(o,e,t)}}}return function(){return Promise.resolve()}},exports.InvokeOrNoop=function(e,r,t){var n=e[r];if(void 0!==n)return Call(n,e,t)},exports.PromiseCall=PromiseCall,exports.TransferArrayBuffer=function(e){var r=e.slice();return Object.defineProperty(e,"byteLength",{get:function get(){return 0}}),e[isFakeDetached]=!0,r},exports.IsDetachedBuffer=function(e){return isFakeDetached in e},exports.ValidateAndNormalizeHighWaterMark=function(e){if(e=Number(e),Number.isNaN(e)||e<0)throw new RangeError("highWaterMark property of a queuing strategy must be non-negative and non-NaN");return e},exports.MakeSizeAlgorithmFromSizeFunction=function(e){if(void 0===e)return function(){return 1};if("function"!=typeof e)throw new TypeError("size property of a queuing strategy must be a function");return function(r){return e(r)}};

},{"better-assert":16}],11:[function(_dereq_,module,exports){
"use strict";var assert=_dereq_("better-assert"),_require=_dereq_("./helpers.js"),IsFiniteNonNegativeNumber=_require.IsFiniteNonNegativeNumber;exports.DequeueValue=function(e){var u=e._queue.shift();return e._queueTotalSize-=u.size,e._queueTotalSize<0&&(e._queueTotalSize=0),u.value},exports.EnqueueValueWithSize=function(e,u,t){if(t=Number(t),!IsFiniteNonNegativeNumber(t))throw new RangeError("Size must be a finite, non-NaN, non-negative number.");e._queue.push({value:u,size:t}),e._queueTotalSize+=t},exports.PeekQueueValue=function(e){return e._queue[0].value},exports.ResetQueue=function(e){e._queue=[],e._queueTotalSize=0};

},{"./helpers.js":10,"better-assert":16}],12:[function(_dereq_,module,exports){
"use strict";function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}function AcquireReadableStreamBYOBReader(e){return new ReadableStreamBYOBReader(e)}function AcquireReadableStreamDefaultReader(e){return new ReadableStreamDefaultReader(e)}function CreateReadableStream(e,r,t){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1,l=arguments.length>4&&void 0!==arguments[4]?arguments[4]:function(){return 1},o=Object.create(ReadableStream.prototype);return InitializeReadableStream(o),SetUpReadableStreamDefaultController(o,Object.create(ReadableStreamDefaultController.prototype),e,r,t,a,l),o}function CreateReadableByteStream(e,r,t){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0,l=arguments.length>4&&void 0!==arguments[4]?arguments[4]:void 0,o=Object.create(ReadableStream.prototype);return InitializeReadableStream(o),SetUpReadableByteStreamController(o,Object.create(ReadableByteStreamController.prototype),e,r,t,a,l),o}function InitializeReadableStream(e){e._state="readable",e._reader=void 0,e._storedError=void 0,e._disturbed=!1}function IsReadableStream(e){return!!typeIsObject(e)&&!!Object.prototype.hasOwnProperty.call(e,"_readableStreamController")}function IsReadableStreamDisturbed(e){return e._disturbed}function IsReadableStreamLocked(e){return void 0!==e._reader}function ReadableStreamTee(e,r){function pullAlgorithm(){return ReadableStreamDefaultReaderRead(t).then(function(e){var r=e.value;if(!0===e.done&&!1===a&&(!1===l&&ReadableStreamDefaultControllerClose(d._readableStreamController),!1===o&&ReadableStreamDefaultControllerClose(s._readableStreamController),a=!0),!0!==a){var t=r,n=r;!1===l&&ReadableStreamDefaultControllerEnqueue(d._readableStreamController,t),!1===o&&ReadableStreamDefaultControllerEnqueue(s._readableStreamController,n)}})}function startAlgorithm(){}var t=AcquireReadableStreamDefaultReader(e),a=!1,l=!1,o=!1,n=void 0,i=void 0,d=void 0,s=void 0,u=void 0,c=new Promise(function(e){u=e});return d=CreateReadableStream(startAlgorithm,pullAlgorithm,function cancel1Algorithm(r){if(l=!0,n=r,!0===o){var t=createArrayFromList([n,i]),a=ReadableStreamCancel(e,t);u(a)}return c}),s=CreateReadableStream(startAlgorithm,pullAlgorithm,function cancel2Algorithm(r){if(o=!0,i=r,!0===l){var t=createArrayFromList([n,i]),a=ReadableStreamCancel(e,t);u(a)}return c}),t._closedPromise.catch(function(e){!0!==a&&(ReadableStreamDefaultControllerErrorIfNeeded(d._readableStreamController,e),ReadableStreamDefaultControllerErrorIfNeeded(s._readableStreamController,e),a=!0)}),[d,s]}function ReadableStreamAddReadIntoRequest(e){return new Promise(function(r,t){var a={_resolve:r,_reject:t};e._reader._readIntoRequests.push(a)})}function ReadableStreamAddReadRequest(e){return new Promise(function(r,t){var a={_resolve:r,_reject:t};e._reader._readRequests.push(a)})}function ReadableStreamCancel(e,r){return e._disturbed=!0,"closed"===e._state?Promise.resolve(void 0):"errored"===e._state?Promise.reject(e._storedError):(ReadableStreamClose(e),e._readableStreamController[CancelSteps](r).then(function(){}))}function ReadableStreamClose(e){e._state="closed";var r=e._reader;if(void 0!==r){if(!0===IsReadableStreamDefaultReader(r)){var t=!0,a=!1,l=void 0;try{for(var o,n=r._readRequests[Symbol.iterator]();!(t=(o=n.next()).done);t=!0)(0,o.value._resolve)(CreateIterResultObject(void 0,!0))}catch(e){a=!0,l=e}finally{try{!t&&n.return&&n.return()}finally{if(a)throw l}}r._readRequests=[]}defaultReaderClosedPromiseResolve(r)}}function ReadableStreamError(e,r){e._state="errored",e._storedError=r;var t=e._reader;if(void 0!==t){if(!0===IsReadableStreamDefaultReader(t)){var a=!0,l=!1,o=void 0;try{for(var n,i=t._readRequests[Symbol.iterator]();!(a=(n=i.next()).done);a=!0)n.value._reject(r)}catch(e){l=!0,o=e}finally{try{!a&&i.return&&i.return()}finally{if(l)throw o}}t._readRequests=[]}else{var d=!0,s=!1,u=void 0;try{for(var c,b=t._readIntoRequests[Symbol.iterator]();!(d=(c=b.next()).done);d=!0)c.value._reject(r)}catch(e){s=!0,u=e}finally{try{!d&&b.return&&b.return()}finally{if(s)throw u}}t._readIntoRequests=[]}defaultReaderClosedPromiseReject(t,r),t._closedPromise.catch(function(){})}}function ReadableStreamFulfillReadIntoRequest(e,r,t){e._reader._readIntoRequests.shift()._resolve(CreateIterResultObject(r,t))}function ReadableStreamFulfillReadRequest(e,r,t){e._reader._readRequests.shift()._resolve(CreateIterResultObject(r,t))}function ReadableStreamGetNumReadIntoRequests(e){return e._reader._readIntoRequests.length}function ReadableStreamGetNumReadRequests(e){return e._reader._readRequests.length}function ReadableStreamHasBYOBReader(e){var r=e._reader;return void 0!==r&&!1!==IsReadableStreamBYOBReader(r)}function ReadableStreamHasDefaultReader(e){var r=e._reader;return void 0!==r&&!1!==IsReadableStreamDefaultReader(r)}function IsReadableStreamBYOBReader(e){return!!typeIsObject(e)&&!!Object.prototype.hasOwnProperty.call(e,"_readIntoRequests")}function IsReadableStreamDefaultReader(e){return!!typeIsObject(e)&&!!Object.prototype.hasOwnProperty.call(e,"_readRequests")}function ReadableStreamReaderGenericInitialize(e,r){e._ownerReadableStream=r,r._reader=e,"readable"===r._state?defaultReaderClosedPromiseInitialize(e):"closed"===r._state?defaultReaderClosedPromiseInitializeAsResolved(e):(defaultReaderClosedPromiseInitializeAsRejected(e,r._storedError),e._closedPromise.catch(function(){}))}function ReadableStreamReaderGenericCancel(e,r){return ReadableStreamCancel(e._ownerReadableStream,r)}function ReadableStreamReaderGenericRelease(e){"readable"===e._ownerReadableStream._state?defaultReaderClosedPromiseReject(e,new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")):defaultReaderClosedPromiseResetToRejected(e,new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")),e._closedPromise.catch(function(){}),e._ownerReadableStream._reader=void 0,e._ownerReadableStream=void 0}function ReadableStreamBYOBReaderRead(e,r){var t=e._ownerReadableStream;return t._disturbed=!0,"errored"===t._state?Promise.reject(t._storedError):ReadableByteStreamControllerPullInto(t._readableStreamController,r)}function ReadableStreamDefaultReaderRead(e){var r=e._ownerReadableStream;return r._disturbed=!0,"closed"===r._state?Promise.resolve(CreateIterResultObject(void 0,!0)):"errored"===r._state?Promise.reject(r._storedError):r._readableStreamController[PullSteps]()}function IsReadableStreamDefaultController(e){return!!typeIsObject(e)&&!!Object.prototype.hasOwnProperty.call(e,"_controlledReadableStream")}function ReadableStreamDefaultControllerCallPullIfNeeded(e){!1!==ReadableStreamDefaultControllerShouldCallPull(e)&&(!0!==e._pulling?(e._pulling=!0,e._pullAlgorithm().then(function(){if(e._pulling=!1,!0===e._pullAgain)return e._pullAgain=!1,ReadableStreamDefaultControllerCallPullIfNeeded(e)},function(r){ReadableStreamDefaultControllerErrorIfNeeded(e,r)}).catch(rethrowAssertionErrorRejection)):e._pullAgain=!0)}function ReadableStreamDefaultControllerShouldCallPull(e){var r=e._controlledReadableStream;return!1!==ReadableStreamDefaultControllerCanCloseOrEnqueue(e)&&(!1!==e._started&&(!0===IsReadableStreamLocked(r)&&ReadableStreamGetNumReadRequests(r)>0||ReadableStreamDefaultControllerGetDesiredSize(e)>0))}function ReadableStreamDefaultControllerClose(e){var r=e._controlledReadableStream;e._closeRequested=!0,0===e._queue.length&&ReadableStreamClose(r)}function ReadableStreamDefaultControllerEnqueue(e,r){var t=e._controlledReadableStream;if(!0===IsReadableStreamLocked(t)&&ReadableStreamGetNumReadRequests(t)>0)ReadableStreamFulfillReadRequest(t,r,!1);else{var a=void 0;try{a=e._strategySizeAlgorithm(r)}catch(r){throw ReadableStreamDefaultControllerErrorIfNeeded(e,r),r}try{EnqueueValueWithSize(e,r,a)}catch(r){throw ReadableStreamDefaultControllerErrorIfNeeded(e,r),r}}ReadableStreamDefaultControllerCallPullIfNeeded(e)}function ReadableStreamDefaultControllerError(e,r){var t=e._controlledReadableStream;ResetQueue(e),ReadableStreamError(t,r)}function ReadableStreamDefaultControllerErrorIfNeeded(e,r){"readable"===e._controlledReadableStream._state&&ReadableStreamDefaultControllerError(e,r)}function ReadableStreamDefaultControllerGetDesiredSize(e){var r=e._controlledReadableStream._state;return"errored"===r?null:"closed"===r?0:e._strategyHWM-e._queueTotalSize}function ReadableStreamDefaultControllerHasBackpressure(e){return!0!==ReadableStreamDefaultControllerShouldCallPull(e)}function ReadableStreamDefaultControllerCanCloseOrEnqueue(e){var r=e._controlledReadableStream._state;return!1===e._closeRequested&&"readable"===r}function SetUpReadableStreamDefaultController(e,r,t,a,l,o,n){r._controlledReadableStream=e,r._queue=void 0,r._queueTotalSize=void 0,ResetQueue(r),r._started=!1,r._closeRequested=!1,r._pullAgain=!1,r._pulling=!1,r._strategySizeAlgorithm=n,r._strategyHWM=o,r._pullAlgorithm=a,r._cancelAlgorithm=l,e._readableStreamController=r;var i=t();Promise.resolve(i).then(function(){r._started=!0,ReadableStreamDefaultControllerCallPullIfNeeded(r)},function(e){ReadableStreamDefaultControllerErrorIfNeeded(r,e)}).catch(rethrowAssertionErrorRejection)}function SetUpReadableStreamDefaultControllerFromUnderlyingSource(e,r,t,a){var l=Object.create(ReadableStreamDefaultController.prototype),o=CreateAlgorithmFromUnderlyingMethod(r,"pull",0,[l]),n=CreateAlgorithmFromUnderlyingMethod(r,"cancel",1,[]);SetUpReadableStreamDefaultController(e,l,function startAlgorithm(){return InvokeOrNoop(r,"start",[l])},o,n,t,a)}function IsReadableByteStreamController(e){return!!typeIsObject(e)&&!!Object.prototype.hasOwnProperty.call(e,"_controlledReadableByteStream")}function IsReadableStreamBYOBRequest(e){return!!typeIsObject(e)&&!!Object.prototype.hasOwnProperty.call(e,"_associatedReadableByteStreamController")}function ReadableByteStreamControllerCallPullIfNeeded(e){!1!==ReadableByteStreamControllerShouldCallPull(e)&&(!0!==e._pulling?(e._pulling=!0,e._pullAlgorithm().then(function(){e._pulling=!1,!0===e._pullAgain&&(e._pullAgain=!1,ReadableByteStreamControllerCallPullIfNeeded(e))},function(r){"readable"===e._controlledReadableByteStream._state&&ReadableByteStreamControllerError(e,r)}).catch(rethrowAssertionErrorRejection)):e._pullAgain=!0)}function ReadableByteStreamControllerClearPendingPullIntos(e){ReadableByteStreamControllerInvalidateBYOBRequest(e),e._pendingPullIntos=[]}function ReadableByteStreamControllerCommitPullIntoDescriptor(e,r){var t=!1;"closed"===e._state&&(t=!0);var a=ReadableByteStreamControllerConvertPullIntoDescriptor(r);"default"===r.readerType?ReadableStreamFulfillReadRequest(e,a,t):ReadableStreamFulfillReadIntoRequest(e,a,t)}function ReadableByteStreamControllerConvertPullIntoDescriptor(e){var r=e.bytesFilled,t=e.elementSize;return new e.ctor(e.buffer,e.byteOffset,r/t)}function ReadableByteStreamControllerEnqueueChunkToQueue(e,r,t,a){e._queue.push({buffer:r,byteOffset:t,byteLength:a}),e._queueTotalSize+=a}function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(e,r){var t=r.elementSize,a=r.bytesFilled-r.bytesFilled%t,l=Math.min(e._queueTotalSize,r.byteLength-r.bytesFilled),o=r.bytesFilled+l,n=o-o%t,i=l,d=!1;n>a&&(i=n-r.bytesFilled,d=!0);for(var s=e._queue;i>0;){var u=s[0],c=Math.min(i,u.byteLength),b=r.byteOffset+r.bytesFilled;ArrayBufferCopy(r.buffer,b,u.buffer,u.byteOffset,c),u.byteLength===c?s.shift():(u.byteOffset+=c,u.byteLength-=c),e._queueTotalSize-=c,ReadableByteStreamControllerFillHeadPullIntoDescriptor(e,c,r),i-=c}return d}function ReadableByteStreamControllerFillHeadPullIntoDescriptor(e,r,t){ReadableByteStreamControllerInvalidateBYOBRequest(e),t.bytesFilled+=r}function ReadableByteStreamControllerHandleQueueDrain(e){0===e._queueTotalSize&&!0===e._closeRequested?ReadableStreamClose(e._controlledReadableByteStream):ReadableByteStreamControllerCallPullIfNeeded(e)}function ReadableByteStreamControllerInvalidateBYOBRequest(e){void 0!==e._byobRequest&&(e._byobRequest._associatedReadableByteStreamController=void 0,e._byobRequest._view=void 0,e._byobRequest=void 0)}function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(e){for(;e._pendingPullIntos.length>0;){if(0===e._queueTotalSize)return;var r=e._pendingPullIntos[0];!0===ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(e,r)&&(ReadableByteStreamControllerShiftPendingPullInto(e),ReadableByteStreamControllerCommitPullIntoDescriptor(e._controlledReadableByteStream,r))}}function ReadableByteStreamControllerPullInto(e,r){var t=e._controlledReadableByteStream,a=1;r.constructor!==DataView&&(a=r.constructor.BYTES_PER_ELEMENT);var l=r.constructor,o={buffer:TransferArrayBuffer(r.buffer),byteOffset:r.byteOffset,byteLength:r.byteLength,bytesFilled:0,elementSize:a,ctor:l,readerType:"byob"};if(e._pendingPullIntos.length>0)return e._pendingPullIntos.push(o),ReadableStreamAddReadIntoRequest(t);if("closed"===t._state){var n=new r.constructor(o.buffer,o.byteOffset,0);return Promise.resolve(CreateIterResultObject(n,!0))}if(e._queueTotalSize>0){if(!0===ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(e,o)){var i=ReadableByteStreamControllerConvertPullIntoDescriptor(o);return ReadableByteStreamControllerHandleQueueDrain(e),Promise.resolve(CreateIterResultObject(i,!1))}if(!0===e._closeRequested){var d=new TypeError("Insufficient bytes to fill elements in the given buffer");return ReadableByteStreamControllerError(e,d),Promise.reject(d)}}e._pendingPullIntos.push(o);var s=ReadableStreamAddReadIntoRequest(t);return ReadableByteStreamControllerCallPullIfNeeded(e),s}function ReadableByteStreamControllerRespondInClosedState(e,r){r.buffer=TransferArrayBuffer(r.buffer);var t=e._controlledReadableByteStream;if(!0===ReadableStreamHasBYOBReader(t))for(;ReadableStreamGetNumReadIntoRequests(t)>0;)ReadableByteStreamControllerCommitPullIntoDescriptor(t,ReadableByteStreamControllerShiftPendingPullInto(e))}function ReadableByteStreamControllerRespondInReadableState(e,r,t){if(t.bytesFilled+r>t.byteLength)throw new RangeError("bytesWritten out of range");if(ReadableByteStreamControllerFillHeadPullIntoDescriptor(e,r,t),!(t.bytesFilled<t.elementSize)){ReadableByteStreamControllerShiftPendingPullInto(e);var a=t.bytesFilled%t.elementSize;if(a>0){var l=t.byteOffset+t.bytesFilled,o=t.buffer.slice(l-a,l);ReadableByteStreamControllerEnqueueChunkToQueue(e,o,0,o.byteLength)}t.buffer=TransferArrayBuffer(t.buffer),t.bytesFilled-=a,ReadableByteStreamControllerCommitPullIntoDescriptor(e._controlledReadableByteStream,t),ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(e)}}function ReadableByteStreamControllerRespondInternal(e,r){var t=e._pendingPullIntos[0];if("closed"===e._controlledReadableByteStream._state){if(0!==r)throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");ReadableByteStreamControllerRespondInClosedState(e,t)}else ReadableByteStreamControllerRespondInReadableState(e,r,t)}function ReadableByteStreamControllerShiftPendingPullInto(e){var r=e._pendingPullIntos.shift();return ReadableByteStreamControllerInvalidateBYOBRequest(e),r}function ReadableByteStreamControllerShouldCallPull(e){var r=e._controlledReadableByteStream;return"readable"===r._state&&(!0!==e._closeRequested&&(!1!==e._started&&(!0===ReadableStreamHasDefaultReader(r)&&ReadableStreamGetNumReadRequests(r)>0||(!0===ReadableStreamHasBYOBReader(r)&&ReadableStreamGetNumReadIntoRequests(r)>0||ReadableByteStreamControllerGetDesiredSize(e)>0))))}function ReadableByteStreamControllerClose(e){var r=e._controlledReadableByteStream;if(e._queueTotalSize>0)e._closeRequested=!0;else{if(e._pendingPullIntos.length>0&&e._pendingPullIntos[0].bytesFilled>0){var t=new TypeError("Insufficient bytes to fill elements in the given buffer");throw ReadableByteStreamControllerError(e,t),t}ReadableStreamClose(r)}}function ReadableByteStreamControllerEnqueue(e,r){var t=e._controlledReadableByteStream,a=r.buffer,l=r.byteOffset,o=r.byteLength,n=TransferArrayBuffer(a);!0===ReadableStreamHasDefaultReader(t)?0===ReadableStreamGetNumReadRequests(t)?ReadableByteStreamControllerEnqueueChunkToQueue(e,n,l,o):ReadableStreamFulfillReadRequest(t,new Uint8Array(n,l,o),!1):!0===ReadableStreamHasBYOBReader(t)?(ReadableByteStreamControllerEnqueueChunkToQueue(e,n,l,o),ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(e)):ReadableByteStreamControllerEnqueueChunkToQueue(e,n,l,o)}function ReadableByteStreamControllerError(e,r){var t=e._controlledReadableByteStream;ReadableByteStreamControllerClearPendingPullIntos(e),ResetQueue(e),ReadableStreamError(t,r)}function ReadableByteStreamControllerGetDesiredSize(e){var r=e._controlledReadableByteStream._state;return"errored"===r?null:"closed"===r?0:e._strategyHWM-e._queueTotalSize}function ReadableByteStreamControllerRespond(e,r){if(r=Number(r),!1===IsFiniteNonNegativeNumber(r))throw new RangeError("bytesWritten must be a finite");ReadableByteStreamControllerRespondInternal(e,r)}function ReadableByteStreamControllerRespondWithNewView(e,r){var t=e._pendingPullIntos[0];if(t.byteOffset+t.bytesFilled!==r.byteOffset)throw new RangeError("The region specified by view does not match byobRequest");if(t.byteLength!==r.byteLength)throw new RangeError("The buffer of view has different capacity than byobRequest");t.buffer=r.buffer,ReadableByteStreamControllerRespondInternal(e,r.byteLength)}function SetUpReadableByteStreamController(e,r,t,a,l,o,n){r._controlledReadableByteStream=e,r._pullAgain=!1,r._pulling=!1,ReadableByteStreamControllerClearPendingPullIntos(r),r._queue=r._queueTotalSize=void 0,ResetQueue(r),r._closeRequested=!1,r._started=!1,r._strategyHWM=ValidateAndNormalizeHighWaterMark(o),r._pullAlgorithm=a,r._cancelAlgorithm=l,r._autoAllocateChunkSize=n,r._pendingPullIntos=[],e._readableStreamController=r;var i=t();Promise.resolve(i).then(function(){r._started=!0,ReadableByteStreamControllerCallPullIfNeeded(r)},function(t){"readable"===e._state&&ReadableByteStreamControllerError(r,t)}).catch(rethrowAssertionErrorRejection)}function SetUpReadableByteStreamControllerFromUnderlyingSource(e,r,t){var a=Object.create(ReadableByteStreamController.prototype),l=CreateAlgorithmFromUnderlyingMethod(r,"pull",0,[a]),o=CreateAlgorithmFromUnderlyingMethod(r,"cancel",1,[]),n=r.autoAllocateChunkSize;if(void 0!==n&&(!1===Number.isInteger(n)||n<=0))throw new RangeError("autoAllocateChunkSize must be a positive integer");SetUpReadableByteStreamController(e,a,function startAlgorithm(){return InvokeOrNoop(r,"start",[a])},l,o,t,n)}function SetUpReadableStreamBYOBRequest(e,r,t){e._associatedReadableByteStreamController=r,e._view=t}function streamBrandCheckException(e){return new TypeError("ReadableStream.prototype."+e+" can only be used on a ReadableStream")}function readerLockException(e){return new TypeError("Cannot "+e+" a stream using a released reader")}function defaultReaderBrandCheckException(e){return new TypeError("ReadableStreamDefaultReader.prototype."+e+" can only be used on a ReadableStreamDefaultReader")}function defaultReaderClosedPromiseInitialize(e){e._closedPromise=new Promise(function(r,t){e._closedPromise_resolve=r,e._closedPromise_reject=t})}function defaultReaderClosedPromiseInitializeAsRejected(e,r){e._closedPromise=Promise.reject(r),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0}function defaultReaderClosedPromiseInitializeAsResolved(e){e._closedPromise=Promise.resolve(void 0),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0}function defaultReaderClosedPromiseReject(e,r){e._closedPromise_reject(r),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0}function defaultReaderClosedPromiseResetToRejected(e,r){e._closedPromise=Promise.reject(r)}function defaultReaderClosedPromiseResolve(e){e._closedPromise_resolve(void 0),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0}function byobReaderBrandCheckException(e){return new TypeError("ReadableStreamBYOBReader.prototype."+e+" can only be used on a ReadableStreamBYOBReader")}function defaultControllerBrandCheckException(e){return new TypeError("ReadableStreamDefaultController.prototype."+e+" can only be used on a ReadableStreamDefaultController")}function byobRequestBrandCheckException(e){return new TypeError("ReadableStreamBYOBRequest.prototype."+e+" can only be used on a ReadableStreamBYOBRequest")}function byteStreamControllerBrandCheckException(e){return new TypeError("ReadableByteStreamController.prototype."+e+" can only be used on a ReadableByteStreamController")}function ifIsObjectAndHasAPromiseIsHandledInternalSlotSetPromiseIsHandledToTrue(e){try{Promise.prototype.then.call(e,void 0,function(){})}catch(e){}}var _createClass=function(){function defineProperties(e,r){for(var t=0;t<r.length;t++){var a=r[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(e,r,t){return r&&defineProperties(e.prototype,r),t&&defineProperties(e,t),e}}(),assert=_dereq_("better-assert"),_require=_dereq_("./helpers.js"),ArrayBufferCopy=_require.ArrayBufferCopy,CreateAlgorithmFromUnderlyingMethod=_require.CreateAlgorithmFromUnderlyingMethod,CreateIterResultObject=_require.CreateIterResultObject,IsFiniteNonNegativeNumber=_require.IsFiniteNonNegativeNumber,InvokeOrNoop=_require.InvokeOrNoop,IsDetachedBuffer=_require.IsDetachedBuffer,TransferArrayBuffer=_require.TransferArrayBuffer,ValidateAndNormalizeHighWaterMark=_require.ValidateAndNormalizeHighWaterMark,IsNonNegativeNumber=_require.IsNonNegativeNumber,MakeSizeAlgorithmFromSizeFunction=_require.MakeSizeAlgorithmFromSizeFunction,createArrayFromList=_require.createArrayFromList,typeIsObject=_require.typeIsObject,_require2=_dereq_("./utils.js"),rethrowAssertionErrorRejection=_require2.rethrowAssertionErrorRejection,_require3=_dereq_("./queue-with-sizes.js"),DequeueValue=_require3.DequeueValue,EnqueueValueWithSize=_require3.EnqueueValueWithSize,ResetQueue=_require3.ResetQueue,_require4=_dereq_("./writable-stream.js"),AcquireWritableStreamDefaultWriter=_require4.AcquireWritableStreamDefaultWriter,IsWritableStream=_require4.IsWritableStream,IsWritableStreamLocked=_require4.IsWritableStreamLocked,WritableStreamAbort=_require4.WritableStreamAbort,WritableStreamDefaultWriterCloseWithErrorPropagation=_require4.WritableStreamDefaultWriterCloseWithErrorPropagation,WritableStreamDefaultWriterRelease=_require4.WritableStreamDefaultWriterRelease,WritableStreamDefaultWriterWrite=_require4.WritableStreamDefaultWriterWrite,WritableStreamCloseQueuedOrInFlight=_require4.WritableStreamCloseQueuedOrInFlight,CancelSteps=Symbol("[[CancelSteps]]"),PullSteps=Symbol("[[PullSteps]]"),ReadableStream=function(){function ReadableStream(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=r.size,a=r.highWaterMark;_classCallCheck(this,ReadableStream),InitializeReadableStream(this);var l=e.type;if("bytes"===String(l)){if(void 0===a&&(a=0),a=ValidateAndNormalizeHighWaterMark(a),void 0!==t)throw new RangeError("The strategy for a byte stream cannot have a size function");SetUpReadableByteStreamControllerFromUnderlyingSource(this,e,a)}else{if(void 0!==l)throw new RangeError("Invalid type is specified");void 0===a&&(a=1),SetUpReadableStreamDefaultControllerFromUnderlyingSource(this,e,a=ValidateAndNormalizeHighWaterMark(a),MakeSizeAlgorithmFromSizeFunction(t))}}return _createClass(ReadableStream,[{key:"cancel",value:function cancel(e){return!1===IsReadableStream(this)?Promise.reject(streamBrandCheckException("cancel")):!0===IsReadableStreamLocked(this)?Promise.reject(new TypeError("Cannot cancel a stream that already has a reader")):ReadableStreamCancel(this,e)}},{key:"getReader",value:function getReader(){var e=(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}).mode;if(!1===IsReadableStream(this))throw streamBrandCheckException("getReader");if(void 0===e)return AcquireReadableStreamDefaultReader(this);if("byob"===(e=String(e)))return AcquireReadableStreamBYOBReader(this);throw new RangeError("Invalid mode is specified")}},{key:"pipeThrough",value:function pipeThrough(e,r){var t=e.writable,a=e.readable;if(void 0===t||void 0===a)throw new TypeError("readable and writable arguments must be defined");return ifIsObjectAndHasAPromiseIsHandledInternalSlotSetPromiseIsHandledToTrue(this.pipeTo(t,r)),a}},{key:"pipeTo",value:function pipeTo(e){var r=this,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=t.preventClose,l=t.preventAbort,o=t.preventCancel;if(!1===IsReadableStream(this))return Promise.reject(streamBrandCheckException("pipeTo"));if(!1===IsWritableStream(e))return Promise.reject(new TypeError("ReadableStream.prototype.pipeTo's first argument must be a WritableStream"));if(a=Boolean(a),l=Boolean(l),o=Boolean(o),!0===IsReadableStreamLocked(this))return Promise.reject(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));if(!0===IsWritableStreamLocked(e))return Promise.reject(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));var n=AcquireReadableStreamDefaultReader(this),i=AcquireWritableStreamDefaultWriter(e),d=!1,s=Promise.resolve();return new Promise(function(t,u){function pipeLoop(){return!0===d?Promise.resolve():i._readyPromise.then(function(){return ReadableStreamDefaultReaderRead(n).then(function(e){var r=e.value;!0!==e.done&&(s=WritableStreamDefaultWriterWrite(i,r).catch(function(){}))})}).then(pipeLoop)}function waitForWritesToFinish(){var e=s;return s.then(function(){return e!==s?waitForWritesToFinish():void 0})}function isOrBecomesErrored(e,r,t){"errored"===e._state?t(e._storedError):r.catch(t).catch(rethrowAssertionErrorRejection)}function shutdownWithAction(r,t,a){function doTheRest(){r().then(function(){return finalize(t,a)},function(e){return finalize(!0,e)}).catch(rethrowAssertionErrorRejection)}!0!==d&&(d=!0,"writable"===e._state&&!1===WritableStreamCloseQueuedOrInFlight(e)?waitForWritesToFinish().then(doTheRest):doTheRest())}function shutdown(r,t){!0!==d&&(d=!0,"writable"===e._state&&!1===WritableStreamCloseQueuedOrInFlight(e)?waitForWritesToFinish().then(function(){return finalize(r,t)}).catch(rethrowAssertionErrorRejection):finalize(r,t))}function finalize(e,r){WritableStreamDefaultWriterRelease(i),ReadableStreamReaderGenericRelease(n),e?u(r):t(void 0)}if(isOrBecomesErrored(r,n._closedPromise,function(r){!1===l?shutdownWithAction(function(){return WritableStreamAbort(e,r)},!0,r):shutdown(!0,r)}),isOrBecomesErrored(e,i._closedPromise,function(e){!1===o?shutdownWithAction(function(){return ReadableStreamCancel(r,e)},!0,e):shutdown(!0,e)}),function isOrBecomesClosed(e,r,t){"closed"===e._state?t():r.then(t).catch(rethrowAssertionErrorRejection)}(r,n._closedPromise,function(){!1===a?shutdownWithAction(function(){return WritableStreamDefaultWriterCloseWithErrorPropagation(i)}):shutdown()}),!0===WritableStreamCloseQueuedOrInFlight(e)||"closed"===e._state){var c=new TypeError("the destination writable stream closed before all data could be piped to it");!1===o?shutdownWithAction(function(){return ReadableStreamCancel(r,c)},!0,c):shutdown(!0,c)}pipeLoop().catch(function(e){s=Promise.resolve(),rethrowAssertionErrorRejection(e)})})}},{key:"tee",value:function tee(){if(!1===IsReadableStream(this))throw streamBrandCheckException("tee");var e=ReadableStreamTee(this,!1);return createArrayFromList(e)}},{key:"locked",get:function get(){if(!1===IsReadableStream(this))throw streamBrandCheckException("locked");return IsReadableStreamLocked(this)}}]),ReadableStream}();module.exports={CreateReadableByteStream:CreateReadableByteStream,CreateReadableStream:CreateReadableStream,ReadableStream:ReadableStream,IsReadableStreamDisturbed:IsReadableStreamDisturbed,ReadableStreamDefaultControllerClose:ReadableStreamDefaultControllerClose,ReadableStreamDefaultControllerEnqueue:ReadableStreamDefaultControllerEnqueue,ReadableStreamDefaultControllerError:ReadableStreamDefaultControllerError,ReadableStreamDefaultControllerGetDesiredSize:ReadableStreamDefaultControllerGetDesiredSize,ReadableStreamDefaultControllerHasBackpressure:ReadableStreamDefaultControllerHasBackpressure,ReadableStreamDefaultControllerCanCloseOrEnqueue:ReadableStreamDefaultControllerCanCloseOrEnqueue};var ReadableStreamDefaultReader=function(){function ReadableStreamDefaultReader(e){if(_classCallCheck(this,ReadableStreamDefaultReader),!1===IsReadableStream(e))throw new TypeError("ReadableStreamDefaultReader can only be constructed with a ReadableStream instance");if(!0===IsReadableStreamLocked(e))throw new TypeError("This stream has already been locked for exclusive reading by another reader");ReadableStreamReaderGenericInitialize(this,e),this._readRequests=[]}return _createClass(ReadableStreamDefaultReader,[{key:"cancel",value:function cancel(e){return!1===IsReadableStreamDefaultReader(this)?Promise.reject(defaultReaderBrandCheckException("cancel")):void 0===this._ownerReadableStream?Promise.reject(readerLockException("cancel")):ReadableStreamReaderGenericCancel(this,e)}},{key:"read",value:function read(){return!1===IsReadableStreamDefaultReader(this)?Promise.reject(defaultReaderBrandCheckException("read")):void 0===this._ownerReadableStream?Promise.reject(readerLockException("read from")):ReadableStreamDefaultReaderRead(this)}},{key:"releaseLock",value:function releaseLock(){if(!1===IsReadableStreamDefaultReader(this))throw defaultReaderBrandCheckException("releaseLock");if(void 0!==this._ownerReadableStream){if(this._readRequests.length>0)throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");ReadableStreamReaderGenericRelease(this)}}},{key:"closed",get:function get(){return!1===IsReadableStreamDefaultReader(this)?Promise.reject(defaultReaderBrandCheckException("closed")):this._closedPromise}}]),ReadableStreamDefaultReader}(),ReadableStreamBYOBReader=function(){function ReadableStreamBYOBReader(e){if(_classCallCheck(this,ReadableStreamBYOBReader),!IsReadableStream(e))throw new TypeError("ReadableStreamBYOBReader can only be constructed with a ReadableStream instance given a byte source");if(!1===IsReadableByteStreamController(e._readableStreamController))throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");if(IsReadableStreamLocked(e))throw new TypeError("This stream has already been locked for exclusive reading by another reader");ReadableStreamReaderGenericInitialize(this,e),this._readIntoRequests=[]}return _createClass(ReadableStreamBYOBReader,[{key:"cancel",value:function cancel(e){return IsReadableStreamBYOBReader(this)?void 0===this._ownerReadableStream?Promise.reject(readerLockException("cancel")):ReadableStreamReaderGenericCancel(this,e):Promise.reject(byobReaderBrandCheckException("cancel"))}},{key:"read",value:function read(e){return IsReadableStreamBYOBReader(this)?void 0===this._ownerReadableStream?Promise.reject(readerLockException("read from")):ArrayBuffer.isView(e)?!0===IsDetachedBuffer(e.buffer)?Promise.reject(new TypeError("Cannot read into a view onto a detached ArrayBuffer")):0===e.byteLength?Promise.reject(new TypeError("view must have non-zero byteLength")):ReadableStreamBYOBReaderRead(this,e):Promise.reject(new TypeError("view must be an array buffer view")):Promise.reject(byobReaderBrandCheckException("read"))}},{key:"releaseLock",value:function releaseLock(){if(!IsReadableStreamBYOBReader(this))throw byobReaderBrandCheckException("releaseLock");if(void 0!==this._ownerReadableStream){if(this._readIntoRequests.length>0)throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");ReadableStreamReaderGenericRelease(this)}}},{key:"closed",get:function get(){return IsReadableStreamBYOBReader(this)?this._closedPromise:Promise.reject(byobReaderBrandCheckException("closed"))}}]),ReadableStreamBYOBReader}(),ReadableStreamDefaultController=function(){function ReadableStreamDefaultController(){throw _classCallCheck(this,ReadableStreamDefaultController),new TypeError}return _createClass(ReadableStreamDefaultController,[{key:"close",value:function close(){if(!1===IsReadableStreamDefaultController(this))throw defaultControllerBrandCheckException("close");if(!1===ReadableStreamDefaultControllerCanCloseOrEnqueue(this))throw new TypeError("The stream is not in a state that permits close");ReadableStreamDefaultControllerClose(this)}},{key:"enqueue",value:function enqueue(e){if(!1===IsReadableStreamDefaultController(this))throw defaultControllerBrandCheckException("enqueue");if(!1===ReadableStreamDefaultControllerCanCloseOrEnqueue(this))throw new TypeError("The stream is not in a state that permits enqueue");return ReadableStreamDefaultControllerEnqueue(this,e)}},{key:"error",value:function error(e){if(!1===IsReadableStreamDefaultController(this))throw defaultControllerBrandCheckException("error");var r=this._controlledReadableStream;if("readable"!==r._state)throw new TypeError("The stream is "+r._state+" and so cannot be errored");ReadableStreamDefaultControllerError(this,e)}},{key:CancelSteps,value:function value(e){return ResetQueue(this),this._cancelAlgorithm(e)}},{key:PullSteps,value:function value(){var e=this._controlledReadableStream;if(this._queue.length>0){var r=DequeueValue(this);return!0===this._closeRequested&&0===this._queue.length?ReadableStreamClose(e):ReadableStreamDefaultControllerCallPullIfNeeded(this),Promise.resolve(CreateIterResultObject(r,!1))}var t=ReadableStreamAddReadRequest(e);return ReadableStreamDefaultControllerCallPullIfNeeded(this),t}},{key:"desiredSize",get:function get(){if(!1===IsReadableStreamDefaultController(this))throw defaultControllerBrandCheckException("desiredSize");return ReadableStreamDefaultControllerGetDesiredSize(this)}}]),ReadableStreamDefaultController}(),ReadableStreamBYOBRequest=function(){function ReadableStreamBYOBRequest(){throw _classCallCheck(this,ReadableStreamBYOBRequest),new TypeError("ReadableStreamBYOBRequest cannot be used directly")}return _createClass(ReadableStreamBYOBRequest,[{key:"respond",value:function respond(e){if(!1===IsReadableStreamBYOBRequest(this))throw byobRequestBrandCheckException("respond");if(void 0===this._associatedReadableByteStreamController)throw new TypeError("This BYOB request has been invalidated");if(!0===IsDetachedBuffer(this._view.buffer))throw new TypeError("The BYOB request's buffer has been detached and so cannot be used as a response");ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController,e)}},{key:"respondWithNewView",value:function respondWithNewView(e){if(!1===IsReadableStreamBYOBRequest(this))throw byobRequestBrandCheckException("respond");if(void 0===this._associatedReadableByteStreamController)throw new TypeError("This BYOB request has been invalidated");if(!ArrayBuffer.isView(e))throw new TypeError("You can only respond with array buffer views");if(!0===IsDetachedBuffer(e.buffer))throw new TypeError("The supplied view's buffer has been detached and so cannot be used as a response");ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController,e)}},{key:"view",get:function get(){if(!1===IsReadableStreamBYOBRequest(this))throw byobRequestBrandCheckException("view");return this._view}}]),ReadableStreamBYOBRequest}(),ReadableByteStreamController=function(){function ReadableByteStreamController(){throw _classCallCheck(this,ReadableByteStreamController),new TypeError("ReadableByteStreamController constructor cannot be used directly")}return _createClass(ReadableByteStreamController,[{key:"close",value:function close(){if(!1===IsReadableByteStreamController(this))throw byteStreamControllerBrandCheckException("close");if(!0===this._closeRequested)throw new TypeError("The stream has already been closed; do not close it again!");var e=this._controlledReadableByteStream._state;if("readable"!==e)throw new TypeError("The stream (in "+e+" state) is not in the readable state and cannot be closed");ReadableByteStreamControllerClose(this)}},{key:"enqueue",value:function enqueue(e){if(!1===IsReadableByteStreamController(this))throw byteStreamControllerBrandCheckException("enqueue");if(!0===this._closeRequested)throw new TypeError("stream is closed or draining");var r=this._controlledReadableByteStream._state;if("readable"!==r)throw new TypeError("The stream (in "+r+" state) is not in the readable state and cannot be enqueued to");if(!ArrayBuffer.isView(e))throw new TypeError("You can only enqueue array buffer views when using a ReadableByteStreamController");if(!0===IsDetachedBuffer(e.buffer))throw new TypeError("Cannot enqueue a view onto a detached ArrayBuffer");ReadableByteStreamControllerEnqueue(this,e)}},{key:"error",value:function error(e){if(!1===IsReadableByteStreamController(this))throw byteStreamControllerBrandCheckException("error");var r=this._controlledReadableByteStream;if("readable"!==r._state)throw new TypeError("The stream is "+r._state+" and so cannot be errored");ReadableByteStreamControllerError(this,e)}},{key:CancelSteps,value:function value(e){return this._pendingPullIntos.length>0&&(this._pendingPullIntos[0].bytesFilled=0),ResetQueue(this),this._cancelAlgorithm(e)}},{key:PullSteps,value:function value(){var e=this._controlledReadableByteStream;if(this._queueTotalSize>0){var r=this._queue.shift();this._queueTotalSize-=r.byteLength,ReadableByteStreamControllerHandleQueueDrain(this);var t=void 0;try{t=new Uint8Array(r.buffer,r.byteOffset,r.byteLength)}catch(e){return Promise.reject(e)}return Promise.resolve(CreateIterResultObject(t,!1))}var a=this._autoAllocateChunkSize;if(void 0!==a){var l=void 0;try{l=new ArrayBuffer(a)}catch(e){return Promise.reject(e)}var o={buffer:l,byteOffset:0,byteLength:a,bytesFilled:0,elementSize:1,ctor:Uint8Array,readerType:"default"};this._pendingPullIntos.push(o)}var n=ReadableStreamAddReadRequest(e);return ReadableByteStreamControllerCallPullIfNeeded(this),n}},{key:"byobRequest",get:function get(){if(!1===IsReadableByteStreamController(this))throw byteStreamControllerBrandCheckException("byobRequest");if(void 0===this._byobRequest&&this._pendingPullIntos.length>0){var e=this._pendingPullIntos[0],r=new Uint8Array(e.buffer,e.byteOffset+e.bytesFilled,e.byteLength-e.bytesFilled),t=Object.create(ReadableStreamBYOBRequest.prototype);SetUpReadableStreamBYOBRequest(t,this,r),this._byobRequest=t}return this._byobRequest}},{key:"desiredSize",get:function get(){if(!1===IsReadableByteStreamController(this))throw byteStreamControllerBrandCheckException("desiredSize");return ReadableByteStreamControllerGetDesiredSize(this)}}]),ReadableByteStreamController}();

},{"./helpers.js":10,"./queue-with-sizes.js":11,"./utils.js":14,"./writable-stream.js":15,"better-assert":16}],13:[function(_dereq_,module,exports){
"use strict";function _classCallCheck(r,e){if(!(r instanceof e))throw new TypeError("Cannot call a class as a function")}function CreateTransformStream(r,e,t){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1,o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:function(){return 1},n=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,l=arguments.length>6&&void 0!==arguments[6]?arguments[6]:function(){return 1},i=Object.create(TransformStream.prototype),m=void 0;InitializeTransformStream(i,new Promise(function(r){m=r}),a,o,n,l),SetUpTransformStreamDefaultController(i,Object.create(TransformStreamDefaultController.prototype),e,t);var s=r();return m(s),i}function InitializeTransformStream(r,e,t,a,o,n){function startAlgorithm(){return e}r._writable=CreateWritableStream(startAlgorithm,function writeAlgorithm(e){return TransformStreamDefaultSinkWriteAlgorithm(r,e)},function closeAlgorithm(){return TransformStreamDefaultSinkCloseAlgorithm(r)},function abortAlgorithm(){return TransformStreamDefaultSinkAbortAlgorithm(r)},t,a),r._readable=CreateReadableStream(startAlgorithm,function pullAlgorithm(){return TransformStreamDefaultSourcePullAlgorithm(r)},function cancelAlgorithm(e){return TransformStreamErrorWritableAndUnblockWrite(r,e),Promise.resolve()},o,n),r._backpressure=void 0,r._backpressureChangePromise=void 0,r._backpressureChangePromise_resolve=void 0,TransformStreamSetBackpressure(r,!0),r._transformStreamController=void 0}function IsTransformStream(r){return!!typeIsObject(r)&&!!Object.prototype.hasOwnProperty.call(r,"_transformStreamController")}function TransformStreamError(r,e){verbose("TransformStreamError()"),"readable"===r._readable._state&&ReadableStreamDefaultControllerError(r._readable._readableStreamController,e),TransformStreamErrorWritableAndUnblockWrite(r,e)}function TransformStreamErrorWritableAndUnblockWrite(r,e){WritableStreamDefaultControllerErrorIfNeeded(r._writable._writableStreamController,e),!0===r._backpressure&&TransformStreamSetBackpressure(r,!1)}function TransformStreamSetBackpressure(r,e){verbose("TransformStreamSetBackpressure() [backpressure = "+e+"]"),void 0!==r._backpressureChangePromise&&r._backpressureChangePromise_resolve(),r._backpressureChangePromise=new Promise(function(e){r._backpressureChangePromise_resolve=e}),r._backpressure=e}function IsTransformStreamDefaultController(r){return!!typeIsObject(r)&&!!Object.prototype.hasOwnProperty.call(r,"_controlledTransformStream")}function SetUpTransformStreamDefaultController(r,e,t,a){e._controlledTransformStream=r,r._transformStreamController=e,e._transformAlgorithm=t,e._flushAlgorithm=a}function SetUpTransformStreamDefaultControllerFromTransformer(r,e){var t=Object.create(TransformStreamDefaultController.prototype),a=function transformAlgorithm(r){try{return TransformStreamDefaultControllerEnqueue(t,r),Promise.resolve()}catch(r){return Promise.reject(r)}},o=e.transform;if(void 0!==o){if("function"!=typeof o)throw new TypeError("transform is not a method");a=function transformAlgorithm(a){return PromiseCall(o,e,[a,t]).catch(function(e){throw TransformStreamError(r,e),e})}}var n=CreateAlgorithmFromUnderlyingMethod(e,"flush",0,[t]);SetUpTransformStreamDefaultController(r,t,a,n)}function TransformStreamDefaultControllerEnqueue(r,e){verbose("TransformStreamDefaultControllerEnqueue()");var t=r._controlledTransformStream,a=t._readable._readableStreamController;if(!1===ReadableStreamDefaultControllerCanCloseOrEnqueue(a))throw new TypeError("Readable side is not in a state that permits enqueue");try{ReadableStreamDefaultControllerEnqueue(a,e)}catch(r){throw TransformStreamErrorWritableAndUnblockWrite(t,r),t._readable._storedError}ReadableStreamDefaultControllerHasBackpressure(a)!==t._backpressure&&TransformStreamSetBackpressure(t,!0)}function TransformStreamDefaultControllerError(r,e){TransformStreamError(r._controlledTransformStream,e)}function TransformStreamDefaultControllerTerminate(r){verbose("TransformStreamDefaultControllerTerminate()");var e=r._controlledTransformStream,t=e._readable._readableStreamController;!0===ReadableStreamDefaultControllerCanCloseOrEnqueue(t)&&ReadableStreamDefaultControllerClose(t),TransformStreamErrorWritableAndUnblockWrite(e,new TypeError("TransformStream terminated"))}function TransformStreamDefaultSinkWriteAlgorithm(r,e){verbose("TransformStreamDefaultSinkWriteAlgorithm()");var t=r._transformStreamController;return!0===r._backpressure?r._backpressureChangePromise.then(function(){var a=r._writable;if("erroring"===a._state)throw a._storedError;return t._transformAlgorithm(e)}):t._transformAlgorithm(e)}function TransformStreamDefaultSinkAbortAlgorithm(r){return TransformStreamError(r,new TypeError("Writable side aborted")),Promise.resolve()}function TransformStreamDefaultSinkCloseAlgorithm(r){verbose("TransformStreamDefaultSinkCloseAlgorithm()");var e=r._readable;return r._transformStreamController._flushAlgorithm().then(function(){if("errored"===e._state)throw e._storedError;var r=e._readableStreamController;!0===ReadableStreamDefaultControllerCanCloseOrEnqueue(r)&&ReadableStreamDefaultControllerClose(r)}).catch(function(t){throw TransformStreamError(r,t),e._storedError})}function TransformStreamDefaultSourcePullAlgorithm(r){return verbose("TransformStreamDefaultSourcePullAlgorithm()"),TransformStreamSetBackpressure(r,!1),r._backpressureChangePromise}function defaultControllerBrandCheckException(r){return new TypeError("TransformStreamDefaultController.prototype."+r+" can only be used on a TransformStreamDefaultController")}function streamBrandCheckException(r){return new TypeError("TransformStream.prototype."+r+" can only be used on a TransformStream")}var _createClass=function(){function defineProperties(r,e){for(var t=0;t<e.length;t++){var a=e[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(r,a.key,a)}}return function(r,e,t){return e&&defineProperties(r.prototype,e),t&&defineProperties(r,t),r}}(),assert=_dereq_("better-assert"),verbose=_dereq_("debug")("streams:transform-stream:verbose"),_require=_dereq_("./helpers.js"),InvokeOrNoop=_require.InvokeOrNoop,CreateAlgorithmFromUnderlyingMethod=_require.CreateAlgorithmFromUnderlyingMethod,PromiseCall=_require.PromiseCall,typeIsObject=_require.typeIsObject,ValidateAndNormalizeHighWaterMark=_require.ValidateAndNormalizeHighWaterMark,IsNonNegativeNumber=_require.IsNonNegativeNumber,MakeSizeAlgorithmFromSizeFunction=_require.MakeSizeAlgorithmFromSizeFunction,_require2=_dereq_("./readable-stream.js"),CreateReadableStream=_require2.CreateReadableStream,ReadableStreamDefaultControllerClose=_require2.ReadableStreamDefaultControllerClose,ReadableStreamDefaultControllerEnqueue=_require2.ReadableStreamDefaultControllerEnqueue,ReadableStreamDefaultControllerError=_require2.ReadableStreamDefaultControllerError,ReadableStreamDefaultControllerGetDesiredSize=_require2.ReadableStreamDefaultControllerGetDesiredSize,ReadableStreamDefaultControllerHasBackpressure=_require2.ReadableStreamDefaultControllerHasBackpressure,ReadableStreamDefaultControllerCanCloseOrEnqueue=_require2.ReadableStreamDefaultControllerCanCloseOrEnqueue,_require3=_dereq_("./writable-stream.js"),CreateWritableStream=_require3.CreateWritableStream,WritableStreamDefaultControllerErrorIfNeeded=_require3.WritableStreamDefaultControllerErrorIfNeeded,TransformStream=function(){function TransformStream(){var r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(_classCallCheck(this,TransformStream),void 0!==r.readableType)throw new RangeError("Invalid readable type specified");if(void 0!==r.writableType)throw new RangeError("Invalid writable type specified");var a=e.size,o=MakeSizeAlgorithmFromSizeFunction(a),n=e.highWaterMark;void 0===n&&(n=1),n=ValidateAndNormalizeHighWaterMark(n);var l=t.size,i=MakeSizeAlgorithmFromSizeFunction(l),m=t.highWaterMark;void 0===m&&(m=0),m=ValidateAndNormalizeHighWaterMark(m);var s=void 0;InitializeTransformStream(this,new Promise(function(r){s=r}),n,o,m,i),SetUpTransformStreamDefaultControllerFromTransformer(this,r);var u=InvokeOrNoop(r,"start",[this._transformStreamController]);s(u)}return _createClass(TransformStream,[{key:"readable",get:function get(){if(!1===IsTransformStream(this))throw streamBrandCheckException("readable");return this._readable}},{key:"writable",get:function get(){if(!1===IsTransformStream(this))throw streamBrandCheckException("writable");return this._writable}}]),TransformStream}(),TransformStreamDefaultController=function(){function TransformStreamDefaultController(){throw _classCallCheck(this,TransformStreamDefaultController),new TypeError("TransformStreamDefaultController instances cannot be created directly")}return _createClass(TransformStreamDefaultController,[{key:"enqueue",value:function enqueue(r){if(!1===IsTransformStreamDefaultController(this))throw defaultControllerBrandCheckException("enqueue");TransformStreamDefaultControllerEnqueue(this,r)}},{key:"error",value:function error(r){if(!1===IsTransformStreamDefaultController(this))throw defaultControllerBrandCheckException("error");TransformStreamDefaultControllerError(this,r)}},{key:"terminate",value:function terminate(){if(!1===IsTransformStreamDefaultController(this))throw defaultControllerBrandCheckException("terminate");TransformStreamDefaultControllerTerminate(this)}},{key:"desiredSize",get:function get(){if(!1===IsTransformStreamDefaultController(this))throw defaultControllerBrandCheckException("desiredSize");var r=this._controlledTransformStream._readable._readableStreamController;return ReadableStreamDefaultControllerGetDesiredSize(r)}}]),TransformStreamDefaultController}();module.exports={CreateTransformStream:CreateTransformStream,TransformStream:TransformStream};

},{"./helpers.js":10,"./readable-stream.js":12,"./writable-stream.js":15,"better-assert":16,"debug":18}],14:[function(_dereq_,module,exports){
"use strict";var assert=_dereq_("better-assert");exports.rethrowAssertionErrorRejection=function(r){r&&r.constructor===assert.AssertionError&&setTimeout(function(){throw r},0)};

},{"better-assert":16}],15:[function(_dereq_,module,exports){
"use strict";function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}function AcquireWritableStreamDefaultWriter(e){return new WritableStreamDefaultWriter(e)}function CreateWritableStream(e,r,t,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,o=arguments.length>5&&void 0!==arguments[5]?arguments[5]:function(){return 1},l=Object.create(WritableStream.prototype);return InitializeWritableStream(l),SetUpWritableStreamDefaultController(l,Object.create(WritableStreamDefaultController.prototype),e,r,t,i,a,o),l}function InitializeWritableStream(e){e._state="writable",e._storedError=void 0,e._writer=void 0,e._writableStreamController=void 0,e._writeRequests=[],e._inFlightWriteRequest=void 0,e._closeRequest=void 0,e._inFlightCloseRequest=void 0,e._pendingAbortRequest=void 0,e._backpressure=!1}function IsWritableStream(e){return!!typeIsObject(e)&&!!Object.prototype.hasOwnProperty.call(e,"_writableStreamController")}function IsWritableStreamLocked(e){return void 0!==e._writer}function WritableStreamAbort(e,r){var t=e._state;if("closed"===t)return Promise.resolve(void 0);if("errored"===t)return Promise.reject(e._storedError);var i=new TypeError("Requested to abort");if(void 0!==e._pendingAbortRequest)return Promise.reject(i);var a=!1;"erroring"===t&&(a=!0,r=void 0);var o=new Promise(function(t,i){e._pendingAbortRequest={_resolve:t,_reject:i,_reason:r,_wasAlreadyErroring:a}});return!1===a&&WritableStreamStartErroring(e,i),o}function WritableStreamAddWriteRequest(e){return new Promise(function(r,t){var i={_resolve:r,_reject:t};e._writeRequests.push(i)})}function WritableStreamDealWithRejection(e,r){verbose("WritableStreamDealWithRejection(stream, %o)",r),"writable"!==e._state?WritableStreamFinishErroring(e):WritableStreamStartErroring(e,r)}function WritableStreamStartErroring(e,r){verbose("WritableStreamStartErroring(stream, %o)",r);var t=e._writableStreamController;e._state="erroring",e._storedError=r;var i=e._writer;void 0!==i&&WritableStreamDefaultWriterEnsureReadyPromiseRejected(i,r),!1===WritableStreamHasOperationMarkedInFlight(e)&&!0===t._started&&WritableStreamFinishErroring(e)}function WritableStreamFinishErroring(e){verbose("WritableStreamFinishErroring()"),e._state="errored",e._writableStreamController[ErrorSteps]();var r=e._storedError,t=!0,i=!1,a=void 0;try{for(var o,l=e._writeRequests[Symbol.iterator]();!(t=(o=l.next()).done);t=!0)o.value._reject(r)}catch(e){i=!0,a=e}finally{try{!t&&l.return&&l.return()}finally{if(i)throw a}}if(e._writeRequests=[],void 0!==e._pendingAbortRequest){var s=e._pendingAbortRequest;if(e._pendingAbortRequest=void 0,!0===s._wasAlreadyErroring)return s._reject(r),void WritableStreamRejectCloseAndClosedPromiseIfNeeded(e);e._writableStreamController[AbortSteps](s._reason).then(function(){s._resolve(),WritableStreamRejectCloseAndClosedPromiseIfNeeded(e)},function(r){s._reject(r),WritableStreamRejectCloseAndClosedPromiseIfNeeded(e)})}else WritableStreamRejectCloseAndClosedPromiseIfNeeded(e)}function WritableStreamFinishInFlightWrite(e){e._inFlightWriteRequest._resolve(void 0),e._inFlightWriteRequest=void 0}function WritableStreamFinishInFlightWriteWithError(e,r){e._inFlightWriteRequest._reject(r),e._inFlightWriteRequest=void 0,WritableStreamDealWithRejection(e,r)}function WritableStreamFinishInFlightClose(e){e._inFlightCloseRequest._resolve(void 0),e._inFlightCloseRequest=void 0,"erroring"===e._state&&(e._storedError=void 0,void 0!==e._pendingAbortRequest&&(e._pendingAbortRequest._resolve(),e._pendingAbortRequest=void 0)),e._state="closed";var r=e._writer;void 0!==r&&defaultWriterClosedPromiseResolve(r)}function WritableStreamFinishInFlightCloseWithError(e,r){e._inFlightCloseRequest._reject(r),e._inFlightCloseRequest=void 0,void 0!==e._pendingAbortRequest&&(e._pendingAbortRequest._reject(r),e._pendingAbortRequest=void 0),WritableStreamDealWithRejection(e,r)}function WritableStreamCloseQueuedOrInFlight(e){return void 0!==e._closeRequest||void 0!==e._inFlightCloseRequest}function WritableStreamHasOperationMarkedInFlight(e){return void 0===e._inFlightWriteRequest&&void 0===e._inFlightCloseRequest?(verbose("WritableStreamHasOperationMarkedInFlight() is false"),!1):(verbose("WritableStreamHasOperationMarkedInFlight() is true"),!0)}function WritableStreamMarkCloseRequestInFlight(e){e._inFlightCloseRequest=e._closeRequest,e._closeRequest=void 0}function WritableStreamMarkFirstWriteRequestInFlight(e){e._inFlightWriteRequest=e._writeRequests.shift()}function WritableStreamRejectCloseAndClosedPromiseIfNeeded(e){verbose("WritableStreamRejectCloseAndClosedPromiseIfNeeded()"),void 0!==e._closeRequest&&(e._closeRequest._reject(e._storedError),e._closeRequest=void 0);var r=e._writer;void 0!==r&&(defaultWriterClosedPromiseReject(r,e._storedError),r._closedPromise.catch(function(){}))}function WritableStreamUpdateBackpressure(e,r){var t=e._writer;void 0!==t&&r!==e._backpressure&&(!0===r?defaultWriterReadyPromiseReset(t):defaultWriterReadyPromiseResolve(t)),e._backpressure=r}function IsWritableStreamDefaultWriter(e){return!!typeIsObject(e)&&!!Object.prototype.hasOwnProperty.call(e,"_ownerWritableStream")}function WritableStreamDefaultWriterAbort(e,r){return WritableStreamAbort(e._ownerWritableStream,r)}function WritableStreamDefaultWriterClose(e){var r=e._ownerWritableStream,t=r._state;if("closed"===t||"errored"===t)return Promise.reject(new TypeError("The stream (in "+t+" state) is not in the writable state and cannot be closed"));var i=new Promise(function(e,t){var i={_resolve:e,_reject:t};r._closeRequest=i});return!0===r._backpressure&&"writable"===t&&defaultWriterReadyPromiseResolve(e),WritableStreamDefaultControllerClose(r._writableStreamController),i}function WritableStreamDefaultWriterCloseWithErrorPropagation(e){var r=e._ownerWritableStream,t=r._state;return!0===WritableStreamCloseQueuedOrInFlight(r)||"closed"===t?Promise.resolve():"errored"===t?Promise.reject(r._storedError):WritableStreamDefaultWriterClose(e)}function WritableStreamDefaultWriterEnsureClosedPromiseRejected(e,r){"pending"===e._closedPromiseState?defaultWriterClosedPromiseReject(e,r):defaultWriterClosedPromiseResetToRejected(e,r),e._closedPromise.catch(function(){})}function WritableStreamDefaultWriterEnsureReadyPromiseRejected(e,r){verbose("WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, %o)",r),"pending"===e._readyPromiseState?defaultWriterReadyPromiseReject(e,r):defaultWriterReadyPromiseResetToRejected(e,r),e._readyPromise.catch(function(){})}function WritableStreamDefaultWriterGetDesiredSize(e){var r=e._ownerWritableStream,t=r._state;return"errored"===t||"erroring"===t?null:"closed"===t?0:WritableStreamDefaultControllerGetDesiredSize(r._writableStreamController)}function WritableStreamDefaultWriterRelease(e){var r=e._ownerWritableStream,t=new TypeError("Writer was released and can no longer be used to monitor the stream's closedness");WritableStreamDefaultWriterEnsureReadyPromiseRejected(e,t),WritableStreamDefaultWriterEnsureClosedPromiseRejected(e,t),r._writer=void 0,e._ownerWritableStream=void 0}function WritableStreamDefaultWriterWrite(e,r){var t=e._ownerWritableStream,i=t._writableStreamController,a=WritableStreamDefaultControllerGetChunkSize(i,r);if(t!==e._ownerWritableStream)return Promise.reject(defaultWriterLockException("write to"));var o=t._state;if("errored"===o)return Promise.reject(t._storedError);if(!0===WritableStreamCloseQueuedOrInFlight(t)||"closed"===o)return Promise.reject(new TypeError("The stream is closing or closed and cannot be written to"));if("erroring"===o)return Promise.reject(t._storedError);var l=WritableStreamAddWriteRequest(t);return WritableStreamDefaultControllerWrite(i,r,a),l}function IsWritableStreamDefaultController(e){return!!typeIsObject(e)&&!!Object.prototype.hasOwnProperty.call(e,"_controlledWritableStream")}function SetUpWritableStreamDefaultController(e,r,t,i,a,o,l,s){r._controlledWritableStream=e,e._writableStreamController=r,r._queue=void 0,r._queueTotalSize=void 0,ResetQueue(r),r._started=!1,r._strategySizeAlgorithm=s,r._strategyHWM=l,r._writeAlgorithm=i,r._closeAlgorithm=a,r._abortAlgorithm=o;var n=WritableStreamDefaultControllerGetBackpressure(r);WritableStreamUpdateBackpressure(e,n);var u=t();Promise.resolve(u).then(function(){r._started=!0,WritableStreamDefaultControllerAdvanceQueueIfNeeded(r)},function(t){r._started=!0,WritableStreamDealWithRejection(e,t)}).catch(rethrowAssertionErrorRejection)}function SetUpWritableStreamDefaultControllerFromUnderlyingSink(e,r,t,i){var a=Object.create(WritableStreamDefaultController.prototype),o=CreateAlgorithmFromUnderlyingMethod(r,"write",1,[a]),l=CreateAlgorithmFromUnderlyingMethod(r,"close",0,[]),s=CreateAlgorithmFromUnderlyingMethod(r,"abort",1,[]);SetUpWritableStreamDefaultController(e,a,function startAlgorithm(){return InvokeOrNoop(r,"start",[a])},o,l,s,t,i)}function WritableStreamDefaultControllerClose(e){EnqueueValueWithSize(e,"close",0),WritableStreamDefaultControllerAdvanceQueueIfNeeded(e)}function WritableStreamDefaultControllerGetChunkSize(e,r){try{return e._strategySizeAlgorithm(r)}catch(r){return WritableStreamDefaultControllerErrorIfNeeded(e,r),1}}function WritableStreamDefaultControllerGetDesiredSize(e){return e._strategyHWM-e._queueTotalSize}function WritableStreamDefaultControllerWrite(e,r,t){var i={chunk:r};try{EnqueueValueWithSize(e,i,t)}catch(r){return void WritableStreamDefaultControllerErrorIfNeeded(e,r)}var a=e._controlledWritableStream;!1===WritableStreamCloseQueuedOrInFlight(a)&&"writable"===a._state&&WritableStreamUpdateBackpressure(a,WritableStreamDefaultControllerGetBackpressure(e)),WritableStreamDefaultControllerAdvanceQueueIfNeeded(e)}function WritableStreamDefaultControllerAdvanceQueueIfNeeded(e){verbose("WritableStreamDefaultControllerAdvanceQueueIfNeeded()");var r=e._controlledWritableStream;if(!1!==e._started&&void 0===r._inFlightWriteRequest){var t=r._state;if("closed"!==t&&"errored"!==t)if("erroring"!==t){if(0!==e._queue.length){var i=PeekQueueValue(e);"close"===i?WritableStreamDefaultControllerProcessClose(e):WritableStreamDefaultControllerProcessWrite(e,i.chunk)}}else WritableStreamFinishErroring(r)}}function WritableStreamDefaultControllerErrorIfNeeded(e,r){"writable"===e._controlledWritableStream._state&&WritableStreamDefaultControllerError(e,r)}function WritableStreamDefaultControllerProcessClose(e){var r=e._controlledWritableStream;WritableStreamMarkCloseRequestInFlight(r),DequeueValue(e),e._closeAlgorithm().then(function(){WritableStreamFinishInFlightClose(r)},function(e){WritableStreamFinishInFlightCloseWithError(r,e)}).catch(rethrowAssertionErrorRejection)}function WritableStreamDefaultControllerProcessWrite(e,r){var t=e._controlledWritableStream;WritableStreamMarkFirstWriteRequestInFlight(t),e._writeAlgorithm(r).then(function(){WritableStreamFinishInFlightWrite(t);var r=t._state;if(DequeueValue(e),!1===WritableStreamCloseQueuedOrInFlight(t)&&"writable"===r){var i=WritableStreamDefaultControllerGetBackpressure(e);WritableStreamUpdateBackpressure(t,i)}WritableStreamDefaultControllerAdvanceQueueIfNeeded(e)},function(e){WritableStreamFinishInFlightWriteWithError(t,e)}).catch(rethrowAssertionErrorRejection)}function WritableStreamDefaultControllerGetBackpressure(e){return WritableStreamDefaultControllerGetDesiredSize(e)<=0}function WritableStreamDefaultControllerError(e,r){WritableStreamStartErroring(e._controlledWritableStream,r)}function streamBrandCheckException(e){return new TypeError("WritableStream.prototype."+e+" can only be used on a WritableStream")}function defaultWriterBrandCheckException(e){return new TypeError("WritableStreamDefaultWriter.prototype."+e+" can only be used on a WritableStreamDefaultWriter")}function defaultWriterLockException(e){return new TypeError("Cannot "+e+" a stream using a released writer")}function defaultWriterClosedPromiseInitialize(e){e._closedPromise=new Promise(function(r,t){e._closedPromise_resolve=r,e._closedPromise_reject=t,e._closedPromiseState="pending"})}function defaultWriterClosedPromiseInitializeAsRejected(e,r){e._closedPromise=Promise.reject(r),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0,e._closedPromiseState="rejected"}function defaultWriterClosedPromiseInitializeAsResolved(e){e._closedPromise=Promise.resolve(void 0),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0,e._closedPromiseState="resolved"}function defaultWriterClosedPromiseReject(e,r){e._closedPromise_reject(r),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0,e._closedPromiseState="rejected"}function defaultWriterClosedPromiseResetToRejected(e,r){e._closedPromise=Promise.reject(r),e._closedPromiseState="rejected"}function defaultWriterClosedPromiseResolve(e){e._closedPromise_resolve(void 0),e._closedPromise_resolve=void 0,e._closedPromise_reject=void 0,e._closedPromiseState="resolved"}function defaultWriterReadyPromiseInitialize(e){verbose("defaultWriterReadyPromiseInitialize()"),e._readyPromise=new Promise(function(r,t){e._readyPromise_resolve=r,e._readyPromise_reject=t}),e._readyPromiseState="pending"}function defaultWriterReadyPromiseInitializeAsRejected(e,r){verbose("defaultWriterReadyPromiseInitializeAsRejected(writer, %o)",r),e._readyPromise=Promise.reject(r),e._readyPromise_resolve=void 0,e._readyPromise_reject=void 0,e._readyPromiseState="rejected"}function defaultWriterReadyPromiseInitializeAsResolved(e){verbose("defaultWriterReadyPromiseInitializeAsResolved()"),e._readyPromise=Promise.resolve(void 0),e._readyPromise_resolve=void 0,e._readyPromise_reject=void 0,e._readyPromiseState="fulfilled"}function defaultWriterReadyPromiseReject(e,r){verbose("defaultWriterReadyPromiseReject(writer, %o)",r),e._readyPromise_reject(r),e._readyPromise_resolve=void 0,e._readyPromise_reject=void 0,e._readyPromiseState="rejected"}function defaultWriterReadyPromiseReset(e){verbose("defaultWriterReadyPromiseReset()"),e._readyPromise=new Promise(function(r,t){e._readyPromise_resolve=r,e._readyPromise_reject=t}),e._readyPromiseState="pending"}function defaultWriterReadyPromiseResetToRejected(e,r){verbose("defaultWriterReadyPromiseResetToRejected(writer, %o)",r),e._readyPromise=Promise.reject(r),e._readyPromiseState="rejected"}function defaultWriterReadyPromiseResolve(e){verbose("defaultWriterReadyPromiseResolve()"),e._readyPromise_resolve(void 0),e._readyPromise_resolve=void 0,e._readyPromise_reject=void 0,e._readyPromiseState="fulfilled"}var _createClass=function(){function defineProperties(e,r){for(var t=0;t<r.length;t++){var i=r[t];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(e,r,t){return r&&defineProperties(e.prototype,r),t&&defineProperties(e,t),e}}(),assert=_dereq_("better-assert"),verbose=_dereq_("debug")("streams:writable-stream:verbose"),_require=_dereq_("./helpers.js"),CreateAlgorithmFromUnderlyingMethod=_require.CreateAlgorithmFromUnderlyingMethod,InvokeOrNoop=_require.InvokeOrNoop,ValidateAndNormalizeHighWaterMark=_require.ValidateAndNormalizeHighWaterMark,IsNonNegativeNumber=_require.IsNonNegativeNumber,MakeSizeAlgorithmFromSizeFunction=_require.MakeSizeAlgorithmFromSizeFunction,typeIsObject=_require.typeIsObject,_require2=_dereq_("./utils.js"),rethrowAssertionErrorRejection=_require2.rethrowAssertionErrorRejection,_require3=_dereq_("./queue-with-sizes.js"),DequeueValue=_require3.DequeueValue,EnqueueValueWithSize=_require3.EnqueueValueWithSize,PeekQueueValue=_require3.PeekQueueValue,ResetQueue=_require3.ResetQueue,AbortSteps=Symbol("[[AbortSteps]]"),ErrorSteps=Symbol("[[ErrorSteps]]"),WritableStream=function(){function WritableStream(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=r.size,i=r.highWaterMark,a=void 0===i?1:i;if(_classCallCheck(this,WritableStream),InitializeWritableStream(this),void 0!==e.type)throw new RangeError("Invalid type is specified");var o=MakeSizeAlgorithmFromSizeFunction(t);SetUpWritableStreamDefaultControllerFromUnderlyingSink(this,e,a=ValidateAndNormalizeHighWaterMark(a),o)}return _createClass(WritableStream,[{key:"abort",value:function abort(e){return!1===IsWritableStream(this)?Promise.reject(streamBrandCheckException("abort")):!0===IsWritableStreamLocked(this)?Promise.reject(new TypeError("Cannot abort a stream that already has a writer")):WritableStreamAbort(this,e)}},{key:"getWriter",value:function getWriter(){if(!1===IsWritableStream(this))throw streamBrandCheckException("getWriter");return AcquireWritableStreamDefaultWriter(this)}},{key:"locked",get:function get(){if(!1===IsWritableStream(this))throw streamBrandCheckException("locked");return IsWritableStreamLocked(this)}}]),WritableStream}();module.exports={AcquireWritableStreamDefaultWriter:AcquireWritableStreamDefaultWriter,CreateWritableStream:CreateWritableStream,IsWritableStream:IsWritableStream,IsWritableStreamLocked:IsWritableStreamLocked,WritableStream:WritableStream,WritableStreamAbort:WritableStreamAbort,WritableStreamDefaultControllerErrorIfNeeded:WritableStreamDefaultControllerErrorIfNeeded,WritableStreamDefaultWriterCloseWithErrorPropagation:WritableStreamDefaultWriterCloseWithErrorPropagation,WritableStreamDefaultWriterRelease:WritableStreamDefaultWriterRelease,WritableStreamDefaultWriterWrite:WritableStreamDefaultWriterWrite,WritableStreamCloseQueuedOrInFlight:WritableStreamCloseQueuedOrInFlight};var WritableStreamDefaultWriter=function(){function WritableStreamDefaultWriter(e){if(_classCallCheck(this,WritableStreamDefaultWriter),!1===IsWritableStream(e))throw new TypeError("WritableStreamDefaultWriter can only be constructed with a WritableStream instance");if(!0===IsWritableStreamLocked(e))throw new TypeError("This stream has already been locked for exclusive writing by another writer");this._ownerWritableStream=e,e._writer=this;var r=e._state;if("writable"===r)!1===WritableStreamCloseQueuedOrInFlight(e)&&!0===e._backpressure?defaultWriterReadyPromiseInitialize(this):defaultWriterReadyPromiseInitializeAsResolved(this),defaultWriterClosedPromiseInitialize(this);else if("erroring"===r)defaultWriterReadyPromiseInitializeAsRejected(this,e._storedError),this._readyPromise.catch(function(){}),defaultWriterClosedPromiseInitialize(this);else if("closed"===r)defaultWriterReadyPromiseInitializeAsResolved(this),defaultWriterClosedPromiseInitializeAsResolved(this);else{var t=e._storedError;defaultWriterReadyPromiseInitializeAsRejected(this,t),this._readyPromise.catch(function(){}),defaultWriterClosedPromiseInitializeAsRejected(this,t),this._closedPromise.catch(function(){})}}return _createClass(WritableStreamDefaultWriter,[{key:"abort",value:function abort(e){return!1===IsWritableStreamDefaultWriter(this)?Promise.reject(defaultWriterBrandCheckException("abort")):void 0===this._ownerWritableStream?Promise.reject(defaultWriterLockException("abort")):WritableStreamDefaultWriterAbort(this,e)}},{key:"close",value:function close(){if(!1===IsWritableStreamDefaultWriter(this))return Promise.reject(defaultWriterBrandCheckException("close"));var e=this._ownerWritableStream;return void 0===e?Promise.reject(defaultWriterLockException("close")):!0===WritableStreamCloseQueuedOrInFlight(e)?Promise.reject(new TypeError("cannot close an already-closing stream")):WritableStreamDefaultWriterClose(this)}},{key:"releaseLock",value:function releaseLock(){if(!1===IsWritableStreamDefaultWriter(this))throw defaultWriterBrandCheckException("releaseLock");void 0!==this._ownerWritableStream&&WritableStreamDefaultWriterRelease(this)}},{key:"write",value:function write(e){return!1===IsWritableStreamDefaultWriter(this)?Promise.reject(defaultWriterBrandCheckException("write")):void 0===this._ownerWritableStream?Promise.reject(defaultWriterLockException("write to")):WritableStreamDefaultWriterWrite(this,e)}},{key:"closed",get:function get(){return!1===IsWritableStreamDefaultWriter(this)?Promise.reject(defaultWriterBrandCheckException("closed")):this._closedPromise}},{key:"desiredSize",get:function get(){if(!1===IsWritableStreamDefaultWriter(this))throw defaultWriterBrandCheckException("desiredSize");if(void 0===this._ownerWritableStream)throw defaultWriterLockException("desiredSize");return WritableStreamDefaultWriterGetDesiredSize(this)}},{key:"ready",get:function get(){return!1===IsWritableStreamDefaultWriter(this)?Promise.reject(defaultWriterBrandCheckException("ready")):this._readyPromise}}]),WritableStreamDefaultWriter}(),WritableStreamDefaultController=function(){function WritableStreamDefaultController(){throw _classCallCheck(this,WritableStreamDefaultController),new TypeError("WritableStreamDefaultController cannot be constructed explicitly")}return _createClass(WritableStreamDefaultController,[{key:"error",value:function error(e){if(!1===IsWritableStreamDefaultController(this))throw new TypeError("WritableStreamDefaultController.prototype.error can only be used on a WritableStreamDefaultController");"writable"===this._controlledWritableStream._state&&WritableStreamDefaultControllerError(this,e)}},{key:AbortSteps,value:function value(e){return this._abortAlgorithm(e)}},{key:ErrorSteps,value:function value(){ResetQueue(this)}}]),WritableStreamDefaultController}();

},{"./helpers.js":10,"./queue-with-sizes.js":11,"./utils.js":14,"better-assert":16,"debug":18}],16:[function(_dereq_,module,exports){
(function (process){
function assert(e){if(!e){var r=callsite(),s=r[1],t=s.getFileName(),i=s.getLineNumber(),n=(n=fs.readFileSync(t,"utf8")).split("\n")[i-1].match(/assert\((.*)\)/)[1];throw new AssertionError({message:n,stackStartFunction:r[0].getFunction()})}}var AssertionError=_dereq_("assert").AssertionError,callsite=_dereq_("callsite"),fs=_dereq_("fs");module.exports=process.env.NO_ASSERT?function(){}:assert;

}).call(this,_dereq_('_process'))

},{"_process":4,"assert":2,"callsite":17,"fs":3}],17:[function(_dereq_,module,exports){
module.exports=function(){var r=Error.prepareStackTrace;Error.prepareStackTrace=function(r,e){return e};var e=new Error;Error.captureStackTrace(e,arguments.callee);var a=e.stack;return Error.prepareStackTrace=r,a};

},{}],18:[function(_dereq_,module,exports){
(function (process){
function useColors(){return!("undefined"==typeof window||!window.process||"renderer"!==window.process.type)||("undefined"==typeof navigator||!navigator.userAgent||!navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))&&("undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))}function formatArgs(e){var o=this.useColors;if(e[0]=(o?"%c":"")+this.namespace+(o?" %c":" ")+e[0]+(o?"%c ":" ")+"+"+exports.humanize(this.diff),o){var C="color: "+this.color;e.splice(1,0,C,"color: inherit");var t=0,r=0;e[0].replace(/%[a-zA-Z%]/g,function(e){"%%"!==e&&(t++,"%c"===e&&(r=t))}),e.splice(r,0,C)}}function log(){return"object"==typeof console&&console.log&&Function.prototype.apply.call(console.log,console,arguments)}function save(e){try{null==e?exports.storage.removeItem("debug"):exports.storage.debug=e}catch(e){}}function load(){var e;try{e=exports.storage.debug}catch(e){}return!e&&"undefined"!=typeof process&&"env"in process&&(e=process.env.DEBUG),e}function localstorage(){try{return window.localStorage}catch(e){}}exports=module.exports=_dereq_("./debug"),exports.log=log,exports.formatArgs=formatArgs,exports.save=save,exports.load=load,exports.useColors=useColors,exports.storage="undefined"!=typeof chrome&&void 0!==chrome.storage?chrome.storage.local:localstorage(),exports.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],exports.formatters.j=function(e){try{return JSON.stringify(e)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}},exports.enable(load());

}).call(this,_dereq_('_process'))

},{"./debug":19,"_process":4}],19:[function(_dereq_,module,exports){
function selectColor(e){var r,t=0;for(r in e)t=(t<<5)-t+e.charCodeAt(r),t|=0;return exports.colors[Math.abs(t)%exports.colors.length]}function createDebug(e){function debug(){if(debug.enabled){var e=debug,t=+new Date,s=t-(r||t);e.diff=s,e.prev=r,e.curr=t,r=t;for(var o=new Array(arguments.length),n=0;n<o.length;n++)o[n]=arguments[n];o[0]=exports.coerce(o[0]),"string"!=typeof o[0]&&o.unshift("%O");var a=0;o[0]=o[0].replace(/%([a-zA-Z%])/g,function(r,t){if("%%"===r)return r;a++;var s=exports.formatters[t];if("function"==typeof s){var n=o[a];r=s.call(e,n),o.splice(a,1),a--}return r}),exports.formatArgs.call(e,o),(debug.log||exports.log||console.log.bind(console)).apply(e,o)}}var r;return debug.namespace=e,debug.enabled=exports.enabled(e),debug.useColors=exports.useColors(),debug.color=selectColor(e),debug.destroy=destroy,"function"==typeof exports.init&&exports.init(debug),exports.instances.push(debug),debug}function destroy(){var e=exports.instances.indexOf(this);return-1!==e&&(exports.instances.splice(e,1),!0)}function enable(e){exports.save(e),exports.names=[],exports.skips=[];var r,t=("string"==typeof e?e:"").split(/[\s,]+/),s=t.length;for(r=0;r<s;r++)t[r]&&("-"===(e=t[r].replace(/\*/g,".*?"))[0]?exports.skips.push(new RegExp("^"+e.substr(1)+"$")):exports.names.push(new RegExp("^"+e+"$")));for(r=0;r<exports.instances.length;r++){var o=exports.instances[r];o.enabled=exports.enabled(o.namespace)}}function disable(){exports.enable("")}function enabled(e){if("*"===e[e.length-1])return!0;var r,t;for(r=0,t=exports.skips.length;r<t;r++)if(exports.skips[r].test(e))return!1;for(r=0,t=exports.names.length;r<t;r++)if(exports.names[r].test(e))return!0;return!1}function coerce(e){return e instanceof Error?e.stack||e.message:e}exports=module.exports=createDebug.debug=createDebug.default=createDebug,exports.coerce=coerce,exports.disable=disable,exports.enable=enable,exports.enabled=enabled,exports.humanize=_dereq_("ms"),exports.instances=[],exports.names=[],exports.skips=[],exports.formatters={};

},{"ms":20}],20:[function(_dereq_,module,exports){
function parse(e){if(!((e=String(e)).length>100)){var r=/^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);if(r){var a=parseFloat(r[1]);switch((r[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return a*y;case"days":case"day":case"d":return a*d;case"hours":case"hour":case"hrs":case"hr":case"h":return a*h;case"minutes":case"minute":case"mins":case"min":case"m":return a*m;case"seconds":case"second":case"secs":case"sec":case"s":return a*s;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return a;default:return}}}}function fmtShort(e){return e>=d?Math.round(e/d)+"d":e>=h?Math.round(e/h)+"h":e>=m?Math.round(e/m)+"m":e>=s?Math.round(e/s)+"s":e+"ms"}function fmtLong(e){return plural(e,d,"day")||plural(e,h,"hour")||plural(e,m,"minute")||plural(e,s,"second")||e+" ms"}function plural(s,e,r){if(!(s<e))return s<1.5*e?Math.floor(s/e)+" "+r:Math.ceil(s/e)+" "+r+"s"}var s=1e3,m=60*s,h=60*m,d=24*h,y=365.25*d;module.exports=function(s,e){e=e||{};var r=typeof s;if("string"===r&&s.length>0)return parse(s);if("number"===r&&!1===isNaN(s))return e.long?fmtLong(s):fmtShort(s);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(s))};

},{}]},{},[1])(1)
});


}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VirtualFileSystemInterface = void 0;

const Path = require("path");

const web_streams_node_1 = require("web-streams-node");

class VirtualFileSystemInterface {
  constructor(fileSystemStructure) {
    this.isReadOnly = true;
    this.fss = fileSystemStructure || null;
  }

  read(path, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = undefined;
    }

    let offset = options === null || options === void 0 ? void 0 : options.offset;
    let length = options === null || options === void 0 ? void 0 : options.length;
    let end = length === undefined ? undefined : offset === undefined ? length : offset + length;

    if (callback) {
      path = Path.normalize(path);
      let fileObject = this.resolvePath(path, this.fss);
      if (!this.isFile(fileObject)) callback(new Error("ENOENT: no such file or directory " + path), undefined);else fileObject.slice(offset, end).arrayBuffer().then(buffer => callback(null, buffer)).catch(error => callback(error));
    }
  }

  createReadStream(path) {
    path = Path.normalize(path);
    let fileObject = this.resolvePath(path, this.fss);
    if (this.isFile(fileObject)) return (0, web_streams_node_1.toNodeReadable)(fileObject.stream());
    throw new Error("ENOENT: no such file or directory " + path);
  }

  readdir(path, callback) {
    let err = null;
    path = Path.normalize(path);
    let fileObject = this.resolvePath(path, this.fss);
    if (!this.isDirectory(fileObject)) err = new Error("ENOENT: no such file or directory " + path);
    callback(err, !err ? Object.keys(fileObject) : undefined);
  }

  stat(path, callback) {
    let err = null;
    path = Path.normalize(path);
    let fileObject = this.resolvePath(path, this.fss);
    if (!this.isFile(fileObject) && !this.isDirectory(fileObject)) err = new Error("ENOENT: no such file or directory " + path);
    let name = Path.parse(path).base;
    let stats;

    if (this.isFile(fileObject)) {
      stats = {
        name: name,
        size: fileObject.size,
        lastModified: fileObject.lastModified,
        lastModifiedDate: fileObject.lastModifiedDate,
        type: fileObject.type,
        isDirectory: false
      };
    } else {
      stats = {
        name: name,
        size: 0,
        lastModified: 0,
        lastModifiedDate: null,
        type: false,
        isDirectory: true
      };
    }

    callback(err, !err ? stats : undefined);
  }

  cleanPath(path) {
    path = Path.normalize(path);
    if (path[path.length - 1] === "/") path = path.slice(0, path.length - 1);
    if (path.length > 1 && path[0] === "/") path = path.slice(1);
    return path;
  }

  resolvePath(path, obj, separator = '/') {
    if (path === "/" || path === "./") return obj;
    const properties = Array.isArray(path) ? path : this.cleanPath(path).split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], obj);
  }

  isFile(object) {
    if (object === undefined) return false;
    if (object === null) return false;
    return object.constructor != Object;
  }

  isDirectory(object) {
    if (object === undefined) return false;
    if (object === null) return false;
    return object.constructor == Object;
  }

}

exports.VirtualFileSystemInterface = VirtualFileSystemInterface;

},{"path":19,"web-streams-node":40}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemInterface = void 0;
var VirtualFileSystemInterface_1 = require("./VirtualFileSystemInterface");
Object.defineProperty(exports, "FileSystemInterface", { enumerable: true, get: function () { return VirtualFileSystemInterface_1.VirtualFileSystemInterface; } });

},{"./VirtualFileSystemInterface":44}],46:[function(require,module,exports){
"use strict";

const {
  fileOpen,
  supported
} = require("browser-fs-access");

const {
  FileSystemInterface
} = require("common-file-system");

(async () => {
  if (supported) {
    console.log('Using native File System Access API.');
  } else {
    console.log('Using the fallback implementation.');
  }
})();

Vue.mixin({
  methods: {
    isFile: object => {
      if (object === undefined) return false;
      if (object === null) return false;
      return object.constructor !== Object;
    },

    log(msg) {
      console.log(msg);
    },

    openFiles: () => {
      return fileOpen({
        startIn: 'downloads',
        multiple: true
      });
    }
  }
});
Vue.component('folder-viewer', {
  props: ['name', 'content'],
  data: function () {
    return {
      isOpen: false
    };
  },
  template: `
            <div style="border: solid black 1px; margin: 10px 0">
                <a>{{name}}</a>

                <button v-on:click="isOpen = !isOpen">New Folder</button>
                <button v-on:click="() => {
                    openFiles().then(files => {
                        files.forEach((file) => {
                            log(file);
                            this.$set(content, file.name, file)
                        });
                    }).catch(() => {
                        log('No file selected');
                    });
                }">Add Files</button>
                <input-dialogue :submit-callback="(value) => {this.$set(content, value, {}); this.isOpen = false}" :cancel-callback="() => this.isOpen = false" :is-open="isOpen"/>

                <ul>
                    <li v-for="[name, object] in Object.entries(content).filter(([name, object]) => this.isFile(object))">{{ name }} {{ object.size }}</li>
                </ul>
                <ul>
                    <li v-for="[name, object] in Object.entries(content).filter(([name, object]) => !this.isFile(object))">
                        <folder-viewer :name="name" :content="object"></folder-viewer>
                    </li>
                </ul>
            </div>
        `
});
Vue.component('input-dialogue', {
  data: function () {
    return {
      value: ""
    };
  },
  props: ['submitCallback', 'cancelCallback', "isOpen"],
  template: `
            <div v-if="isOpen" class="input-dialogue">
                <div class="backdrop"></div>
                <div class="dialogue-box">
                    <div>
                        <input v-model="value" type="text" placeholder="folder name">
                        <br>
                        <button v-on:click="() => submitCallback(value)">OK</button>
                        <button v-on:click="cancelCallback">cancel</button>
                    </div>
                </div>
            </div>
        `
});
let app = new Vue({
  el: '#app',
  data: {
    fs: {// file1: new File([], "file1"),
      // file2: new File([], "file2"),
      // file3: new File([], "file3"),
      // folder1: {
      //     fileA: new File([], "file3"),
      //     fileB: new File([], "fileB"),
      //     fileC: new File([], "filC"),
      //     fileD: new File([], "fileD"),
      //     fileE: new File([], "fileE"),
      //     folder1: {
      //         file1: new File([], "file1"),
      //         file2: new File([], "file2"),
      //     },
      //     folder2: {
      //         file1: new File([], "file1"),
      //         file2: new File([], "file2"),
      //     }
      // }
    }
  },
  methods: {
    isFile: object => {
      if (object === undefined) return false;
      if (object === null) return false;
      return object.constructor !== Object;
    },
    getFileStructure: function () {
      return this.fs;
    }
  }
});
let b = document.getElementById("read");
b.addEventListener("click", () => {
  readFile();
});

function isFile(object) {
  if (object === undefined) return false;
  if (object === null) return false;
  return object.constructor !== Object;
}

function readFile() {
  let fs = new FileSystemInterface(app.getFileStructure());
  fs.readdir("./", (err, files) => {
    if (err) console.log(err);else {
      files.forEach(file => {
        if (!isFile(file)) return;
        fs.read("/" + file, (err, buffer) => {
          let enc = new TextDecoder("utf-8");
          if (err) console.log(err);else console.log(enc.decode(buffer));
        });
      });
    }
  });
}

},{"browser-fs-access":8,"common-file-system":45}]},{},[46]);
