function readSingleFile(evt) {
	var file = evt.target.files[0];
	if (!file) return;
	var fd = new FormData();
	fd.append('file', file);
	fd.append('options', JSON.stringify({
		packetsToRead: 3,
		packetsSeek: 0
	}));

	$.ajax({
		url: '/ajax/upload',
		type: 'POST'
		,cache: false
		,processData: false
		,contentType: false
		, data: fd
		, error: function (jqXHR, textStatus, err) {
			$('#ajaxStatus').text('Upload Fault!');
			alert('text status: ' + textStatus + ', err: ' + err)
		}
		, success: function (data, textStatus, jqXHR) {
			data = JSON.parse(data);
			var ajaxStatus = $('#ajaxStatus');
			if (data.err) {
				ajaxStatus.text(data.err);
				return
			}
			ajaxStatus.text('Upload successful!');
			//graph(document.getElementById("container"), data.packets[0].data32);
			drawVibroHighChart( vibroPackets2HCSeries(data.packets));
		}
	});
}

document.getElementById('file-input').addEventListener('change', readSingleFile, false);


// отображение графика из живого пакета
function graph(container, data) {
	if (!data) data = new Array(14);
	var d = [], d2 = [], res;
	for (var i=0, len = data.length; i < len; i += 1) {
		d2.push([i, Math.sin(i)]);
		d.push([i, data[i]]);
	}
	// Draw Graph
	res = Flotr.draw(container, [d, d2], {
		xaxis: {
			minorTickFreq: 4
		}
		/*yaxis : {  max : 2, min : -2	 },*/
		,grid: {
			minorVerticalLines: true
		}
		,selection: {
			mode: 'x',
			fps: 30
		}
		,title: 'Vibration'
	});
}
// отправка имени файла, который лежит на сервере, чтобы получить распарсенные значения
$('#enter').click(function(){
	$.ajax({
		url: '/ajax',
		type: 'POST',
		cache: false
		//,dataType: "json"
		//,contentType: 'application/json'
		,data: { filename: $('#filename').val(), field2: 2 }
		,success: function(data){
			data = JSON.parse(data);
			var ajaxStatus = $('#ajaxStatus');
			if (data.err) {
				ajaxStatus.text( data.err );
				return;
			}
			ajaxStatus.text('Success!');
			//graph(document.getElementById("container"), data.packets[0].data32); //graph( $('#container'), data.packets[0].data32);
			graph(document.getElementById("container"), data.packets[0].data32.concat(data.packets[1].data32) );
		}
		,error: function(jqXHR, textStatus, err){
			$('#ajaxStatus').text('Fault!');
			alert('text status: '+textStatus+', err: '+err)
		}
	})
});

// Отображение стандартного графика
/*(function basic(container, data) {
	if (!data) data = new Array(14);
	var	d1 = [ [0, 3], [4, 8], [8, 5], [9, 13] ],
		d2 = [], i, graph;
	// Generate first data set
	for (i = 0; i < 12; i += 0.5) {
		d2.push([i, Math.sin(i)]);
	}
	// Draw Graph
	graph = Flotr.draw(container, [d1, d2], {
		xaxis: {
			minorTickFreq: 4
		},
		//yaxis : {	max : 2, min : -2 },
		grid: {
			minorVerticalLines: true
		}
	});
})(document.getElementById("container"));*/


/*(function mouse_zoom(container) {

	var
		d1 = [],
		d2 = [],
		d3 = [],
		options, graph, i;

	for (i = 0; i < 40; i += 0.5) {
		d1.push([i, Math.sin(i) + 3 * Math.cos(i)]);
		d2.push([i, Math.pow(1.1, i)]);
		d3.push([i, 40 - i + Math.random() * 10]);
	}

	options = {
		selection: {
			mode: 'x',
			fps: 30
		},
		title: 'Mouse Zoom'
	};

	// Draw graph with default options, overwriting with passed options


	function drawGraph(opts) {

		// Clone the options, so the 'options' variable always keeps intact.
		var o = Flotr._.extend(Flotr._.clone(options), opts || {});

		// Return a new graph.
		return Flotr.draw(
			container, [d1, d2, d3], o);
	}

	// Actually draw the graph.
	graph = drawGraph();

	// Hook into the 'flotr:select' event.
	Flotr.EventAdapter.observe(container, 'flotr:select', function(area) {

		// Draw graph with new area
		graph = drawGraph({
			xaxis: {
				min: area.x1,
				max: area.x2
			},
			yaxis: {
				min: area.y1,
				max: area.y2
			}
		});
	});

	// When graph is clicked, draw the graph with default area.
	Flotr.EventAdapter.observe(container, 'flotr:click', function() {
		drawGraph();
	});
})(document.getElementById("container"));*/

/**
 * Highcharts
 */
//$(function () {
function drawVibroHighChart(series) {
	$('#container').highcharts({
		chart: {
			type: 'spline'
			,zoomType: 'x'
		},
		title: {
			text: 'Vibration'
		},
		/*subtitle: {
			text: 'Irregular time data in Highcharts JS'
		},*/
		xAxis: {
			type: 'datetime'
			,dateTimeLabelFormats: { // don't display the dummy year
				month: '%e. %b',
				year: '%b'
			}
			/*title: {
				text: 'Date&Time'
			}*/
		},
		yAxis: {
			title: {
				text: 'Acceleration, m2/s'
			}
			//,min: 0
		},
		tooltip: {
			headerFormat: '<b>{series.name}</b><br>',
			pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
		},

		series: series
	});
}//});

function vibroPackets2HCSeries(packets){
	const STEP_MS = 50;

	// структура данных HighChart
	var series = [{
		name: 'Vertical axis',
		data: []
	}];

	var lend32 = packets[0].data32.length; //у всех равна
	for (var i= 0, len=packets.length; i<len; i++) {
		var ts = new Date(packets[i].timestamp_ms.date);
		for (var j= 0; j<lend32; j++) {
			var k = i*lend32+j;
			series[0].data[k] = [
				//ts.setMilliseconds(ts.getMilliseconds + STEP_MS*j),
				//k,
				new Date(ts.getTime() + 50*k),
				packets[i].data32[j] / 100
			];
		}
	}
	return series;
}

drawVibroHighChart(	[{
	name: 'Vertical axis',
	data: []
}]);
	/*[{
	name: 'Winter 2007-2008',
	// Define the data points. All series have a dummy year
	// of 1970/71 in order to be compared on the same x axis. Note
	// that in JavaScript, months start at 0 for January, 1 for February etc.
	data: [
		[Date.UTC(1970,  9, 27), 0   ],
		[Date.UTC(1970, 10, 10), 0.6 ],
		[Date.UTC(1970, 10, 18), 0.7 ],
		[Date.UTC(1970, 11,  2), 0.8 ],
		[Date.UTC(1970, 11,  9), 0.6 ],
		[Date.UTC(1970, 11, 16), 0.6 ],
		[Date.UTC(1970, 11, 28), 0.67],
		[Date.UTC(1971,  0,  1), 0.81],
		[Date.UTC(1971,  0,  8), 0.78],
		[Date.UTC(1971,  0, 12), 0.98],
		[Date.UTC(1971,  0, 27), 1.84],
		[Date.UTC(1971,  1, 10), 1.80],
		[Date.UTC(1971,  1, 18), 1.80],
		[Date.UTC(1971,  1, 24), 1.92],
		[Date.UTC(1971,  2,  4), 2.49],
		[Date.UTC(1971,  2, 11), 2.79],
		[Date.UTC(1971,  2, 15), 2.73],
		[Date.UTC(1971,  2, 25), 2.61],
		[Date.UTC(1971,  3,  2), 2.76],
		[Date.UTC(1971,  3,  6), 2.82],
		[Date.UTC(1971,  3, 13), 2.8 ],
		[Date.UTC(1971,  4,  3), 2.1 ],
		[Date.UTC(1971,  4, 26), 1.1 ],
		[Date.UTC(1971,  5,  9), 0.25],
		[Date.UTC(1971,  5, 12), 0   ]
	]
}, {
	name: 'Winter 2008-2009',
	data: [
		[Date.UTC(1970,  9, 18), 0   ],
		[Date.UTC(1970,  9, 26), 0.2 ],
		[Date.UTC(1970, 11,  1), 0.47],
		[Date.UTC(1970, 11, 11), 0.55],
		[Date.UTC(1970, 11, 25), 1.38],
		[Date.UTC(1971,  0,  8), 1.38],
		[Date.UTC(1971,  0, 15), 1.38],
		[Date.UTC(1971,  1,  1), 1.38],
		[Date.UTC(1971,  1,  8), 1.48],
		[Date.UTC(1971,  1, 21), 1.5 ],
		[Date.UTC(1971,  2, 12), 1.89],
		[Date.UTC(1971,  2, 25), 2.0 ],
		[Date.UTC(1971,  3,  4), 1.94],
		[Date.UTC(1971,  3,  9), 1.91],
		[Date.UTC(1971,  3, 13), 1.75],
		[Date.UTC(1971,  3, 19), 1.6 ],
		[Date.UTC(1971,  4, 25), 0.6 ],
		[Date.UTC(1971,  4, 31), 0.35],
		[Date.UTC(1971,  5,  7), 0   ]
	]
}, {
	name: 'Winter 2009-2010',
	data: [
		[Date.UTC(1970,  9,  9), 0   ],
		[Date.UTC(1970,  9, 14), 0.15],
		[Date.UTC(1970, 10, 28), 0.35],
		[Date.UTC(1970, 11, 12), 0.46],
		[Date.UTC(1971,  0,  1), 0.59],
		[Date.UTC(1971,  0, 24), 0.58],
		[Date.UTC(1971,  1,  1), 0.62],
		[Date.UTC(1971,  1,  7), 0.65],
		[Date.UTC(1971,  1, 23), 0.77],
		[Date.UTC(1971,  2,  8), 0.77],
		[Date.UTC(1971,  2, 14), 0.79],
		[Date.UTC(1971,  2, 24), 0.86],
		[Date.UTC(1971,  3,  4), 0.8 ],
		[Date.UTC(1971,  3, 18), 0.94],
		[Date.UTC(1971,  3, 24), 0.9 ],
		[Date.UTC(1971,  4, 16), 0.39],
		[Date.UTC(1971,  4, 21), 0   ]
	]
}]);*/