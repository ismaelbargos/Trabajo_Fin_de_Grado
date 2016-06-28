$(document).ready(function(){

	function validaFechaDDMMAAAA(fecha){
		var dtCh= "/";
		var minYear=1900;
		var maxYear=2100;
		function isInteger(s){
			var i;
			for (i = 0; i < s.length; i++){
				var c = s.charAt(i);
				if (((c < "0") || (c > "9"))) return false;
			}
			return true;
		}
		function stripCharsInBag(s, bag){
			var i;
			var returnString = "";
			for (i = 0; i < s.length; i++){
				var c = s.charAt(i);
				if (bag.indexOf(c) == -1) returnString += c;
			}
			return returnString;
		}
		function daysInFebruary (year){
			return (((year % 4 == 0) && ( (!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28 );
		}
		function DaysArray(n) {
			for (var i = 1; i <= n; i++) {
				this[i] = 31
				if (i==4 || i==6 || i==9 || i==11) {this[i] = 30}
				if (i==2) {this[i] = 29}
			}
			return this
		}
		function isDate(dtStr){
			var daysInMonth = DaysArray(12)
			var pos1=dtStr.indexOf(dtCh)
			var pos2=dtStr.indexOf(dtCh,pos1+1)
			var strDay=dtStr.substring(0,pos1)
			var strMonth=dtStr.substring(pos1+1,pos2)
			var strYear=dtStr.substring(pos2+1)
			strYr=strYear
			if (strDay.charAt(0)=="0" && strDay.length>1) strDay=strDay.substring(1)
			if (strMonth.charAt(0)=="0" && strMonth.length>1) strMonth=strMonth.substring(1)
			for (var i = 1; i <= 3; i++) {
				if (strYr.charAt(0)=="0" && strYr.length>1) strYr=strYr.substring(1)
			}
			month=parseInt(strMonth)
			day=parseInt(strDay)
			year=parseInt(strYr)
			if (pos1==-1 || pos2==-1){
				return false
			}
			if (strMonth.length<1 || month<1 || month>12){
				return false
			}
			if (strDay.length<1 || day<1 || day>31 || (month==2 && day>daysInFebruary(year)) || day > daysInMonth[month]){
				return false
			}
			if (strYear.length != 4 || year==0 || year<minYear || year>maxYear){
				return false
			}
			if (dtStr.indexOf(dtCh,pos2+1)!=-1 || isInteger(stripCharsInBag(dtStr, dtCh))==false){
				return false
			}
			return true
		}
		if(isDate(fecha)){
			return true;
		}else{
			return false;
		}
	}

	$("#buscar").click(function(){
		var idLine = $("#idLine").val();
		var fecha = $("#fecha").val();
		if (validaFechaDDMMAAAA(fecha) && idLine != "" && idLine != undefined){
			$.post("/Horarios",{linea: idLine, fecha: fecha}, function(data){
				console.log(data);
				$("#datos").text("");
				$("#datos").append("<h3>Horario de los autobuses de la línea "+ idLine + "</h3>");
				$("#datos").append("<h3>Día: "+ fecha + "</h3>");
				var contenido1 = "";
				var contenido2 = "";
				var Encontrado = false;
				var i = 0;
				console.log(data.Line);
				if (data.Line != undefined){
					while((i<data.Line.length) && (!Encontrado)){
						if(data.Line[i].lineId == idLine){
							console.log("hemos encontrado la línea" + i);
							var tabla1="<table>"+data.Line[i].headerA + " - " + data.Line[i].headerB + "<tr><td>Tipo día</td><td>Inicio</td><td>Fin</td><td>Frecuencia autobuses</td>";
							var tabla2="<table>"+data.Line[i].headerB + " - " + data.Line[i].headerA+ "<tr><td>Inicio</td><td>Fin</td><td>Frecuencia autobuses</td>";			
							Encontrado = true;
							for(j=0;j<data.Line[i].dayType.length;j++){
								contenido1 = contenido1 + "<tr><td>" + data.Line[i].dayType[j].dayTypeId + "</td>";
								contenido1 = contenido1 + "<td>" + data.Line[i].dayType[j].direction1.startTime + "</td>";
								contenido1 = contenido1 + "<td>" + data.Line[i].dayType[j].direction1.stopTime + "</td>";
								contenido1 = contenido1 + "<td>" + data.Line[i].dayType[j].direction1.frequencyDescription + "</td></tr>";
								contenido2 = contenido2 + "<tr><td>" + data.Line[i].dayType[j].dayTypeId + "</td>";
								contenido2 = contenido2 + "<td>" + data.Line[i].dayType[j].direction2.startTime + "</td>";
								contenido2 = contenido2 + "<td>" + data.Line[i].dayType[j].direction2.stopTime + "</td>";
								contenido2 = contenido2 + "<td>" + data.Line[i].dayType[j].direction2.frequencyDescription + "</td></tr>";
							}
							$("#datos").append(tabla1+contenido1+"</table>");
							$("#datos").append(tabla2+contenido2+"</table>");
						}
					i = i+1;
					}
				}else{
					contenido = "<p>No existen datos</p>";
					$("#datos").append(contenido);
				}
			})
		}else{
			$("#idLine").text("");
			$("#fecha").text("");
			alert("Error al rellenar el formulario");
		}
	});
})
