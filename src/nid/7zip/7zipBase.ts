module nid
{

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    export class _7zipBase
    {
        public CRC_NUM_TABLES;
        public MY_CPU_X86_OR_AMD64;
        public g_CrcUpdate;
        public CrcUpdateT1;
        public CrcUpdateT4;
        public CrcUpdateT8;
        public g_CrcTable;

        constructor(){

        }
        public CrcGenerateTable()
        {
            var i;
            for (i = 0; i < 256; i++)
            {
                var r = i;
                var j;
                for (j = 0; j < 8; j++){
                    r = (r >> 1) ^ (_7zipDefines.kCrcPoly & ~((r & 1) - 1));
                }
                this.g_CrcTable[i] = r;
            }

            if(this.CRC_NUM_TABLES == 1){
                this.g_CrcUpdate = this.CrcUpdateT1;
            }
            else {
                for (; i < 256 * this.CRC_NUM_TABLES; i++) {
                    r = this.g_CrcTable[i - 256];
                    this.g_CrcTable[i] = this.g_CrcTable[r & 0xFF] ^ (r >> 8);
                }
                this.g_CrcUpdate = this.CrcUpdateT4;

                if (this.MY_CPU_X86_OR_AMD64) {
                    if (!this.CPU_Is_InOrder()) {
                        this.g_CrcUpdate = this.CrcUpdateT8;
                    }
                }
            }
        }

        /**
         * TODO : implement CRC check
         */
        public CrcCalc(buf, size:number):number{
            return 0;
        }
        public CrcCalc1(buf, size:number):number
        {
            //uint32
            var crc:number = _7zipDefines.CRC_INIT_VAL;
            for (var i = 0; i < size; i++)
            crc = this.CRC_UPDATE_BYTE(crc, buf[i]);
            return this.CRC_GET_DIGEST(crc);
        }
        public CRC_GET_DIGEST(crc){
            return crc ^ _7zipDefines.CRC_INIT_VAL;
        }
        public CRC_UPDATE_BYTE(crc, b){
          return (this.g_CrcTable[((crc) ^ (b)) & 0xFF] ^ ((crc) >> 8))
        }
        public CPU_Is_InOrder():boolean{
            return false;
        }
    }
}