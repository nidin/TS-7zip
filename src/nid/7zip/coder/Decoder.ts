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

        public mixerCoder:ICompressCoder2;
        public decoders;
        public passwordIsDefined:boolean;

        constructor(multiThread:boolean=false)
        {
            this.multiThread = multiThread;
            this.bindInfoExPrevIsDefined = false;
        }
        static convertFolderItemInfoToBindInfo(folder:Folder,bindInfo:BindInfoEx):BindInfoEx{
            bindInfo.clear();
            var i;
            for (i = 0; i < folder.bindPairs.length; i++)
            {
                var bindPair:BindPair = new BindPair();
                bindPair.inIndex = folder.bindPairs[i].inIndex;
                bindPair.outIndex = folder.bindPairs[i].outIndex;
                bindInfo.bindPairs.push(bindPair);
            }

            var outStreamIndex:number = 0;

            for (i = 0; i < folder.coders.length; i++)
            {
                var coderStreamsInfo:CoderStreamsInfo = new CoderStreamsInfo();
                var coderInfo:CoderInfo = folder.coders[i];

                coderStreamsInfo.numInStreams = coderInfo.numInStreams;
                coderStreamsInfo.numOutStreams = coderInfo.numOutStreams;
                bindInfo.coders.push(coderStreamsInfo);
                bindInfo.coderMethodIDs.push(coderInfo.methodID);

                for (var j = 0; j < coderStreamsInfo.numOutStreams; j++, outStreamIndex++)
                {
                    if (folder.findBindPairForOutStream(outStreamIndex) < 0){
                        bindInfo.outStreams.push(outStreamIndex);
                    }
                }
            }
            for (i = 0; i < folder.packStreams.length; i++){
                bindInfo.inStreams.push(folder.packStreams[i]);
            }
            return bindInfo;
        }
        static areCodersEqual(a1:CoderStreamsInfo,a2:CoderStreamsInfo):boolean{
            return (a1.numInStreams == a2.numInStreams) && (a1.numOutStreams == a2.numOutStreams);
        }
        static areBindPairsEqual(a1:BindPair, a2:BindPair):boolean{
            return (a1.inIndex == a2.inIndex) && (a1.outIndex == a2.outIndex);
        }
        static areBindInfoExEqual(a1:BindInfoEx, a2:BindInfoEx):boolean{
            if (a1.coders.length != a2.coders.length){
                return false;
            }
            var i;
            for (i = 0; i < a1.coders.length; i++) {
                if (!this.areCodersEqual(a1.coders[i], a2.coders[i])){
                    return false;
                }
            }
            if (a1.bindPairs.length != a2.bindPairs.length){
                return false;
            }
            for (i = 0; i < a1.bindPairs.length; i++){
                if (!this.areBindPairsEqual(a1.bindPairs[i], a2.bindPairs[i])){
                    return false;
                }
            }
            for (i = 0; i < a1.coderMethodIDs.length; i++){
                if (a1.coderMethodIDs[i] != a2.coderMethodIDs[i]){
                    return false;
                }
            }
            if (a1.inStreams.length != a2.inStreams.length){
                return false;
            }
            if (a1.outStreams.length != a2.outStreams.length){
                return false;
            }
            return true;
        }
        public decode(inStream, startPos:number, packSizes:number, folderInfo:Folder, outStream,mtMode:boolean=false,numThreads:number=2){
            if (!folderInfo.checkStructure()){
                return console.log('CheckStructure not implemented');
            }

            this.passwordIsDefined = false;

            var inStreams:Array<InStream> = [];

            var lockedInStream:LockedInStream = new LockedInStream();
            lockedInStream.init(inStream);

            for (var j = 0; j < folderInfo.packStreams.length; j++)
            {
                var lockedStreamImpSpec:LockedSequentialInStreamImp = new LockedSequentialInStreamImp();
                var lockedStreamImp = lockedStreamImpSpec;
                lockedStreamImpSpec.init(lockedInStream, startPos);
                startPos += packSizes[j];

                var streamSpec:LimitedSequentialInStream = new LimitedSequentialInStream();
                var inStream:InStream = streamSpec;
                streamSpec.setStream(lockedStreamImp);
                streamSpec.init(packSizes[j]);
                inStreams.push(inStream);
            }

            var numCoders:number = folderInfo.coders.length;

            var bindInfo:BindInfoEx = new BindInfoEx();

            Decoder.convertFolderItemInfoToBindInfo(folderInfo,bindInfo);

            var createNewCoders:boolean;

            if (!this.bindInfoExPrevIsDefined){
                createNewCoders = true;
            }
            else{
                createNewCoders = !Decoder.areBindInfoExEqual(bindInfo, this.bindInfoExPrev);
            }

            if (createNewCoders)
            {
                var i;
                this.decoders.clear();

                if (this.multiThread)
                {
                    this.mixerCoderMTSpec = new CoderMixer2MT();
                    this.mixerCoder = this.mixerCoderMTSpec;
                    this.mixerCoderCommon = this.mixerCoderMTSpec;
                }
                else
                {
                    this.mixerCoderSTSpec = new CoderMixer2ST();
                    this.mixerCoder = this.mixerCoderSTSpec;
                    this.mixerCoderCommon = this.mixerCoderSTSpec;
                }

                this.mixerCoderCommon.setBindInfo(bindInfo);

                for (i = 0; i < numCoders; i++)
                {
                    var coderInfo:CoderInfo = folderInfo.coders[i];


                    var decoder;
                    var decoder2;

                    CoderFactory.createCoder(coderInfo.methodID, decoder, decoder2, false);

                    var decoderUnknown;

                    if (coderInfo.isSimpleCoder())
                    {
                        if (decoder == null){
                            return console.log('not implemented');
                            return false;
                        }

                        decoderUnknown = decoder;

                        if (this.multiThread){
                            this.mixerCoderMTSpec.addCoder(decoder);
                        }
                        else{
                            this.mixerCoderSTSpec.addCoder(decoder, false);
                        }
                    }
                    else
                    {
                        if (decoder2 == 0){
                            return console.log('not implemented');
                            return false;
                        }
                        decoderUnknown = decoder2;
                        if (this.multiThread){
                            this.mixerCoderMTSpec.addCoder2(decoder2);
                        }
                        else{
                            this.mixerCoderSTSpec.addCoder2(decoder2, false);
                        }
                    }
                    this.decoders.push(decoderUnknown);
                }
                this.bindInfoExPrev = bindInfo;
                this.bindInfoExPrevIsDefined = true;
            }
            var i;
            this.mixerCoderCommon.reInit();

            var packStreamIndex = 0, unpackStreamIndex = 0, coderIndex = 0;//UInt32
            // UInt32 coder2Index = 0;

            for (i = 0; i < numCoders; i++)
            {
                var coderInfo:CoderInfo = folderInfo.coders[i];
                var decoder = this.decoders[coderIndex];

                /*var setDecoderProperties:ICompressSetDecoderProperties2;
                if (setDecoderProperties)
                {
                    var props:ByteBuffer = coderInfo.props;
                    var size = props.length;
                    if (size > 0xFFFFFFFF){
                        console.log('Not Implemented');
                        return false;
                    }
                    if (size > 0)
                    {
                        setDecoderProperties.setDecoderProperties2(props, size);
                    }
                }*/

                coderIndex++;

                var numInStreams = coderInfo.numInStreams;
                var numOutStreams = coderInfo.numOutStreams;
                var packSizesPointers:Array<number> = [];//UInt64
                var unpackSizesPointers:Array<number> = [];//UInt64
                /*packSizesPointers.Reserve(numInStreams);
                unpackSizesPointers.Reserve(numOutStreams);*/

                var j;
                for (j = 0; j < numOutStreams; j++, unpackStreamIndex++){
                    unpackSizesPointers.push(folderInfo.unpackSizes[unpackStreamIndex]);
                }

                for (j = 0; j < numInStreams; j++, packStreamIndex++)
                {
                    var bindPairIndex = folderInfo.findBindPairForInStream(packStreamIndex);
                    if (bindPairIndex >= 0) {
                        packSizesPointers.push(folderInfo.unpackSizes[folderInfo.bindPairs[bindPairIndex].outIndex]);
                    }
                    else
                    {
                        var index:number = folderInfo.findPackStreamArrayIndex(packStreamIndex);
                        if (index < 0){
                            console.log('something failed')
                            return false;
                        }
                        packSizesPointers.push(packSizes[index]);
                    }
                }

                this.mixerCoderCommon.setCoderInfo(i,packSizesPointers[0],unpackSizesPointers[0]);
            }
            var mainCoder, temp;
            bindInfo.findOutStream(bindInfo.outStreams[0], mainCoder, temp);

            if (this.multiThread){
                this.mixerCoderMTSpec.setProgressCoderIndex(mainCoder);
            }
            /*
             else
             _mixerCoderSTSpec->SetProgressCoderIndex(mainCoder);;
             */

            if (numCoders == 0){
                return 0;
            }
            var inStreamPointers:Array<InStream> = [];
            //inStreamPointers.Reserve(inStreams.length);
            for (i = 0; i < inStreams.length; i++){
                inStreamPointers.push(inStreams[i]);
            }
            var outStreamPointer = outStream;
            return this.mixerCoder.code(inStreamPointers[0], null,inStreams.length, outStreamPointer, null, 1, compressProgress);
        }
    }
}