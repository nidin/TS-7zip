///<reference path="7zip.d.ts" />
module nid
{

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import Uint64 = ctypes.Uint64;
    import Int64 = ctypes.Int64;

    export class _7zip extends _7zipBase
    {

        private data:ByteArray;
        private archive:_7zArchive;

        constructor(data?:Uint8Array){
            if(data){
                this.load(data);
            }
        }
        public load(data:Uint8Array){

            this.data = new ByteArray(data.buffer);
            this.archive = new _7zArchive();
            this.archive.open(this.data);
        }
    }
}