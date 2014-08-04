module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class LzmaDec{

        static kNumTopBits:number = 24
        static kTopValue:number = (1 << LzmaDec.kNumTopBits)
    
        static kNumBitModelTotalBits:number = 11;
        static kBitModelTotal:number =  (1 << kNumBitModelTotalBits)
        static kNumMoveBits:number = 5;
    
        static RC_INIT_SIZE:number = 5;
    
        private NORMALIZE(){
            if (this.range < LzmaDec.kTopValue) { this.range <<= 8; this.code = (this.code << 8) | (buf++); }
        }

        static IF_BIT_0(p) ttt = *(p); NORMALIZE; bound = (range >> kNumBitModelTotalBits) * ttt; if (code < bound)
            static UPDATE_0(p) range = bound; *(p) = (CLzmaProb)(ttt + ((kBitModelTotal - ttt) >> kNumMoveBits));
        static UPDATE_1(p) range -= bound; code -= bound; *(p) = (CLzmaProb)(ttt - (ttt >> kNumMoveBits));
        static GET_BIT2(p, i, A0, A1) IF_BIT_0(p) \
          { UPDATE_0(p); i = (i + i); A0; } else \
          { UPDATE_1(p); i = (i + i) + 1; A1; }
        static GET_BIT(p, i) GET_BIT2(p, i, ; , ;)
        
        static TREE_GET_BIT(probs, i) { GET_BIT((probs + i), i); }
        static TREE_DECODE(probs, limit, i) \
          { i = 1; do { TREE_GET_BIT(probs, i); } while (i < limit); i -= limit; }
        
            /* static _LZMA_SIZE_OPT */
        
        #ifdef _LZMA_SIZE_OPT
        static TREE_6_DECODE(probs, i) TREE_DECODE(probs, (1 << 6), i)
        #else
        static TREE_6_DECODE(probs, i) \
          { i = 1; \
          TREE_GET_BIT(probs, i); \
          TREE_GET_BIT(probs, i); \
          TREE_GET_BIT(probs, i); \
          TREE_GET_BIT(probs, i); \
          TREE_GET_BIT(probs, i); \
          TREE_GET_BIT(probs, i); \
          i -= 0x40; }
        #endif
        
        static NORMALIZE_CHECK if (range < kTopValue) { if (buf >= bufLimit) return DUMMY_ERROR; range <<= 8; code = (code << 8) | (*buf++); }
        
        static IF_BIT_0_CHECK(p) ttt = *(p); NORMALIZE_CHECK; bound = (range >> kNumBitModelTotalBits) * ttt; if (code < bound)
            static UPDATE_0_CHECK range = bound;
        static UPDATE_1_CHECK range -= bound; code -= bound;
        static GET_BIT2_CHECK(p, i, A0, A1) IF_BIT_0_CHECK(p) \
          { UPDATE_0_CHECK; i = (i + i); A0; } else \
          { UPDATE_1_CHECK; i = (i + i) + 1; A1; }
        static GET_BIT_CHECK(p, i) GET_BIT2_CHECK(p, i, ; , ;)
        static TREE_DECODE_CHECK(probs, limit, i) \
          { i = 1; do { GET_BIT_CHECK(probs + i, i) } while (i < limit); i -= limit; }
        
        
        static kNumPosBitsMax 4
        static kNumPosStatesMax (1 << kNumPosBitsMax)
        
        static kLenNumLowBits 3
        static kLenNumLowSymbols (1 << kLenNumLowBits)
        static kLenNumMidBits 3
        static kLenNumMidSymbols (1 << kLenNumMidBits)
        static kLenNumHighBits 8
        static kLenNumHighSymbols (1 << kLenNumHighBits)
        
        static LenChoice 0
        static LenChoice2 (LenChoice + 1)
        static LenLow (LenChoice2 + 1)
        static LenMid (LenLow + (kNumPosStatesMax << kLenNumLowBits))
        static LenHigh (LenMid + (kNumPosStatesMax << kLenNumMidBits))
        static kNumLenProbs (LenHigh + kLenNumHighSymbols)
        
        
        static kNumStates 12
        static kNumLitStates 7
        
        static kStartPosModelIndex 4
        static kEndPosModelIndex 14
        static kNumFullDistances (1 << (kEndPosModelIndex >> 1))
        
        static kNumPosSlotBits 6
        static kNumLenToPosStates 4
        
        static kNumAlignBits 4
        static kAlignTableSize (1 << kNumAlignBits)
        
        static kMatchMinLen 2
        static kMatchSpecLenStart (kMatchMinLen + kLenNumLowSymbols + kLenNumMidSymbols + kLenNumHighSymbols)
        
        static IsMatch 0
        static IsRep (IsMatch + (kNumStates << kNumPosBitsMax))
        static IsRepG0 (IsRep + kNumStates)
        static IsRepG1 (IsRepG0 + kNumStates)
        static IsRepG2 (IsRepG1 + kNumStates)
        static IsRep0Long (IsRepG2 + kNumStates)
        static PosSlot (IsRep0Long + (kNumStates << kNumPosBitsMax))
        static SpecPos (PosSlot + (kNumLenToPosStates << kNumPosSlotBits))
        static Align (SpecPos + kNumFullDistances - kEndPosModelIndex)
        static LenCoder (Align + kAlignTableSize)
        static RepLenCoder (LenCoder + kNumLenProbs)
        static Literal (RepLenCoder + kNumLenProbs)
        
        static LZMA_BASE_SIZE 1846
        static LZMA_LIT_SIZE 768
        
        static LzmaProps_GetNumProbs(p) ((UInt32)LZMA_BASE_SIZE + (LZMA_LIT_SIZE << ((p)->lc + (p)->lp)))
        
        #if Literal != LZMA_BASE_SIZE
            StopCompilingDueBUG
        #endif
        
        static LZMA_DIC_MIN (1 << 12)
        
        
        static LZMA_REQUIRED_INPUT_MAX:number = 20;
        static LZMA_PROPS_SIZE:number = 5;
        static LZMA_DIC_MIN:number = (1 << 12);
        static LZMA_BASE_SIZE:number  = 1846;
        static LZMA_LIT_SIZE:number  = 768;

        public prop:LzmaProbs;
        public probs:Array<LzmaProbs>;
        public dic:ByteBuffer;
        public buf:ByteBuffer;
        public range:number;
        public code:number;
        public dicPos:number;
        public dicBufSize:number;
        public processedPos:number;
        public checkDicSize:number;
        public state:number;
        public reps:Array<number>;
        public remainLen:number;
        public needFlush:number;
        public needInitState:number;
        public numProbs:number;
        public tempBufSize:number;
        public tempBuf:Array<number>;

        constructor(){
            this.tempBuf = [];//LZMA_REQUIRED_INPUT_MAX
            this.reps = [];//4
        }

        static LzmaDec_Allocate(p:LzmaDec, props:ByteBuffer, propsSize:number)
        {
            var propNew:LzmaProbs = new LzmaProbs;
            var dicBufSize:number;
            LzmaDec.LzmaProps_Decode(propNew, props, propsSize);
            LzmaDec.LzmaDec_AllocateProbs2(p, propNew);
            dicBufSize = propNew.dicSize;
            if (p.dic == null || dicBufSize != p.dicBufSize)
            {
                p.dic = new ByteBuffer()
                p.dic.setCapacity(dicBufSize);
            }
            p.dicBufSize = dicBufSize;
            p.prop = propNew;
            return true;
        }
        static LzmaProps_Decode(p:LzmaProbs, data:ByteBuffer, size:number)
        {
            var dicSize:number;
            var d:number;

            if (size < LzmaDec.LZMA_PROPS_SIZE){
                console.log('SZ_ERROR_UNSUPPORTED');
                return false;
            }

            else
            dicSize = data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24);

            if (dicSize < LzmaDec.LZMA_DIC_MIN)
            dicSize = LzmaDec.LZMA_DIC_MIN;
            p.dicSize = dicSize;

            d = data[0];
            if (d >= (9 * 5 * 5))
            console.log('SZ_ERROR_UNSUPPORTED');
            return false;

            p.lc = d % 9;
            d /= 9;
            p.pb = d / 5;
            p.lp = d % 5;

            return true;
        }
        static LzmaDec_AllocateProbs2(p:LzmaDec, propNew:LzmaProbs)
        {
            var numProbs:number = LzmaDec.LzmaProps_GetNumProbs(propNew);
            if (p.probs == null || numProbs != p.numProbs)
            {
                p.probs = [];
                p.probs.ElementClass = nid.LzmaProbs;
                p.probs.reserve(numProbs);
                p.numProbs = numProbs;
            }
            return true;
        }
        static LzmaProps_GetNumProbs(p:LzmaProbs):number{
            return LzmaDec.LZMA_BASE_SIZE + (LzmaDec.LZMA_LIT_SIZE << (p.lc + p.lp))
        }
        static LzmaDec_WriteRem(p:LzmaDec, limit:number)
        {
            if (p.remainLen != 0 && p.remainLen < kMatchSpecLenStart)
            {
                var dic:ByteBuffer = p.dic;
                var dicPos:number = p.dicPos;
                var dicBufSize:number = p.dicBufSize;
                var len:number = p.remainLen;
                var rep0:number = p.reps[0];
                if (limit - dicPos < len)
                len = (limit - dicPos);

                if (p.checkDicSize == 0 && p.prop.dicSize - p.processedPos <= len)
                p.checkDicSize = p.prop.dicSize;

                p.processedPos += len;
                p.remainLen -= len;
                while (len-- != 0)
                {
                    dic[dicPos] = dic[(dicPos - rep0) + ((dicPos < rep0) ? dicBufSize : 0)];
                    dicPos++;
                }
                p.dicPos = dicPos;
            }
        }
        static LzmaDec_DecodeToDic(p:LzmaDec,dicLimit:number,src:ByteBuffer, srcLen:number,finishMode:number)
        {
            var inSize:number = srcLen;
            srcLen = 0;
            LzmaDec.LzmaDec_WriteRem(p, dicLimit);

            var status:number = LZMA_STATUS_NOT_SPECIFIED;

                while (p.remainLen != kMatchSpecLenStart)
                {
                    var checkEndMarkNow;

                    if (p.needFlush != 0)
                    {
                        for (; inSize > 0 && p.tempBufSize < RC_INIT_SIZE; (*srcLen)++, inSize--)
                        p.tempBuf[p.tempBufSize++] = *src++;
                        if (p.tempBufSize < RC_INIT_SIZE)
                        {
                        *status = LZMA_STATUS_NEEDS_MORE_INPUT;
                            return SZ_OK;
                        }
                        if (p.tempBuf[0] != 0)
                            return SZ_ERROR_DATA;

                        LzmaDec_InitRc(p, p.tempBuf);
                        p.tempBufSize = 0;
                    }

                    checkEndMarkNow = 0;
                    if (p.dicPos >= dicLimit)
                    {
                        if (p.remainLen == 0 && p.code == 0)
                        {
                        *status = LZMA_STATUS_MAYBE_FINISHED_WITHOUT_MARK;
                            return SZ_OK;
                        }
                        if (finishMode == LZMA_FINISH_ANY)
                        {
                        *status = LZMA_STATUS_NOT_FINISHED;
                            return SZ_OK;
                        }
                        if (p.remainLen != 0)
                        {
                        *status = LZMA_STATUS_NOT_FINISHED;
                            return SZ_ERROR_DATA;
                        }
                        checkEndMarkNow = 1;
                    }

                    if (p.needInitState)
                        LzmaDec_InitStateReal(p);

                    if (p.tempBufSize == 0)
                    {
                        SizeT processed;
                        const Byte *bufLimit;
                        if (inSize < LZMA_REQUIRED_INPUT_MAX || checkEndMarkNow)
                        {
                            int dummyRes = LzmaDec_TryDummy(p, src, inSize);
                            if (dummyRes == DUMMY_ERROR)
                            {
                                memcpy(p.tempBuf, src, inSize);
                                p.tempBufSize = (unsigned)inSize;
                                (*srcLen) += inSize;
                            *status = LZMA_STATUS_NEEDS_MORE_INPUT;
                                return SZ_OK;
                            }
                            if (checkEndMarkNow && dummyRes != DUMMY_MATCH)
                            {
                            *status = LZMA_STATUS_NOT_FINISHED;
                                return SZ_ERROR_DATA;
                            }
                            bufLimit = src;
                        }
                        else
                            bufLimit = src + inSize - LZMA_REQUIRED_INPUT_MAX;
                        p.buf = src;
                        if (LzmaDec_DecodeReal2(p, dicLimit, bufLimit) != 0)
                            return SZ_ERROR_DATA;
                        processed = (SizeT)(p.buf - src);
                        (*srcLen) += processed;
                        src += processed;
                        inSize -= processed;
                    }
                    else
                    {
                        unsigned rem = p.tempBufSize, lookAhead = 0;
                        while (rem < LZMA_REQUIRED_INPUT_MAX && lookAhead < inSize)
                            p.tempBuf[rem++] = src[lookAhead++];
                        p.tempBufSize = rem;
                        if (rem < LZMA_REQUIRED_INPUT_MAX || checkEndMarkNow)
                        {
                            int dummyRes = LzmaDec_TryDummy(p, p.tempBuf, rem);
                            if (dummyRes == DUMMY_ERROR)
                            {
                                (*srcLen) += lookAhead;
                            *status = LZMA_STATUS_NEEDS_MORE_INPUT;
                                return SZ_OK;
                            }
                            if (checkEndMarkNow && dummyRes != DUMMY_MATCH)
                            {
                            *status = LZMA_STATUS_NOT_FINISHED;
                                return SZ_ERROR_DATA;
                            }
                        }
                        p.buf = p.tempBuf;
                        if (LzmaDec_DecodeReal2(p, dicLimit, p.buf) != 0)
                            return SZ_ERROR_DATA;
                        lookAhead -= (rem - (unsigned)(p.buf - p.tempBuf));
                        (*srcLen) += lookAhead;
                        src += lookAhead;
                        inSize -= lookAhead;
                        p.tempBufSize = 0;
                    }
                }
            if (p.code == 0)
                status = LZMA_STATUS_FINISHED_WITH_MARK;
            return (p.code == null) ? SZ_OK : SZ_ERROR_DATA;
        }
    }
}