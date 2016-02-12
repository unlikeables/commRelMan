var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
// Constructor
var Expire = function(ttl) {
	EventEmitter.call(this);
 	this.ttl = ttl;
  	this.dataSingle = new Array();
  	this.dataGroup = new Array();
  	this.loadingTimer = null;
}
//Herencia para eventos
util.inherits(Expire, EventEmitter);
// class methods
//bollean function Expired or not
var isExpire = function(dateExpired,now){
	if( dateExpired < now ){
		return true;
	}else{
		return false;
	}
}
Expire.prototype.set = function(key, value, timeExpired){
	var obj = {
		timeExpired: timeExpired,
		timeOrigin: new Date().getTime(),
		key: key,
		value: value
	}
	this.dataSingle[key] = obj;
	this.ttlInterval();
};
Expire.prototype.setByGroup = function(group, key, value, timeExpired){
	var obj = {
		timeExpired: timeExpired,
		timeOrigin: new Date().getTime(),
		key: key,
		value: value
	}
	if(!this.dataGroup.hasOwnProperty(group)){
		this.dataGroup[group] = [obj];
	}else{
		this.dataGroup[group].push(obj);
	}
	this.ttlInterval();
};
Expire.prototype.ttlInterval = function() {
	this.loadingTimer = setInterval(function(){this.checkPeriod()}.bind(this), this.ttl);
};
Expire.prototype.checkPeriod = function(){
	if(Object.keys(this.dataSingle).length === 0 && Object.keys(this.dataGroup).length === 0){
		clearInterval(this.loadingTimer);
		return;
	}
	var now = new Date().getTime();
	for(var i in this.dataSingle){
		var t = this.dataSingle[i];
		if( isExpire( (t.timeOrigin + t.timeExpired), now ) ){
			this.emit('expired', this.dataSingle[i].key);
			this.dataSingle = _.without(this.dataSingle, this.dataSingle[i].key);
		}
	}

	for(var j in this.dataGroup){
		for(var k in this.dataGroup[j]){
			var group = j;
			var obj_group = this.dataGroup[j][k];
			if( isExpire( (obj_group.timeOrigin + obj_group.timeExpired), now ) ){
				var data_expired = {
					group: group,
					key: obj_group.key,
					value: obj_group.value
				};
				this.emit('inGroupExpired', data_expired);
				this.dataGroup[group] = _.without(this.dataGroup[group], _.findWhere(this.dataGroup[group], {key: data_expired.key}));
				if(this.dataGroup[group].length === 0){
					this.dataGroup = _.without(this.dataGroup,group);
				}
				break;
			}
		}
	}


};
Expire.prototype.delForGroup = function(group, key, cback){
	this.dataGroup[group] = _.without(this.dataGroup[group], _.findWhere(this.dataGroup[group], {key: key}));
	if(this.dataGroup[group].length === 0){
		this.dataGroup = _.without(this.dataGroup,group);
	}
	return cback(null, (this.dataGroup[group])?this.dataGroup[group]:null);
};
Expire.prototype.del = function(key, cback){
	this.dataSingle = _.without(this.dataSingle, key);
	return cback(null, (this.dataSingle)?this.dataSingle:null);
};
Expire.prototype.getData = function(){
	if(this.dataSingle){
		return this.dataSingle;
	}else{
		return null;
	}
};
Expire.prototype.getForGroupValues = function(group){
	var aux = new Array();
	if(this.dataGroup[group]){
		_.each(this.dataGroup[group],function(num){
			aux.push(num.value);
		});
		return aux;
	}else{
		return null;
	}
}
Expire.prototype.getForGroup = function(group){
	if(this.dataGroup[group]){
		return this.dataGroup[group];
	}else{
		return null;
	}
};
// export the class
module.exports = Expire;