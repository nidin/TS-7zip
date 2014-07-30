module nid {

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class ByteBuffer extends ByteArray{

        constructor(buffer?: ArrayBuffer, offset?: number){
            super(buffer,offset);
        }
        public setCapacity(size:number)
        {
            super.buffer = new ArrayBuffer(size);
        }
        public readByte()
        {
            return super.readByte();
        }

        public readBytes(data,size)
        {
            super.readBytes(data,0,size);
        }

        public skipData(size)
        {
            super.position += size;
        }

        public skipData2()
        {
            this.skipData(this.readNumber());
        }

        public readID():number//UInt64
        {
            return this.readNumber();
        }
        public readNumber():number//UInt64
        {
            var firstByte:number = super.readByte();
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
                value |= (super.readByte() << (8 * i));
                mask >>= 1;
            }
            return value;
        }
        public readNum():number
        {
            var value = this.readNumber();
            if (value > _7zipDefines.kNumMax){
                console.log('Unsupported Num:'+value);
            }
            return value;
        }

        public readUInt32()
        {
            return super.readUnsignedInt();
        }

        public readUInt64()
        {
            return super.readUnsignedInt64();
        }

        public readString():string
        {
            var rem:number = (super.bytesAvailable) / 2 * 2;
            return super.readUTFBytes(rem);
        }
    }
}