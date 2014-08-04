///<reference path="../7zip.d.ts" />
module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class FileItem2 {

        public cTime:number;//UInt64
        public aTime:number;//UInt64
        public mTime:number;//UInt64
        public startPos:number;//UInt64
        public CTimeDefined:boolean;
        public ATimeDefined:boolean;
        public MTimeDefined:boolean;
        public startPosDefined:boolean;
        public IsAnti:boolean;

        constructor(){

        }

    }

}