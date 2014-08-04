///<reference path="../7zip.d.ts" />
module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */
    export class CoderFactory
    {

        static numCodecs:number = 1;
        static codecs = [

        ];

        static init(){

        }
        static createCoder(methodId:number,encode:boolean):object {
            var coder:ICompressCoder;
            var coder2:ICompressCoder2;
            var filter:ICompressFilter;
            var created:boolean = false;
            var i;
            for (i = 0; i < CoderFactory.numCodecs; i++)
            {
                var codec:CodecInfo = CoderFactory.codecs[i];
                if (codec.id == methodId)
                {
                    if (encode)
                    {
                        if (codec.createEncoder)
                        {
                            var p = codec.createEncoder();
                            if (codec.isFilter){
                                filter = <ICompressFilter>p;
                            }
                        else if (codec.numInStreams == 1) coder = p;
                        else coder2 = <ICompressCoder2>p;
                            created = (p != null);
                            break;
                        }
                    }
                    else
                    if (codec.createDecoder)
                    {
                        var p = codec.createDecoder();
                        if (codec.isFilter) filter = <ICompressFilter>p;
                    else if (codec.numInStreams == 1) coder = <ICompressCoder>p;
                    else coder2 = <ICompressCoder2>p;
                        created = (p != null);
                        break;
                    }
                }
            }
            return {
                coder:coder,coder2:coder2
            };
        }
    }
}