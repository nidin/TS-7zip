module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class LimitedSequentialInStream extends ByteBuffer
    {
        public wasFinished:boolean;

        constructor(){
            super();
        }
        public setStream(inStream){
            super.buffer = inStream.buffer;
        }
        public releaseStream(){

        }
        public init(streamSize)//UInt64
        {
            super.setCapacity(streamSize);
            super.position = 0;
            this.wasFinished = false;
        }
    }

}