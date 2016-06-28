$(document).ready(function(){

	$("#buscar").click(function(){
		var idStop = $("#idStop").val();
		var idLine = $("#idLine").val();
		var idBus = $("#idBus").val();

		$.post("/consulta",{parada: idStop, linea: idLine, bus: idBus}, function(data){
			$("#datos").removeClass("box info");
			$("#datos").text("");
			$("#datos").addClass("box info")
			$("#datos").append("<h2>Datos de la consulta</h2>");
			var contenido="";
			for (i=0;i<data.length;i++){
				contenido = contenido + "<tr><td>Username: " + data[i].username + "</td><td>Parada: " + data[i].parada + "</td><td>Linea: " + data[i].lineId + "</td><td>Bus: " + data[i].idBus + "</td><td>Destino: " + data[i].destination + "</td><td>Distancia: " + data[i].distancia + "</td><td>Tiempo llegada: " + data[i].tiempo_llegada + "</td><td>Fecha: " + data[i].fecha + "</td><td>Hora: " + data[i].hora + "</td></tr>"
			}
			tabla = "<table>" + contenido + "</table>";
			$("#datos").append(tabla);
		})
	});

	$("#submit").click(function(){
		var parada = parseInt($("#parada").val());
		var tiempo = parseInt($("#tiempo").val());
		var timeout = parseInt($("#timeout").val());
		var id = setInterval(function(){ obtener_datos(parada) }, tiempo);
		myVar = setTimeout(function(){ clearInterval(id) }, timeout);
		
	});

	function obtener_datos(parada){
		$.post("/getDatos", {parada: parada},function(data){
			console.log(data);
		})
	}
})
