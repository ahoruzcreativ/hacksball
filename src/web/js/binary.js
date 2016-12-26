class Binary
{
	static determineEndianness()
	{
		var buf = new ArrayBuffer(2);
		var u8arr = new Uint8Array(buf);
		var u16arr = new Uint16Array(buf);
		u8arr[0] = 0xab;
		u8arr[1] = 0xcd;
		if(u16arr[0] == 0xabcd)
		{
			return this.BIG_ENDIAN;
		}
		else if(u16arr[0] == 0xcdab)
		{
			return this.LITTLE_ENDIAN;
		}
		return this.UNSUPPORED;
	}
	static toString(u8, off)
	{
		if(arguments.length < 2)
		{
			off = 0;
		}
		var len = this.toUint32(u8, off);
		off += 4;
		var result = "";
		for(var i = 0; i + 1 < len * 2 && off + i + 1 < u8.length; i += 2)
		{
			if(this.endianness == this.BIG_ENDIAN)
			{
				var character = u8[off + i] | u8[off + i + 1] << 8;
			}
			else
			{
				var character = u8[off + i] << 8 | u8[off + i + 1];
			}
			result += String.fromCharCode(character);
		}
		return [len, result];
	}
	static fromUint8(uint8)
	{
		var buf = new ArrayBuffer(1);
		var arr = new Uint8Array(buf);
		arr[0] = uint8;
		return arr;
	}
	static toUint8(u8, off)
	{
		if(arguments.length < 2)
		{
			off = 0;
		}
		return u8[off];
	}
	static fromBool(val)
	{
		return this.fromUint8(val ? 1 : 0);
	}
	static toBool(b, off)
	{
		if(arguments.length < 2)
		{
			off = 0;
		}
		return b[off] == 0 ? false : true;
	}
	static fromUint32(uint32)
	{
		var buf = new ArrayBuffer(4);
		var arr = new Uint32Array(buf);
		arr[0] = uint32;
		if(this.endianness == this.LITTLE_ENDIAN)
		{
			arr[0] = (arr[0] & 0xFF) << 24 | (arr[0] & 0xFF00) << 8 | (arr[0] & 0xFF0000) >> 8 | (arr[0] & 0xFF000000) >> 24;
		}
		return new Uint8Array(buf);
	}
	static toUint32(u8, off)
	{
		if(arguments.length < 2)
		{
			off = 0;
		}
		if(this.endianness == this.BIG_ENDIAN)
		{
			return u8[off + 0] | u8[off + 1] << 8 | u8[off + 2] << 16 | u8[off + 3] << 24;
		}
		return u8[off + 0] << 24 | u8[off + 1] << 16 | u8[off + 2] << 8 | u8[off + 3];
	}
	static fromString(str)
	{
		var buf = new ArrayBuffer(4 + str.length * 2);
		var arr = new Uint16Array(buf);
		var u8 = new Uint8Array(buf);
		var len = this.fromUint32(str.length);
		for(var i = 0; i < 4; i++)
		{
			u8[i] = len[i];
		}
		for(var i = 0; i < str.length; i++)
		{
			arr[i + 2] = str.charCodeAt(i);
			if(this.endianness == this.LITTLE_ENDIAN)
			{
				arr[i + 2] = (arr[i + 2] & 0xFF) << 8 | ((arr[i + 2] >> 8) & 0xFF)
			}
		}
		return u8;
	}
}
Binary.LITTLE_ENDIAN = 0;
Binary.BIG_ENDIAN = 1;
Binary.UNSUPPORTED = -1;
Binary.endianness = Binary.determineEndianness();

class BinaryReader
{
	constructor(arr)
	{
		this.arr = arr;
		this.offset = 0;
	}
	readUint32()
	{
		var result = Binary.toUint32(this.arr, this.offset);
		this.offset += 4;
		return result;
	}
	readString()
	{
		var result = Binary.toString(this.arr, this.offset);
		this.offset += 4 + result[0] * 2;
		return result[1];
	}
	readBool()
	{
		return this.readUint8() != 0;
	}
	readUint8()
	{
		var result = Binary.toUint8(this.arr, this.offset);
		this.offset += 1;
		return result;
	}
}

class Uint8Buffer // Class does not perform expensive instanceof checks for performance reasons
{
	constructor()
	{
		this.arrays = [];
		this.length = 0;
	}
	append(arr)
	{
		if(arr.length <= 0)
		{
			return;
		}
		this.arrays.push(arr);
		this.length += arr.length;
	}
	toArray()
	{
		var target = new Uint8Array(this.length);
		var j = 0; // array index
		var i = 0; // byte index of current array
		var t = 0; // target offset
		while(j < this.arrays.length)
		{
			if(i >= this.arrays[j].length)
			{
				i = 0;
				j++;
				continue;
			}
			target[t++] = this.arrays[j][i++];
		}
		return target;
	}
}
