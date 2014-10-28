var fs = require('fs'),
	VibroPacket = require('./VibroPacket');



/**
 * Прочитать локальный (для сервера) файл и создать объект(ы)-пакет(ы).
 * @param filename
 * @param options
 * @param cb The function (err, packets), where @param packets is array of VibroPacket class
 */
function parseVibroDump(filename, options, cb) {

	if (!fs.existsSync(filename)) {/*throw*/ cb(new Error('file ' + filename + ' does not exist')); return }
	if ((cb) && (typeof cb != 'function')) {/*throw*/ cb(new Error('cb must be a function')); return }

	fs.stat(filename, function(err, fileStats){
		if (err) {cb(err);return} //throw err;

		var fileSize = fileStats.size;
		console.log('Reading file ' + filename + ', size ' + fileSize);

		fs.open(filename, 'r', function (err, f) {
			if (err) {cb(err);return} //throw err;

			fs.read(f, new Buffer(fileSize), 0, fileSize, null, function (err, bytesRead, buf) {
				if (err) {cb(err);return}//throw err;

				var packets = VibroPacket.parseBuf(buf, options)

				fs.close(f);
				cb(err, packets);
			});
		});
	})
}

module.exports = {
	parse: parseVibroDump
};