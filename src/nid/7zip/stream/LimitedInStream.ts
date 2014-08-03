module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class LimitedInStream extends ByteBuffer
    {
        public virtPos:number;//UInt64
        public physPos:number;//UInt64
        public size:number;//UInt64
        public startOffset:number;//UInt64

        constructor(){
            super();
        }
        public setStream(inStream){
            super.buffer = inStream.buffer;
        }
        public initAndSeek(startOffset:number, size:number)//UInt64
        {
            this.startOffset = startOffset;
            this.physPos = startOffset;
            this.virtPos = 0;
            this.size = size;
            return this.seekToPhys();
        }
        public seekToPhys(){
            super.position = this.physPos;
        }
        public seekToStart(){
            super.position = 0;
        }
    }

}