var express = require('express');
var passport = require('passport');
var Datos = require("../models/datos")
var router = express.Router();
var sendgrid = require('sendgrid').SendGrid("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");

var EMT = require ('API-Emtmad');
EMT.initAPICredentials('WEB.SERV.isma.bargos@gmail.com','38F2A3E6-D982-4A84-8F85-3222DD07A9E2');

//EMT.initAPICredentials('EMT.SERVICIOS.EMTJSONBETAEMT.SERVICIOS.EMTJSONBETA','4F4EEB75-A822-41E3-817B-AB301D5DA321');
/* GET home page. */

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('error_msg','No estas registrado');
		res.redirect('/users/login');
	}
}

router.get('/', function(req, res, next) {
  res.render('company');
});

router.get('/Experimental', ensureAuthenticated, function(req, res, next) {
  res.render('experimental');
});

router.post('/getNodesLines', function(req,res){
  EMT.getNodesLines("", function(output){
  	if (output.status == 200){
  	  res.send(output);
  	}
  	else if (output.status == 400){
      return res.render('error', {message: "Error 400."});
  	}
    else
      return res.render('error', {message: "Error desconocido."});
    });
 });

router.post('/getRouteLines', function(req, res){
	EMT.getRouteLines(req.body.linea,req.body.fecha, function(output){
		if (output.status == 200){
	  	  res.send(output);
	  	}
	  	else if (output.status == 400){
	      return res.render('error', {message: "Error 400."});
	  	}
	    else
	      return res.render('error', {message: "Error desconocido."});
	});
});

router.post('/getIncidents', function(req, res){
  var parada = req.body.parada;
  var lineas = req.body.linea;
  console.log(lineas);
  EMT.getEstimatesIncident(parada, lineas, "Y", "N", "Y", "N", "Y", "N", "20160613", function(output){
  	if (output.status == 200){
  	  console.log(output.arrives);
  	  res.send(output);
  	}
  	else if (output.status == 400){
      return res.render('error', {message: "Error 400."});
  	}
    else
      return res.render('error', {message: "Error desconocido."});
  });
});

router.post('/getParada', function(req,res){
  EMT.getNodesLines(req.body.parada, function(output){
  	if (output.status == 200){
  	  console.log(output);
  	  res.send(output);
  	}
  	else if (output.status == 400){
      return res.render('error', {message: "Error 400."});
  	}
    else
      return res.render('error', {message: "Error desconocido."});
    });
 });

router.post('/getStreetRoute', function(req, res, next){
	var origen=req.body.origen_name;
	var destino=req.body.destino_name;
	var tipo_ruta=req.body.tipo;
	var fecha=req.body.fecha;
	var aux_fecha = fecha.split("/");
	var hora=req.body.hora;
	var aux_hora=hora.split(":");
	EMT.getStreet(origen, "1", "500", "1", function(output){
		if (output.status == 200){
	  	  var lon_ori=output.site[0].longitude;
	  	  var lat_ori=output.site[0].latitude;
	  	  EMT.getStreet(destino, "1", "500", "5", function(output){
			if (output.status == 200){
		  	  var lon_des=output.site[0].longitude;
		  	  var lat_des=output.site[0].latitude;
		  	  EMT.getStreetRoute(lat_ori,lon_ori,lat_des,lon_des,tipo_ruta,aux_fecha[0],aux_fecha[1],aux_fecha[2],aux_hora[0],aux_hora[1],origen,destino,"N", function(output){
		  		if (output.status == 200){
		  			res.send(output.listRouteData.routeData);
				}
				else if (output.status == 400){
				    return res.render('error', {message: "Error 400."});
				}
				else
				    return res.render('error', {message: "Error desconocido."});
		  	  });
		  	}
		  	else if (output.status == 400){
		      return res.render('error', {message: "Error 400."});
		  	}
		    else
		      return res.render('error', {message: "Error desconocido."});
		  });
	  	}
	  	else if (output.status == 400){
	      res.send("Error 400");
	  	}
	    else
	      res.send("Error desconocido");
	});
})

router.get('/Contacts', function(req, res, next) {
  res.render('contacts');
});

router.get('/Horarios', function(req, res, next){
	res.render('horarios');
})

router.post('/Horarios', function(req, res, next){
	console.log(req.body.linea + ", " + req.body.fecha);
	EMT.getInfoLineExtended(req.body.linea, req.body.fecha , function(data){
		res.send(data);
	})
})

router.post('/Contacts', function(req, res, next){
  var helper = require('sendgrid').mail;
  from_email = new helper.Email(req.body.email);
  to_email = new helper.Email("urjc.api.emt@gmail.com");
  subject = req.body.asunto;
  content = new helper.Content("text/plain", req.body.contenido + "\r\n\r\n" + "Nombre: " + req.body.nombre + "\r\n\r\n" + "Teléfono: " +req.body.tfn);
  mail = new helper.Mail(from_email, subject, to_email, content);
  var requestBody = mail.toJSON();
  var request = sendgrid.emptyRequest();
  request.method = 'POST';
  request.path = '/v3/mail/send';
  request.body = requestBody;
  sendgrid.API(request, function (response) {
    if (response.statusCode == 400){
    	res.render('error', {message: "Error provocado por la librería SendGrid a la hora de enviar el correo."})
    }else{
    	res.render('contacts');
    }
  })
});

router.get('/Company', function(req, res, next) {
  res.render('company');
});

router.get('/Services', function(req, res, next) {
  res.render('services');
});

router.get('/Solutions', function(req, res, next) {
  res.render('solutions');
});

router.post('/getDatos',function(req, res, next){
	EMT.getArriveStop(req.body.parada, function(output){
		if (output.status == 200){
			if (output.arrives != undefined){
				for(i=0;i<output.arrives.length;i++){
					var registro = new Datos();
				  	registro.username = req.user.local.username; 
				  	var aux_fecha = new Date();
				  	var fecha = aux_fecha.getDate()+"/"+parseInt(aux_fecha.getMonth())+1+"/"+aux_fecha.getFullYear();
				  	var hora = aux_fecha.getHours()+":"+aux_fecha.getMinutes() + ":" + aux_fecha.getSeconds();
				  	registro.fecha = fecha;
				  	registro.hora = hora;
				  	registro.parada = parseInt(output.arrives[i].stopId);
				  	registro.idBus = output.arrives[i].busId;
				  	registro.lineId = output.arrives[i].lineId;
				  	registro.distancia = parseInt(output.arrives[i].busDistance);
				  	registro.tiempo_llegada= parseInt(output.arrives[i].busTimeLeft);
				  	registro.destination = output.arrives[i].destination;
				  	Datos.createDatos(registro, function(err, user){
					  	if (err){
					  		return res.render('error', {message: "Error al guardar los datos."});
					  	}
					});
				}
				res.send(output);
			}
		}else if (output.status == 400){
		    return res.render('error', {message: "Error 400."});
		}
		else
		    return res.render('error', {message: "Error desconocido"});
	})
});

router.post('/consulta', function(req,res,next){

	var query = {};
	if( req.user.local.username !== "" && req.user.local.username != undefined) {
	    query["username"] = req.user.local.username;
	}
	if( req.body.parada !== ""  && req.body.parada != undefined) {
	    query["parada"] = req.body.parada;
	}
	if( req.body.linea !== "" && req.body.linea != undefined) {
	    query["lineId"] = req.body.linea;
	}
	if( req.body.bus !== "" && req.body.bus != undefined) {
	    query["idBus"] = req.body.bus;
	}
	var resultado = Datos.getDatos(query, function(err, datos) {
		if(err){
  			return res.render('error', {message: "Error al realizar la busqueda."});
		}else{
			if (!datos) {
		        return res.redirect('/Experimental');
		    }else{
		        res.send(datos);
		    }
		}
	});
});

module.exports = router;
