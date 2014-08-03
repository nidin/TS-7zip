module nid {

    /**
     * സെവൻ സിപ്പ്  (Dedicated to my mother tongue :D , http://en.wikipedia.org/wiki/Malayalam)
     * 7zip Archive Decoder
     * Version 0.1
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    export var LZMA_STATUS_NOT_SPECIFIED:number                 = 0; /* use main error code instead */
    export var LZMA_STATUS_FINISHED_WITH_MARK:number            = 1; /* stream was finished with end mark. */
    export var LZMA_STATUS_NOT_FINISHED:number                  = 2; /* stream was not finished */
    export var LZMA_STATUS_NEEDS_MORE_INPUT:number              = 3; /* you must provide more input bytes */
    export var LZMA_STATUS_MAYBE_FINISHED_WITHOUT_MARK:number   = 4; /* there is probability that stream was finished without end mark */
}