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
        private archiveBeginStreamPosition:number = 0;

        public dataOffset:number = 0;
        public headerSize:number = 32;
        public headersSize:number = 0;
        public header:Uint8Array;
        public stream:ByteArray;

        public inByteVector:Array<InByte2>;
        public inByteBack:InByte2;
        public inByteBack:ByteBuffer;
        private db:ArchiveDatabaseEx;

        constructor(){
            this.inByteVector = [];
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

            this.dataOffset = this.archiveBeginStreamPosition;

            if (this.versionMajor != _7zipDefines.kMajorVersion) {
                console.log('UnsupportedVersion');
                return false;
            }

            this.dataOffset = this.archiveBeginStreamPosition + _7zipDefines.kHeaderSize;
            this.db.archiveInfo.startPositionAfterHeader = this.dataOffset;

            if (this.nextHeaderSize == 0) {
                return true;
            }
            if (this.nextHeaderSize > 0xFFFFFFFF || this.nextHeaderOffset < 0){
                return false;
            }

            this.stream.position = this.nextHeaderOffset;

            var buffer2:ByteBuffer = new ByteBuffer();
            buffer2.setCapacity(this.nextHeaderSize);

            this.stream.readBytes(buffer2,this.nextHeaderSize);
            this.headersSize += _7zipDefines.kHeaderSize + this.nextHeaderSize;
            this.db.phySize = _7zipDefines.kHeaderSize + this.nextHeaderOffset + this.nextHeaderSize;

            /**
             * TODO: Check CRC
             */
            /*if (this.CrcCalc(buffer2, this.nextHeaderSize) != this.nextHeaderCRC){
                console.log('Incorrect');
            }*/

            var streamSwitch:StreamSwitch = new StreamSwitch();
            streamSwitch.set2(this,buffer2);

            var dataVector:Array<ByteBuffer> = [];

            var type = this.inByteBack.readID();

            if (type != kHeader)
            {
                if (type != kEncodedHeader){
                    console.log('Incorrect');
                }
                var result = this.readAndDecodePackedStreams(dataVector);

                if(result){
                    console.log('readAndDecodePackedStreams:OK');
                }

                if (dataVector.length == 0){
                    return true;
                }
                if (dataVector.length > 1){
                    console.log('Incorrect');
                }

                streamSwitch.remove();
                streamSwitch.set3(this, dataVector);

                if (this.inByteBack.readID() != kHeader){
                    console.log('Incorrect');
                }
            }

            db.headersSize = this.headersSize;

            return this.readHeader();
        }

        public readAndDecodePackedStreams(dataVector)
        {
            var packSizes:Array<number> = [];//UInt64
            var packCRCsDefined:Array<boolean> = [];
            var packCRCs:Array<number> = [];
            var folders:Array<Folder> = [];

            var numUnpackStreamsInFolders:Array<number> = [];
            var unpackSizes:Array<number> = [];//UInt64
            var digestsDefined:Array<boolean> = [];
            var digests:Array<number> = [];//UInt32

            this.readStreamsInfo(
                null,
                packSizes,
                packCRCsDefined,
                packCRCs,
                folders,
                numUnpackStreamsInFolders,
                unpackSizes,
                digestsDefined,
                digests
            );

            // db.archiveInfo.DataStartPosition2 += db.archiveInfo.StartPositionAfterHeader;

            var packIndex:number = 0;
            var decoder:Decoder = new Decoder();

            var dataStartPos:number = this.dataOffset;

            for (var i = 0; i < folders.length; i++)
            {
                var folder:Folder = folders[i];
                var data:ByteBuffer = new ByteBuffer();
                dataVector.push(data);
                var unpackSize64 = folder.getUnpackSize();
                var unpackSize = unpackSize64;
                /*if (unpackSize != unpackSize64){
                    console.log('Unsupported')
                }*/
                data.setCapacity(unpackSize);

                /*var outStreamSpec:BufPtrSeqOutStream = new BufPtrSeqOutStream();
                var outStream:ISequentialOutStream = outStreamSpec;
                outStreamSpec.init(data, unpackSize);*/

                var result = decoder.decode(this.stream, dataStartPos,packSizes[packIndex], folder, data);

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
        public readAndDecodePackedStreams2(dataVector,folders){
            this.waitAttribute(kFolder);
            var numFolders:number = this.inByteBack.readNum();

            var streamSwitch:StreamSwitch = new StreamSwitch();
            streamSwitch.set3(this, dataVector);
            folders.clear();
            //folders.Reserve(numFolders);
            for (var i = 0; i < numFolders; i++)
            {
                var folder:Folder = new Folder()
                folders.push(folder);
                this.getNextFolderItem(folder);
            }

            this.waitAttribute(kCodersUnpackSize);

            var i;
            for (i = 0; i < numFolders; i++)
            {
                var folder:Folder = folders[i];
                var numOutStreams = folder.getNumOutStreams();
                //folder.unpackSizes.Reserve(numOutStreams);
                for (var j = 0; j < numOutStreams; j++){
                    folder.unpackSizes.push(this.inByteBack.readNumber());
                }
            }

            for (;;)
            {
                var type:number = this.inByteBack.readID();
                if (type == kEnd){
                    return;
                }
                if (type == kCRC)
                {
                    var crcsDefined:Array<boolean> = [];
                    var crcs:Array<number> = [];
                    this.readHashDigests(numFolders, crcsDefined, crcs);
                    for (i = 0; i < numFolders; i++)
                    {
                        var folder:Folder = folders[i];
                        folder.unpackCRCDefined = crcsDefined[i];
                        folder.unpackCRC = crcs[i];
                    }
                    continue;
                }
                this.inByteBack.skipData2();
            }
        }
        public readHeader()
        {
            var type = this.inByteBack.readID();

            if (type == kArchiveProperties)
            {
                this.readArchiveProperties();
                type = this.inByteBack.readID();
            }

            var dataVector:Array<ByteBuffer> = [];

            if (type == kAdditionalStreamsInfo)
            {
                var result = this.readAndDecodePackedStreams(dataVector);

                if(result){
                    console.log('kAdditionalStreamsInfo:OK');
                }
                this.db.archiveInfo.dataStartPosition2 += this.db.archiveInfo.startPositionAfterHeader;
                type = this.inByteBack.readID();
            }

            var unpackSizes:Array<number> = [];
            var digestsDefined:Array<boolean> = [];
            var digests:Array<number> =[];

            if (type == kMainStreamsInfo)
            {

                this.readStreamsInfo(
                    dataVector,
                    this.db.packSizes,
                    this.db.packCRCsDefined,
                    this.db.packCRCs,
                    this.db.folders,
                    this.db.numUnpackStreamsVector,
                    unpackSizes,
                    digestsDefined,
                    digests
                );

                this.db.archiveInfo.dataStartPosition += this.db.archiveInfo.startPositionAfterHeader;
                type = this.inByteBack.readID();
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

            this.db.files.clear();

            if (type == kEnd){
                return true;
            }
            if (type != kFilesInfo){
                console.log('Incorrect');
            }

            var numFiles:number = this.inByteBack.readNum();
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
            this.boolVector_Fill_False(emptyStreamVector, numFiles);
            var emptyFileVector:Array<boolean> = [];;
            var antiFileVector:Array<boolean> = [];;
            var numEmptyStreams:number = 0;

            for (;;)
            {
                var type = this.inByteBack.readID();
                if (type == kEnd){
                    break;
                }
                var size:number = this.inByteBack.readNumber();//UInt64
                var ppp:number = this.inByteBack.position;
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
                        streamSwitch.set3(this, dataVector);

                        for (var i = 0; i < this.db.files.length; i++){
                            this.db.files[i].name = this.inByteBack.readString();
                        }

                        break;
                    }
                    case kWinAttributes:
                    {
                        var boolVector:Array<boolean> = [];
                        this.readBoolVector2(this.db.files.length, boolVector);

                        streamSwitch = new StreamSwitch();
                        streamSwitch.set3(this, dataVector);

                        for (i = 0; i < numFiles; i++)
                        {
                            var file:FileItem = this.db.files[i];
                            file.attribDefined = boolVector[i];
                            if (file.attribDefined){
                                file.attrib = this.inByteBack.readUInt32();
                            }
                        }
                        break;
                    }
                    case kEmptyStream:
                    {
                        this.readBoolVector(numFiles, emptyStreamVector);
                        for (i = 0; i < emptyStreamVector.length; i++)
                        if (emptyStreamVector[i]) {
                            numEmptyStreams++;
                        }

                        this.boolVector_Fill_False(emptyFileVector, numEmptyStreams);
                        this.boolVector_Fill_False(antiFileVector, numEmptyStreams);

                        break;
                    }
                    case kEmptyFile:    this.readBoolVector(numEmptyStreams, emptyFileVector); break;
                    case kAnti:         this.readBoolVector(numEmptyStreams, antiFileVector); break;
                    case kStartPos:     this.readUInt64DefVector(dataVector, this.db.startPos, numFiles); break;
                    case kCTime:        this.readUInt64DefVector(dataVector, this.db.cTime, numFiles); break;
                    case kATime:        this.readUInt64DefVector(dataVector, this.db.aTime, numFiles); break;
                    case kMTime:        this.readUInt64DefVector(dataVector, this.db.mTime, numFiles); break;
                    case kDummy:
                    {
                        for (var j = 0; j < size; j++)
                        if (this.inByteBack.readByte() != 0) {
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
                        this.db.archiveInfo.fileInfoPopIDs.push(type);
                }
                else{
                    this.inByteBack.skipData(size);
                }

                var checkRecordsSize:boolean = (this.db.archiveInfo.versionMajor > 0 || this.db.archiveInfo.versionMinor > 2);
                if (checkRecordsSize && this.inByteBack.position - ppp != size){
                    console.log('Incorrect');
                }

            }

            var emptyFileIndex:number = 0;
            var sizeIndex:number = 0;

            var numAntiItems:number = 0;
            for (i = 0; i < numEmptyStreams; i++){
                if (antiFileVector[i]){
                    numAntiItems++;
                }
            }

            for (i = 0; i < numFiles; i++)
            {
                var file:FileItem = this.db.files[i];
                var isAnti:boolean;
                file.hasStream = !emptyStreamVector[i];
                if (file.hasStream)
                {
                    file.isDir      = false;
                    isAnti          = false;
                    file.size       = unpackSizes[sizeIndex];
                    file.CRC        = digests[sizeIndex];
                    file.CRCDefined = digestsDefined[sizeIndex];
                    sizeIndex++;
                }
                else
                {
                    file.isDir = !emptyFileVector[emptyFileIndex];
                    isAnti = antiFileVector[emptyFileIndex];
                    emptyFileIndex++;
                    file.size = 0;
                    file.CRCDefined = false;
                }
                if (numAntiItems != 0){
                    this.db.isAnti.push(isAnti);
                }
            }
            return true;
        }
        public readArchiveProperties(){
            for (;;)
            {
                if (this.inByteBack.readID() == kEnd){
                    break;
                }
                this.inByteBack.skipData2();
            }
        }
        public readPackInfo(packSizes, packCRCsDefined, packCRCs)
        {
            this.dataOffset = this.inByteBack.readNumber();
            this.db.archiveInfo.dataStartPosition = this.dataOffset;
            var numPackStreams:number = this.inByteBack.readNum();

            this.waitAttribute(kSize);
            packSizes.clear();
            //packSizes.reserve(numPackStreams);

            for (var i = 0; i < numPackStreams; i++){
                packSizes.push(this.inByteBack.readNumber());
            }

            var type;
            for (;;)
            {
                type = this.inByteBack.readID();
                if (type == kEnd){
                    break;
                }
                if (type == kCRC)
                {
                    this.readHashDigests(numPackStreams, packCRCsDefined, packCRCs);
                    continue;
                }
                this.inByteBack.skipData2();
            }
            if (packCRCsDefined.length == 0)
            {
                this.boolVector_Fill_False(packCRCsDefined, numPackStreams);
                //packCRCs.Reserve(numPackStreams);
                packCRCs.clear();
                for (var i = 0; i < numPackStreams; i++){
                    packCRCs.push(0);
                }
            }
        }
        public readHashDigests(numItems, digestsDefined, digests)//UInt64
        {
            this.readBoolVector2(numItems, digestsDefined);
            digests.clear();
            //digests.Reserve(numItems);
            for (var i = 0; i < numItems; i++)
            {
                var crc:number = 0;//UInt32
                if (digestsDefined[i]){
                    crc = this.inByteBack.readUInt32();
                }
                digests.push(crc);
            }
        }
        public waitAttribute(attribute)//UInt64
        {
            for (;;)
            {
                var type:number = this.inByteBack.readID();//UInt64
                if (type == attribute){
                    return;
                }
                if (type == kEnd){
                    console.log('Incorrect');
                }
                this.inByteBack.skipData2();
            }
        }
        public readUnpackInfo(dataVector:Array<ByteBuffer>, folders:Array<Folder>)
        {
            this.waitAttribute(kFolder);
            var numFolders:number = this.inByteBack.readNum();

            var streamSwitch:StreamSwitch;
            streamSwitch.set3(this, dataVector);
            folders.clear();

            //folders.Reserve(numFolders);
            for (var i = 0; i < numFolders; i++)
            {
                var folder:Folder = new Folder();
                folders.push(folder);
                this.getNextFolderItem(folder);
            }

            this.waitAttribute(kCodersUnpackSize);

            var i;
            for (i = 0; i < numFolders; i++)
            {
                var folder:Folder = folders[i];
                var numOutStreams = folder.getNumOutStreams();
                //folder.unpackSizes.Reserve(numOutStreams);
                for (var j = 0; j < numOutStreams; j++){
                    folder.unpackSizes.push(this.inByteBack.readNumber());
                }
            }

            for (;;)
            {
                var type = this.inByteBack.readID();

                if (type == kEnd){
                    return;
                }

                if (type == kCRC)
                {
                    var crcsDefined:Array<boolean>;
                    var crcs:Array<number>;
                    this.readHashDigests(numFolders, crcsDefined, crcs);
                    for (i = 0; i < numFolders; i++)
                    {
                        var folder:Folder = folders[i];
                        folder.unpackCRCDefined = crcsDefined[i];
                        folder.unpackCRC = crcs[i];
                    }
                    continue;
                }
                this.inByteBack.skipData2();
            }

        }
        public getNextFolderItem(folder) {

            var numCoders:number = this.inByteBack.readNum();

            folder.coders.clear();
            //folder.coders.Reserve((int)
            var numInStreams:number = 0;
            var numOutStreams:number = 0;
            var i;
            for (i = 0; i < numCoders; i++) {
                var coder:CoderInfo = new CoderInfo();
                folder.coders.push(coder);

                {
                    var mainByte:number = this.inByteBack.readByte();
                    var idSize:number = (mainByte & 0xF);
                    var longID:ByteBuffer = new ByteBuffer();//[15];
                    longID.setCapacity(15);
                    this.inByteBack.readBytes(longID, idSize);
                    if (idSize > 8){
                        console.log('Unsupported');
                    }

                    var id:number = 0;//UInt64

                    for (var j = 0; j < idSize; j++ ){
                        id |= longID[idSize - 1 - j] << (8 * j);
                    }

                    coder.methodID = id;

                    if ((mainByte & 0x10) != 0) {
                        coder.numInStreams = this.inByteBack.readNum();
                        coder.numOutStreams = this.inByteBack.readNum();
                    }
                    else
                    {
                        coder.numInStreams = 1;
                        coder.numOutStreams = 1;
                    }
                    if ((mainByte & 0x20) != 0) {
                        var propsSize:number = this.inByteBack.readNum();
                        coder.props.setCapacity(propsSize);
                        this.inByteBack.readBytes(coder.props,propsSize);
                    }
                    if ((mainByte & 0x80) != 0){
                        console.log('Unsupported');
                    }
                }
                numInStreams += coder.numInStreams;
                numOutStreams += coder.numOutStreams;
            }

            var numBindPairs:number = numOutStreams - 1;
            folder.bindPairs.clear();
            //folder.BindPairs.Reserve(numBindPairs);
            for (i = 0; i < numBindPairs; i++) {
                var bp:BindPair = new BindPair();
                bp.inIndex = this.inByteBack.readNum();
                bp.outIndex = this.inByteBack.readNum();
                folder.bindPairs.push(bp);
            }

            if (numInStreams < numBindPairs){
                console.log('Unsupported');
            }
            var numPackStreams:number = numInStreams - numBindPairs;
            //folder.PackStreams.Reserve(numPackStreams);
            if (numPackStreams == 1) {
                for (i = 0; i < numInStreams; i++)
                    if (folder.findBindPairForInStream(i) < 0) {
                        folder.packStreams.push(i);
                        break;
                    }
                if (folder.packStreams.length != 1){
                    console.log('Unsupported');
                }
            }
            else{
                for (i = 0; i < numPackStreams; i++){
                    folder.packStreams.push(this.inByteBack.readNum());
                }
            }
        }
        public readSubStreamsInfo(folders,numUnpackStreamsInFolders,unpackSizes,digestsDefined,digests)
        {
            numUnpackStreamsInFolders.clear();
            //numUnpackStreamsInFolders.Reserve(folders.length);
            var type:number;
            for (;;)
            {
                type = this.inByteBack.readID();
                if (type == kNumUnpackStream)
                {
                    for (var i = 0; i < folders.length; i++){
                        numUnpackStreamsInFolders.push(this.inByteBack.readNum());
                    }
                    continue;
                }
                if (type == kCRC || type == kSize || type == kEnd){
                    break;
                }
                this.inByteBack.skipData2();
            }

            if (numUnpackStreamsInFolders.length == 0){
                for (var i = 0; i < folders.length; i++){
                    numUnpackStreamsInFolders.push(1);
                }
            }


            var i;
            for (i = 0; i < numUnpackStreamsInFolders.length; i++)
            {
                // v3.13 incorrectly worked with empty folders
                // v4.07: we check that folder is empty
                var numSubstreams:number = numUnpackStreamsInFolders[i];
                if (numSubstreams == 0){
                    continue;
                }
                var sum:number = 0;//UInt64
                for (var j = 1; j < numSubstreams; j++){
                    if (type == kSize)
                    {
                        var size:number = this.inByteBack.readNumber();//UInt64
                        unpackSizes.push(size);
                        sum += size;
                    }
                }
                unpackSizes.push(folders[i].getUnpacklength - sum);
            }
            if (type == kSize){
                type = this.inByteBack.readID();
            }

            var numDigests = 0;
            var numDigestsTotal = 0;
            for (i = 0; i < folders.length; i++)
            {
                var numSubstreams = numUnpackStreamsInFolders[i];
                if (numSubstreams != 1 || !folders[i].UnpackCRCDefined){
                    numDigests += numSubstreams;
                }
                numDigestsTotal += numSubstreams;
            }

            for (;;)
            {
                if (type == kCRC)
                {
                    var digestsDefined2:Array<boolean>= [];
                    var digests2:Array<number> = [];
                    this.readHashDigests(numDigests, digestsDefined2, digests2);
                    var digestIndex = 0;
                    for (i = 0; i < folders.length; i++)
                    {
                        var numSubstreams = numUnpackStreamsInFolders[i];
                        var folder:Folder = folders[i];
                        if (numSubstreams == 1 && folder.unpackCRCDefined)
                        {
                            digestsDefined.push(true);
                            digests.push(folder.unpackCRC);
                        }
                        else {
                            for (var j = 0; j < numSubstreams; j++, digestIndex++) {
                                digestsDefined.push(digestsDefined2[digestIndex]);
                                digests.push(digests2[digestIndex]);
                            }
                        }
                    }
                }
                else if (type == kEnd)
                {
                    if (digestsDefined.length == 0)
                    {
                        this.boolVector_Fill_False(digestsDefined, numDigestsTotal);
                        digests.clear();
                        for (var i = 0; i < numDigestsTotal; i++){
                            digests.push(0);
                        }
                    }
                    return;
                }
                else{
                    this.inByteBack.skipData2();
                }
                type = this.inByteBack.readID();
            }
        }

        public readStreamsInfo(
                dataVector:Array<ByteBuffer>,
                packSizes:Array<number>,
                packCRCsDefined:Array<boolean>,
                packCRCs:Array<number>,
                folders:Array<Folder>,
                numUnpackStreamsInFolders:Array<number>,
                unpackSizes:Array<number>,
                digestsDefined:Array<boolean>,
                digests:Array<number>){

            for (;;)
            {
                var type:number = this.inByteBack.readID();//UInt64

                if (type > (1 << 30)) {
                    console.log('Incorrect');
                }

                switch(type)
                {
                    case kEnd:
                        return;
                    case kPackInfo:
                    {
                        this.readPackInfo(packSizes, packCRCsDefined, packCRCs);
                        break;
                    }
                    case kUnpackInfo:
                    {
                        this.readUnpackInfo(dataVector, folders);
                        break;
                    }
                    case kSubStreamsInfo:
                    {
                        this.readSubStreamsInfo(folders, numUnpackStreamsInFolders,
                            unpackSizes, digestsDefined, digests);
                        break;
                    }
                    default:
                        console.log('Incorrect');
                }
            }
        }
        public readBoolVector(numItems, v)
        {
            /**
             * TODO: migrate to TypedArray from Array
             */
            v.splice(0,v.length);
            v.reserve(numItems);
            var b:number = 0;//Byte
            var mask:number = 0;//Byte
            for (var i = 0; i < numItems; i++)
            {
                if (mask == 0)
                {
                    b = this.inByteBack.readByte();
                    mask = 0x80;
                }
                v.push((b & mask) != 0);
                mask >>= 1;
            }
            return v;
        }
        public readBoolVector2(numItems, v)
        {
            var allAreDefined:number = this.inByteBack.readByte();//Byte
            if (allAreDefined == 0)
            {
                this.readBoolVector(numItems, v);
                return;
            }
            v.splice(0,v.length);
            v.reserve(numItems);
            for (var i = 0; i < numItems; i++){
                v.push(true);
            }
            return v;
        }
        public readUInt64DefVector(dataVector,v,numFiles)
        {
            this.readBoolVector2(numFiles, v.defined);

            var streamSwitch:StreamSwitch = new StreamSwitch();
            streamSwitch.set3(this,dataVector);
            v.values.reserve(numFiles);

            for (var i = 0; i < numFiles; i++)
            {
                var t:number = 0;//UInt64
                if (v.defined[i]){
                    t = this.inByteBack.readUInt64().value();
                }
                v.values.push(t);
            }
        }
        public boolVector_Fill_False(boolVector,size){
            for(var i = 0;i < size;i++) {
                boolVector[i] = false;
            }
        }
        public readDatabase2(){

        }
        public deleteByteStream(){
            this.inByteVector.pop();
            if (this.inByteVector.length > 0){
                this.inByteBack = this.inByteVector[this.inByteVector.length-1];
            }
        }
        public addByteStream(buffer, size){
            this.inByteBack = new InByte2();
            this.inByteVector.push(this.inByteBack);
            this.inByteBack.init(buffer, size);
        }
    }
}