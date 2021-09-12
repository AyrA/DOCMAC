# DOCMAC IP addresses

DOCMAC allows you to assign valid routable IPv6 addresses to all your network interfaces.

The address space is used for documentation,
and the address is generated using a MAC address (hence DOC-MAC).

This tricks a system into thinking it has a routable IPv6 network available.

## Definitions

List of definitions used in this document

### uint8

An 8 bit unsigned integer,
also known as "byte" or "octet".

### uint16

A 16 bit unsigned integer,
Also known as "word".

### index

A zero based offset of an array.
Index zero is the first entry and index "array_length - 1" is the last entry.

### 0x...

A hexadecimal number.

### MAC address

Unique address of a network interface consisting of 6 uint8 numbers,
often formatted as two digit hexadecimal numbers with `:` or `-` between them.

## Range information

The documentation IP range is `2001:DB8::/32`.
None of the addresses in this range has any further meaning.
This means up to 14 address segments can be freely chosen.
DOCMAC reserves the first two of them (index 2 and 3 of an IPv6 address)
for future expansion to the standard.

### Known values for the reserved indexes

Below is a list of all known indexes.
A client must treat an unknown extension
as a standard IPv6 address without any special meaning.

#### `0x0,0x0`

Regular DOCMAC address.

#### `0x1,0x0`

Short-lived DOCMAC address.
This indicates that the address is likely not going to stay around for a long time,
for example due to frequent MAC address randomization.
If the address disappears and reappears at a later time,
a client has to assume that the reappearing address belongs to a different device.

#### `0x4159,0x5241`

DOCRND address (see further below) for an explanation.

#### `0xFFFF,0x0` - `0xFFFF,0xFFFF`

User defined extensions.
These are free to use for 3rd party extensions and flags.
A value in this range can never become a standard.

## DOCMAC generation

1. Create an array with 16 uint16 entries set to zero
2. Set index 0 to `0x2001`
3. Set index 1 to `0x0DB8`
4. Optionally set index 2 to `0x1` to indicate that this is a short lived address
5. Fill the last 3 indexes (13,14,15) with the MAC address

Filling of the addres is performed by grouping two numbers together into a single uint16.

### Example MAC fill code

*This code uses C style syntax*
*Order of operations is "shift" before "or" before "assign"*

- "addr" is the IPv6 array with 16 uint16 entries
- "mac" is the mac address array with 6 uint8 entries.

```C
addr[13] = mac[0] << 8 | mac[1];
addr[14] = mac[2] << 8 | mac[3];
addr[15] = mac[4] << 8 | mac[5];
```

# DOCRND

This is similar to DOCMAC but uses a random number generator instead of a constant value.

It works the same way and uses the same address space.

Differences:

- Index 2 is set to `0x4159`
- Index 3 is set to `0x5241`
- Up to 9 following indexes may be set to zero to shorten the address
- The remaining indexes are randomly assigned a number `0x0 - 0xFFFF` inclusive

The default is to zero 9 indexes.
This makes the random address space just as large as the DOCMAC address space.

# Usage

DOCMAC and DOCRND are very easy to use.
Very few lines are required.
The global DOCMAC object has more functions if needed.

## DOCMAC

```js
//"true" means shorten the address using "::"
console.log(DOCMAC.getIPFromMAC("FF-EE-DD-CC-BB-AA", true));
```

## DOCRND

```js
var zeros = 9;
var result = DOCRND.getRandomIP(zeros);
console.log(result["short"]); //Address shortened with "::" syntax
console.log(result["long"]);  //Address in expanded format
console.log(result["raw"]);   //Address as Uint16Array instance
```

# Example

[Reference implemantation in use](https://cable.ayra.ch/docmac/)
