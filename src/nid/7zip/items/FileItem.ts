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

    export class FileItem {
        public size:number;//UInt64
        public attrib;//UInt32
        public CRC;//UInt32
        public name:string;

        public hasStream:boolean; // Test it !!! it means that there is
        // stream in some folder. It can be empty stream
        public isDir:boolean;
        public CRCDefined:boolean;
        public attribDefined:boolean;


        constructor(){
            this.hasStream      = true;
            this.isDir          = false;
            this.CRCDefined     = false;
            this.attribDefined  = false;
        }
        public setAttrib(attrib:number)//UInt32
        {
            this.attribDefined = true;
            this.attrib = attrib;
        }
    }

}