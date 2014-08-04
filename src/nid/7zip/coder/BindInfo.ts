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

    export class BindInfo
    {
        public coders:Array<CoderStreamsInfo>;
        public bindPairs:Array<BindPair>;
        public inStreams:Array<number>;
        public outStreams:Array<number>;

        constructor(){

        }
        public clear()
        {
            this.coders     = [];
            this.bindPairs  = [];
            this.inStreams  = [];
            this.outStreams = [];
        }

        public getNumStreams()
        {
            var numInStreams:number = 0;
            var numOutStreams:number = 0;
            for (var i = 0; i < this.coders.length; i++)
            {
                var coderStreamsInfo:CoderStreamsInfo = this.coders[i];
                numInStreams += coderStreamsInfo.numInStreams;
                numOutStreams += coderStreamsInfo.numOutStreams;
            }
            return [numInStreams,numOutStreams];
        }

        public findBinderForInStream(inStream):number
        {
            for (var i = 0; i < this.bindPairs.length; i++)
            {
                if (this.bindPairs[i].inIndex == inStream) {
                    return i;
                }
            }
            return -1;
        }
        public findBinderForOutStream(outStream):number
        {
            for (var i = 0; i < this.bindPairs.length; i++)
            {
                if (this.bindPairs[i].outIndex == outStream) {
                    return i;
                }
            }
            return -1;
        }

        public getCoderInStreamIndex(coderIndex:number):number
        {
            var streamIndex:number = 0;
            for (var i = 0; i < coderIndex; i++) {
                streamIndex += this.coders[i].numInStreams;
            }
            return streamIndex;
        }

        public getCoderOutStreamIndex(coderIndex:number):number
        {
            var streamIndex:number = 0;
            for (var i = 0; i < coderIndex; i++) {
                streamIndex += this.coders[i].numOutStreams;
            }
            return streamIndex;
        }


        public findInStream(streamIndex:number)
        {
            var coderStreamIndex:number
            for (var coderIndex:number = 0; coderIndex < this.coders.length; coderIndex++)
            {
                var curSize:number = this.coders[coderIndex].numInStreams;
                if (streamIndex < curSize)
                {
                    coderStreamIndex = streamIndex;
                    return;
                }
                streamIndex -= curSize;
            }
            return [coderIndex,coderStreamIndex];
        }
        public findOutStream(streamIndex:number)
        {
            var coderStreamIndex:number;

            for (var coderIndex:number = 0; coderIndex < this.coders.length; coderIndex++)
            {
                var curSize:number = this.coders[coderIndex].numOutStreams;
                if (streamIndex < curSize)
                {
                    coderStreamIndex = streamIndex;
                    return;
                }
                streamIndex -= curSize;
            }
            return [coderIndex,coderStreamIndex];
        }
    }

}