$(document).ready(function(){

	function dibujar_mapa(){
		$("#map").text("");
		var view = new ol.View({
			center: ol.proj.fromLonLat([-3.7035285,40.4169473]),
			zoom: 10,
			minZoom: 8,
		});
		var map = new ol.Map({
			target: document.getElementById('map'),
			loadTilesWhileAnimating: true,
			view: view,
			layers: [
				new ol.layer.Tile({
      				source: new ol.source.OSM()
    			})
			]
		});

		var geolocation = new ol.Geolocation({
			projection: view.getProjection(),
			tracking: true
		});

			// handle geolocation error.
		geolocation.on('error', function(error) {
			alert(error.message);
		});

		var accuracyFeature = new ol.Feature({
			geometry: geolocation.getAccuracyGeometry()
		});

		var positionFeature = new ol.Feature();
			positionFeature.setStyle(new ol.style.Style({
				image: new ol.style.Circle({
				radius: 6,
				fill: new ol.style.Fill({
					color: '#3399CC'
				}),
				stroke: new ol.style.Stroke({
					color: '#fff',
					width: 2
				})
			})
		}));

		geolocation.on('change:accuracyGeometry', function () {
			accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
		});

		
		geolocation.on('change:position', function () {
			var coordinates = geolocation.getPosition();
			positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
		});

		geolocation.on('error', function(error) {
			alert(error.message);
		});

		new ol.layer.Vector({
			map: map,
			source: new ol.source.Vector({
				features: [accuracyFeature, positionFeature]
			})
		});
	}


	function validar(fecha, hora){
		var Correcto = validaFechaDDMMAAAA(fecha);
		var Correcto1 = validar_hora(hora);
		if (Correcto && Correcto1){
			return true;
		}else{
			if (!Correcto){
				alert ("El campo fecha está mal relleno.");
				return false;
			}
			if (!Correcto1){
				alert ("El campo hora está mal relleno");
			}
		}
	}

	function validar_hora(hora){
		var hora_aux = hora.split(":");
		var horas = hora_aux[0];
		var minutos = hora_aux[1];
		if (hora.length>5){
			return false;
		}
		if (hora.length!=5){
			return false;
		}
		if (hora_aux.length != 2){
			return false;
		}
		if (horas.length != 2 || minutos.length != 2){
			return false;
		}
		a=horas.charAt(0);
		b=horas.charAt(1);
		c=minutos.charAt(0);
		if (a>=2 && b>3){
			return false;
		}
		if (c>5){
			return false
		}
		return true;
	}

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

	dibujar_mapa();
	$("#submit").click(function(){
		var origen = $("#origen").val();
	    var destino = $("#destino").val(); 
	    var tipo = $("#tipo_ruta").val();
	    var fecha = $("#fecha").val();
	    var hora = $("#hora").val();
	    var continuar = validar(fecha, hora);

	    if (continuar){
			$.post("/getStreetRoute",{origen_name: origen, destino_name: destino, tipo: tipo, fecha: fecha, hora: hora},function(data){
				if (data != undefined && data.descriptionRouteData != undefined){
					var hora_salida = data.descriptionRouteData.descriptionInitTime;
					var hora_llegada = data.descriptionRouteData.descriptionEstimateArrivalTime;
				}
				$("#map").text("");
				$("#datos").text("");
				if (data != undefined && data.listSectionRoute != undefined && data.listSectionRoute.section){
					var array_instrucciones=data.listSectionRoute.section;
					$("#datos").addClass("box info")
					var cabecera = "<h2>Instrucciones</h2><p>" + hora_salida + "</p><p>Hora estimada de llegada: <strong>" + hora_llegada + "</strong></p>";
					$("#datos").append(cabecera);
					for(i=0;i<array_instrucciones.length;i++){
						var instrucciones = "<ul><dd>";
						var aux = array_instrucciones[i];
						if (aux.walkingLeg != undefined){
							instrucciones = instrucciones + "<li><dd>" +aux.walkingLeg.sourceWalkingLeg.routeDescription + ".</dd></li>";
						}
						if (aux.busLeg != undefined){
							instrucciones = instrucciones + "<li><dd>" +aux.busLeg.sourceBusLeg.routeDescription + ".</dd></li>";
						}
						if (data.routeSectionLists.routeSectionList[i].routeList != undefined && data.routeSectionLists.routeSectionList[i].routeList.routes != undefined){
							for (j=0;j<data.routeSectionLists.routeSectionList[i].routeList.routes.length;j++){
								if (data.routeSectionLists.routeSectionList[i].routeList.routes[j].name != undefined){
									instrucciones = instrucciones + "<ul><dd><li><dd>" + data.routeSectionLists.routeSectionList[i].routeList.routes[j].name + ".</dd></li></dd></ul>";
								}
							}
						}
					$("#datos").append(instrucciones + "</dd></ul>");
					}
				}
				if (data != undefined && data.routeSectionLists != undefined && data.routeSectionLists.routeSectionList){
					var section = data.routeSectionLists.routeSectionList;
					var coords = [];
					for(i=0;i<section.length;i++){
						if (section[i].routeList != undefined && section[i].routeList.routes != undefined){
							for (j=0;j<section[i].routeList.routes.length;j++){
								coords.push([section[i].routeList.routes[j].longitude, section[i].routeList.routes[j].latitude]);
							}
						}
					}
					//var points = [[-65.65, 10.10], [13, 18]];
					var lineString = new ol.geom.LineString(coords);
					lineString.transform('EPSG:4326', 'EPSG:3857');

					var feature = new ol.Feature({
					    geometry: lineString,
					    name: 'Line'
					});

					var lineStyle = new ol.style.Style({
						stroke: new ol.style.Stroke({
						  width: 6, color: [40, 40, 40, 0.8]
						})
					});

					var source = new ol.source.Vector({
						features: [feature]
					});
					var vector = new ol.layer.Vector({
						source: source,
						style: [lineStyle]
					});

					var view = new ol.View({
						center: ol.proj.fromLonLat([-3.7035285,40.4169473]),
						zoom: 11
					});
					var ruta = new ol.source.Vector({});
					var map = new ol.Map({
						target: document.getElementById('map'),
						loadTilesWhileAnimating: true,
						view: view,
						layers: [
							new ol.layer.Tile({
				    			source: new ol.source.OSM()
				    		}),
				    		vector
						]
					});
				}
			})
	    }
	});
})
