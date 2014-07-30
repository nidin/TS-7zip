///<reference path="../7zip.d.ts" />
module nid {

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import Uint64 = ctypes.UInt64;
    import Int64 = ctypes.Int64;

    export class InByte2 extends ByteArray{

        constructor() {
            super();

        }

        public init(buffer,size)
        {
            super.buffer = buffer;
        }
        public skipData() {

        }
        public readNumber() {

        }
        public readNum() {

        }
        public readUInt32() {

        }
        public readUInt64() {

        }
        public readString(){

        }
    }
}