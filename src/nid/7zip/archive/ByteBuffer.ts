module nid {

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class ByteBuffer {

        private buffer:ByteArray;

        constructor(buffer:ByteArray){
            this.buffer = buffer;
        }
        public readID():number//UInt64
        {
            var firstByte:number = this.buffer.readByte();
            var mask = 0x80;
            //var value:UInt64 = new UInt64();
            var value:number = 0;
            for (var i = 0; i < 8; i++)
            {
                if ((firstByte & mask) == 0)
                {
                    var highPart = firstByte & (mask - 1);
                    value += (highPart << (i * 8));
                    return value;
                }
                value |= (this.buffer.readByte() << (8 * i));
                mask >>= 1;
            }
            return value;
        }
        public readByte()
        {
            return this.buffer.readByte();
        }

        public readBytes(data,size)
        {
            this.buffer.readBytes(data,0,size);
        }

        public skipData(size)
        {
            this.buffer.position += size;
        }

        public SkipData()
        {
            SkipData(ReadNumber());
        }

        public ReadNumber()
        {
            if (_pos >= _size)
                ThrowEndOfData();
            Byte firstByte = _buffer[_pos++];
            Byte mask = 0x80;
            UInt64 value = 0;
            for (int i = 0; i < 8; i++)
            {
                if ((firstByte & mask) == 0)
                {
                    UInt64 highPart = firstByte & (mask - 1);
                    value += (highPart << (i * 8));
                    return value;
                }
                if (_pos >= _size)
                    ThrowEndOfData();
                value |= ((UInt64)_buffer[_pos++] << (8 * i));
                mask >>= 1;
            }
            return value;
        }

        public ReadNum()
        {
            UInt64 value = ReadNumber();
            if (value > kNumMax)
                ThrowUnsupported();
            return (CNum)value;
        }

        public ReadUInt32()
        {
            if (_pos + 4 > _size)
                ThrowEndOfData();
            UInt32 res = Get32(_buffer + _pos);
            _pos += 4;
            return res;
        }

        public ReadUInt64()
        {
            if (_pos + 8 > _size)
                ThrowEndOfData();
            UInt64 res = Get64(_buffer + _pos);
            _pos += 8;
            return res;
        }

        public ReadString(UString &s)
        {
            const Byte *buf = _buffer + _pos;
            size_t rem = (_size - _pos) / 2 * 2;
            {
                size_t i;
                for (i = 0; i < rem; i += 2)
                    if (buf[i] == 0 && buf[i + 1] == 0)
                        break;
                if (i == rem)
                    ThrowEndOfData();
                rem = i;
            }
            int len = (int)(rem / 2);
            if (len < 0 || (size_t)len * 2 != rem)
            ThrowUnsupported();
            wchar_t *p = s.GetBuffer(len);
            int i;
            for (i = 0; i < len; i++, buf += 2)
                p[i] = (wchar_t)Get16(buf);
            s.ReleaseBuffer(len);
            _pos += rem + 2;
        }
    }
}