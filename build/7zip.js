///<reference path="7zip.d.ts" />
var nid;
(function (nid) {
    /**
    * @author : Nidin Vinayakan
    */
    var SevenZip = (function () {
        function SevenZip(data) {
            this.signature = [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C];
            if (data) {
                this.load(data);
            }
        }
        SevenZip.prototype.load = function (data) {
            if (data[0] != this.signature[0] || data[1] != this.signature[1] || data[2] != this.signature[2] || data[3] != this.signature[3] || data[4] != this.signature[4] || data[5] != this.signature[5]) {
                console.log('Error! Invalid file');
                return false;
            }
        };
        return SevenZip;
    })();
    nid.SevenZip = SevenZip;
})(nid || (nid = {}));
//# sourceMappingURL=7zip.js.map
