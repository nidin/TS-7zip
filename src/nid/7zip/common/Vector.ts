interface Array<T> {
    back();
    clear();
    reserve(size);
    ElementClass;
}
Array.prototype.ElementClass = null;
Array.prototype.clear = function(){
    this.splice(0,this.length);
}
Array.prototype.back = function(){
    return this[this.length-1];
}
Array.prototype.reserve = function(size){
    if(this.ElementClass != null && this.ElementClass != undefined){
        for(var i = 0; i < size; i++){
            this.push(new this.ElementClass());
        }
    }else{
        throw {
            name:'Reserve class undefined',
            message:'ElementClass no defined to reserve an Array'
        }
    }
}
