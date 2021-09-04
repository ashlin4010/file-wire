(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "v1", {
  enumerable: true,
  get: function () {
    return _v.default;
  }
});
Object.defineProperty(exports, "v3", {
  enumerable: true,
  get: function () {
    return _v2.default;
  }
});
Object.defineProperty(exports, "v4", {
  enumerable: true,
  get: function () {
    return _v3.default;
  }
});
Object.defineProperty(exports, "v5", {
  enumerable: true,
  get: function () {
    return _v4.default;
  }
});
Object.defineProperty(exports, "NIL", {
  enumerable: true,
  get: function () {
    return _nil.default;
  }
});
Object.defineProperty(exports, "version", {
  enumerable: true,
  get: function () {
    return _version.default;
  }
});
Object.defineProperty(exports, "validate", {
  enumerable: true,
  get: function () {
    return _validate.default;
  }
});
Object.defineProperty(exports, "stringify", {
  enumerable: true,
  get: function () {
    return _stringify.default;
  }
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: function () {
    return _parse.default;
  }
});

var _v = _interopRequireDefault(require("./v1.js"));

var _v2 = _interopRequireDefault(require("./v3.js"));

var _v3 = _interopRequireDefault(require("./v4.js"));

var _v4 = _interopRequireDefault(require("./v5.js"));

var _nil = _interopRequireDefault(require("./nil.js"));

var _version = _interopRequireDefault(require("./version.js"));

var _validate = _interopRequireDefault(require("./validate.js"));

var _stringify = _interopRequireDefault(require("./stringify.js"));

var _parse = _interopRequireDefault(require("./parse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./nil.js":3,"./parse.js":4,"./stringify.js":8,"./v1.js":9,"./v3.js":10,"./v4.js":12,"./v5.js":13,"./validate.js":14,"./version.js":15}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function md5(bytes) {
  if (typeof bytes === 'string') {
    const msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Uint8Array(msg.length);

    for (let i = 0; i < msg.length; ++i) {
      bytes[i] = msg.charCodeAt(i);
    }
  }

  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
/*
 * Convert an array of little-endian words to an array of bytes
 */


function md5ToHexEncodedArray(input) {
  const output = [];
  const length32 = input.length * 32;
  const hexTab = '0123456789abcdef';

  for (let i = 0; i < length32; i += 8) {
    const x = input[i >> 5] >>> i % 32 & 0xff;
    const hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
    output.push(hex);
  }

  return output;
}
/**
 * Calculate output length with padding and bit length
 */


function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */


function wordsToMd5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[getOutputLength(len) - 1] = len;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  return [a, b, c, d];
}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */


function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }

  const length8 = input.length * 8;
  const output = new Uint32Array(getOutputLength(length8));

  for (let i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
  }

  return output;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */


function safeAdd(x, y) {
  const lsw = (x & 0xffff) + (y & 0xffff);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xffff;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */


function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */


function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}

function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}

function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

var _default = md5;
exports.default = _default;
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = '00000000-0000-0000-0000-000000000000';
exports.default = _default;
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _validate = _interopRequireDefault(require("./validate.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

var _default = parse;
exports.default = _default;
},{"./validate.js":14}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
exports.default = _default;
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rng;
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);

function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}
},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;

    case 1:
      return x ^ y ^ z;

    case 2:
      return x & y ^ x & z ^ y & z;

    case 3:
      return x ^ y ^ z;
  }
}

function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}

function sha1(bytes) {
  const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  if (typeof bytes === 'string') {
    const msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = [];

    for (let i = 0; i < msg.length; ++i) {
      bytes.push(msg.charCodeAt(i));
    }
  } else if (!Array.isArray(bytes)) {
    // Convert Array-like to Array
    bytes = Array.prototype.slice.call(bytes);
  }

  bytes.push(0x80);
  const l = bytes.length / 4 + 2;
  const N = Math.ceil(l / 16);
  const M = new Array(N);

  for (let i = 0; i < N; ++i) {
    const arr = new Uint32Array(16);

    for (let j = 0; j < 16; ++j) {
      arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }

    M[i] = arr;
  }

  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

  for (let i = 0; i < N; ++i) {
    const W = new Uint32Array(80);

    for (let t = 0; t < 16; ++t) {
      W[t] = M[i][t];
    }

    for (let t = 16; t < 80; ++t) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }

    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];

    for (let t = 0; t < 80; ++t) {
      const s = Math.floor(t / 20);
      const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }

  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
}

var _default = sha1;
exports.default = _default;
},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _validate = _interopRequireDefault(require("./validate.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

var _default = stringify;
exports.default = _default;
},{"./validate.js":14}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _stringify = _interopRequireDefault(require("./stringify.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0, _stringify.default)(b);
}

var _default = v1;
exports.default = _default;
},{"./rng.js":6,"./stringify.js":8}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _md = _interopRequireDefault(require("./md5.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports.default = _default;
},{"./md5.js":2,"./v35.js":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.URL = exports.DNS = void 0;

var _stringify = _interopRequireDefault(require("./stringify.js"));

var _parse = _interopRequireDefault(require("./parse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0, _parse.default)(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0, _stringify.default)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}
},{"./parse.js":4,"./stringify.js":8}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _stringify = _interopRequireDefault(require("./stringify.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  options = options || {};

  const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0, _stringify.default)(rnds);
}

var _default = v4;
exports.default = _default;
},{"./rng.js":6,"./stringify.js":8}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _sha = _interopRequireDefault(require("./sha1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports.default = _default;
},{"./sha1.js":7,"./v35.js":11}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regex = _interopRequireDefault(require("./regex.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(uuid) {
  return typeof uuid === 'string' && _regex.default.test(uuid);
}

var _default = validate;
exports.default = _default;
},{"./regex.js":5}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _validate = _interopRequireDefault(require("./validate.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function version(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

var _default = version;
exports.default = _default;
},{"./validate.js":14}],16:[function(require,module,exports){
const {WsDuplex, RTCConnection } = require("rtc-connection");
const { v4: uuid } = require('uuid');
const { DomainConnection } = require("ws-domain");


let button = document.getElementById("connect");
let checkbox = document.getElementById("checkbox");
window.addEventListener('hashchange', () => window.location.reload());

let [domain, server] =  window.location.hash.substr(1).split("/");
let isServer = Boolean(server);
if(!domain && !isServer) window.location.hash = "#" + (domain = uuid().substr(0,5)) + "/server";
checkbox.checked = !isServer;


button?.addEventListener("click", () => {
    let domainConnection;
    let url = location.origin.replace(/^http/, 'ws');
    let isInitiator = checkbox ? checkbox.checked : false;
    isServer = !isInitiator;
    button.disabled = true;

    try{
        domainConnection = new DomainConnection(url, domain, isServer ? "token" : undefined);
    } catch (e) {
        console.log("Websocket connection failed to be established, the target might not be online");
        button.disabled = false;
        return;
    }


    domainConnection.on("connect", async (wsProxy) => {
        setConnected(1);
        let ws;
        if(isServer) ws = await new Promise((resolve, reject) => wsProxy.on("connection", resolve));
        else ws = wsProxy;

        let wsDuplex = new WsDuplex(ws);
        let RTC = new RTCConnection(wsDuplex, isInitiator , {});

        if(isInitiator) RTC.addDataChannel("plz work");

        RTC.on("connect", () => {
            console.log("RTC open!");
            setConnected(2);
        });
    });

    domainConnection.on("disconnect", () => {
        setConnected(0);
        button.disabled = false;
    });

});


function setConnected(value) {
    let ele = document.getElementById("connected");
    if(value === 0) {
        ele.className = "red";
    } else if (value === 1) {
        ele.className = "yellow";
    } else if (value === 2) {
        ele.className = "green";
    }
}
},{"rtc-connection":20,"uuid":1,"ws-domain":30}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplexState = void 0;
var DuplexState;
(function (DuplexState) {
    DuplexState[DuplexState["OPEN"] = 0] = "OPEN";
    DuplexState[DuplexState["CLOSED"] = 1] = "CLOSED";
})(DuplexState = exports.DuplexState || (exports.DuplexState = {}));

},{}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTCConnection = void 0;
var WebRTC = require("wrtc");
var EventEmitter = require("events");
var RTCPeerConnection = WebRTC.RTCPeerConnection;
var RTCConnection = /** @class */ (function (_super) {
    __extends(RTCConnection, _super);
    function RTCConnection(duplex, initiator, configuration) {
        var _this = _super.call(this) || this;
        _this.duplex = duplex;
        _this.initiator = initiator || false;
        _this.configuration = configuration || {
            'iceServers': [
                {
                    'urls': 'stun:stun.l.google.com:19302'
                }
            ]
        };
        _this.duplex.on("data", _this.handleDuplexData.bind(_this));
        // @ts-ignore
        _this.RTCPeerConnection = new RTCPeerConnection(_this.configuration);
        console.log(_this.RTCPeerConnection);
        _this.RTCPeerConnection.ondatachannel = _this.handleDataChannel.bind(_this);
        _this.RTCPeerConnection.onconnectionstatechange = _this.handleConnectionStateChange.bind(_this);
        _this.RTCPeerConnection.onsignalingstatechange = _this.handleSignalingStateChange.bind(_this);
        _this.RTCPeerConnection.onicecandidate = _this.handleIceCandidate.bind(_this);
        _this.RTCPeerConnection.onnegotiationneeded = _this.handleNegotiationNeeded.bind(_this);
        return _this;
    }
    RTCConnection.prototype.handleDuplexData = function (data) {
        var _this = this;
        if (data.type === 'offer') {
            this.RTCPeerConnection.setRemoteDescription(data).catch(console.error);
            this.RTCPeerConnection.createAnswer().then(function (description) {
                _this.RTCPeerConnection.setLocalDescription(description).then(function () {
                    _this.duplex.write(_this.RTCPeerConnection.localDescription);
                }).catch(console.error);
            }).catch(console.error);
        }
        else if (data.type === 'answer') {
            this.RTCPeerConnection.setRemoteDescription(data).catch(console.error);
        }
        else if (data.type === 'candidate') {
            this.RTCPeerConnection.addIceCandidate(data.candidate).catch(console.error);
        }
    };
    RTCConnection.prototype.handleDataChannel = function (_a) {
        var channel = _a.channel;
        this.emit("datachannel", channel);
    };
    RTCConnection.prototype.handleConnectionStateChange = function () {
        console.log("Connection state:", this.RTCPeerConnection.connectionState);
        if (this.RTCPeerConnection.connectionState === "disconnected")
            this.close();
        if (this.RTCPeerConnection.connectionState === "failed")
            this.close();
    };
    RTCConnection.prototype.handleSignalingStateChange = function () {
        if (this.RTCPeerConnection.signalingState === "stable") {
            this.emit("connect");
        }
    };
    RTCConnection.prototype.handleIceCandidate = function (_a) {
        var candidate = _a.candidate;
        if (candidate && candidate.candidate) {
            this.duplex.write({
                type: 'candidate',
                label: candidate.sdpMLineIndex,
                id: candidate.sdpMid,
                candidate: candidate
            });
        }
    };
    RTCConnection.prototype.handleNegotiationNeeded = function () {
        var _this = this;
        console.log("negotiation needed");
        // start negotiation
        this.RTCPeerConnection.createOffer().then(function (SDP_offer) {
            _this.RTCPeerConnection.setLocalDescription(SDP_offer).then(function () {
                _this.duplex.write(_this.RTCPeerConnection.localDescription);
            }).catch(console.error);
        }).catch(console.error);
    };
    RTCConnection.prototype.addDataChannel = function (label) {
        // add channel
        console.log("add chanel");
        var channel = this.RTCPeerConnection.createDataChannel(label);
        channel.onerror = function (e) {
            console.log(e);
        };
    };
    RTCConnection.prototype.close = function () {
        // Object.values(this.dataChannels).forEach(channel => {
        //     channel.close();
        // });
        this.RTCPeerConnection.close();
        this.RTCPeerConnection.ondatachannel = null;
        this.RTCPeerConnection.onconnectionstatechange = null;
        this.RTCPeerConnection.onsignalingstatechange = null;
        this.RTCPeerConnection.onicecandidate = null;
        this.RTCPeerConnection.onnegotiationneeded = null;
        this.emit("disconnect");
    };
    ;
    return RTCConnection;
}(EventEmitter));
exports.RTCConnection = RTCConnection;

},{"events":48,"wrtc":21}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsDuplex = void 0;
var Duplex_1 = require("./Duplex");
var EventEmitter = require("events");
var WsDuplex = /** @class */ (function (_super) {
    __extends(WsDuplex, _super);
    function WsDuplex(ws) {
        var _this = _super.call(this) || this;
        _this.ws = ws;
        _this.state = Duplex_1.DuplexState.OPEN;
        _this.ondata = null;
        _this.onclose = null;
        _this.ws.onmessage = _this.handleMessage.bind(_this);
        _this.ws.onclose = _this.handleClose.bind(_this);
        return _this;
    }
    WsDuplex.prototype.write = function (data) {
        if (this.state === Duplex_1.DuplexState.OPEN)
            this.ws.send(data);
        else
            throw "Websocket connection is not open";
    };
    WsDuplex.prototype.handleMessage = function (message) {
        if (this.ondata)
            this.ondata(message);
        this.emit("data", message);
    };
    WsDuplex.prototype.handleClose = function (code, reason) {
        this.state = Duplex_1.DuplexState.CLOSED;
        if (this.onclose)
            this.onclose(code, reason);
        this.emit("data", code, reason);
    };
    return WsDuplex;
}(EventEmitter));
exports.WsDuplex = WsDuplex;

},{"./Duplex":17,"events":48}],20:[function(require,module,exports){
"use strict";
// import { RTCConnection } from "./RTCConnection";
// export default RTCConnection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsDuplex = exports.RTCConnection = void 0;
var RTCConnection_1 = require("./RTCConnection");
Object.defineProperty(exports, "RTCConnection", { enumerable: true, get: function () { return RTCConnection_1.RTCConnection; } });
var WsDuplex_1 = require("./WsDuplex");
Object.defineProperty(exports, "WsDuplex", { enumerable: true, get: function () { return WsDuplex_1.WsDuplex; } });

},{"./RTCConnection":18,"./WsDuplex":19}],21:[function(require,module,exports){
'use strict';

exports.MediaStream = window.MediaStream;
exports.MediaStreamTrack = window.MediaStreamTrack;
exports.RTCDataChannel = window.RTCDataChannel;
exports.RTCDataChannelEvent = window.RTCDataChannelEvent;
exports.RTCDtlsTransport = window.RTCDtlsTransport;
exports.RTCIceCandidate = window.RTCIceCandidate;
exports.RTCIceTransport = window.RTCIceTransport;
exports.RTCPeerConnection = window.RTCPeerConnection;
exports.RTCPeerConnectionIceEvent = window.RTCPeerConnectionIceEvent;
exports.RTCRtpReceiver = window.RTCRtpReceiver;
exports.RTCRtpSender = window.RTCRtpSender;
exports.RTCRtpTransceiver = window.RTCRtpTransceiver;
exports.RTCSctpTransport = window.RTCSctpTransport;
exports.RTCSessionDescription = window.RTCSessionDescription;
exports.getUserMedia = window.getUserMedia;
exports.mediaDevices = navigator.mediaDevices;

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DomainPayload_1 = require("./DomainPayload");
const uuid_1 = require("uuid");
class Domain {
    constructor(domainAddress) {
        this.address = domainAddress;
        this.lord = null;
        this.membersByWs = new Map();
        this.membersById = new Map();
    }
    setLord(ws) {
        var _a;
        // close connection with existing lord if one exists
        // this could be dangerous, you could potentially intercept
        // connections as they get made but only if you have a valid token
        if (this.lord)
            this.lord.onmessage = null;
        (_a = this.lord) === null || _a === void 0 ? void 0 : _a.close();
        this.lord = ws;
        this.lord.onmessage = this.handleLordMessage.bind(this);
        // when the lord disconnects disconnect all members
        ws.onclose = () => {
            this.lord = null;
            this.membersById.forEach(({ ws }, id) => ws.close());
            this.membersById.clear();
            this.membersByWs.clear();
        };
    }
    addMember(ws) {
        var _a;
        let id = (0, uuid_1.v4)();
        this.membersByWs.set(ws, { id, ws });
        this.membersById.set(id, { id, ws });
        ws.onmessage = this.handleMemberMessage.bind(this);
        // inform server of connection and disconnect
        (_a = this.lord) === null || _a === void 0 ? void 0 : _a.send(DomainPayload_1.DomainPayload.createConnectPayload(id));
        ws.onclose = ({ code }) => {
            var _a;
            this.membersByWs.delete(ws);
            this.membersById.delete(id);
            (_a = this.lord) === null || _a === void 0 ? void 0 : _a.send(DomainPayload_1.DomainPayload.createDisconnectPayload(code, id));
        };
    }
    handleMemberMessage(event) {
        var _a, _b;
        // ony message events
        let payload = DomainPayload_1.DomainPayload.parserPayload(event.data);
        let id = (_a = this.membersByWs.get(event.target)) === null || _a === void 0 ? void 0 : _a.id;
        let { type, data } = payload;
        switch (type) {
            case DomainPayload_1.PayloadType.MESSAGE:
                (_b = this.lord) === null || _b === void 0 ? void 0 : _b.send(DomainPayload_1.DomainPayload.createMessagePayload(data, id));
                break;
        }
    }
    handleLordMessage(event) {
        var _a;
        // message and disconnect events
        let payload = DomainPayload_1.DomainPayload.parserPayload(event.data);
        let { type, data, id } = payload;
        if (!id)
            return;
        let ws = (_a = this.membersById.get(id)) === null || _a === void 0 ? void 0 : _a.ws;
        switch (type) {
            case DomainPayload_1.PayloadType.MESSAGE:
                ws === null || ws === void 0 ? void 0 : ws.send(DomainPayload_1.DomainPayload.createMessagePayload(data, id));
                break;
            case DomainPayload_1.PayloadType.DISCONNECT:
                ws === null || ws === void 0 ? void 0 : ws.close(data);
        }
    }
}
exports.default = Domain;

},{"./DomainPayload":24,"uuid":33}],23:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainConnection = void 0;
const EventWebSocket_1 = require("./EventWebSocket");
const events_1 = __importDefault(require("events"));
const build_url_1 = __importDefault(require("build-url"));
const ProxyClient_1 = require("./ProxyClient");
const ProxyServer_1 = require("./ProxyServer");
class DomainConnection extends events_1.default {
    constructor(url, domain, token) {
        super();
        this.isLord = !!token;
        this._token = token;
        this.domain = domain;
        this.url = url;
        let fullURL = (0, build_url_1.default)(url, {
            path: domain,
            queryParams: token ? { "token": token } : undefined
        });
        this._ws = new EventWebSocket_1.EventWebSocket(fullURL);
        this._ws.onopen = this.handleOpen.bind(this);
        this._ws.onclose = this.handleClose.bind(this);
        this._ws.onerror = this.handleError.bind(this);
    }
    handleOpen() {
        // @ts-ignore
        let proxy = this.isLord ? new ProxyServer_1.ProxyServer(this._ws) : new ProxyClient_1.ProxyClient(this._ws);
        if (this.onconnect)
            this.onconnect(proxy);
        this.emit("connect", proxy);
    }
    handleClose(code, reason) {
        if (this.ondisconnect)
            this.ondisconnect(code, reason);
        this.emit("disconnect", code, reason);
    }
    handleError() {
        if (this.onerror)
            this.onerror();
        this.emit("error");
    }
}
exports.DomainConnection = DomainConnection;

},{"./EventWebSocket":25,"./ProxyClient":26,"./ProxyServer":28,"build-url":31,"events":48}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainPayload = exports.PayloadType = void 0;
var PayloadType;
(function (PayloadType) {
    PayloadType[PayloadType["MESSAGE"] = 0] = "MESSAGE";
    PayloadType[PayloadType["CONNECT"] = 1] = "CONNECT";
    PayloadType[PayloadType["DISCONNECT"] = 2] = "DISCONNECT";
})(PayloadType = exports.PayloadType || (exports.PayloadType = {}));
class DomainPayload {
    constructor(type, data, clientId) {
        this.type = type;
        this.data = data;
        this.id = clientId || null;
    }
    static parserPayload(string) {
        let payload = JSON.parse(string.toString());
        return new DomainPayload(payload.type, payload.data, payload.id);
    }
    toString() {
        return JSON.stringify({ type: this.type, data: this.data, id: this.id });
    }
    static createMessagePayload(data, clientId) {
        return new DomainPayload(PayloadType.MESSAGE, data, clientId).toString();
    }
    static createConnectPayload(clientId) {
        return new DomainPayload(PayloadType.CONNECT, null, clientId).toString();
    }
    static createDisconnectPayload(code, clientId) {
        return new DomainPayload(PayloadType.DISCONNECT, code, clientId).toString();
    }
}
exports.DomainPayload = DomainPayload;

},{}],25:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventWebSocket = void 0;
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
class EventWebSocket extends isomorphic_ws_1.default {
    constructor(address, protocols, options) {
        super(address, protocols, options);
    }
    set onclose(listener) {
        if (listener)
            super.onclose = (typeof window === 'undefined') ? listener : ({ code, reason }) => listener(code, reason);
        else
            super.onmessage = undefined;
    }
    set onmessage(listener) {
        if (listener)
            super.onmessage = (typeof window === 'undefined') ? listener : ({ data }) => listener(data);
        else
            super.onmessage = undefined;
    }
    bindEventListener(event, listener) {
        if (typeof window === 'undefined') { // node js
            super.on(event, listener);
        }
        else { // web js
            let eventListener = listener;
            if (event === "close")
                eventListener = ({ code, reason }) => listener(code, reason);
            if (event === "message")
                eventListener = ({ data }) => listener(data);
            super.addEventListener(event, eventListener);
        }
    }
    on(event, listener) {
        this.bindEventListener(event, listener);
        return this;
    }
    addEventListener(event, listener) {
        this.bindEventListener(event, listener);
        return this;
    }
}
exports.EventWebSocket = EventWebSocket;

},{"isomorphic-ws":32}],26:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyClient = void 0;
const events_1 = __importDefault(require("events"));
const DomainPayload_1 = require("./DomainPayload");
class ProxyClient extends events_1.default {
    constructor(webSocket) {
        super();
        this._ws = webSocket;
        this._ws.onmessage = this.handleMessage.bind(this);
    }
    handleMessage(rawData) {
        let payload = DomainPayload_1.DomainPayload.parserPayload(rawData);
        let { data, type, id } = payload;
        switch (type) {
            case DomainPayload_1.PayloadType.MESSAGE:
                if (this.onmessage)
                    this.onmessage(data);
                this.emit("message", data);
        }
    }
    send(message) {
        this._ws.send(DomainPayload_1.DomainPayload.createMessagePayload(message));
    }
}
exports.ProxyClient = ProxyClient;

},{"./DomainPayload":24,"events":48}],27:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyConnection = void 0;
const events_1 = __importDefault(require("events"));
const DomainPayload_1 = require("./DomainPayload");
class ProxyConnection extends events_1.default {
    constructor(webSocket, id) {
        super();
        this._ws = webSocket;
        this.id = id;
    }
    receiveClose(code) {
        if (this.onclose)
            this.onclose(code);
        this.emit("close", code);
    }
    receiveMessage(data) {
        if (this.onmessage)
            this.onmessage(data);
        this.emit("message", data);
    }
    close(code) {
        this._ws.send(DomainPayload_1.DomainPayload.createDisconnectPayload(code, this.id));
    }
    send(data) {
        this._ws.send(DomainPayload_1.DomainPayload.createMessagePayload(data, this.id));
    }
}
exports.ProxyConnection = ProxyConnection;

},{"./DomainPayload":24,"events":48}],28:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyServer = void 0;
const events_1 = __importDefault(require("events"));
const ProxyConnection_1 = require("./ProxyConnection");
const DomainPayload_1 = require("./DomainPayload");
class ProxyServer extends events_1.default {
    constructor(webSocket) {
        super();
        this.clients = {};
        this._ws = webSocket;
        this._ws.onmessage = this.handleMessage.bind(this);
    }
    handleMessage(rawData) {
        let payload = DomainPayload_1.DomainPayload.parserPayload(rawData);
        let { data, type, id } = payload;
        switch (type) {
            case DomainPayload_1.PayloadType.CONNECT:
                this.handleMemberConnect(id);
                break;
            case DomainPayload_1.PayloadType.DISCONNECT:
                this.handelMemberDisconnect(id, data);
                break;
            case DomainPayload_1.PayloadType.MESSAGE:
                this.handelMemberMessage(id, data);
                break;
        }
    }
    handleMemberConnect(memberID) {
        if (!memberID)
            return;
        let member = new ProxyConnection_1.ProxyConnection(this._ws, memberID);
        this.clients[memberID] = member;
        this.emit("connection", member);
    }
    handelMemberDisconnect(memberID, data) {
        if (!memberID || !(memberID in this.clients))
            return;
        let proxyConnection = this.clients[memberID];
        proxyConnection.receiveClose(parseInt(data));
        delete this.clients[memberID];
    }
    handelMemberMessage(memberID, data) {
        if (!memberID || !(memberID in this.clients))
            return;
        let proxyConnection = this.clients[memberID];
        proxyConnection.receiveMessage(data);
    }
}
exports.ProxyServer = ProxyServer;

},{"./DomainPayload":24,"./ProxyConnection":27,"events":48}],29:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketDomainServer = void 0;
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
const Domain_1 = __importDefault(require("./Domain"));
class WebSocketDomainServer {
    constructor() {
        this.clients = [];
        this.domains = {};
        this._wss = new isomorphic_ws_1.default.Server({ noServer: true });
    }
    handleUpgrade(request, socket, head, cb) {
        this._wss.handleUpgrade(request, socket, head, (webSocket, request) => {
            this.clients.push(webSocket);
            cb(webSocket);
        });
    }
    getDomain(domainAddress) {
        return this.domains[domainAddress] || null;
    }
    createDomain(domainAddress) {
        return this.domains[domainAddress] = new Domain_1.default(domainAddress);
    }
}
exports.WebSocketDomainServer = WebSocketDomainServer;

},{"./Domain":22,"isomorphic-ws":32}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketDomainServer = exports.DomainConnection = void 0;
var DomainConnection_1 = require("./DomainConnection");
Object.defineProperty(exports, "DomainConnection", { enumerable: true, get: function () { return DomainConnection_1.DomainConnection; } });
var WebSocketDomainServer_1 = require("./WebSocketDomainServer");
Object.defineProperty(exports, "WebSocketDomainServer", { enumerable: true, get: function () { return WebSocketDomainServer_1.WebSocketDomainServer; } });

},{"./DomainConnection":23,"./WebSocketDomainServer":29}],31:[function(require,module,exports){
/**
 * build-url - A small library that builds a URL given its components
 * @version v6.0.0
 * @link https://github.com/steverydz/build-url#readme
 * @license MIT
 */
;(function () {
  'use strict';

  var root = this;
  var previousBuildUrl = root.buildUrl;

  var encodedParam = function (param) {
    return param === null ? '' : encodeURIComponent(String(param).trim());
  };

  var buildUrl = function (url, options) {
    var queryString = [];
    var key;
    var builtUrl;
    var caseChange; 
    
    if (options && options.lowerCase) {
        caseChange = !!options.lowerCase;
    } else {
        caseChange = false;
    }

    if (url === null) {
      builtUrl = '';
    } else if (typeof(url) === 'object') {
      builtUrl = '';
      options = url;
    } else {
      builtUrl = url;
    }

    if (options) {
      if (options.path) {
        if(builtUrl && builtUrl[builtUrl.length - 1] === '/') {
          builtUrl = builtUrl.slice(0, -1);
        } 

        var localVar = String(options.path).trim(); 
        if (caseChange) {
          localVar = localVar.toLowerCase();
        }
        if (localVar.indexOf('/') === 0) {
            builtUrl += localVar;
        } else {
          builtUrl += '/' + localVar;
        }
      }

      if (options.queryParams) {
        for (key in options.queryParams) {
          if (options.queryParams.hasOwnProperty(key) && options.queryParams[key] !== void 0) {
            var param;
            if (options.disableCSV && Array.isArray(options.queryParams[key]) && options.queryParams[key].length) {
              for(var i = 0; i < options.queryParams[key].length; i++) {
                param = options.queryParams[key][i];
                queryString.push(key + '=' + encodedParam(param));
              }
            } else {              
              if (caseChange) {
                param = options.queryParams[key].toLowerCase();
              }
              else {
                param = options.queryParams[key];
              }
              queryString.push(key + '=' + encodedParam(param));
            }
          }
        }
        builtUrl += '?' + queryString.join('&');
      }

      if (options.hash) {
        if(caseChange)
            builtUrl += '#' + String(options.hash).trim().toLowerCase();
        else
            builtUrl += '#' + String(options.hash).trim();
      }
    } 
    return builtUrl;
  };

  buildUrl.noConflict = function () {
    root.buildUrl = previousBuildUrl;
    return buildUrl;
  };

  if (typeof(exports) !== 'undefined') {
    if (typeof(module) !== 'undefined' && module.exports) {
      exports = module.exports = buildUrl;
    }
    exports.buildUrl = buildUrl;
  } else {
    root.buildUrl = buildUrl;
  }
}).call(this);

},{}],32:[function(require,module,exports){
(function (global){(function (){
// https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

var ws = null

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket
} else if (typeof global !== 'undefined') {
  ws = global.WebSocket || global.MozWebSocket
} else if (typeof window !== 'undefined') {
  ws = window.WebSocket || window.MozWebSocket
} else if (typeof self !== 'undefined') {
  ws = self.WebSocket || self.MozWebSocket
}

module.exports = ws

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"./nil.js":35,"./parse.js":36,"./stringify.js":40,"./v1.js":41,"./v3.js":42,"./v4.js":44,"./v5.js":45,"./validate.js":46,"./version.js":47,"dup":1}],34:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],35:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],36:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"./validate.js":46,"dup":4}],37:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],38:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],39:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],40:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"./validate.js":46,"dup":8}],41:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"./rng.js":38,"./stringify.js":40,"dup":9}],42:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"./md5.js":34,"./v35.js":43,"dup":10}],43:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./parse.js":36,"./stringify.js":40,"dup":11}],44:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"./rng.js":38,"./stringify.js":40,"dup":12}],45:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"./sha1.js":39,"./v35.js":43,"dup":13}],46:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"./regex.js":37,"dup":14}],47:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"./validate.js":46,"dup":15}],48:[function(require,module,exports){
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
    function eventListener() {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };
    var errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = function errorListener(err) {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}

},{}]},{},[16]);
