module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import var = ctypes.UInt64;

    export class LzmaDecoder
    implements
        ICompressCoder,
        ICompressSetDecoderProperties2,
        ICompressSetBufSize,
        ICompressSetInStream,
        ICompressSetOutStreamSize,
        ISequentialInStream{

        public inStream:ISequentialInStream;
        public inBuf:ByteBuffer;
        public inPos:number;
        public inSize:number;
        public state:LzmaDec;
        public propsWereSet:boolean;
        public outSizeDefined:boolean;
        public outSize:number;//UInt64
        public inSizeProcessed:number;//UInt64
        public outSizeProcessed:number;//UInt64

        public inBufSizeAllocated:number;//UInt32
        public inBufSize:number;//UInt32
        public outBufSize:number;//UInt32
        public wrPos:number;

        public finishStream:boolean;

        constructor(){
            this.inSizeProcessed = 0;
            this.inPos = this.inSize = 0;
        }
        public createInputBuffer(){
            if (this.inBuf == null || this.inBufSize != this.inBufSizeAllocated)
            {
                this.inBuf = new ByteBuffer();
                this.inBuf.setCapacity(this.inBufSize);
                this.inBufSizeAllocated = this.inBufSize;
            }
        }
        public setDecoderProperties2(data:ByteBuffer, size:number){
            LzmaDec.LzmaDec_Allocate(this.state, data, size);
            this.propsWereSet = true;
            return this.createInputBuffer();
        }
        public codeSpec(inStream:ISequentialInStream,outStream:ISequentialOutStream,progress:ICompressProgressInfo){

            if (this.inBuf == null || !this.propsWereSet){
                return false;
            }

            var startInProgress = this.inSizeProcessed;

            var next = (this.state.dicBufSize - this.state.dicPos < this.outBufSize) ? this.state.dicBufSize : (this.state.dicPos + this.outBufSize);
            for (;;)
            {
                if (this.inPos == this.inSize)
                {
                    this.inPos = this.inSize = 0;
                    inStream.read(this.inBuf, this.inBufSizeAllocated, this.inSize);
                }

                var dicPos = this.state.dicPos;
                var curSize = next - dicPos;

                var finishMode:number = LZMA_FINISH_ANY;
                if (this.outSizeDefined)
                {
                    var rem = this.outSize - this.outSizeProcessed;
                    if (rem <= curSize)
                    {
                        curSize = rem;
                        if (this.finishStream) {
                            finishMode = LZMA_FINISH_END;
                        }
                    }
                }

                var inSizeProcessed = this.inSize - this.inPos;
                var status:number;
                var res = LzmaDec.LzmaDec_DecodeToDic(this.state, dicPos + curSize, this.inBuf + this.inPos, inSizeProcessed, finishMode, status);

                this.inPos += inSizeProcessed;
                this.inSizeProcessed += inSizeProcessed;
                var outSizeProcessed = this.state.dicPos - dicPos;
                this.outSizeProcessed += outSizeProcessed;

                var finished:boolean = (inSizeProcessed == 0  outSizeProcessed == 0);
                var stopDecoding:boolean = (this.outSizeDefined  this.outSizeProcessed >= this.outSize);

                if (res != 0 || this.state.dicPos == next || finished || stopDecoding)
                {
                    var res2 = WriteStream(outStream, this.state.dic + this.wrPos, this.state.dicPos - this.wrPos);

                    this.wrPos = this.state.dicPos;
                    if (this.state.dicPos == this.state.dicBufSize)
                    {
                        this.state.dicPos = 0;
                        this.wrPos = 0;
                    }
                    next = (this.state.dicBufSize - this.state.dicPos < this.outBufSize) ? this.state.dicBufSize : (this.state.dicPos + this.outBufSize);

                    if (res != 0)
                        return false;

                    if (stopDecoding)
                        return true;
                    if (finished)
                        return (status == LZMA_STATUS_FINISHED_WITH_MARK ? S_OK : S_FALSE);
                }
                if (progress)
                {
                    var inSize = this.inSizeProcessed - startInProgress;
                    progress.setRatioInfo(inSize, this.outSizeProcessed));
                }
            }
        }
        public setOutStreamSizeResume(outSize):void{

        }
        public code(inStream:ISequentialInStream,outStream:ISequentialOutStream,inSize:number, outSize:number,progress:ICompressProgressInfo){

        }
        public setOutStreamSize(outSize:number){

        }
        public setInBufSize(streamIndex:number, size:number){
            this.inBufSize = size;
        }
        public setOutBufSize(streamIndex:number, size:number){
            this.outBufSize = size
        }
        public setInStream(inStream:ISequentialInStream){

        }
        public releaseInStream(){

        }
        public read(data:ByteBuffer,size:number,processedSize:number){

        }

        public codeResume(outStream:ISequentialOutStream, outSize:number, progress:ICompressProgressInfo){

        }
        public readFromInputStream(data:ByteBuffer, size:number, processedSize:number){

        }
        public getInputProcessedSize():number{
            return this.inSizeProcessed;
        }
    }

}