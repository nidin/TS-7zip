Array.prototype.ElementClass = null;
Array.prototype.clear = function () {
    this.splice(0, this.length);
};
Array.prototype.reserve = function (size) {
    if (this.ElementClass != null && this.ElementClass != undefined) {
        for (var i = 0; i < size; i++) {
            this.push(new this.ElementClass());
        }
    } else {
        throw {
            name: 'Reserve class undefined',
            message: 'ElementClass no defined to reserve an Array'
        };
    }
};
/**
* JavaScript UInt64
* version : 0.1
* @author Nidin Vinayakan | nidinthb@gmail.com
*
*/
var ctypes;
(function (ctypes) {
    var UInt64 = (function () {
        function UInt64(low, high) {
            if (typeof low === "undefined") { low = 0; }
            if (typeof high === "undefined") { high = 0; }
            this.low = low;
            this.high = high;
        }
        UInt64.prototype.value = function () {
            this._value = (this.high << 32) | this.low;
            return this._value;
        };
        return UInt64;
    })();
    ctypes.UInt64 = UInt64;
})(ctypes || (ctypes = {}));
/**
* JavaScript Int64
* version : 0.1
* @author Nidin Vinayakan | nidinthb@gmail.com
*
*/
var ctypes;
(function (ctypes) {
    var Int64 = (function () {
        function Int64(low, high) {
            this.low = low;
            this.high = high;
        }
        Int64.prototype.value = function () {
            this._value = (this.high << 32) | this.low;
            return this._value;
        };
        return Int64;
    })();
    ctypes.Int64 = Int64;
})(ctypes || (ctypes = {}));
var nid;
(function (nid) {
    (function (utils) {
        var LZMAHelper = (function () {
            function LZMAHelper() {
            }
            LZMAHelper.init = function () {
                var command = 0;
                LZMAHelper.decoderAsync.onmessage = function (e) {
                    if (command == 0) {
                        command = e.data;
                    } else if (command == LZMAHelper.ENCODE) {
                        command = 0; //encode not implemented
                    } else if (command == LZMAHelper.DECODE) {
                        command = 0;
                        LZMAHelper.callback(e.data);
                        LZMAHelper.callback = null;
                    }
                };
            };

            /*static encode(data:ArrayBuffer):ArrayBuffer{
            return null;
            }
            static decode(data:ArrayBuffer):ArrayBuffer{
            return LZMAHelper.decoder.decode(new Uint8Array(data)).buffer;
            }*/
            LZMAHelper.encodeAsync = function (data, _callback) {
            };
            LZMAHelper.decodeAsync = function (data, _callback) {
                if (LZMAHelper.callback == null) {
                    LZMAHelper.callback = _callback;
                    LZMAHelper.decoderAsync.postMessage(LZMAHelper.DECODE);
                    LZMAHelper.decoderAsync.postMessage(data, [data]);
                } else {
                    console.log('Warning! Another LZMA decoding is running...');
                }
            };
            LZMAHelper.decoderAsync = new Worker('LZMAWorker.min.js');

            LZMAHelper.ENCODE = 1;
            LZMAHelper.DECODE = 2;
            return LZMAHelper;
        })();
        utils.LZMAHelper = LZMAHelper;
    })(nid.utils || (nid.utils = {}));
    var utils = nid.utils;
})(nid || (nid = {}));
nid.utils.LZMAHelper.init();
var nid;
(function (nid) {
    (function (utils) {
        /**
        * JavaScript ByteArray
        * version : 0.2
        * @author Nidin Vinayakan | nidinthb@gmail.com
        */
        var CompressionAlgorithm = (function () {
            function CompressionAlgorithm() {
            }
            CompressionAlgorithm.DEFLATE = "deflate";
            CompressionAlgorithm.LZMA = "lzma";
            CompressionAlgorithm.ZLIB = "zlib";
            return CompressionAlgorithm;
        })();
        utils.CompressionAlgorithm = CompressionAlgorithm;
    })(nid.utils || (nid.utils = {}));
    var utils = nid.utils;
})(nid || (nid = {}));
var nid;
(function (nid) {
    ///<reference path="./ctypes/ctypes.d.ts" />
    ///<reference path="./LZMAHelper.ts" />
    ///<reference path="CompressionAlgorithm.ts" />
    /**
    * JavaScript ByteArray
    * version : 0.2
    * @author Nidin Vinayakan | nidinthb@gmail.com
    *
    * ActionScript3 ByteArray implementation in JavaScript
    * limitation : size of ByteArray cannot be changed
    *
    */
    (function (utils) {
        var UInt64 = ctypes.UInt64;
        var Int64 = ctypes.Int64;

        var ByteArray = (function () {
            function ByteArray(buffer, offset) {
                if (typeof offset === "undefined") { offset = 0; }
                this.BUFFER_EXT_SIZE = 1024;
                this.offset = 0;
                this.EOF_byte = -1;
                this.EOF_code_point = -1;
                if (typeof (buffer) === "undefined") {
                    buffer = new ArrayBuffer(this.BUFFER_EXT_SIZE);
                    this.write_position = 0;
                } else {
                    this.write_position = buffer.byteLength;
                }
                this.data = new DataView(buffer);
                this._position = 0;
                this.offset = offset;
                this.endian = ByteArray.BIG_ENDIAN;
            }
            Object.defineProperty(ByteArray.prototype, "buffer", {
                // getter setter
                get: function () {
                    return this.data.buffer;
                },
                set: function (value) {
                    this.data = new DataView(value);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ByteArray.prototype, "dataView", {
                get: function () {
                    return this.data;
                },
                set: function (value) {
                    this.data = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ByteArray.prototype, "position", {
                get: function () {
                    return this._position + this.offset;
                },
                set: function (value) {
                    if (this._position < value) {
                        if (!this.validate(this._position - value)) {
                            return;
                        }
                    }
                    this._position = value;
                    this.write_position = value > this.write_position ? value : this.write_position;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ByteArray.prototype, "length", {
                get: function () {
                    return this.write_position;
                },
                set: function (value) {
                    this.validateBuffer(value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
                get: function () {
                    return this.data.byteLength - this.position;
                },
                enumerable: true,
                configurable: true
            });

            //end
            ByteArray.prototype.clear = function () {
                this._position = 0;
            };
            ByteArray.prototype.compress = function (algorithm) {
                if (typeof algorithm === "undefined") { algorithm = utils.CompressionAlgorithm.LZMA; }
                if (algorithm == utils.CompressionAlgorithm.LZMA) {
                } else {
                    throw {
                        name: "Compression error!",
                        message: algorithm + " not implemented",
                        errorID: 0
                    };
                }
            };

            /*public uncompress(algorithm:string=CompressionAlgorithm.LZMA) : void{
            if(algorithm == CompressionAlgorithm.LZMA) {
            try {
            this.buffer = LZMAHelper.decode(this.buffer);
            } catch (e) {
            throw{
            name: "Uncompression error!",
            message: e.message,
            errorID: 0
            }
            }
            }else{
            throw{
            name:"Uncompression error!",
            message:algorithm+" not implemented",
            errorID:0
            }
            }
            }*/
            ByteArray.prototype.compressAsync = function (algorithm, callback) {
                if (algorithm == utils.CompressionAlgorithm.LZMA) {
                } else {
                    throw {
                        name: "Compression error!",
                        message: algorithm + " not implemented",
                        errorID: 0
                    };
                }
            };
            ByteArray.prototype.uncompressAsync = function (algorithm, callback) {
                if (typeof algorithm === "undefined") { algorithm = utils.CompressionAlgorithm.LZMA; }
                if (typeof callback === "undefined") { callback = null; }
                if (algorithm == utils.CompressionAlgorithm.LZMA) {
                    utils.LZMAHelper.decodeAsync(this.buffer, function (_data) {
                        this.buffer = _data;
                    });
                } else {
                    throw {
                        name: "Uncompression error!",
                        message: algorithm + " not implemented",
                        errorID: 0
                    };
                }
            };
            ByteArray.prototype.deflate = function () {
            };
            ByteArray.prototype.inflate = function () {
            };

            /**
            * Reads a Boolean value from the byte stream. A single byte is read,
            * and true is returned if the byte is nonzero,
            * false otherwise.
            * @return	Returns true if the byte is nonzero, false otherwise.
            */
            ByteArray.prototype.readBoolean = function () {
                if (!this.validate(ByteArray.SIZE_OF_BOOLEAN))
                    return null;

                return this.data.getUint8(this.position++) != 0;
            };

            /**
            * Reads a signed byte from the byte stream.
            * The returned value is in the range -128 to 127.
            * @return	An integer between -128 and 127.
            */
            ByteArray.prototype.readByte = function () {
                if (!this.validate(ByteArray.SIZE_OF_INT8))
                    return null;

                return this.data.getInt8(this.position++);
            };

            /**
            * Reads the number of data bytes, specified by the length parameter, from the byte stream.
            * The bytes are read into the ByteArray object specified by the bytes parameter,
            * and the bytes are written into the destination ByteArray starting at the _position specified by offset.
            * @param	bytes	The ByteArray object to read data into.
            * @param	offset	The offset (_position) in bytes at which the read data should be written.
            * @param	length	The number of bytes to read.  The default value of 0 causes all available data to be read.
            */
            ByteArray.prototype.readBytes = function (bytes, offset, length) {
                if (typeof offset === "undefined") { offset = 0; }
                if (typeof length === "undefined") { length = 0; }
                if (!this.validate(length))
                    return;
                var tmp_data = new DataView(this.data.buffer, this.position, length);
                this.position += length;

                //This method is expensive
                //for(var i=0; i < length;i++){
                //tmp_data.setUint8(i,this.data.getUint8(this.position++));
                //}
                bytes.dataView = tmp_data;
            };

            /**
            * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
            * @return	A double-precision (64-bit) floating-point number.
            */
            ByteArray.prototype.readDouble = function () {
                if (!this.validate(ByteArray.SIZE_OF_FLOAT64))
                    return null;

                var value = this.data.getFloat64(this.position);
                this.position += ByteArray.SIZE_OF_FLOAT64;
                return value;
            };

            /**
            * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
            * @return	A single-precision (32-bit) floating-point number.
            */
            ByteArray.prototype.readFloat = function () {
                if (!this.validate(ByteArray.SIZE_OF_FLOAT32))
                    return null;

                var value = this.data.getFloat32(this.position);
                this.position += ByteArray.SIZE_OF_FLOAT32;
                return value;
            };

            /**
            * Reads a signed 32-bit integer from the byte stream.
            *
            *   The returned value is in the range -2147483648 to 2147483647.
            * @return	A 32-bit signed integer between -2147483648 and 2147483647.
            */
            ByteArray.prototype.readInt = function () {
                if (!this.validate(ByteArray.SIZE_OF_INT32))
                    return null;

                var value = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT32;
                return value;
            };

            /**
            * Reads a signed 64-bit integer from the byte stream.
            *
            *   The returned value is in the range −(2^63) to 2^63 − 1
            * @return	A 64-bit signed integer between −(2^63) to 2^63 − 1
            */
            ByteArray.prototype.readInt64 = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT32))
                    return null;

                var low = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT32;
                var high = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT32;
                return new Int64(low, high);
            };

            /**
            * Reads a multibyte string of specified length from the byte stream using the
            * specified character set.
            * @param	length	The number of bytes from the byte stream to read.
            * @param	charSet	The string denoting the character set to use to interpret the bytes.
            *   Possible character set strings include "shift-jis", "cn-gb",
            *   "iso-8859-1", and others.
            *   For a complete list, see Supported Character Sets.
            *   Note: If the value for the charSet parameter
            *   is not recognized by the current system, the application uses the system's default
            *   code page as the character set. For example, a value for the charSet parameter,
            *   as in myTest.readMultiByte(22, "iso-8859-01") that uses 01 instead of
            *   1 might work on your development system, but not on another system.
            *   On the other system, the application will use the system's default code page.
            * @return	UTF-8 encoded string.
            */
            ByteArray.prototype.readMultiByte = function (length, charSet) {
                if (!this.validate(length))
                    return null;

                return "";
            };

            /**
            * Reads an object from the byte array, encoded in AMF
            * serialized format.
            * @return	The deserialized object.
            */
            ByteArray.prototype.readObject = function () {
                //return this.readAmfObject();
                return null;
            };

            /**
            * Reads a signed 16-bit integer from the byte stream.
            *
            *   The returned value is in the range -32768 to 32767.
            * @return	A 16-bit signed integer between -32768 and 32767.
            */
            ByteArray.prototype.readShort = function () {
                if (!this.validate(ByteArray.SIZE_OF_INT16))
                    return null;

                var value = this.data.getInt16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT16;
                return value;
            };

            /**
            * Reads an unsigned byte from the byte stream.
            *
            *   The returned value is in the range 0 to 255.
            * @return	A 32-bit unsigned integer between 0 and 255.
            */
            ByteArray.prototype.readUnsignedByte = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT8))
                    return null;

                return this.data.getUint8(this.position++);
            };

            /**
            * Reads an unsigned 32-bit integer from the byte stream.
            *
            *   The returned value is in the range 0 to 4294967295.
            * @return	A 32-bit unsigned integer between 0 and 4294967295.
            */
            ByteArray.prototype.readUnsignedInt = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT32))
                    return null;

                var value = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT32;
                return value;
            };

            /**
            * Reads an unsigned 64-bit integer from the byte stream.
            *
            *   The returned value is in the range 0 to 2^64 − 1.
            * @return	A 64-bit unsigned integer between 0 and 2^64 − 1
            */
            ByteArray.prototype.readUnsignedInt64 = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT32))
                    return null;

                var low = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT32;
                var high = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT32;
                return new UInt64(low, high);
            };

            /**
            * Reads an unsigned 16-bit integer from the byte stream.
            *
            *   The returned value is in the range 0 to 65535.
            * @return	A 16-bit unsigned integer between 0 and 65535.
            */
            ByteArray.prototype.readUnsignedShort = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT16))
                    return null;

                var value = this.data.getUint16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT16;
                return value;
            };

            /**
            * Reads a UTF-8 string from the byte stream.  The string
            * is assumed to be prefixed with an unsigned short indicating
            * the length in bytes.
            * @return	UTF-8 encoded  string.
            */
            ByteArray.prototype.readUTF = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT16))
                    return null;

                var length = this.data.getUint16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT16;

                if (length > 0) {
                    return this.readUTFBytes(length);
                } else {
                    return "";
                }
            };

            /**
            * Reads a sequence of UTF-8 bytes specified by the length
            * parameter from the byte stream and returns a string.
            * @param	length	An unsigned short indicating the length of the UTF-8 bytes.
            * @return	A string composed of the UTF-8 bytes of the specified length.
            */
            ByteArray.prototype.readUTFBytes = function (length) {
                if (!this.validate(length))
                    return null;

                var bytes = new Uint8Array(new ArrayBuffer(length));
                for (var i = 0; i < length; i++) {
                    bytes[i] = this.data.getUint8(this.position++);
                }
                return this.decodeUTF8(bytes);
            };

            /**
            * Writes a Boolean value. A single byte is written according to the value parameter,
            * either 1 if true or 0 if false.
            * @param	value	A Boolean value determining which byte is written. If the parameter is true,
            *   the method writes a 1; if false, the method writes a 0.
            */
            ByteArray.prototype.writeBoolean = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_BOOLEAN);

                this.data.setUint8(this.position++, value ? 1 : 0);
            };

            /**
            * Writes a byte to the byte stream.
            * The low 8 bits of the
            * parameter are used. The high 24 bits are ignored.
            * @param	value	A 32-bit integer. The low 8 bits are written to the byte stream.
            */
            ByteArray.prototype.writeByte = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_INT8);

                this.data.setInt8(this.position++, value);
            };
            ByteArray.prototype.writeUnsignedByte = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_UINT8);

                this.data.setUint8(this.position++, value);
            };

            /**
            * Writes a sequence of length bytes from the
            * specified byte array, bytes,
            * starting offset(zero-based index) bytes
            * into the byte stream.
            *
            *   If the length parameter is omitted, the default
            * length of 0 is used; the method writes the entire buffer starting at
            * offset.
            * If the offset parameter is also omitted, the entire buffer is
            * written. If offset or length
            * is out of range, they are clamped to the beginning and end
            * of the bytes array.
            * @param	bytes	The ByteArray object.
            * @param	offset	A zero-based index indicating the _position into the array to begin writing.
            * @param	length	An unsigned integer indicating how far into the buffer to write.
            */
            ByteArray.prototype.writeBytes = function (bytes, offset, length) {
                if (typeof offset === "undefined") { offset = 0; }
                if (typeof length === "undefined") { length = 0; }
                this.validateBuffer(length);

                var tmp_data = new DataView(bytes.buffer);
                for (var i = 0; i < bytes.length; i++) {
                    this.data.setUint8(this.position++, tmp_data.getUint8(i));
                }
            };

            /**
            * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
            * @param	value	A double-precision (64-bit) floating-point number.
            */
            ByteArray.prototype.writeDouble = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_FLOAT64);

                this.data.setFloat64(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_FLOAT64;
            };

            /**
            * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
            * @param	value	A single-precision (32-bit) floating-point number.
            */
            ByteArray.prototype.writeFloat = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_FLOAT32);

                this.data.setFloat32(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_FLOAT32;
            };

            /**
            * Writes a 32-bit signed integer to the byte stream.
            * @param	value	An integer to write to the byte stream.
            */
            ByteArray.prototype.writeInt = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_INT32);

                this.data.setInt32(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT32;
            };

            /**
            * Writes a multibyte string to the byte stream using the specified character set.
            * @param	value	The string value to be written.
            * @param	charSet	The string denoting the character set to use. Possible character set strings
            *   include "shift-jis", "cn-gb", "iso-8859-1", and others.
            *   For a complete list, see Supported Character Sets.
            */
            ByteArray.prototype.writeMultiByte = function (value, charSet) {
            };

            /**
            * Writes an object into the byte array in AMF
            * serialized format.
            * @param	object	The object to serialize.
            */
            ByteArray.prototype.writeObject = function (value) {
            };

            /**
            * Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used.
            * The high 16 bits are ignored.
            * @param	value	32-bit integer, whose low 16 bits are written to the byte stream.
            */
            ByteArray.prototype.writeShort = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_INT16);

                this.data.setInt16(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT16;
            };
            ByteArray.prototype.writeUnsignedShort = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_UINT16);

                this.data.setUint16(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT16;
            };

            /**
            * Writes a 32-bit unsigned integer to the byte stream.
            * @param	value	An unsigned integer to write to the byte stream.
            */
            ByteArray.prototype.writeUnsignedInt = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_UINT32);

                this.data.setUint32(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT32;
            };

            /**
            * Writes a UTF-8 string to the byte stream. The length of the UTF-8 string in bytes
            * is written first, as a 16-bit integer, followed by the bytes representing the
            * characters of the string.
            * @param	value	The string value to be written.
            */
            ByteArray.prototype.writeUTF = function (value) {
                var utf8bytes = this.encodeUTF8(value);
                var length = utf8bytes.length;

                this.validateBuffer(ByteArray.SIZE_OF_UINT16 + length);

                this.data.setUint16(this.position, length, this.endian === ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT16;
                this.writeUint8Array(utf8bytes);
            };

            /**
            * Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method,
            * but writeUTFBytes() does not prefix the string with a 16-bit length word.
            * @param	value	The string value to be written.
            */
            ByteArray.prototype.writeUTFBytes = function (value) {
                this.writeUint8Array(this.encodeUTF8(value));
            };

            ByteArray.prototype.toString = function () {
                return "[ByteArray]";
            };

            /****************************/
            /* EXTRA JAVASCRIPT APIs    */
            /****************************/
            /**
            * Writes a Uint8Array to the byte stream.
            * @param	value	The Uint8Array to be written.
            */
            ByteArray.prototype.writeUint8Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setUint8(this.position++, bytes[i]);
                }
            };

            /**
            * Writes a Uint16Array to the byte stream.
            * @param	value	The Uint16Array to be written.
            */
            ByteArray.prototype.writeUint16Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setUint16(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT16;
                }
            };

            /**
            * Writes a Uint32Array to the byte stream.
            * @param	value	The Uint32Array to be written.
            */
            ByteArray.prototype.writeUint32Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setUint32(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT32;
                }
            };

            /**
            * Writes a Int8Array to the byte stream.
            * @param	value	The Int8Array to be written.
            */
            ByteArray.prototype.writeInt8Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setInt8(this.position++, bytes[i]);
                }
            };

            /**
            * Writes a Int16Array to the byte stream.
            * @param	value	The Int16Array to be written.
            */
            ByteArray.prototype.writeInt16Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setInt16(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT16;
                }
            };

            /**
            * Writes a Int32Array to the byte stream.
            * @param	value	The Int32Array to be written.
            */
            ByteArray.prototype.writeInt32Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setInt32(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT32;
                }
            };

            /**
            * Writes a Float32Array to the byte stream.
            * @param	value	The Float32Array to be written.
            */
            ByteArray.prototype.writeFloat32Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setFloat32(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT32;
                }
            };

            /**
            * Writes a Float64Array to the byte stream.
            * @param	value	The Float64Array to be written.
            */
            ByteArray.prototype.writeFloat64Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setFloat64(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT64;
                }
            };

            /**
            * Read a Uint8Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Uint8Array.
            */
            ByteArray.prototype.readUint8Array = function (length) {
                if (!this.validate(length))
                    return null;
                var result = new Uint8Array(new ArrayBuffer(length));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint8(this.position);
                    this.position += ByteArray.SIZE_OF_UINT8;
                }
                return result;
            };

            /**
            * Read a Uint16Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Uint16Array.
            */
            ByteArray.prototype.readUint16Array = function (length) {
                var size = length * ByteArray.SIZE_OF_UINT16;
                if (!this.validate(size))
                    return null;
                var result = new Uint16Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint16(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT16;
                }
                return result;
            };

            /**
            * Read a Uint32Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Uint32Array.
            */
            ByteArray.prototype.readUint32Array = function (length) {
                var size = length * ByteArray.SIZE_OF_UINT32;
                if (!this.validate(size))
                    return null;
                var result = new Uint32Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint32(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT32;
                }
                return result;
            };

            /**
            * Read a Int8Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Int8Array.
            */
            ByteArray.prototype.readInt8Array = function (length) {
                if (!this.validate(length))
                    return null;
                var result = new Int8Array(new ArrayBuffer(length));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getInt8(this.position);
                    this.position += ByteArray.SIZE_OF_INT8;
                }
                return result;
            };

            /**
            * Read a Int16Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Int16Array.
            */
            ByteArray.prototype.readInt16Array = function (length) {
                var size = length * ByteArray.SIZE_OF_INT16;
                if (!this.validate(size))
                    return null;
                var result = new Int16Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getInt16(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT16;
                }
                return result;
            };

            /**
            * Read a Int32Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Int32Array.
            */
            ByteArray.prototype.readInt32Array = function (length) {
                var size = length * ByteArray.SIZE_OF_INT32;
                if (!this.validate(size))
                    return null;
                var result = new Int32Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getInt32(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT32;
                }
                return result;
            };

            /**
            * Read a Float32Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Float32Array.
            */
            ByteArray.prototype.readFloat32Array = function (length) {
                var size = length * ByteArray.SIZE_OF_FLOAT32;
                if (!this.validate(size))
                    return null;
                var result = new Float32Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getFloat32(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT32;
                }
                return result;
            };

            /**
            * Read a Float64Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Float64Array.
            */
            ByteArray.prototype.readFloat64Array = function (length) {
                var size = length * ByteArray.SIZE_OF_FLOAT64;
                if (!this.validate(size))
                    return null;
                var result = new Float64Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getFloat64(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT64;
                }
                return result;
            };

            /**********************/
            /*  PRIVATE METHODS   */
            /**********************/
            ByteArray.prototype.validate = function (len) {
                len += this.offset;
                if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength) {
                    return true;
                } else {
                    throw {
                        name: 'Error',
                        message: 'Error #2030: End of file was encountered.',
                        errorID: 2030
                    };
                }
            };
            ByteArray.prototype.validateBuffer = function (len) {
                this.write_position = len > this.write_position ? len : this.write_position;
                if (this.data.byteLength < len) {
                    var tmp = new Uint8Array(new ArrayBuffer(len + this.BUFFER_EXT_SIZE));
                    tmp.set(new Uint8Array(this.data.buffer));
                    this.data.buffer = tmp.buffer;
                }
            };

            /**
            * UTF-8 Encoding/Decoding
            */
            ByteArray.prototype.encodeUTF8 = function (str) {
                var pos = 0;
                var codePoints = this.stringToCodePoints(str);
                var outputBytes = [];

                while (codePoints.length > pos) {
                    var code_point = codePoints[pos++];

                    if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                        this.encoderError(code_point);
                    } else if (this.inRange(code_point, 0x0000, 0x007f)) {
                        outputBytes.push(code_point);
                    } else {
                        var count, offset;
                        if (this.inRange(code_point, 0x0080, 0x07FF)) {
                            count = 1;
                            offset = 0xC0;
                        } else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                            count = 2;
                            offset = 0xE0;
                        } else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                            count = 3;
                            offset = 0xF0;
                        }

                        outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);

                        while (count > 0) {
                            var temp = this.div(code_point, Math.pow(64, count - 1));
                            outputBytes.push(0x80 + (temp % 64));
                            count -= 1;
                        }
                    }
                }
                return new Uint8Array(outputBytes);
            };
            ByteArray.prototype.decodeUTF8 = function (data) {
                var fatal = false;
                var pos = 0;
                var result = "";
                var code_point;
                var utf8_code_point = 0;
                var utf8_bytes_needed = 0;
                var utf8_bytes_seen = 0;
                var utf8_lower_boundary = 0;

                while (data.length > pos) {
                    var _byte = data[pos++];

                    if (_byte === this.EOF_byte) {
                        if (utf8_bytes_needed !== 0) {
                            code_point = this.decoderError(fatal);
                        } else {
                            code_point = this.EOF_code_point;
                        }
                    } else {
                        if (utf8_bytes_needed === 0) {
                            if (this.inRange(_byte, 0x00, 0x7F)) {
                                code_point = _byte;
                            } else {
                                if (this.inRange(_byte, 0xC2, 0xDF)) {
                                    utf8_bytes_needed = 1;
                                    utf8_lower_boundary = 0x80;
                                    utf8_code_point = _byte - 0xC0;
                                } else if (this.inRange(_byte, 0xE0, 0xEF)) {
                                    utf8_bytes_needed = 2;
                                    utf8_lower_boundary = 0x800;
                                    utf8_code_point = _byte - 0xE0;
                                } else if (this.inRange(_byte, 0xF0, 0xF4)) {
                                    utf8_bytes_needed = 3;
                                    utf8_lower_boundary = 0x10000;
                                    utf8_code_point = _byte - 0xF0;
                                } else {
                                    this.decoderError(fatal);
                                }
                                utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                                code_point = null;
                            }
                        } else if (!this.inRange(_byte, 0x80, 0xBF)) {
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            pos--;
                            code_point = this.decoderError(fatal, _byte);
                        } else {
                            utf8_bytes_seen += 1;
                            utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);

                            if (utf8_bytes_seen !== utf8_bytes_needed) {
                                code_point = null;
                            } else {
                                var cp = utf8_code_point;
                                var lower_boundary = utf8_lower_boundary;
                                utf8_code_point = 0;
                                utf8_bytes_needed = 0;
                                utf8_bytes_seen = 0;
                                utf8_lower_boundary = 0;
                                if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                    code_point = cp;
                                } else {
                                    code_point = this.decoderError(fatal, _byte);
                                }
                            }
                        }
                    }

                    //Decode string
                    if (code_point !== null && code_point !== this.EOF_code_point) {
                        if (code_point <= 0xFFFF) {
                            if (code_point > 0)
                                result += String.fromCharCode(code_point);
                        } else {
                            code_point -= 0x10000;
                            result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                            result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                        }
                    }
                }
                return result;
            };
            ByteArray.prototype.encoderError = function (code_point) {
                throw {
                    name: 'EncodingError',
                    message: 'The code point ' + code_point + ' could not be encoded.',
                    errorID: 0
                };
            };
            ByteArray.prototype.decoderError = function (fatal, opt_code_point) {
                if (fatal) {
                    throw {
                        name: 'DecodingError',
                        message: 'DecodingError.',
                        errorID: 0
                    };
                }
                return opt_code_point || 0xFFFD;
            };

            ByteArray.prototype.inRange = function (a, min, max) {
                return min <= a && a <= max;
            };
            ByteArray.prototype.div = function (n, d) {
                return Math.floor(n / d);
            };
            ByteArray.prototype.stringToCodePoints = function (string) {
                /** @type {Array.<number>} */
                var cps = [];

                // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
                var i = 0, n = string.length;
                while (i < string.length) {
                    var c = string.charCodeAt(i);
                    if (!this.inRange(c, 0xD800, 0xDFFF)) {
                        cps.push(c);
                    } else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                        cps.push(0xFFFD);
                    } else {
                        if (i === n - 1) {
                            cps.push(0xFFFD);
                        } else {
                            var d = string.charCodeAt(i + 1);
                            if (this.inRange(d, 0xDC00, 0xDFFF)) {
                                var a = c & 0x3FF;
                                var b = d & 0x3FF;
                                i += 1;
                                cps.push(0x10000 + (a << 10) + b);
                            } else {
                                cps.push(0xFFFD);
                            }
                        }
                    }
                    i += 1;
                }
                return cps;
            };
            ByteArray.BIG_ENDIAN = "bigEndian";
            ByteArray.LITTLE_ENDIAN = "littleEndian";

            ByteArray.SIZE_OF_BOOLEAN = 1;
            ByteArray.SIZE_OF_INT8 = 1;
            ByteArray.SIZE_OF_INT16 = 2;
            ByteArray.SIZE_OF_INT32 = 4;
            ByteArray.SIZE_OF_UINT8 = 1;
            ByteArray.SIZE_OF_UINT16 = 2;
            ByteArray.SIZE_OF_UINT32 = 4;
            ByteArray.SIZE_OF_FLOAT32 = 4;
            ByteArray.SIZE_OF_FLOAT64 = 8;
            return ByteArray;
        })();
        utils.ByteArray = ByteArray;
    })(nid.utils || (nid.utils = {}));
    var utils = nid.utils;
})(nid || (nid = {}));
var _7zipDefines;
(function (_7zipDefines) {
    /**
    * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
    * 7zip Archive Decoder
    * Version 0.1
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    _7zipDefines.CRC_INIT_VAL = 0xFFFFFFFF;
    _7zipDefines.STREAM_SEEK_SET = 0;
    _7zipDefines.STREAM_SEEK_CUR = 1;
    _7zipDefines.STREAM_SEEK_END = 2;

    _7zipDefines.k_AES = 0x06F10701;
    _7zipDefines.kNumMax = 0x7FFFFFFF;
    _7zipDefines.kHeader = 0x01;
    _7zipDefines.kCrcPoly = 0xEDB88320;
    _7zipDefines.kHeaderSize = 32;
    _7zipDefines.kNumNoIndex = 0xFFFFFFFF;
    _7zipDefines.kMajorVersion = 0;
    _7zipDefines.kEncodedHeader = 0x17;
})(_7zipDefines || (_7zipDefines = {}));
var nid;
(function (nid) {
    /**
    * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
    * 7zip Archive Decoder
    * Version 0.1
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    var _7zipBase = (function () {
        function _7zipBase() {
        }
        _7zipBase.prototype.CrcGenerateTable = function () {
            var i;
            for (i = 0; i < 256; i++) {
                var r = i;
                var j;
                for (j = 0; j < 8; j++) {
                    r = (r >> 1) ^ (_7zipDefines.kCrcPoly & ~((r & 1) - 1));
                }
                this.g_CrcTable[i] = r;
            }

            if (this.CRC_NUM_TABLES == 1) {
                this.g_CrcUpdate = this.CrcUpdateT1;
            } else {
                for (; i < 256 * this.CRC_NUM_TABLES; i++) {
                    r = this.g_CrcTable[i - 256];
                    this.g_CrcTable[i] = this.g_CrcTable[r & 0xFF] ^ (r >> 8);
                }
                this.g_CrcUpdate = this.CrcUpdateT4;

                if (this.MY_CPU_X86_OR_AMD64) {
                    if (!this.CPU_Is_InOrder()) {
                        this.g_CrcUpdate = this.CrcUpdateT8;
                    }
                }
            }
        };

        /**
        * TODO : implement CRC check
        */
        _7zipBase.prototype.CrcCalc = function (buf, size) {
            return 0;
        };
        _7zipBase.prototype.CrcCalc1 = function (buf, size) {
            //uint32
            var crc = _7zipDefines.CRC_INIT_VAL;
            for (var i = 0; i < size; i++)
                crc = this.CRC_UPDATE_BYTE(crc, buf[i]);
            return this.CRC_GET_DIGEST(crc);
        };
        _7zipBase.prototype.CRC_GET_DIGEST = function (crc) {
            return crc ^ _7zipDefines.CRC_INIT_VAL;
        };
        _7zipBase.prototype.CRC_UPDATE_BYTE = function (crc, b) {
            return (this.g_CrcTable[((crc) ^ (b)) & 0xFF] ^ ((crc) >> 8));
        };
        _7zipBase.prototype.CPU_Is_InOrder = function () {
            return false;
        };
        return _7zipBase;
    })();
    nid._7zipBase = _7zipBase;
})(nid || (nid = {}));
///<reference path="../../7zip.d.ts" />
var nid;
(function (nid) {
    var InArchive = (function () {
        function InArchive() {
            this.signature = [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C];
            this.archiveBeginStreamPosition = 0;
            this.dataOffset = 0;
            this.headerSize = 32;
            this.headersSize = 0;
            this.inByteVector = [];
        }
        InArchive.prototype.open = function (stream) {
            this.stream = stream;
            this.findAndReadSignature();
        };
        InArchive.prototype.findAndReadSignature = function () {
            if (this.stream.readByte() != this.signature[0] || this.stream.readByte() != this.signature[1] || this.stream.readByte() != this.signature[2] || this.stream.readByte() != this.signature[3] || this.stream.readByte() != this.signature[4] || this.stream.readByte() != this.signature[5]) {
                console.log('Error! Invalid file');
                return false;
            } else {
                console.log('7zip file');
            }

            this.versionMajor = this.stream.readByte();
            this.versionMinor = this.stream.readByte();

            this.startHeaderCRC = this.stream.readUnsignedInt();

            //StartHeader
            this.nextHeaderOffset = this.stream.readUnsignedInt64().value();
            this.nextHeaderSize = this.stream.readUnsignedInt64().value();
            this.nextHeaderCRC = this.stream.readUnsignedInt();

            /**
            * TODO: Check CRC
            */
            this.stream.position = this.nextHeaderOffset;
        };
        InArchive.prototype.readDatabase = function (db) {
            this.db = db;
            this.db.clear();
            this.db.archiveInfo.startPosition = this.archiveBeginStreamPosition;
            this.db.archiveInfo.versionMajor = this.versionMajor;
            this.db.archiveInfo.versionMinor = this.versionMinor;

            this.dataOffset = this.archiveBeginStreamPosition;

            if (this.versionMajor != _7zipDefines.kMajorVersion) {
                console.log('UnsupportedVersion');
                return false;
            }

            this.dataOffset = this.archiveBeginStreamPosition + _7zipDefines.kHeaderSize;
            this.db.archiveInfo.startPositionAfterHeader = this.dataOffset;

            if (this.nextHeaderSize == 0) {
                return true;
            }
            if (this.nextHeaderSize > 0xFFFFFFFF || this.nextHeaderOffset < 0) {
                return false;
            }

            this.stream.position = this.nextHeaderOffset;

            var buffer2 = new nid.ByteBuffer();
            buffer2.setCapacity(this.nextHeaderSize);

            this.stream.readBytes(buffer2, this.nextHeaderSize);
            this.headersSize += _7zipDefines.kHeaderSize + this.nextHeaderSize;
            this.db.phySize = _7zipDefines.kHeaderSize + this.nextHeaderOffset + this.nextHeaderSize;

            /**
            * TODO: Check CRC
            */
            /*if (this.CrcCalc(buffer2, this.nextHeaderSize) != this.nextHeaderCRC){
            console.log('Incorrect');
            }*/
            var streamSwitch = new StreamSwitch();
            streamSwitch.set2(this, buffer2);

            var dataVector = [];

            var type = this.inByteBack.readID();

            if (type != kHeader) {
                if (type != kEncodedHeader) {
                    console.log('Incorrect');
                }
                var result = this.readAndDecodePackedStreams(dataVector);

                if (result) {
                    console.log('readAndDecodePackedStreams:OK');
                }

                if (dataVector.length == 0) {
                    return true;
                }
                if (dataVector.length > 1) {
                    console.log('Incorrect');
                }

                streamSwitch.remove();
                streamSwitch.set3(this, dataVector);

                if (this.inByteBack.readID() != kHeader) {
                    console.log('Incorrect');
                }
            }

            db.headersSize = this.headersSize;

            return this.readHeader();
        };

        InArchive.prototype.readAndDecodePackedStreams = function (dataVector) {
            var packSizes = [];
            var packCRCsDefined = [];
            var packCRCs = [];
            var folders = [];

            var numUnpackStreamsInFolders = [];
            var unpackSizes = [];
            var digestsDefined = [];
            var digests = [];

            this.readStreamsInfo(null, packSizes, packCRCsDefined, packCRCs, folders, numUnpackStreamsInFolders, unpackSizes, digestsDefined, digests);

            // db.archiveInfo.DataStartPosition2 += db.archiveInfo.StartPositionAfterHeader;
            var packIndex = 0;
            var decoder = new Decoder();

            var dataStartPos = this.dataOffset;

            for (var i = 0; i < folders.length; i++) {
                var folder = folders[i];
                var data = new nid.ByteBuffer();
                dataVector.push(data);
                var unpackSize64 = folder.getUnpackSize();
                var unpackSize = unpackSize64;

                /*if (unpackSize != unpackSize64){
                console.log('Unsupported')
                }*/
                data.setCapacity(unpackSize);

                /*var outStreamSpec:BufPtrSeqOutStream = new BufPtrSeqOutStream();
                var outStream:ISequentialOutStream = outStreamSpec;
                outStreamSpec.init(data, unpackSize);*/
                var result = decoder.decode(this.stream, dataStartPos, packSizes[packIndex], folder, data);

                if (folder.unpackCRCDefined) {
                    /*if (CrcCalc(data, unpackSize) != folder.UnpackCRC){
                    console.log('Incorrect')
                    }*/
                }
                for (var j = 0; j < folder.packStreams.length; j++) {
                    var packSize = packSizes[packIndex++];
                    dataStartPos += packSize;
                    this.headersSize += packSize;
                }
            }
            return true;
        };
        InArchive.prototype.readAndDecodePackedStreams2 = function (dataVector, folders) {
            this.waitAttribute(kFolder);
            var numFolders = this.inByteBack.readNum();

            var streamSwitch = new StreamSwitch();
            streamSwitch.set3(this, dataVector);
            folders.clear();

            for (var i = 0; i < numFolders; i++) {
                var folder = new Folder();
                folders.push(folder);
                this.getNextFolderItem(folder);
            }

            this.waitAttribute(kCodersUnpackSize);

            var i;
            for (i = 0; i < numFolders; i++) {
                var folder = folders[i];
                var numOutStreams = folder.getNumOutStreams();

                for (var j = 0; j < numOutStreams; j++) {
                    folder.unpackSizes.push(this.inByteBack.readNumber());
                }
            }

            for (; ;) {
                var type = this.inByteBack.readID();
                if (type == kEnd) {
                    return;
                }
                if (type == kCRC) {
                    var crcsDefined = [];
                    var crcs = [];
                    this.readHashDigests(numFolders, crcsDefined, crcs);
                    for (i = 0; i < numFolders; i++) {
                        var folder = folders[i];
                        folder.unpackCRCDefined = crcsDefined[i];
                        folder.unpackCRC = crcs[i];
                    }
                    continue;
                }
                this.inByteBack.skipData2();
            }
        };
        InArchive.prototype.readHeader = function () {
            var type = this.inByteBack.readID();

            if (type == kArchiveProperties) {
                this.readArchiveProperties();
                type = this.inByteBack.readID();
            }

            var dataVector = [];

            if (type == kAdditionalStreamsInfo) {
                var result = this.readAndDecodePackedStreams(dataVector);

                if (result) {
                    console.log('kAdditionalStreamsInfo:OK');
                }
                this.db.archiveInfo.dataStartPosition2 += this.db.archiveInfo.startPositionAfterHeader;
                type = this.inByteBack.readID();
            }

            var unpackSizes = [];
            var digestsDefined = [];
            var digests = [];

            if (type == kMainStreamsInfo) {
                this.readStreamsInfo(dataVector, this.db.packSizes, this.db.packCRCsDefined, this.db.packCRCs, this.db.folders, this.db.numUnpackStreamsVector, unpackSizes, digestsDefined, digests);

                this.db.archiveInfo.dataStartPosition += this.db.archiveInfo.startPositionAfterHeader;
                type = this.inByteBack.readID();
            } else {
                for (var i = 0; i < this.db.folders.length; i++) {
                    this.db.numUnpackStreamsVector.push(1);
                    var folder = this.db.folders[i];
                    unpackSizes.push(folder.getUnpackSize());
                    digestsDefined.push(folder.unpackCRCDefined);
                    digests.push(folder.unpackCRC);
                }
            }

            this.db.files.clear();

            if (type == kEnd) {
                return true;
            }
            if (type != kFilesInfo) {
                console.log('Incorrect');
            }

            var numFiles = this.inByteBack.readNum();

            //this.db.files.reserve(numFiles);
            var i;
            for (i = 0; i < numFiles; i++) {
                this.db.files.push(new FileItem());
            }

            this.db.archiveInfo.fileInfoPopIDs.push(kSize);
            if (!(this.db.packSizes.length == 0))
                this.db.archiveInfo.fileInfoPopIDs.push(kPackInfo);
            if (numFiles > 0 && !(digests.length == 0))
                this.db.archiveInfo.fileInfoPopIDs.push(kCRC);

            var emptyStreamVector = [];
            this.boolVector_Fill_False(emptyStreamVector, numFiles);
            var emptyFileVector = [];
            ;
            var antiFileVector = [];
            ;
            var numEmptyStreams = 0;

            for (; ;) {
                var type = this.inByteBack.readID();
                if (type == kEnd) {
                    break;
                }
                var size = this.inByteBack.readNumber();
                var ppp = this.inByteBack.position;
                var addPropIdToList = true;
                var isKnownType = true;
                if (type > (1 << 30)) {
                    isKnownType = false;
                } else
                    switch (type) {
                        case kName: {
                            var streamSwitch = new StreamSwitch();
                            streamSwitch.set3(this, dataVector);

                            for (var i = 0; i < this.db.files.length; i++) {
                                this.db.files[i].name = this.inByteBack.readString();
                            }

                            break;
                        }
                        case kWinAttributes: {
                            var boolVector = [];
                            this.readBoolVector2(this.db.files.length, boolVector);

                            streamSwitch = new StreamSwitch();
                            streamSwitch.set3(this, dataVector);

                            for (i = 0; i < numFiles; i++) {
                                var file = this.db.files[i];
                                file.attribDefined = boolVector[i];
                                if (file.attribDefined) {
                                    file.attrib = this.inByteBack.readUInt32();
                                }
                            }
                            break;
                        }
                        case kEmptyStream: {
                            this.readBoolVector(numFiles, emptyStreamVector);
                            for (i = 0; i < emptyStreamVector.length; i++)
                                if (emptyStreamVector[i]) {
                                    numEmptyStreams++;
                                }

                            this.boolVector_Fill_False(emptyFileVector, numEmptyStreams);
                            this.boolVector_Fill_False(antiFileVector, numEmptyStreams);

                            break;
                        }
                        case kEmptyFile:
                            this.readBoolVector(numEmptyStreams, emptyFileVector);
                            break;
                        case kAnti:
                            this.readBoolVector(numEmptyStreams, antiFileVector);
                            break;
                        case kStartPos:
                            this.readUInt64DefVector(dataVector, this.db.startPos, numFiles);
                            break;
                        case kCTime:
                            this.readUInt64DefVector(dataVector, this.db.cTime, numFiles);
                            break;
                        case kATime:
                            this.readUInt64DefVector(dataVector, this.db.aTime, numFiles);
                            break;
                        case kMTime:
                            this.readUInt64DefVector(dataVector, this.db.mTime, numFiles);
                            break;
                        case kDummy: {
                            for (var j = 0; j < size; j++)
                                if (this.inByteBack.readByte() != 0) {
                                    console.log('Incorrect');
                                }
                            addPropIdToList = false;
                            break;
                        }
                        default:
                            addPropIdToList = isKnownType = false;
                    }

                if (isKnownType) {
                    if (addPropIdToList)
                        this.db.archiveInfo.fileInfoPopIDs.push(type);
                } else {
                    this.inByteBack.skipData(size);
                }

                var checkRecordsSize = (this.db.archiveInfo.versionMajor > 0 || this.db.archiveInfo.versionMinor > 2);
                if (checkRecordsSize && this.inByteBack.position - ppp != size) {
                    console.log('Incorrect');
                }
            }

            var emptyFileIndex = 0;
            var sizeIndex = 0;

            var numAntiItems = 0;
            for (i = 0; i < numEmptyStreams; i++) {
                if (antiFileVector[i]) {
                    numAntiItems++;
                }
            }

            for (i = 0; i < numFiles; i++) {
                var file = this.db.files[i];
                var isAnti;
                file.hasStream = !emptyStreamVector[i];
                if (file.hasStream) {
                    file.isDir = false;
                    isAnti = false;
                    file.size = unpackSizes[sizeIndex];
                    file.CRC = digests[sizeIndex];
                    file.CRCDefined = digestsDefined[sizeIndex];
                    sizeIndex++;
                } else {
                    file.isDir = !emptyFileVector[emptyFileIndex];
                    isAnti = antiFileVector[emptyFileIndex];
                    emptyFileIndex++;
                    file.size = 0;
                    file.CRCDefined = false;
                }
                if (numAntiItems != 0) {
                    this.db.isAnti.push(isAnti);
                }
            }
            return true;
        };
        InArchive.prototype.readArchiveProperties = function () {
            for (; ;) {
                if (this.inByteBack.readID() == kEnd) {
                    break;
                }
                this.inByteBack.skipData2();
            }
        };
        InArchive.prototype.readPackInfo = function (packSizes, packCRCsDefined, packCRCs) {
            this.dataOffset = this.inByteBack.readNumber();
            this.db.archiveInfo.dataStartPosition = this.dataOffset;
            var numPackStreams = this.inByteBack.readNum();

            this.waitAttribute(kSize);
            packSizes.clear();

            for (var i = 0; i < numPackStreams; i++) {
                packSizes.push(this.inByteBack.readNumber());
            }

            var type;
            for (; ;) {
                type = this.inByteBack.readID();
                if (type == kEnd) {
                    break;
                }
                if (type == kCRC) {
                    this.readHashDigests(numPackStreams, packCRCsDefined, packCRCs);
                    continue;
                }
                this.inByteBack.skipData2();
            }
            if (packCRCsDefined.length == 0) {
                this.boolVector_Fill_False(packCRCsDefined, numPackStreams);

                //packCRCs.Reserve(numPackStreams);
                packCRCs.clear();
                for (var i = 0; i < numPackStreams; i++) {
                    packCRCs.push(0);
                }
            }
        };
        InArchive.prototype.readHashDigests = function (numItems, digestsDefined, digests) {
            this.readBoolVector2(numItems, digestsDefined);
            digests.clear();

            for (var i = 0; i < numItems; i++) {
                var crc = 0;
                if (digestsDefined[i]) {
                    crc = this.inByteBack.readUInt32();
                }
                digests.push(crc);
            }
        };
        InArchive.prototype.waitAttribute = function (attribute) {
            for (; ;) {
                var type = this.inByteBack.readID();
                if (type == attribute) {
                    return;
                }
                if (type == kEnd) {
                    console.log('Incorrect');
                }
                this.inByteBack.skipData2();
            }
        };
        InArchive.prototype.readUnpackInfo = function (dataVector, folders) {
            this.waitAttribute(kFolder);
            var numFolders = this.inByteBack.readNum();

            var streamSwitch;
            streamSwitch.set3(this, dataVector);
            folders.clear();

            for (var i = 0; i < numFolders; i++) {
                var folder = new Folder();
                folders.push(folder);
                this.getNextFolderItem(folder);
            }

            this.waitAttribute(kCodersUnpackSize);

            var i;
            for (i = 0; i < numFolders; i++) {
                var folder = folders[i];
                var numOutStreams = folder.getNumOutStreams();

                for (var j = 0; j < numOutStreams; j++) {
                    folder.unpackSizes.push(this.inByteBack.readNumber());
                }
            }

            for (; ;) {
                var type = this.inByteBack.readID();

                if (type == kEnd) {
                    return;
                }

                if (type == kCRC) {
                    var crcsDefined;
                    var crcs;
                    this.readHashDigests(numFolders, crcsDefined, crcs);
                    for (i = 0; i < numFolders; i++) {
                        var folder = folders[i];
                        folder.unpackCRCDefined = crcsDefined[i];
                        folder.unpackCRC = crcs[i];
                    }
                    continue;
                }
                this.inByteBack.skipData2();
            }
        };
        InArchive.prototype.getNextFolderItem = function (folder) {
            var numCoders = this.inByteBack.readNum();

            folder.coders.clear();

            //folder.coders.Reserve((int)
            var numInStreams = 0;
            var numOutStreams = 0;
            var i;
            for (i = 0; i < numCoders; i++) {
                var coder = new CoderInfo();
                folder.coders.push(coder);

                 {
                    var mainByte = this.inByteBack.readByte();
                    var idSize = (mainByte & 0xF);
                    var longID = new nid.ByteBuffer();
                    longID.setCapacity(15);
                    this.inByteBack.readBytes(longID, idSize);
                    if (idSize > 8) {
                        console.log('Unsupported');
                    }

                    var id = 0;

                    for (var j = 0; j < idSize; j++) {
                        id |= longID[idSize - 1 - j] << (8 * j);
                    }

                    coder.methodID = id;

                    if ((mainByte & 0x10) != 0) {
                        coder.numInStreams = this.inByteBack.readNum();
                        coder.numOutStreams = this.inByteBack.readNum();
                    } else {
                        coder.numInStreams = 1;
                        coder.numOutStreams = 1;
                    }
                    if ((mainByte & 0x20) != 0) {
                        var propsSize = this.inByteBack.readNum();
                        coder.props.setCapacity(propsSize);
                        this.inByteBack.readBytes(coder.props, propsSize);
                    }
                    if ((mainByte & 0x80) != 0) {
                        console.log('Unsupported');
                    }
                }
                numInStreams += coder.numInStreams;
                numOutStreams += coder.numOutStreams;
            }

            var numBindPairs = numOutStreams - 1;
            folder.bindPairs.clear();

            for (i = 0; i < numBindPairs; i++) {
                var bp = new BindPair();
                bp.inIndex = this.inByteBack.readNum();
                bp.outIndex = this.inByteBack.readNum();
                folder.bindPairs.push(bp);
            }

            if (numInStreams < numBindPairs) {
                console.log('Unsupported');
            }
            var numPackStreams = numInStreams - numBindPairs;

            //folder.PackStreams.Reserve(numPackStreams);
            if (numPackStreams == 1) {
                for (i = 0; i < numInStreams; i++)
                    if (folder.findBindPairForInStream(i) < 0) {
                        folder.packStreams.push(i);
                        break;
                    }
                if (folder.packStreams.length != 1) {
                    console.log('Unsupported');
                }
            } else {
                for (i = 0; i < numPackStreams; i++) {
                    folder.packStreams.push(this.inByteBack.readNum());
                }
            }
        };
        InArchive.prototype.readSubStreamsInfo = function (folders, numUnpackStreamsInFolders, unpackSizes, digestsDefined, digests) {
            numUnpackStreamsInFolders.clear();

            //numUnpackStreamsInFolders.Reserve(folders.length);
            var type;
            for (; ;) {
                type = this.inByteBack.readID();
                if (type == kNumUnpackStream) {
                    for (var i = 0; i < folders.length; i++) {
                        numUnpackStreamsInFolders.push(this.inByteBack.readNum());
                    }
                    continue;
                }
                if (type == kCRC || type == kSize || type == kEnd) {
                    break;
                }
                this.inByteBack.skipData2();
            }

            if (numUnpackStreamsInFolders.length == 0) {
                for (var i = 0; i < folders.length; i++) {
                    numUnpackStreamsInFolders.push(1);
                }
            }

            var i;
            for (i = 0; i < numUnpackStreamsInFolders.length; i++) {
                // v3.13 incorrectly worked with empty folders
                // v4.07: we check that folder is empty
                var numSubstreams = numUnpackStreamsInFolders[i];
                if (numSubstreams == 0) {
                    continue;
                }
                var sum = 0;
                for (var j = 1; j < numSubstreams; j++) {
                    if (type == kSize) {
                        var size = this.inByteBack.readNumber();
                        unpackSizes.push(size);
                        sum += size;
                    }
                }
                unpackSizes.push(folders[i].getUnpacklength - sum);
            }
            if (type == kSize) {
                type = this.inByteBack.readID();
            }

            var numDigests = 0;
            var numDigestsTotal = 0;
            for (i = 0; i < folders.length; i++) {
                var numSubstreams = numUnpackStreamsInFolders[i];
                if (numSubstreams != 1 || !folders[i].UnpackCRCDefined) {
                    numDigests += numSubstreams;
                }
                numDigestsTotal += numSubstreams;
            }

            for (; ;) {
                if (type == kCRC) {
                    var digestsDefined2 = [];
                    var digests2 = [];
                    this.readHashDigests(numDigests, digestsDefined2, digests2);
                    var digestIndex = 0;
                    for (i = 0; i < folders.length; i++) {
                        var numSubstreams = numUnpackStreamsInFolders[i];
                        var folder = folders[i];
                        if (numSubstreams == 1 && folder.unpackCRCDefined) {
                            digestsDefined.push(true);
                            digests.push(folder.unpackCRC);
                        } else {
                            for (var j = 0; j < numSubstreams; j++, digestIndex++) {
                                digestsDefined.push(digestsDefined2[digestIndex]);
                                digests.push(digests2[digestIndex]);
                            }
                        }
                    }
                } else if (type == kEnd) {
                    if (digestsDefined.length == 0) {
                        this.boolVector_Fill_False(digestsDefined, numDigestsTotal);
                        digests.clear();
                        for (var i = 0; i < numDigestsTotal; i++) {
                            digests.push(0);
                        }
                    }
                    return;
                } else {
                    this.inByteBack.skipData2();
                }
                type = this.inByteBack.readID();
            }
        };

        InArchive.prototype.readStreamsInfo = function (dataVector, packSizes, packCRCsDefined, packCRCs, folders, numUnpackStreamsInFolders, unpackSizes, digestsDefined, digests) {
            for (; ;) {
                var type = this.inByteBack.readID();

                if (type > (1 << 30)) {
                    console.log('Incorrect');
                }

                switch (type) {
                    case kEnd:
                        return;
                    case kPackInfo: {
                        this.readPackInfo(packSizes, packCRCsDefined, packCRCs);
                        break;
                    }
                    case kUnpackInfo: {
                        this.readUnpackInfo(dataVector, folders);
                        break;
                    }
                    case kSubStreamsInfo: {
                        this.readSubStreamsInfo(folders, numUnpackStreamsInFolders, unpackSizes, digestsDefined, digests);
                        break;
                    }
                    default:
                        console.log('Incorrect');
                }
            }
        };
        InArchive.prototype.readBoolVector = function (numItems, v) {
            /**
            * TODO: migrate to TypedArray from Array
            */
            v.splice(0, v.length);
            v.reserve(numItems);
            var b = 0;
            var mask = 0;
            for (var i = 0; i < numItems; i++) {
                if (mask == 0) {
                    b = this.inByteBack.readByte();
                    mask = 0x80;
                }
                v.push((b & mask) != 0);
                mask >>= 1;
            }
            return v;
        };
        InArchive.prototype.readBoolVector2 = function (numItems, v) {
            var allAreDefined = this.inByteBack.readByte();
            if (allAreDefined == 0) {
                this.readBoolVector(numItems, v);
                return;
            }
            v.splice(0, v.length);
            v.reserve(numItems);
            for (var i = 0; i < numItems; i++) {
                v.push(true);
            }
            return v;
        };
        InArchive.prototype.readUInt64DefVector = function (dataVector, v, numFiles) {
            this.readBoolVector2(numFiles, v.defined);

            var streamSwitch = new StreamSwitch();
            streamSwitch.set3(this, dataVector);
            v.values.reserve(numFiles);

            for (var i = 0; i < numFiles; i++) {
                var t = 0;
                if (v.defined[i]) {
                    t = this.inByteBack.readUInt64().value();
                }
                v.values.push(t);
            }
        };
        InArchive.prototype.boolVector_Fill_False = function (boolVector, size) {
            for (var i = 0; i < size; i++) {
                boolVector[i] = false;
            }
        };
        InArchive.prototype.readDatabase2 = function () {
        };
        InArchive.prototype.deleteByteStream = function () {
            this.inByteVector.pop();
            if (this.inByteVector.length > 0) {
                this.inByteBack = this.inByteVector[this.inByteVector.length - 1];
            }
        };
        InArchive.prototype.addByteStream = function (buffer, size) {
            this.inByteBack = new InByte2();
            this.inByteVector.push(this.inByteBack);
            this.inByteBack.init(buffer, size);
        };
        return InArchive;
    })();
    nid.InArchive = InArchive;
})(nid || (nid = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var nid;
(function (nid) {
    /**
    * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
    * 7zip Archive Decoder
    * Version 0.1
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    var ByteArray = nid.utils.ByteArray;

    var ByteBuffer = (function (_super) {
        __extends(ByteBuffer, _super);
        function ByteBuffer(buffer, offset) {
            _super.call(this, buffer, offset);
        }
        ByteBuffer.prototype.setCapacity = function (size) {
            _super.prototype.buffer = new ArrayBuffer(size);
        };
        ByteBuffer.prototype.readByte = function () {
            return _super.prototype.readByte.call(this);
        };

        ByteBuffer.prototype.readBytes = function (data, size) {
            _super.prototype.readBytes.call(this, data, 0, size);
        };

        ByteBuffer.prototype.skipData = function (size) {
            _super.prototype.position += size;
        };

        ByteBuffer.prototype.skipData2 = function () {
            this.skipData(this.readNumber());
        };

        ByteBuffer.prototype.readID = function () {
            return this.readNumber();
        };
        ByteBuffer.prototype.readNumber = function () {
            var firstByte = _super.prototype.readByte.call(this);
            var mask = 0x80;

            //var value:UInt64 = new UInt64();
            var value = 0;
            for (var i = 0; i < 8; i++) {
                if ((firstByte & mask) == 0) {
                    var highPart = firstByte & (mask - 1);
                    value += (highPart << (i * 8));
                    return value;
                }
                value |= (_super.prototype.readByte.call(this) << (8 * i));
                mask >>= 1;
            }
            return value;
        };
        ByteBuffer.prototype.readNum = function () {
            var value = this.readNumber();
            if (value > _7zipDefines.kNumMax) {
                console.log('Unsupported Num:' + value);
            }
            return value;
        };

        ByteBuffer.prototype.readUInt32 = function () {
            return _super.prototype.readUnsignedInt.call(this);
        };

        ByteBuffer.prototype.readUInt64 = function () {
            return _super.prototype.readUnsignedInt64.call(this);
        };

        ByteBuffer.prototype.readString = function () {
            var rem = (_super.prototype.bytesAvailable) / 2 * 2;
            return _super.prototype.readUTFBytes.call(this, rem);
        };
        return ByteBuffer;
    })(ByteArray);
    nid.ByteBuffer = ByteBuffer;
})(nid || (nid = {}));
///<reference path="7zip.d.ts" />
var nid;
(function (nid) {
    /**
    * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
    * 7zip Archive Decoder
    * Version 0.1
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    var ByteArray = nid.utils.ByteArray;

    var _7zip = (function (_super) {
        __extends(_7zip, _super);
        function _7zip(data) {
            if (data) {
                this.load(data);
            }
            this.db = new ArchiveDatabaseEx();
        }
        _7zip.prototype.load = function (data) {
            this.data = new ByteArray(data);
            this.archive = new nid.InArchive();
            this.archive.open(this.data);
            this.archive.readDatabase(this.db);
        };
        return _7zip;
    })(nid._7zipBase);
    nid._7zip = _7zip;
})(nid || (nid = {}));
//# sourceMappingURL=7zip.js.map
