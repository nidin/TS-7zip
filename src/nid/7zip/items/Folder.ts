module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class Folder {
        public coders:Array<CoderInfo>;
        public bindPairs:Array<BindPair>;
        public packStreams:Array<number>;
        public unpackSizes:Array<UInt64>;
        public unpackCRC:number;//uint32
        public unpackCRCDefined:boolean = false;

        constructor(){
            this.coders         = [];
            this.bindPairs      = [];
            this.packStreams    = [];
            this.unpackSizes    = [];
        }
        public getUnpackSize():UInt64
        {
            if (this.unpackSizes.length == 0) {
                return new UInt64(0);
            }

            for (var i = this.unpackSizes.length - 1; i >= 0; i--) {
                if (this.findBindPairForOutStream(i) < 0) {
                    return this.unpackSizes[i];
                }
            }
        }

        public getNumOutStreams():number
        {
            var result:number = 0;
            for (var i = 0; i < this.coders.length; i++){
                result += this.coders[i].numOutStreams;
            }
            return result;
        }

        public findBindPairForInStream(inStreamIndex:number):number
        {
            for(var i = 0; i < this.bindPairs.length; i++) {
                if (this.bindPairs[i].inIndex == inStreamIndex) {
                    return i;
                }
            }
            return -1;
        }

        public findBindPairForOutStream(outStreamIndex:number):number
        {
            for(var i = 0; i < this.bindPairs.length; i++) {
                if (this.bindPairs[i].outIndex == outStreamIndex) {
                    return i;
                }
            }
            return -1;
        }
        public findPackStreamArrayIndex(inStreamIndex:number):number
        {
            for(var i = 0; i < this.packStreams.length; i++) {
                if (this.packStreams[i] == inStreamIndex) {
                    return i;
                }
            }
            return -1;
        }

        public isEncrypted():boolean
        {
            for (var i = this.coders.length - 1; i >= 0; i--) {
                if (this.coders[i].methodID == _7zipDefines.k_AES) {
                    return true;
                }
            }
            return false;
        }

        public checkStructure(){

        }
    }
}