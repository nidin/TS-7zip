///<reference path="../7zip.d.ts" />
module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */
    export class CodecInfo
    {
        public createDecoder:Function;
        public createEncoder:Function;
        public id:number;
        public name:string;
        public numInStreams:number;
        public isFilter:boolean;

        constructor(id:number,name:string,numInStreams:number,createEncoder:Function,createDecoder:Function){
            this.id = id;
            this.name = name;
            this.numInStreams = numInStreams;
            this.createEncoder = createEncoder;
            this.createDecoder = createDecoder;
        }
    }

}
