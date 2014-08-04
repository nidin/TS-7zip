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

    export class StreamSwitch {

        private needRemove:boolean;
        private archive:InArchive;

        constructor(){

        }
        public remove(){
            if(this.needRemove){
                this.archive.deleteByteStream();
                this.needRemove = false;
            }
        }

        /**
         * TODO : Must be optimize this methods, current implementation is copied from C++.
         */
        public set1(archive:InArchive,data:ByteBuffer,size:number){
            this.remove();
            this.archive = archive;
            this.archive.addByteStream(data, size);
            this.needRemove = true;
        }
        public set2(archive:InArchive,buffer:ByteBuffer){
            this.set1(archive,buffer,buffer.length);
        }
        public set3(archive:InArchive,dataVector:Array<ByteBuffer>){
            this.remove();
            var external:number = archive.inByteBack.readByte();
            if (external != 0)
            {
                var dataIndex:number = archive.inByteBack.readNum();
                if (dataIndex < 0 || dataIndex >= dataVector.length){
                    console.log('Incorrect');
                }
                this.set2(archive, dataVector[dataIndex]);
            }
        }
    }

}