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
                var unpackSize64 = folder.getUnpacklength;
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
        public readAndDecodePackedStreams2(dataVector,folders){
            this.waitAttribute(kFolder);
            var numFolders:number = this.currentBuffer.readNum();

            var streamSwitch:StreamSwitch = new StreamSwitch();
            streamSwitch.set(this, dataVector);
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
                    folder.unpackSizes.push(this.currentBuffer.readNumber());
                }
            }

            for (;;)
            {
                var type:number = this.currentBuffer.readID();
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
                this.currentBuffer.skipData2();
            }
        }
        public readHeader()
        {
            var type = this.currentBuffer.readID();

            if (type == kArchiveProperties)
            {
                this.readArchiveProperties();
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
                    unpackSizes.push(folder.getUnpacklength);
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
            this.boolVector_Fill_False(emptyStreamVector, numFiles);
            var emptyFileVector:Array<boolean> = [];;
            var antiFileVector:Array<boolean> = [];;
            var numEmptyStreams:number = 0;

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

                        for (var i = 0; i < this.db.files.length; i++){
                            this.db.files[i].name = this.currentBuffer.readString();
                        }

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
                            if (file.attribDefined){
                                file.attrib = this.currentBuffer.readUInt32();
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
                        this.db.archiveInfo.fileInfoPopIDs.push(type);
                }
                else{
                    this.currentBuffer.skipData(size);
                }

                var checkRecordsSize:boolean = (this.db.archiveInfo.versionMajor > 0 || this.db.archiveInfo.versionMinor > 2);
                if (checkRecordsSize && this.currentBuffer.position - ppp != size){
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
                if (this.currentBuffer.readID() == kEnd){
                    break;
                }
                this.currentBuffer.skipData2();
            }
        }
        public readPackInfo(dataOffset, packSizes, packCRCsDefined, packCRCs)
        {
            dataOffset = this.currentBuffer.readNumber();
            var numPackStreams:number = this.currentBuffer.readNum();

            this.waitAttribute(kSize);
            packSizes.clear();
            //packSizes.Reserve(numPackStreams);
            for (var i = 0; i < numPackStreams; i++){
                packSizes.push(this.currentBuffer.readNumber());
            }

            var type;
            for (;;)
            {
                type = this.currentBuffer.readID();
                if (type == kEnd){
                    break;
                }
                if (type == kCRC)
                {
                    this.readHashDigests(numPackStreams, packCRCsDefined, packCRCs);
                    continue;
                }
                this.currentBuffer.skipData2();
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
                    crc = this.currentBuffer.readUInt32();
                }
                digests.push(crc);
            }
        }
        public waitAttribute(attribute)//UInt64
        {
            for (;;)
            {
                var type:number = this.currentBuffer.readID();//UInt64
                if (type == attribute){
                    return;
                }
                if (type == kEnd){
                    console.log('Incorrect');
                }
                this.currentBuffer.skipData2();
            }
        }
        public readUnpackInfo(dataVector, folders)
        {
            this.waitAttribute(kFolder);
            var numFolders:number = this.currentBuffer.readNum();

            {
                var streamSwitch:StreamSwitch;
                streamSwitch.set(this, dataVector);
                folders.clear();
                //folders.Reserve(numFolders);
                for (var i = 0; i < numFolders; i++)
                {
                    var folder:Folder = new Folder();
                    folders.push(folder);
                    this.getNextFolderItem(folder);
                }
            }

            this.waitAttribute(kCodersUnpackSize);

            var i;
            for (i = 0; i < numFolders; i++)
            {
                var folder:Folder = folders[i];
                var numOutStreams = folder.getNumOutStreams();
                //folder.unpackSizes.Reserve(numOutStreams);
                for (var j = 0; j < numOutStreams; j++){
                    folder.unpackSizes.push(this.currentBuffer.readNumber());
                }
            }

            for (;;)
            {
                var type = this.currentBuffer.readID();

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
                this.currentBuffer.skipData2();
            }

        }
        public getNextFolderItem(folder) {

            var numCoders:number = this.currentBuffer.readNum();

            folder.coders.clear();
            //folder.coders.Reserve((int)
            var numInStreams:number = 0;
            var numOutStreams:number = 0;
            var i;
            for (i = 0; i < numCoders; i++) {
                var coder:CoderInfo = new CoderInfo();
                folder.coders.push(coder);

                {
                    var mainByte:number = this.currentBuffer.readByte();
                    var idSize:number = (mainByte & 0xF);
                    var longID:ByteBuffer = new ByteBuffer();//[15];
                    longID.setCapacity(15);
                    this.currentBuffer.readBytes(longID, idSize);
                    if (idSize > 8){
                        console.log('Unsupported');
                    }

                    var id:number = 0;//UInt64

                    for (var j = 0; j < idSize; j++ ){
                        id |= longID[idSize - 1 - j] << (8 * j);
                    }

                    coder.methodID = id;

                    if ((mainByte & 0x10) != 0) {
                        coder.numInStreams = this.currentBuffer.readNum();
                        coder.numOutStreams = this.currentBuffer.readNum();
                    }
                    else
                    {
                        coder.numInStreams = 1;
                        coder.numOutStreams = 1;
                    }
                    if ((mainByte & 0x20) != 0) {
                        var propsSize:number = this.currentBuffer.readNum();
                        coder.props.setCapacity(propsSize);
                        this.currentBuffer.readBytes(coder.props,propsSize);
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
                bp.inIndex = this.currentBuffer.readNum();
                bp.outIndex = this.currentBuffer.readNum();
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
                    folder.packStreams.push(this.currentBuffer.readNum());
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
                type = this.currentBuffer.readID();
                if (type == kNumUnpackStream)
                {
                    for (var i = 0; i < folders.length; i++){
                        numUnpackStreamsInFolders.push(this.currentBuffer.readNum());
                    }
                    continue;
                }
                if (type == kCRC || type == kSize || type == kEnd){
                    break;
                }
                this.currentBuffer.skipData2();
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
                        var size:number = this.currentBuffer.readNumber();//UInt64
                        unpackSizes.push(size);
                        sum += size;
                    }
                }
                unpackSizes.push(folders[i].getUnpacklength - sum);
            }
            if (type == kSize){
                type = this.currentBuffer.readID();
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
                    this.currentBuffer.skipData2();
                }
                type = this.currentBuffer.readID();
            }
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
            //v.reserve(numItems);
            var b:number = 0;//Byte
            var mask:number = 0;//Byte
            for (var i = 0; i < numItems; i++)
            {
                if (mask == 0)
                {
                    b = this.currentBuffer.readByte();
                    mask = 0x80;
                }
                v.push((b & mask) != 0);
                mask >>= 1;
            }
            return v;
        }
        public readBoolVector2(numItems, v)
        {
            var allAreDefined:number = this.currentBuffer.readByte();//Byte
            if (allAreDefined == 0)
            {
                this.readBoolVector(numItems, v);
                return;
            }
            v.splice(0,v.length);
            //v.reserve(numItems);
            for (var i = 0; i < numItems; i++){
                v.push(true);
            }
            return v;
        }
        public readUInt64DefVector(dataVector,v,numFiles)
        {
            this.readBoolVector2(numFiles, v.Defined);

            var streamSwitch:StreamSwitch = new StreamSwitch();
            streamSwitch.set(this,dataVector);
            v.Values.Reserve(numFiles);

            for (var i = 0; i < numFiles; i++)
            {
                var t:number = 0;//UInt64
                if (v.Defined[i])
                    t = this.currentBuffer.readUInt64().value();
                v.Values.push(t);
            }
        }
        public boolVector_Fill_False(boolVector,size){
            for(var i = 0;i < size;i++) {
                boolVector[i] = false;
            }
        }
        public readDatabase2(){

        }
    }
}