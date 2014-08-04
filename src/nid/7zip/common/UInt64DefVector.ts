module nid {

    /**
     * സെവൻ സിപ്പ് (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    export class UInt64DefVector {

        public values:Array<number>;
        public defined:Array<boolean>;

        constructor(){
            this.values = [];
            this.defined = [];
        }

        public clear()
        {
            this.values.clear();
            this.defined.clear();
        }

        public reserveDown()
        {
            /*this.values.reserveDown();
            this.values.reserveDown();*/
        }

        public getItem(index:number):number//UInt64
        {
            var value:number;
            if (index < this.defined.length && this.defined[index])
            {
                value = this.values[index];
            }else{
                value = 0;
            }
            return value;
        }

        public setItem(index:number, defined:boolean, value:number)//UInt64
        {
            while (index >= this.defined.length){
                this.defined.push(false);
            }

            this.defined[index] = defined;

            if (!defined){
                return;
            }
            while (index >= this.values.length){
                this.values.push(0);
            }
            this.values[index] = value;
        }

        public checkSize(size:number):boolean{
            return this.defined.length == size || this.defined.length == 0;
        }
    }
}