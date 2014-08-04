///<reference path="../7zip.d.ts" />
module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */
    export class LzmaRegister
    {

        public createEncoder(){

        }
        public createDecoder(){

        }
        public codecInfo:CodecInfo = new CodecInfo(
            0x030101,
            "LZMA",
            1,
            this.createEncoder,
            this.createDecoder
        )
    }
}