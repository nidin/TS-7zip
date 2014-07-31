interface Array<T> {
    clear();
}
Array.prototype.clear = function(){
    this.splice(0,this.length);
}
