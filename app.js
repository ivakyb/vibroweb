var express = require('express')
  , bodyParser = require('body-parser')
  , parseVibroDump = require('./VibroPacketReader').parse
  , VibroPacket = require('./VibroPacket')
  //, multiparty = require('multiparty')
  , multipart = require('connect-multiparty')
  , multipartMiddleware = multipart()
  , util = require('util');

var app = express()
  , PORT = process.env.PORT || 8888;  //что такое env? но так пишут


app.use('/', express.static(__dirname + '/pub'));
app.post('/ajax', bodyParser.urlencoded({extended:true}), function (req, res){
	//options = req.body.options;
	parseVibroDump( 'dumps/' + req.body.filename, {packetsToRead: 10}, function(err, packets){
		if (err) {
			res.end(JSON.stringify( {err:err.message} ));
			return;
		}
		res.send(JSON.stringify({ packets: packets }));
	});
	//res.redirect('/');
});

app.post('/ajax/upload', multipartMiddleware, function (req, res){
	var opts = JSON.parse(req.body.options);
	parseVibroDump( req.files.file.path, opts, function(err, packets){
		if (err) {
			res.end(JSON.stringify( {err:err.message} ));
			return;
		}
		res.send(JSON.stringify({ packets: packets }));
	});
	//TODO delete all req.files when done
});

app.listen(PORT, function(){
	console.log('Server running on ' + PORT);
} );