module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import Uint64 = ctypes.Uint64;

    export class ByteBuffer {
        CObjectVector<CCoderInfo> Coders;
        CRecordVector<CBindPair> BindPairs;
        CRecordVector<CNum> PackStreams;
        CRecordVector<UInt64> UnpackSizes;
        UInt32 UnpackCRC;
        bool UnpackCRCDefined;

        constructor(){

        }

        CFolder(): UnpackCRCDefined(false) {}

        public GetUnpackSize()Uint64
        {
            if (UnpackSizes.IsEmpty())
                return 0;
            for (int i = UnpackSizes.Size() - 1; i >= 0; i--)
            if (FindBindPairForOutStream(i) < 0)
                return UnpackSizes[i];
            throw 1;
        }

CNum GetNumOutStreams() const
    {
CNum result = 0;
for (int i = 0; i < Coders.Size(); i++)
result += Coders[i].NumOutStreams;
return result;
}

int FindBindPairForInStream(CNum inStreamIndex) const
    {
for(int i = 0; i < BindPairs.Size(); i++)
if (BindPairs[i].InIndex == inStreamIndex)
    return i;
return -1;
}
int FindBindPairForOutStream(CNum outStreamIndex) const
    {
for(int i = 0; i < BindPairs.Size(); i++)
if (BindPairs[i].OutIndex == outStreamIndex)
    return i;
return -1;
}
int FindPackStreamArrayIndex(CNum inStreamIndex) const
    {
for(int i = 0; i < PackStreams.Size(); i++)
if (PackStreams[i] == inStreamIndex)
    return i;
return -1;
}

bool IsEncrypted() const
    {
for (int i = Coders.Size() - 1; i >= 0; i--)
if (Coders[i].MethodID == k_AES)
    return true;
return false;
}

bool CheckStructure() const;
    }
}