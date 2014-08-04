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

    export class CoderMixer2ST  extends CoderMixer2{

        constructor(){

        }
        public reInit(){

        }
        public addCoder(coder,isMain:boolean){
            this.addCoderCommon(isMain);
            this.coders.back().coder = coder;
        }
        public addCoder2(coder,isMain:boolean){
            this.addCoderCommon(isMain);
            this.coders.back().coder2 = coder;
        }
        public addCoderCommon(isMain:boolean)
        {
            var csi:CoderStreamsInfo = this.bindInfo.coders[this.coders.length];
            this.coders.push(new STCoderInfo(csi.numInStreams, csi.numOutStreams, isMain));
        }

        public getInStream(inStreams:Array<ISequentialInStream>,inSizes:Array<number>,streamIndex):ISequentialInStream
        {
            var inStreamRes:ISequentialInStream;
            var seqInStream:ISequentialInStream;
            var i;
            for(i = 0; i < this.bindInfo.inStreams.length; i++){
                if (this.bindInfo.inStreams[i] == streamIndex)
                {
                    seqInStream = inStreams[i];
                    inStreamRes = seqInStream;
                    return true;
                }
            }

            var binderIndex = this.bindInfo.findBinderForInStream(streamIndex);
            if (binderIndex < 0){
                console.log('Invalid arguments');
                return false;
            }


            var result = this.bindInfo.findOutStream(this.bindInfo.bindPairs[binderIndex].outIndex);
            var coderIndex:number       = result[0];
            var coderStreamIndex:number = result[1];

            var coder:CoderInfo = this.coders[coderIndex];
            if (!coder.coder){
                console.log('Not implemented');
                return false;
            }

            seqInStream  = coder.coder;

            if (!seqInStream){
                console.log('Not implemented');
                return false;
            }

            var startIndex = this.bindInfo.getCoderInStreamIndex(coderIndex);

            var setInStream:ICompressSetInStream;

            if (!coder.coder){
                console.log('Not implemented')
                return false;
            }

            setInStream = coder.coder;

            if (!setInStream){
                console.log('Not implemented');
                return false;
            }

            if (coder.numInStreams > 1){
                console.log('Not implemented')
                return false;
            }
            for (i = 0; i < coder.numInStreams; i++)
            {
                var seqInStream2:ISequentialInStream = this.getInStream(inStreams, inSizes, startIndex + i);
                setInStream.setInStream(seqInStream2);
            }
            inStreamRes = seqInStream;
            return inStreamRes;
        }

        public setOutStream(outStreams:Array<ISequentialOutStream>, outSizes:Array<number>,streamIndex):ISequentialOutStream
        {
            var outStreamRes:ISequentialOutStream
            var seqOutStream:ISequentialOutStream;
            var i;
            for(i = 0; i < this.bindInfo.outStreams.length; i++) {
                if (this.bindInfo.outStreams[i] == streamIndex) {
                    seqOutStream = outStreams[i];
                    outStreamRes = seqOutStream;
                    return  outStreamRes;
                }
            }
            var binderIndex = this.bindInfo.findBinderForOutStream(streamIndex);
            if (binderIndex < 0){
                console.log('Invalid arguments');
                return null;
            }

            var result:Array = this.bindInfo.findInStream(this.bindInfo.bindPairs[binderIndex].inIndex);

            var coderIndex:number          = result[0];
            var coderStreamIndex:number    = result[1];


            var coder:CoderInfo = this.coders[coderIndex];

            if (!coder.coder){
                console.log('Not implemented');
                return null;
            }

            seqOutStream = coder.coder;

            if (!seqOutStream){
                console.log('Not implemented');
                return null;
            }

            var startIndex = this.bindInfo.getCoderOutStreamIndex(coderIndex);

            var setOutStream:ICompressSetOutStream;
            if (!coder.coder){
                console.log('Not implemented');
                return null;
            }

            setOutStream = coder.coder;

            if (!setOutStream){
                console.log('Not implemented');
                return null;
            }

            if (coder.numOutStreams > 1){
                console.log('Not implemented');
                return null;
            }

            for (i = 0; i < coder.numOutStreams; i++)
            {
                var seqOutStream2:ISequentialOutStream = this.getOutStream(outStreams, outSizes, startIndex + i);
                setOutStream.setOutStream(seqOutStream2);
            }
            outStreamRes = seqOutStream;
            return outStreamRes;
        }


        public code(inStreams:Array<ISequentialInStream>,inSizes:Array<number>,numInStreams:number,
                    outStreams:Array<ISequentialOutStream>,outSizes:Array<number>,numOutStreams:number,
                    progress:ICompressProgressInfo)
        {
            if (numInStreams != this.bindInfo.inStreams.length ||
                numOutStreams != this.bindInfo.outStreams.length){

                return console.log('E_INVALIDARG');
            }

            // Find main coder
            var mainCoderIndex = -1;
            var i;
            for (i = 0; i < this.coders.length; i++)
                if (this.coders[i].isMain)
                {
                    mainCoderIndex = i;
                    break;
                }
            if (mainCoderIndex < 0) {
                for (i = 0; i < this.coders.length; i++) {
                    if (this.coders[i].numInStreams > 1) {
                        if (mainCoderIndex >= 0) {
                            return console.log('E_NOTIMPL');
                        }
                        mainCoderIndex = i;
                    }
                }
            }
            if (mainCoderIndex < 0){
                mainCoderIndex = 0;
            }

            // mainCoderIndex = 0;
            // mainCoderIndex = this.coders.length - 1;
            var mainCoder:CoderInfo = this.coders[mainCoderIndex];

            var seqInStreams:Array<ISequentialInStream> = [];
            var seqOutStreams:Array<ISequentialOutStream> = [];
            var startInIndex = this.bindInfo.getCoderInStreamIndex(mainCoderIndex);
            var startOutIndex = this.bindInfo.getCoderOutStreamIndex(mainCoderIndex);
            for (i = 0; i < mainCoder.numInStreams; i++)
            {
                var seqInStream:ISequentialInStream = this.getInStream(inStreams, inSizes, startInIndex + i);
                seqInStreams.push(seqInStream);
            }
            for (i = 0; i < mainCoder.numOutStreams; i++)
            {
                var seqOutStream:ISequentialOutStream = this.getOutStream(outStreams, outSizes, startOutIndex + i);
                seqOutStreams.push(seqOutStream);
            }
            var seqInStreamsSpec:Array<ISequentialInStream> = [];
            var seqOutStreamsSpec:Array<ISequentialOutStream> = [];
            for (i = 0; i < mainCoder.numInStreams; i++){
                seqInStreamsSpec.push(seqInStreams[i]);
            }
            for (i = 0; i < mainCoder.numOutStreams; i++){
                seqOutStreamsSpec.push(seqOutStreams[i]);
            }

            for (i = 0; i < this.coders.length; i++)
            {
                if (i == mainCoderIndex){
                    continue;
                }
                var coder:CoderInfo = this.coders[i];
                var setOutStreamSize:ICompressSetOutStreamSize = coder.coder;
                if (setOutStreamSize)
                {
                    setOutStreamSize.setOutStreamSize(coder.outSizePointers[0]);
                }
            }
            if (mainCoder.coder)
            {
                mainCoder.coder.code(seqInStreamsSpec[0], seqOutStreamsSpec[0],
                    mainCoder.inSizePointers[0], mainCoder.outSizePointers[0],
                    progress
                );
            }
            else
            {
                mainCoder.coder2.code(seqInStreamsSpec[0],
                    mainCoder.inSizePointers[0], mainCoder.numInStreams,
                    seqOutStreamsSpec[0],
                    mainCoder.outSizePointers[0], mainCoder.numOutStreams,
                    progress
                );
            }
            seqOutStreams[0].flush();
            return S_OK;
        }
    }
}