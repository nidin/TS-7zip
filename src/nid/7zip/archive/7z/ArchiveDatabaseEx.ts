module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class ArchiveDatabaseEx extends ArchiveDatabase {

        public archiveInfo:InArchiveInfo;
        public packStreamStartPositions:Array<number>;//UInt64
        public folderStartPackStreamIndex:Array<number>;
        public folderStartFileIndex:Array<number>;
        public fileIndexToFolderIndexMap:Array<number>;

        public headersSize:number;//UInt64
        public phySize:number;//UInt64

        constructor(){
            this.archiveInfo = new InArchiveInfo();
        }
        public clear()
        {
            super.clear();
            this.archiveInfo.clear();
            this.packStreamStartPositions.clear();
            this.folderStartPackStreamIndex.clear();
            this.folderStartFileIndex.clear();
            this.fileIndexToFolderIndexMap.clear();

            this.headersSize = 0;
            this.phySize = 0;
        }

        public fillFolderStartPackStream(){
            this.folderStartPackStreamIndex.clear();
            //this.folderStartPackStreamIndex.Reserve(Folders.Size());
            var startPos:number = 0;
            for (var i = 0; i < this.folders.length; i++)
            {
                this.folderStartPackStreamIndex.push(startPos);
                startPos += this.folders[i].packStreams.length;
            }
        }
        public fillStartPos(){

        }
        public fillFolderStartFileIndex(){

        }

        public fill()
        {
            this.fillFolderStartPackStream();
            this.fillStartPos();
            this.fillFolderStartFileIndex();
        }

        public getFolderStreamPos(folderIndex:number, indexInFolder:number):number
        {
            return this.archiveInfo.dataStartPosition +
                this.packStreamStartPositions[this.folderStartPackStreamIndex[folderIndex] + indexInFolder];
        }

        public getFolderFullPackSize(folderIndex:number):number//UInt64
        {
            var packStreamIndex:number = this.folderStartPackStreamIndex[folderIndex];
            var folder:Folder = this.folders[folderIndex];
            var size:number = 0;
            for (var i = 0; i < folder.packStreams.length; i++){
                size += this.packSizes[packStreamIndex + i];
            }
            return size;
        }

        public getFolderPackStreamSize(folderIndex:number, streamIndex:number)//UInt64
        {
            return this.packSizes[this.folderStartPackStreamIndex[folderIndex] + streamIndex];
        }

        public getFilePackSize(fileIndex:number)//UInt64
        {
            var folderIndex:number = this.fileIndexToFolderIndexMap[fileIndex];
            if (folderIndex != _7zipDefines.kNumNoIndex) {
                if (this.folderStartFileIndex[folderIndex] == fileIndex) {
                    return this.getFolderFullPackSize(folderIndex);
                }
            }
            return 0;
        }
    }
}





