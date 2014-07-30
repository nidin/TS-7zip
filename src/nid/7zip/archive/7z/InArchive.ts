///<reference path="../../7zip.d.ts" />
module nid {

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class InArchive {

        private signature = [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C];

        public versionMajor:number;
        public versionMinor:number;

        private startHeaderCRC:number;
        private nextHeaderOffset:UInt64;
        private nextHeaderSize:UInt64;
        private nextHeaderCRC:number;

        public headerSize:number = 32;
        public header:Uint8Array;
        public stream:ByteArray;

        private currentBuffer:ByteBuffer;
        private db:ArchiveDatabaseEx;

        constructor(){

        }
        public open(stream:ByteArray){
            this.stream = stream;
            this.findAndReadSignature();
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
        public readDatabase(db){
            this.db = db;
            this.currentBuffer = new ByteBuffer(new ByteArray(new ArrayBuffer(this.nextHeaderSize.value())));
            var type:number = this.currentBuffer.readID();//UInt64
            if (type != _7zipDefines.kHeader)
            {
                if (type != _7zipDefines.kEncodedHeader){
                    console.log('Error! Incorrect');
                }

                this.currentBuffer = this.readAndDecodePackedStreams(
                    db.ArchiveInfo.StartPositionAfterHeader,
                    db.ArchiveInfo.DataStartPosition2,
                    dataVector);
            }

        }
        public readAndDecodePackedStreams(baseOffset,dataOffset,dataVector){
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
            var decoder:Decoder = new Decoder();

            var dataStartPos:number = baseOffset + dataOffset;

            for (var i = 0; i < folders.length; i++)
            {
                var folder:Folder = folders[i];
                var data:ByteBuffer = new ByteBuffer();
                dataVector.push(data);
                var unpackSize64 = folder.getUnpackSize();
                var unpackSize = unpackSize64;
                if (unpackSize != unpackSize64){
                    console.log('Unsupported')
                }
                data.setCapacity(unpackSize);

                var outStreamSpec:BufPtrSeqOutStream = new BufPtrSeqOutStream();
                var outStream:ISequentialOutStream = outStreamSpec;
                outStreamSpec.init(data, unpackSize);

                var result = decoder.decode(_stream, dataStartPos,&packSizes[packIndex], folder, outStream);

                if (folder.unpackCRCDefined) {
                    if (CrcCalc(data, unpackSize) != folder.UnpackCRC){
                        console.log('Incorrect')
                    }
                }
                for (var j = 0; j < folder.packStreams.length; j++)
                {
                    var packSize:number = packSizes[packIndex++];//UInt64
                    dataStartPos += packSize;
                    headersSize += packSize;
                }
            }
            return true;
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
        public readStreamsInfo(dataVector,dataOffset,packSizes,packCRCsDefined,packCRCs,folders,numUnpackStreamsInFolders,unpackSizes,digestsDefined,digests){

                /*dataVector:Array<ByteBuffer>,
                dataOffset:number,
                packSizes:Array<number>,
                packCRCsDefined,
                packCRCs:Array<number>,
                folders:Array<Folder>,
                numUnpackStreamsInFolders:Array<number>,
                unpackSizes:Array<number>,
                digestsDefined,
                digests:Array<number>*/

            for (;;)
            {
                var type:number = this.currentBuffer.readID();//UInt64
                if (type > (1 << 30)) {
                    console.log('Incorrect');
                }
                switch(type)
                {
                    case kEnd:
                        return;
                    case kPackInfo:
                    {
                        this.readPackInfo(dataOffset, packSizes, packCRCsDefined, packCRCs);
                        break;
                    }
                    case kUnpackInfo:
                    {
                        ReadUnpackInfo(dataVector, folders);
                        break;
                    }
                    case kSubStreamsInfo:
                    {
                        ReadSubStreamsInfo(folders, numUnpackStreamsInFolders,
                            unpackSizes, digestsDefined, digests);
                        break;
                    }
                    default:
                        console.log('Incorrect');
                    }
                }
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