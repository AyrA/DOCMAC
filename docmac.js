"use strict";

//Licensed under the MIT.

//Contains functions to create DOCMAC addresses
var DOCMAC = {};
//Contains functions to create DOCRAND addresses
var DOCRND = {};

//Checks if the argument is an array that represents valid MAC address segments in numerical form
//mac:  Result of parseMAC()
DOCMAC.isMAC = function (mac) {
    if (mac instanceof Array && mac.length === 6) {
        return mac.filter(v => isNaN(v) || v < 0 || v > 0xFF).length === 0;
    }
    return false;
};

//Formats a MAC address
//mac:  Result of parseMAC()
DOCMAC.formatMAC = function (mac) {
    if (!DOCMAC.isMAC(mac)) {
        throw new Error("Argument must be a valid MAC address array");
    }
    return mac.map(v => ("0" + v.toString(16)).substr(-2)).join(':').toUpperCase();
};

//Gets a unique DOCMAC address
//mac:            MAC address string or the result of parseMAC()
//shorten=false:  Shorten consecutive zero segments using "::" syntax
DOCMAC.getIPFromMAC = function (mac, shorten) {
    if (typeof(mac) === typeof("")) {
        mac = parseMAC(mac);
    }
    if (!DOCMAC.isMAC(mac)) {
        throw new Error("Argument not an array with 6 entries");
    }
    var addr = new Uint16Array(16);
    addr[0] = 0x2001;
    addr[1] = 0x0DB8;
    //Segments 2-12 are left as zero
    addr[13] = mac[0] << 8 | mac[1]; //Two MAC segments
    addr[14] = mac[2] << 8 | mac[3]; //fit into
    addr[15] = mac[4] << 8 | mac[5]; //one v6 segment
    return DOCMAC.formatIPv6(addr, shorten);
};

//Formats the supplied argument as a IPv6 address
//addr:           Uint16Array with 16 entries
//shorten=false:  Shorten consecutive zero segments using "::" syntax
DOCMAC.formatIPv6 = function (addr, shorten) {
    if (!(addr instanceof Uint16Array) || addr.length !== 16) {
        throw new Error("Invalid argument. Must be Uint16Array with 16 entries.");
    }
    //Note that this formatter is quite stupid.
    //It will replace the **first** repeating "0:0:..." pattern instead of the **longest**
    addr = Array.from(addr).map(v => v.toString(16)).join(':');
    if (shorten) {
        addr = addr.replace(/:(?:[0+]:)+/, "::");
    }
    return addr.toLowerCase();
};

//Tries to convert a MAC address string to a numerical array
//str:  MAC address in common format (hex with optional delimiter)
DOCMAC.parseMAC = function (str) {
    if (typeof(str) !== typeof("")) {
        throw new Error("Argument not a string");
    }
    var segments = str.trim().replace(/[_.\-:\s]+/g, ':').match(/[\dA-F]{1,2}/gi);
    if (segments instanceof Array && segments.length === 6) {
        segments = segments.map(v => parseInt(v, 16));
        if (DOCMAC.isMAC(segments)) {
            return segments;
        }
    }
};

//Generates a random IPv6 address from the documentation address space
//zeros=0:        Number of segments to keep as zero to shorten the IP. Range: 0-11
DOCRND.getRandomIP = function (zeros) {
    zeros |= 0;
    if (zeros > 13) {
        throw new Error("Cannot have more than 11 leading zero segments");
    }
    var addr = new Uint16Array(16).map(function (v, i) {
        if (i < 4) {
            return [0x2001, 0x0DB8, 0x4159, 0x5241][i];
        }
        return zeros-- > 0 ? 0 : Math.random() * 0x1000 | 0;
    });
    return {
        "short": DOCMAC.formatIPv6(addr, true),
        "long": DOCMAC.formatIPv6(addr, false),
        "raw:": addr
    };
};

Object.freeze(DOCMAC);
Object.freeze(DOCRND);
