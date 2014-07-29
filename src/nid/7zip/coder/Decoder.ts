module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class Decoder
    {
        public bindInfoExPrevIsDefined:boolean;
        public bindInfoExPrev:BindInfoEx;

        public multiThread:boolean;
        public mixerCoderSTSpec:CoderMixer2ST;
        public mixerCoderMTSpec:CoderMixer2MT;
        public mixerCoderCommon:CoderMixer2;

        public mixerCoder:Array<ICompressCoder2>;
        public decoders;

        constructor()
        {

        }
    }
}