module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */
    export class CoderInfo
    {
        public coder:ICompressCoder;
        public inStream:ISequentialInStream;
        public outStream:ISequentialOutStream;
        public progress:ICompressProgressInfo;

        public methodID:number;//UInt64
        public props:ByteBuffer;
        public numInStreams:number;
        public numOutStreams:number;

        constructor(){

        }
        public isSimpleCoder():boolean {
            return (this.numInStreams == 1) && (this.numOutStreams == 1);
        }
    }
}