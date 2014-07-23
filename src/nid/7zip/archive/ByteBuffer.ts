module nid {

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import Uint64 = ctypes.Uint64;

    export class ByteBuffer {

        private buffer:ByteArray;

        constructor(buffer:ByteArray){
            this.buffer = buffer;
        }
        public readID():Uint64{
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
    }
}