module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class STCoderInfo {

        public numInStreams:number;
        public numOutStreams:number;
        public isMain:boolean;

        constructor(numInStreams:number, numOutStreams:number, isMain:boolean){
            this.numInStreams = numInStreams;
            this.numOutStreams = numOutStreams;
            this.isMain = isMain;
        }
    }
}