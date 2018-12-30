/*! lightly modified version of https://mths.be/utf8js v3.0.0 by @mathias, all credits go there */

const stringFromCharCode = String.fromCharCode;

export const version = '3.0.0';

// Taken from https://mths.be/punycode
function ucs2decode(string: string): number[] {
  const output = [];
  let counter = 0;
  const length = string.length;
  while (counter < length) {
    const value = string.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // high surrogate, and there is a next character
      const extra = string.charCodeAt(counter++);
      if ((extra & 0xFC00) == 0xDC00) { // low surrogate
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // unmatched surrogate; only append this code unit, in case the next
        // code unit is the high surrogate of a surrogate pair
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}

// Taken from https://mths.be/punycode
function ucs2encode(array: number[]): string {
  const length = array.length;
  let index = -1;
  let output = '';
  while (++index < length) {
    let value = array[index];
    if (value > 0xFFFF) {
      value -= 0x10000;
      output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
      value = 0xDC00 | value & 0x3FF;
    }
    output += stringFromCharCode(value);
  }
  return output;
}

function checkScalarValue(codePoint: number) {
  if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
    throw Error(`Lone surrogate U+${codePoint.toString(16).toUpperCase()} is not a scalar value`);
  }
}
/*--------------------------------------------------------------------------*/

function createByte(codePoint: number, shift: number): string {
  return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
}

function encodeCodePoint(codePoint: number) {
  if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
    return stringFromCharCode(codePoint);
  }
  let symbol = '';
  if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
    symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
  }
  else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
    checkScalarValue(codePoint);
    symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
    symbol += createByte(codePoint, 6);
  }
  else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
    symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
    symbol += createByte(codePoint, 12);
    symbol += createByte(codePoint, 6);
  }
  symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
  return symbol;
}

export function utf8encode(string: string): string {
  const codePoints = ucs2decode(string);
  const length = codePoints.length;
  let index = -1;
  let byteString = '';
  while (++index < length) {
    const codePoint = codePoints[index];
    byteString += encodeCodePoint(codePoint);
  }
  return byteString;
}

/*--------------------------------------------------------------------------*/

export function utf8decode(byteString: string): string {
  const byteArray = ucs2decode(byteString);
  const byteCount = byteArray.length;
  let byteIndex = 0;
  const codePoints = [];

  // scoped functions
  const readContinuationByte = () => {
    if (byteIndex >= byteCount) {
      throw Error('Invalid byte index');
    }
    const continuationByte = byteArray[byteIndex] & 0xFF;
    byteIndex++;
    if ((continuationByte & 0xC0) == 0x80) {
      return continuationByte & 0x3F;
    }
    // If we end up here, it’s not a continuation byte
    throw Error('Invalid continuation byte');
  }

  const decodeSymbol = (): number|null => {
		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
    }
		if (byteIndex == byteCount) {
			return null;
		}
		// Read first byte
		const byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;
		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}
		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			const byte2 = readContinuationByte();
			const codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}
		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			const byte2 = readContinuationByte();
			const byte3 = readContinuationByte();
			const codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				checkScalarValue(codePoint);
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}
		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			const byte2 = readContinuationByte();
			const byte3 = readContinuationByte();
			const byte4 = readContinuationByte();
			const codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}
		throw Error('Invalid UTF-8 detected');
	}
  let tmp: number|null;
  while (tmp = decodeSymbol()) {
    codePoints.push(tmp);
  }
  return ucs2encode(codePoints);
}
/*--------------------------------------------------------------------------*/