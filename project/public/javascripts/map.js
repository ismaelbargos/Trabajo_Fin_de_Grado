$(document).ready(function(){ 

	var lineStyle = new ol.style.Style({
		stroke: new ol.style.Stroke({
		  width: 6, color: [40, 40, 40, 0.8]
		})
	});

	var icon_url = "../images/parada.jpg";
	var icon_url_selected = "../images/parada_seleccionada.jpeg";
	var styles = {
		icon: new ol.style.Style({
			image: new ol.style.Icon({
	  			anchor: [0.5, 1],
	  			src: icon_url
			})
		})
	};

	//dibujamos el mapa

	function dibujar_mapa(map,vectorSource){
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
    			}),
			  	new ol.layer.Vector({
			        title: 'Paradas',
			        source: vectorSource
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
		map.getLayers().item(1).setVisible(false);
		return map;
	}

	function ObtenerVector(datos){
		vectorSource = new ol.source.Vector();
		var vectorLayer = new ol.layer.Vector({
			source: vectorSource
		});
		if (datos.resultValues.length > 1){
			for (i=0;i<datos.resultValues.length;i++){
				var coord = [datos.resultValues[i].longitude, datos.resultValues[i].latitude];
				var feature = new ol.Feature({
				  type: 'place',
				  parada: datos.resultValues[i].node,
				  nombre: datos.resultValues[i].name,
				  lines: datos.resultValues[i].lines,
				  latitud: datos.resultValues[i].latitude,
				  longitud:datos.resultValues[i].longitude,
				  geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
				});
				feature.setStyle(styles.icon);
				vectorSource.addFeature(feature);
			}
		}else{
			var coord = [datos.resultValues.longitude, datos.resultValues.latitude];
			var feature = new ol.Feature({
			  type: 'place',
			  parada: datos.resultValues.node,
			  nombre: datos.resultValues.name,
			  lines: datos.resultValues.lines,
			  latitud: datos.resultValues.latitude,
			  longitud:datos.resultValues.longitude,
			  geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
			});
			feature.setStyle(styles.icon);
			vectorSource.addFeature(feature);
		}
		return vectorSource;
	}

	function sort_unique(arr) {
	    if (arr.length === 0) return arr;
	    arr = arr.sort(function (a, b) { return a*1 - b*1; });
	    var ret = [arr[0]];
	    for (var i = 1; i < arr.length; i++) { // start loop at 1 as element 0 can never be a duplicate
	        if (arr[i-1] !== arr[i]) {
	            ret.push(arr[i]);
	        }
	    }
	    return ret;
	}

	$("#buscar_parada").click(function(datos){
		var stop = $("#id_stop").val();
		$.post("/getParada",{parada: stop},function(idStop){
			var latitude = idStop.resultValues.latitude;
			var longitude = idStop.resultValues.longitude;
			$("#map").text("");
			var view = new ol.View({
				center: ol.proj.fromLonLat([longitude,latitude]),
				zoom: 17,
				minZoom: 11,
			});
			var map = new ol.Map({
				target: document.getElementById('map'),
				loadTilesWhileAnimating: true,
				view: view,
				layers: [
					new ol.layer.Tile({
	      				source: new ol.source.OSM()
	    			}),
				  	new ol.layer.Vector({
				        title: 'Paradas',
				        source: vectorSource
				    })
				]
			});

			map.on('click', function(evt) {
		        var feature = map.forEachFeatureAtPixel(evt.pixel,
		            function(feature) {
		              vectorSource.addFeature(feature);
		              return feature;
		            });
		        if (feature) {
		        	$("#datos").removeClass("box info");
		          	$("#datos").text("");
                    $("#datos").addClass("box info");
                    $("#datos").append("<h1>Datos de la parada</h1><div class ='.ym-contain-dt'");
			        $("#datos").append("<span id='node' class='dropcap_1'>" +feature.get("parada")+"</section>");
			        $("#datos").append("<h3 id='name' class='pad_bot1'>"+ feature.get("nombre") + "</h3><br>");
			        var datos = feature.get("lines");
			        var lineas = [];
			        for(i=0;i<datos.length;i++){
			        	var aux = datos[i].split("/");
			        	lineas.push(aux[0]);
			        }
			        ObtenerDatos(feature.get("parada"),lineas);
		        } else {
		        	$("#datos").removeClass("box info");
		          	$("#datos").text("");
		        }
	        });
		})
	});

	function calcularTiempo(tiempo){
		if(tiempo == "999999"){
			return "+20 min";
		}else{
			var minutes = Math.floor(tiempo / 60);
			var seconds = tiempo - minutes * 60;
			if (seconds <= 9){
				return minutes +":0" + seconds;
			}
			return minutes + ":" + seconds;
		}
	}

	

	function ObtenerFechaYYYYMMDD(){

		var d = new Date();
		var ano = d.getFullYear().toString();
		var mes = d.getMonth();
		if (mes<10){
			mes = "0" + mes.toString();
		}
		var dia = d.getDay();
		if (dia < 10){
			dia = "0" + dia.toString();
		}
		return ano+mes+dia;
	}

	function ObtenerFechaDDMMYYYY(){

		var d = new Date();
		var ano = d.getFullYear().toString();
		var mes = d.getMonth();
		if (mes<10){
			mes = "0" + mes.toString();
		}
		var dia = d.getDate();
		if (dia < 10){
			dia = "0" + dia.toString();
		}
		return dia+"/"+mes+"/"+ano;
	}

	function ObtenerDatos(parada, datos){
		var lineas = "";
		if (datos!="" && datos != "undefined" && datos.arrives!="undefined"){
			datos = sort_unique(datos);
			for (i=0;i<datos.length;i++ ){					
				if (i == datos.length-1 && datos[i] != ""){
					lineas = lineas + datos[i];
				}else if (i <= datos.length-1 && datos[i] != ""){
					lineas = lineas + datos[i] + "|";
				}
			}
			var fecha = ObtenerFechaYYYYMMDD();
		

			$.post("/getIncidents",{parada: parada, linea: lineas, fecha: fecha},function(data){
				if (data.arrives!="undefined" && data != "undefined" && data.arrives != null){
					if(data.arrives.arriveEstimationList.arrive != null && data.arrives.arriveEstimationList.arrive != "" && data.arrives.arriveEstimationList.arrive != "undefined"){
						for (i=0;i<data.arrives.arriveEstimationList.arrive.length;i++){
							var elemento = "";
							elemento = "<div id='lines'><section class='box info'><span class='linea'>Línea: <strong>"+data.arrives.arriveEstimationList.arrive[i].lineId + "</strong></span><br>";
							elemento = elemento + "<span>Dirección: <strong>"+data.arrives.arriveEstimationList.arrive[i].destination+"</strong></span><br>";
							var tiempo = calcularTiempo(data.arrives.arriveEstimationList.arrive[i].busTimeLeft);
							elemento = elemento + "<span>Tiempo espera estimado: <strong>" + tiempo + "</strong></span><br>"
							if (data.incident.incidentList != null && data.incident.incidentList != "" && data.incident.incidentList != "undefined"){
								var incident = data.incident.incidentList.data.description.split("Ver m\u00e1s detalle");
								elemento = elemento + "<span>Incidencia: <strong>"+ incident[0] + "</strong></span></div>";
							}
							elemento = elemento + "</section>";
							$("#datos").append(elemento);
						}
					}
				}else{
					elemento = "</section>No existen datos para esta parada.</section>";
					$("#datos").append(elemento);
				}

				$("#lines").on("click", "span.linea",function(){
					var aux = $(this).text();
					aux = aux.split("Línea: ");
					var fecha = ObtenerFechaDDMMYYYY();
					dibujar_linea(aux[1], fecha);
				});
			})
		}
	}


	function dibujar_linea(linea, fecha){
		var centro = [];
		var url = '//router.project-osrm.org/viaroute?loc=';
		$.post("/getRouteLines", {linea: linea, fecha: fecha}, function(data){
			var parada = $("#node").text();
			console.log(parada);
			var url_goo = "https://roads.googleapis.com/v1/snapToRoads?path=";
			$("#map").text("");
			for (i=0;i<data.resultValuess.length;i++){
				if (i == data.resultValuess.length-1){
					url_goo = url_goo + [data.resultValuess[i].latitude, data.resultValuess[i].longitude] + "&interpolate=true&key=AIzaSyAp3eKLcX7YRIH8K8i7wlzK7jMNTKaXbuE";
				}else{
					url_goo = url_goo + [data.resultValuess[i].latitude, data.resultValuess[i].longitude] + "|";
				}
				if (parada == data.resultValuess[i].node){
					centro = [data.resultValuess[i].longitude, data.resultValuess[i].latitude];
				}
			}
			$.ajax({
			  url: url_goo,
			}).done(function(data) {
				var datos = data.snappedPoints;
				var linea = [];
				for (i=0;i<datos.length;i++){
					linea.push([datos[i].location.longitude, datos[i].location.latitude]);
				}
			  	var lineString = new ol.geom.LineString(linea);
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
					center: ol.proj.fromLonLat(centro),
					zoom: 14,
					minZoom: 11
				});
				var map = new ol.Map({
					target: document.getElementById('map'),
					loadTilesWhileAnimating: true,
					view: view,
					layers: [
						new ol.layer.Tile({
			    			source: new ol.source.OSM()
			    		}),
			    		vector,
			    		new ol.layer.Vector({
					        title: 'Paradas',
					        source: vectorSource
					    })
					]
				});
				map.getLayers().item(2).setVisible(false);

				map.on('moveend', function(){ 
					if (map.getView().getZoom() >= 17){
					 	map.getLayers().item(2).setVisible(true);
					} else{
						map.getLayers().item(2).setVisible(false);
					}
				});

				map.on('click', function(evt) {
			        var feature = map.forEachFeatureAtPixel(evt.pixel,
			            function(feature) {
			              vectorSource.addFeature(feature);
			              return feature;
			            });
			        if (feature) {
			        	$("#datos").removeClass("box info");
		          		$("#datos").text("");
                    	$("#datos").addClass("box info");
                    	$("#datos").append("<h1>Datos de la parada</h1><div class ='.ym-contain-dt'");
			        	$("#datos").append("<span id='node' class='dropcap_1'>" +feature.get("parada")+"</section>");
			        	$("#datos").append("<h3 id='name' class='pad_bot1'>"+ feature.get("nombre") + "</h3><br>");
				        var datos = feature.get("lines");
				        var lineas = [];
				        for(i=0;i<datos.length;i++){
				        	var aux = datos[i].split("/");
				        	lineas.push(aux[0]);
				        }
				        ObtenerDatos(feature.get("parada"),lineas);
			        } else {
			        	map.getLayers().item(1).setVisible(false);
			        	$("#datos").removeClass("box info");
		          		$("#datos").text("");
			        }
		        });

			});
		});
	}

	//Aqui obtengo la localización
	$.post("/getNodesLines",function(data){
		var vector_paradas = ObtenerVector(data);
		var map = dibujar_mapa(map,vector_paradas);

		map.on('moveend', function(){ 
		 if (map.getView().getZoom() >= 15){
		 	map.getLayers().item(1).setVisible(true);
		 }else{
		 	map.getLayers().item(1).setVisible(false);
		 }
		});

		map.on('click', function(evt) {
	        var feature = map.forEachFeatureAtPixel(evt.pixel,
	            function(feature) {
	              vectorSource.addFeature(feature);
	              return feature;
	            });
	        if (feature) {
	        	$("#datos").removeClass("box info");
		        $("#datos").text("");
	        	$("#datos").addClass("box info");
                $("#datos").append("<h1>Datos de la parada</h1><div class ='.ym-contain-dt'");
			    $("#datos").append("<span id='node' class='dropcap_1'>" +feature.get("parada")+"</section>");
			    $("#datos").append("<h3 id='name' class='pad_bot1'>"+ feature.get("nombre") + "</h3><br>");
		        var datos = feature.get("lines");
		        var lineas = [];
		        for(i=0;i<datos.length;i++){
		        	var aux = datos[i].split("/");
		        	lineas.push(aux[0]);
		        }
		        ObtenerDatos(feature.get("parada"),lineas);
	        } else {
	        		$("#datos").removeClass("box info");
		          	$("#datos").text("");
	        }
        });
	});
});
