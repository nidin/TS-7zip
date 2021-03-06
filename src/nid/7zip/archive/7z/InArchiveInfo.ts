module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class InArchiveInfo {

        public versionMajor:number;
        public versionMinor:number;
        public dataStartPosition:number;
        public startPositionAfterHeader:number;
        public dataStartPosition2:number;
        public startPosition:number;
        public fileInfoPopIDs:Array<number>;

        constructor(){
            this.fileInfoPopIDs = [];
            this.dataStartPosition2 = 0;
        }
        public clear(){
            this.versionMajor = null;
            this.versionMinor = null;
            this.dataStartPosition = null;
            this.startPositionAfterHeader = null;
            this.dataStartPosition2 = 0;
            this.startPosition = 0;
            this.fileInfoPopIDs = [];
        }
    }
}