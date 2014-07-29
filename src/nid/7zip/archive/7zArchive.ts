module nid {

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class _7zArchive {

        private signature = [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C];

        public versionMajor:number;
        public versionMinor:number;

        private startHeaderCRC:number;
        private nextHeaderOffset:Uint64;
        private nextHeaderSize:Uint64;
        private nextHeaderCRC:number;

        public headerSize:number = 32;
        public header:Uint8Array;
        public stream:ByteArray;

        private currentBuffer:ByteBuffer;

        constructor(){

        }
        public open(stream:ByteArray){
            this.stream = stream;
            this.findAndReadSignature();
            this.readDatabase();
        }
        public findAndReadSignature(){
            if( data[0] != this.signature[0] ||
                data[1] != this.signature[1] ||
                data[2] != this.signature[2] ||
                data[3] != this.signature[3] ||
                data[4] != this.signature[4] ||
                data[5] != this.signature[5]){
                console.log('Error! Invalid file');
                return false;
            }else{
                console.log('7zip file');
            }

            this.stream.position = 6;

            this.versionMajor = this.stream.readByte();
            this.versionMinor = this.stream.readByte();

            this.startHeaderCRC = this.stream.readUnsignedInt();

            //StartHeader
            this.nextHeaderOffset  = this.stream.readUnsignedInt64();
            this.nextHeaderSize    = this.stream.readUnsignedInt64();
            this.nextHeaderCRC     = this.stream.readUnsignedInt();

            this.stream.position = this.nextHeaderOffset.value();
        }
        public readDatabase(){
            this.currentBuffer = new ByteBuffer(new ByteArray(new ArrayBuffer(this.nextHeaderSize.value())));
            var type:UInt64 = this.currentBuffer.readID();
            if (type.value() != _7zipDefines.kHeader)
            {
                if (type._value != _7zipDefines.kEncodedHeader){
                    console.log('Error! Incorrect');
                }

                this.currentBuffer = this.readAndDecodePackedStreams();
            }

        }
        public readAndDecodePackedStreams():ByteBuffer{
            var packSizes:Array<UInt64>;
            var packCRCsDefined:boolean;
            var packCRCs:Array<number>;
            var folders:Array<Folder>;

            var numUnpackStreamsInFolders:Array<number>;
            var unpackSizes:Array<number>;//UInt64
            var digestsDefined:boolean;
            var digests:Array<number>;//UInt32

            this.readStreamsInfo(null,
                dataOffset,
                packSizes,
                packCRCsDefined,
                packCRCs,
                folders,
                numUnpackStreamsInFolders,
                unpackSizes,
                digestsDefined,
                digests);

            // db.ArchiveInfo.DataStartPosition2 += db.ArchiveInfo.StartPositionAfterHeader;

            var packIndex:number = 0;
            CDecoder decoder(
    #ifdef _ST_MODE
            false
    #else
            true
    #endif
        );

            UInt64 dataStartPos = baseOffset + dataOffset;

            for (int i = 0; i < folders.Size(); i++)
            {
                const CFolder &folder = folders[i];
                dataVector.Add(CByteBuffer());
                CByteBuffer &data = dataVector.Back();
                UInt64 unpackSize64 = folder.GetUnpackSize();
                size_t unpackSize = (size_t)unpackSize64;
                if (unpackSize != unpackSize64)
                    ThrowUnsupported();
                data.SetCapacity(unpackSize);

                CBufPtrSeqOutStream *outStreamSpec = new CBufPtrSeqOutStream;
                CMyComPtr<ISequentialOutStream> outStream = outStreamSpec;
                outStreamSpec->Init(data, unpackSize);

                HRESULT result = decoder.Decode(
                EXTERNAL_CODECS_LOC_VARS
                _stream, dataStartPos,
            &packSizes[packIndex], folder, outStream, NULL
      #ifndef _NO_CRYPTO
                , getTextPassword, passwordIsDefined
      #endif
      #if !defined(_7ZIP_ST) && !defined(_SFX)
                , false, 1
                #endif
            );
                RINOK(result);

                if (folder.UnpackCRCDefined)
                    if (CrcCalc(data, unpackSize) != folder.UnpackCRC)
                        ThrowIncorrect();
                for (int j = 0; j < folder.packStreams.Size(); j++)
                {
                    UInt64 packSize = packSizes[packIndex++];
                    dataStartPos += packSize;
                    HeadersSize += packSize;
                }
            }
            return S_OK;
        }
        public readHeader(){
            UInt64 type = ReadID();

            if (type == NID::kArchiveProperties)
            {
                ReadArchiveProperties(db.ArchiveInfo);
                type = ReadID();
            }

            CObjectVector<CByteBuffer> dataVector;

            if (type == NID::kAdditionalStreamsInfo)
            {
                HRESULT result = ReadAndDecodePackedStreams(
                EXTERNAL_CODECS_LOC_VARS
                db.ArchiveInfo.StartPositionAfterHeader,
                    db.ArchiveInfo.DataStartPosition2,
                    dataVector
        #ifndef _NO_CRYPTO
                , getTextPassword, passwordIsDefined
        #endif
            );
                RINOK(result);
                db.ArchiveInfo.DataStartPosition2 += db.ArchiveInfo.StartPositionAfterHeader;
                type = ReadID();
            }

            CRecordVector<UInt64> unpackSizes;
            CBoolVector digestsDefined;
            CRecordVector<UInt32> digests;

            if (type == NID::kMainStreamsInfo)
            {
                ReadStreamsInfo(&dataVector,
                    db.ArchiveInfo.DataStartPosition,
                    db.PackSizes,
                    db.PackCRCsDefined,
                    db.PackCRCs,
                    db.Folders,
                    db.NumUnpackStreamsVector,
                    unpackSizes,
                    digestsDefined,
                    digests);
                db.ArchiveInfo.DataStartPosition += db.ArchiveInfo.StartPositionAfterHeader;
                type = ReadID();
            }
        else
            {
                for (int i = 0; i < db.Folders.Size(); i++)
                {
                    db.NumUnpackStreamsVector.Add(1);
                    CFolder &folder = db.Folders[i];
                    unpackSizes.Add(folder.GetUnpackSize());
                    digestsDefined.Add(folder.UnpackCRCDefined);
                    digests.Add(folder.UnpackCRC);
                }
            }

            db.Files.Clear();

            if (type == NID::kEnd)
            return S_OK;
            if (type != NID::kFilesInfo)
            ThrowIncorrect();

            CNum numFiles = ReadNum();
            db.Files.Reserve(numFiles);
            CNum i;
            for (i = 0; i < numFiles; i++)
                db.Files.Add(CFileItem());

            db.ArchiveInfo.FileInfoPopIDs.Add(NID::kSize);
            if (!db.PackSizes.IsEmpty())
                db.ArchiveInfo.FileInfoPopIDs.Add(NID::kPackInfo);
            if (numFiles > 0  && !digests.IsEmpty())
                db.ArchiveInfo.FileInfoPopIDs.Add(NID::kCRC);

            CBoolVector emptyStreamVector;
            BoolVector_Fill_False(emptyStreamVector, (int)numFiles);
            CBoolVector emptyFileVector;
            CBoolVector antiFileVector;
            CNum numEmptyStreams = 0;

            for (;;)
            {
                UInt64 type = ReadID();
                if (type == NID::kEnd)
                break;
                UInt64 size = ReadNumber();
                size_t ppp = _inByteBack->_pos;
                bool addPropIdToList = true;
                bool isKnownType = true;
                if (type > ((UInt32)1 << 30))
                isKnownType = false;
            else switch((UInt32)type)
            {
            case NID::kName:
            {
                CStreamSwitch streamSwitch;
                streamSwitch.Set(this, &dataVector);
                for (int i = 0; i < db.Files.Size(); i++)
                _inByteBack->ReadString(db.Files[i].Name);
                break;
            }
            case NID::kWinAttributes:
            {
                CBoolVector boolVector;
                ReadBoolVector2(db.Files.Size(), boolVector);
                CStreamSwitch streamSwitch;
                streamSwitch.Set(this, &dataVector);
                for (i = 0; i < numFiles; i++)
                {
                    CFileItem &file = db.Files[i];
                    file.AttribDefined = boolVector[i];
                    if (file.AttribDefined)
                        file.Attrib = ReadUInt32();
                }
                break;
            }
            case NID::kEmptyStream:
            {
                ReadBoolVector(numFiles, emptyStreamVector);
                for (i = 0; i < (CNum)emptyStreamVector.Size(); i++)
                if (emptyStreamVector[i])
                    numEmptyStreams++;

                BoolVector_Fill_False(emptyFileVector, numEmptyStreams);
                BoolVector_Fill_False(antiFileVector, numEmptyStreams);

                break;
            }
            case NID::kEmptyFile:  ReadBoolVector(numEmptyStreams, emptyFileVector); break;
            case NID::kAnti:  ReadBoolVector(numEmptyStreams, antiFileVector); break;
            case NID::kStartPos:  ReadUInt64DefVector(dataVector, db.StartPos, (int)numFiles); break;
            case NID::kCTime:  ReadUInt64DefVector(dataVector, db.CTime, (int)numFiles); break;
            case NID::kATime:  ReadUInt64DefVector(dataVector, db.ATime, (int)numFiles); break;
            case NID::kMTime:  ReadUInt64DefVector(dataVector, db.MTime, (int)numFiles); break;
            case NID::kDummy:
            {
                for (UInt64 j = 0; j < size; j++)
                if (ReadByte() != 0)
                    ThrowIncorrect();
                addPropIdToList = false;
                break;
            }
            default:
                addPropIdToList = isKnownType = false;
            }
                if (isKnownType)
                {
                    if(addPropIdToList)
                        db.ArchiveInfo.FileInfoPopIDs.Add(type);
                }
                else
                    SkipData(size);
                bool checkRecordsSize = (db.ArchiveInfo.Version.Major > 0 ||
                    db.ArchiveInfo.Version.Minor > 2);
                if (checkRecordsSize && _inByteBack->_pos - ppp != size)
                ThrowIncorrect();
            }

                CNum emptyFileIndex = 0;
                CNum sizeIndex = 0;

                CNum numAntiItems = 0;
                for (i = 0; i < numEmptyStreams; i++)
                    if (antiFileVector[i])
                        numAntiItems++;

                for (i = 0; i < numFiles; i++)
                {
                    CFileItem &file = db.Files[i];
                    bool isAnti;
                    file.HasStream = !emptyStreamVector[i];
                    if (file.HasStream)
                    {
                        file.IsDir = false;
                        isAnti = false;
                        file.Size = unpackSizes[sizeIndex];
                        file.Crc = digests[sizeIndex];
                        file.CrcDefined = digestsDefined[sizeIndex];
                        sizeIndex++;
                    }
                    else
                    {
                        file.IsDir = !emptyFileVector[emptyFileIndex];
                        isAnti = antiFileVector[emptyFileIndex];
                        emptyFileIndex++;
                        file.Size = 0;
                        file.CrcDefined = false;
                    }
                    if (numAntiItems != 0)
                        db.IsAnti.Add(isAnti);
                }
                return S_OK;

        }
        public readPackInfo(){

        }
        public readUnpackInfo(){

        }
        public readSubStreamsInfo(){

        }
        public readStreamsInfo(){

        }
        public readBoolVector(){

        }
        public readBoolVector2(){

        }
        public readUInt64DefVector(){

        }
        public readDatabase2(){

        }
    }
}