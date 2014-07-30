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
        private nextHeaderOffset:number;//UInt64
        private nextHeaderSize:number;//UInt64
        private nextHeaderCRC:number;
        private archiveBeginStreamPosition:number;

        public headerSize:number = 32;
        public headersSize:number = 0;
        public header:Uint8Array;
        public stream:ByteArray;
        public emptyFileVector:Array<boolean> = [];
        public antiFileVector:Array<boolean> = [];
        public numEmptyStreams:number = 0;

        public currentBuffer:ByteBuffer;
        private db:ArchiveDatabaseEx;

        constructor(){

        }
        public open(stream:ByteArray){
            this.stream = stream;
            this.findAndReadSignature();
        }
        public findAndReadSignature(){
            if( this.stream.readByte() != this.signature[0] ||
                this.stream.readByte() != this.signature[1] ||
                this.stream.readByte() != this.signature[2] ||
                this.stream.readByte() != this.signature[3] ||
                this.stream.readByte() != this.signature[4] ||
                this.stream.readByte() != this.signature[5]){
                console.log('Error! Invalid file');
                return false;
            }else{
                console.log('7zip file');
            }

            //this.stream.position = 6;

            this.versionMajor = this.stream.readByte();
            this.versionMinor = this.stream.readByte();

            this.startHeaderCRC = this.stream.readUnsignedInt();

            //StartHeader
            this.nextHeaderOffset  = this.stream.readUnsignedInt64().value();
            this.nextHeaderSize    = this.stream.readUnsignedInt64().value();
            this.nextHeaderCRC     = this.stream.readUnsignedInt();
            /**
             * TODO: Check CRC
             */
            this.stream.position = this.nextHeaderOffset;
        }
        public readDatabase(db){
            this.db = db;
            this.db.clear();
            this.db.archiveInfo.startPosition = this.archiveBeginStreamPosition;

            this.db.archiveInfo.versionMajor = this.versionMajor;
            this.db.archiveInfo.versionMinor = this.versionMinor;

            if (db.archiveInfo.version.major != _7zipDefines.kMajorVersion) {
                console.log('UnsupportedVersion');
                return false;
            }

            /*this.currentBuffer = new ByteBuffer(new ByteArray(new ArrayBuffer(this.nextHeaderSize.value())));
            var type:number = this.currentBuffer.readID();//UInt64

            if (type != _7zipDefines.kHeader)
            {
                if (type != _7zipDefines.kEncodedHeader){
                    console.log('Error! Incorrect');
                }

                this.currentBuffer = this.readAndDecodePackedStreams(
                    db.archiveInfo.startPositionAfterHeader,
                    db.archiveInfo.dataStartPosition2,
                    dataVector);
            }*/

            if (this.nextHeaderSize == 0) {
                return true;
            }
            if (this.nextHeaderSize > 0xFFFFFFFF){
                return false;
            }
            if (this.nextHeaderOffset < 0){
                return false;
            }

            this.stream.position = this.nextHeaderOffset;

            this.currentBuffer = new ByteBuffer();
            this.currentBuffer.setCapacity(this.nextHeaderSize);

            this.stream.readBytes(this.currentBuffer,this.nextHeaderSize);
            this.headersSize += _7zipDefines.kHeaderSize + this.nextHeaderSize;
            db.phySize = _7zipDefines.kHeaderSize + this.nextHeaderOffset + this.nextHeaderSize;

            /**
             * TODO: Check CRC
             */
            /*if (this.CrcCalc(buffer2, this.nextHeaderSize) != this.nextHeaderCRC){
                console.log('Incorrect');
            }*/

            var dataVector:Array<ByteBuffer> = [];

            var type = this.currentBuffer.readID();

            if (type != kHeader)
            {
                if (type != kEncodedHeader){
                    console.log('Incorrect');
                }
                var result = this.readAndDecodePackedStreams(
                    db.archiveInfo.startPositionAfterHeader,
                    db.archiveInfo.dataStartPosition2,
                    dataVector);

                if(result){
                    console.log('readAndDecodePackedStreams:OK');
                }

                if (dataVector.length == 0){
                    return true;
                }
                if (dataVector.length > 1){
                    console.log('Incorrect');
                }

                /*streamSwitch.remove();
                streamSwitch.set(this, dataVector[0]);*/

                this.currentBuffer = dataVector[0];
                if (this.currentBuffer.readID() != kHeader){
                    console.log('Incorrect');
                }
            }

            db.headersSize = headersSize;

            return this.readHeader();
        }
        public readAndDecodePackedStreams(baseOffset,dataOffset,dataVector){
            var packSizes:Array<number> = [];//UInt64
            var packCRCsDefined:boolean;
            var packCRCs:Array<number> = [];
            var folders:Array<Folder> = [];

            var numUnpackStreamsInFolders:Array<number> = [];
            var unpackSizes:Array<number> = [];//UInt64
            var digestsDefined:boolean;
            var digests:Array<number> = [];//UInt32

            this.readStreamsInfo(
                null,
                dataOffset,
                packSizes,
                packCRCsDefined,
                packCRCs,
                folders,
                numUnpackStreamsInFolders,
                unpackSizes,
                digestsDefined,
                digests);

            // db.archiveInfo.DataStartPosition2 += db.archiveInfo.StartPositionAfterHeader;

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

                var result = decoder.decode(this.stream, dataStartPos,packSizes[packIndex], folder, outStream);

                if (folder.unpackCRCDefined) {
                    /*if (CrcCalc(data, unpackSize) != folder.UnpackCRC){
                        console.log('Incorrect')
                    }*/
                }
                for (var j = 0; j < folder.packStreams.length; j++)
                {
                    var packSize:number = packSizes[packIndex++];//UInt64
                    dataStartPos += packSize;
                    this.headersSize += packSize;
                }
            }
            return true;
        }
        public readHeader(){
            var type = this.currentBuffer.readID();

            if (type == kArchiveProperties)
            {
                this.readArchiveProperties(this.db.archiveInfo);
                type = this.currentBuffer.readID();
            }

            var dataVector:Array<ByteBuffer> = [];

            if (type == kAdditionalStreamsInfo)
            {
                var result = this.readAndDecodePackedStreams(
                    this.db.archiveInfo.startPositionAfterHeader,
                    this.db.archiveInfo.dataStartPosition2,
                    dataVector);

                if(result){
                    console.log('readAndDecodePackedStreams:OK');
                }
                this.db.archiveInfo.dataStartPosition2 += this.db.archiveInfo.startPositionAfterHeader;
                type = this.currentBuffer.readID();
            }

            var unpackSizes:Array<number>;
            var digestsDefined:boolean;
            var digests:Array<number>;

            if (type == kMainStreamsInfo)
            {
                this.readStreamsInfo(dataVector,
                    this.db.archiveInfo.dataStartPosition,
                    this.db.packSizes,
                    this.db.packCRCsDefined,
                    this.db.packCRCs,
                    this.db.folders,
                    this.db.numUnpackStreamsVector,
                    unpackSizes,
                    digestsDefined,
                    digests);
                this.db.archiveInfo.dataStartPosition += this.db.archiveInfo.startPositionAfterHeader;
                type = this.currentBuffer.readID();
            }
            else
            {
                for (var i = 0; i < this.db.folders.length; i++)
                {
                    this.db.numUnpackStreamsVector.push(1);
                    var folder:Folder = this.db.folders[i];
                    unpackSizes.push(folder.getUnpackSize());
                    digestsDefined.push(folder.unpackCRCDefined);
                    digests.push(folder.unpackCRC);
                }
            }

            this.db.files = [];

            if (type == kEnd){
                return true;
            }
            if (type != kFilesInfo){
                console.log('Incorrect');
            }

            var numFiles:number = this.currentBuffer.readNum();
            //this.db.files.reserve(numFiles);
            var i;
            for (i = 0; i < numFiles; i++) {
                this.db.files.push(new FileItem());
            }

            this.db.archiveInfo.fileInfoPopIDs.push(kSize);
            if (!(this.db.packSizes.length == 0))
                this.db.archiveInfo.fileInfoPopIDs.push(kPackInfo);
            if (numFiles > 0  && !(digests.length == 0))
                this.db.archiveInfo.fileInfoPopIDs.push(kCRC);

            var emptyStreamVector:Array<boolean> = [];
            this.bool()

            for (;;)
            {
                var type = this.currentBuffer.readID();
                if (type == kEnd){
                    break;
                }
                var size:number = this.currentBuffer.readNumber();//UInt64
                var ppp:number = this.currentBuffer.position;
                var addPropIdToList:boolean = true;
                var isKnownType:boolean = true;
                if (type > (1 << 30)){
                    isKnownType = false;
                }
                else switch(type)
                {
                    case kName:
                    {
                        var streamSwitch:StreamSwitch = new StreamSwitch();
                        streamSwitch.set(this, dataVector);
                        for (var i = 0; i < this.db.files.length; i++)
                            this.currentBuffer.readString(this.db.files[i].name);
                        break;
                    }
                    case kWinAttributes:
                    {
                        var boolVector:Array<boolean> = [];
                        this.readBoolVector2(this.db.files.length, boolVector);
                        streamSwitch = new StreamSwitch();
                        streamSwitch.set(this, dataVector);
                        for (i = 0; i < numFiles; i++)
                        {
                            var file:FileItem = this.db.files[i];
                            file.attribDefined = boolVector[i];
                            if (file.attribDefined)
                                file.attrib = this.currentBuffer.readUInt32();
                        }
                        break;
                    }
                    case kEmptyStream:
                    {
                        this.readBoolVector(numFiles, emptyStreamVector);
                        for (i = 0; i < emptyStreamVector.length; i++)
                        if (emptyStreamVector[i]) {
                            this.numEmptyStreams++;
                        }

                        this.boolVector_Fill_False(this.emptyFileVector, this.numEmptyStreams);
                        this.boolVector_Fill_False(this.antiFileVector, this.numEmptyStreams);

                        break;
                    }
                    case kEmptyFile:    this.currentBuffer.readBoolVector(numEmptyStreams, emptyFileVector); break;
                    case kAnti:         this.currentBuffer.readBoolVector(numEmptyStreams, antiFileVector); break;
                    case kStartPos:     this.currentBuffer.readUInt64DefVector(dataVector, this.db.startPos, numFiles); break;
                    case kCTime:  ReadUInt64DefVector(dataVector, this.db.cTime, numFiles); break;
                    case kATime:  ReadUInt64DefVector(dataVector, this.db.aTime, numFiles); break;
                    case kMTime:  ReadUInt64DefVector(dataVector, this.db.mTime, numFiles); break;
                    case kDummy:
                    {
                        for (var j = 0; j < size; j++)
                        if (this.currentBuffer.readByte() != 0) {
                            console.log('Incorrect');
                        }
                        addPropIdToList = false;
                        break;
                    }
                    default:
                        addPropIdToList = isKnownType = false;
                }
                    if (isKnownType)
                    {
                        if(addPropIdToList)
                            this.db.archiveInfo.fileInfoPopIDs.Add(type);
                    }
                    else
                        SkipData(size);
                    bool checkRecordsSize = (this.db.archiveInfo.Version.Major > 0 ||
                        this.db.archiveInfo.Version.Minor > 2);
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
                        CFileItem &file = this.db.Files[i];
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
                            this.db.IsAnti.Add(isAnti);
                    }
                    return S_OK;

                }
            }


        public boolVector_Fill_False(boolVector,size){
            for(var i = 0;i < size;i++) {
                boolVector[i] = false;
            }
        }
        public readPackInfo(){

        }
        public readUnpackInfo(){

        }
        public readSubStreamsInfo(){

        }
        public readStreamsInfo(
                dataVector:Array<ByteBuffer>,
                dataOffset:number,
                packSizes:Array<number>,
                packCRCsDefined,
                packCRCs:Array<number>,
                folders:Array<Folder>,
                numUnpackStreamsInFolders:Array<number>,
                unpackSizes:Array<number>,
                digestsDefined,
                digests:Array<number>){

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