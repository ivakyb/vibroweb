//TODO VIBRO_PROTOCOL_PACKET_SIZE рассчитывать автоматически на основе структуры


/** Импорт внешних модулей Node.js */
var mod_ctype = require('ctype'),
	Int64 = require('node-int64');



var ctparser = new mod_ctype.Parser({ endian: 'little'});
ctparser.typedef( 'VibroPacket_t', [
	{ protocolName: { type: 'char[4]' }}
	,{protocolVersion: {type: 'uint8_t' }}
	,{uid32: {type: 'uint32_t'}}
	,{timestamp_ms: {type: 'int64_t'}}
	,{rtcSeconds: {type: 'uint32_t'}}
	,{sampleRate: {type: 'uint32_t'}}
	,{data32: {type: 'float[250]'}}
]);

var VibroPacket = function (vp) {
	this.protocolName = vp.protocolName.toString();
	this.protocolVersion = (vp.protocolVersion>>>4) + '.' + (vp.protocolVersion&0xF);
	this.timestamp_ms = {
		int: new Int64(vp.timestamp_ms[0], vp.timestamp_ms[1]),
		date: new Date(new Int64(vp.timestamp_ms[0], vp.timestamp_ms[1]))
	};
	this.rtcSeconds = {
		int: vp.rtcSeconds,
		date: new Date(vp.rtcSeconds * 1000 - 1000)
	};
	this.data32 = vp.data32;
};
VibroPacket.prototype.toString = function(){
	var ret = 'VibroPacket: {\n';
	ret += '\t' + 'protocolName: ' + this.protocolName + '\n';
	ret += '\t' + 'protocolVersion: ' + this.protocolVersion + '\n';
	ret += '\t' + 'timestamp_ms: ' + this.timestamp_ms.date + '\n';
	ret += '\t' + 'rtcSeconds: ' + this.rtcSeconds.date + '\n';
	ret += '\t' + 'data: ' + this.data32 + '\n';
	ret += '}' + '\n';
	return ret;
};
VibroPacket.prototype.VIBRO_PROTOCOL_NAME = 'VMP\x00';
VibroPacket.prototype.VIBRO_PROTOCOL_PACKET_SIZE = 1025;

function parse1 (buffer) {
	if (!Buffer.isBuffer(buffer)) throw new Error('Wrong buffer arg');
	//TODO	if (buffer.length < type.length)

	var ctparsed = ctparser.readData([ {vp: {type: 'VibroPacket_t'}} ], buffer, 0 );

	return new VibroPacket(ctparsed.vp);//vp;
}

function parseBuf(buf, options) {

	const VIBRO_PROTOCOL_NAME = VibroPacket.prototype.VIBRO_PROTOCOL_NAME,
		VIBRO_PROTOCOL_PACKET_SIZE = VibroPacket.prototype.VIBRO_PROTOCOL_PACKET_SIZE;
	var packetsToRead = options ? options.packetsToRead || Infinity : Infinity
		,packetsSeek = options ? options.packetsSeek || 0 : 0;
		//,protocolName = options ? options.protocolName || VIBRO_PROTOCOL_NAME : VIBRO_PROTOCOL_NAME
		//,packetSize = options ?  options.packetSize || VIBRO_PROTOCOL_PACKET_SIZE: VIBRO_PROTOCOL_PACKET_SIZE;

	var packets = [];
	for (var i = 0, end = VIBRO_PROTOCOL_PACKET_SIZE;
		 packetsToRead && /*(i < buf.length) &&*/ (end <= buf.length);
		 i++, end = i + VIBRO_PROTOCOL_PACKET_SIZE)
	{
		if (buf.slice(i, i + VIBRO_PROTOCOL_NAME.length).toString() == VIBRO_PROTOCOL_NAME) {
			packets.push( parse1(buf.slice(i, end)));
			--packetsToRead;
			i += VIBRO_PROTOCOL_PACKET_SIZE-1;
		}
	}
	console.log('Packets read: ' + packets.length + ', packets to read left: ' + packetsToRead);

	return packets;
}


module.exports = {
	parse1: parse1
	,parseBuf: parseBuf
	//,Packet: VibroPacket
	,VIBRO_PROTOCOL_NAME: 'VMP\x00'
	,VIBRO_PROTOCOL_PACKET_SIZE: 1025
};