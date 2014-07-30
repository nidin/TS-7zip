module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    import ByteArray = nid.utils.ByteArray;
    import UInt64 = ctypes.UInt64;

    export class ArchiveDatabase {
        public packSizes:Array<number>;//UInt64
        public packCRCsDefined:Array<boolean>;
        public packCRCs:Array<number>;//UInt32
        public folders:Array<Folder>;
        public numUnpackStreamsVector:Array<number>;
        public files:Array<FileItem>;

        public cTime:UInt64DefVector;
        public aTime:UInt64DefVector;
        public mTime:UInt64DefVector;
        public startPos:UInt64DefVector;
        public isAnti:Array<boolean>;

        constructor(){

        }



        public clear()
        {
            this.packSizes = [];
            this.packCRCsDefined = [];
            this.packCRCs = [];
            this.folders = [];
            this.numUnpackStreamsVector = [];
            this.files = [];
            this.cTime.clear();
            this.aTime.clear();
            this.mTime.clear();
            this.startPos.clear();
            this.isAnti = [];
        }

        public reserveDown()
        {
            /*this.packSizes.ReserveDown();
            this.packCRCsDefined.ReserveDown();
            this.packCRCs.ReserveDown();
            this.folders.ReserveDown();
            this.numUnpackStreamsVector.ReserveDown();
            this.files.ReserveDown();
            this.cTime.ReserveDown();
            this.aTime.ReserveDown();
            this.mTime.ReserveDown();
            this.startPos.ReserveDown();
            this.isAnti.ReserveDown();*/
        }

        public isEmpty():boolean
        {
            return (this.packSizes.length == 0 &&
                this.packCRCsDefined.length == 0 &&
                this.packCRCs.length == 0 &&
                this.folders.length == 0 &&
                this.numUnpackStreamsVector.length == 0 &&
                this.files.length == 0);
        }

        public checkNumFiles():boolean
        {
            var size = this.files.length;
            return (
                this.cTime.checkSize(size) &&
                this.aTime.checkSize(size) &&
                this.mTime.checkSize(size) &&
                    this.startPos.checkSize(size) &&
                (size == this.isAnti.length || this.isAnti.length == 0));
        }

        public isSolid():boolean
        {
            for (var i = 0; i < this.numUnpackStreamsVector.length; i++) {
                if (this.numUnpackStreamsVector[i] > 1) {
                    return true;
                }
            }
            return false;
        }
        public isItemAnti(index:number):boolean{
            return (index < this.isAnti.length && this.isAnti[index]);
        }
        public setItemAnti(index:number, isAnti:boolean)
        {
            while (index >= this.isAnti.length){
                this.isAnti.push(false);
            }
            this.isAnti[index] = isAnti;
        }

        public getFile(index:number,  file:FileItem,  file2:FileItem2){

        }
        public addFile(file:FileItem, file2:FileItem2){

        }
    }
}