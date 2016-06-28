var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    username :String,
    fecha :String,
    hora : String,
    parada:Number,
    lineId:String,
	idBus: String,
	distancia: Number,
	tiempo_llegada: Number,
	destination: String
});

var Datos = module.exports = mongoose.model('Datos', Schema);

module.exports.createDatos = function(newDatos, callback){
	newDatos.save(callback);
}

module.exports.getDatos = function(query, callback){
	console.log(query);
	Datos.find(query, callback)
}
