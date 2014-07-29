module _7zipDefines
{

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    export var CRC_INIT_VAL:number      = 0xFFFFFFFF;
    export var kCrcPoly:number          = 0xEDB88320;
    export var k_AES:number             = 0x06F10701;
    export var kNumMax:number           = 0x7FFFFFFF;
    export var kNumNoIndex:number       = 0xFFFFFFFF;
    export var STREAM_SEEK_SET:number   = 0;
    export var STREAM_SEEK_CUR:number   = 1;
    export var STREAM_SEEK_END:number   = 2;

    export var kHeader:number           = 0x01;
    export var kEncodedHeader:number    = 0x17;

}