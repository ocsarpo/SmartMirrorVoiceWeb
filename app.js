var express = require('express'), http = require('http'), path = require('path');
var expressErrorHandler = require('express-error-handler');

var bodyParser = require('body-parser');
var path = require('path');
var exec = require('child_process').exec;
// https://www.npmjs.com/package/jsmediatags
// Simple API - will fetch all tags
var jsmediatags = require("jsmediatags");
var request = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
// http://uiandwe.tistory.com/1002
var urlencode = require('urlencode');
var multer = require('multer');
var key = require('./js/config.js');

console.log(key.getBusKey());
// exec('start chrome 127.0.0.1:3000 -kiosk', function(error, stdout, stderr){
// console.log(stdout);
// });
exec('start chrome 127.0.0.1:3000', function(error, stdout, stderr) {
	console.log(stdout);
});

var _storage = multer.diskStorage({
	// 객체(함수) 사용자가 전송한 파일을 해당 디렉에 저장한다 cb=callback
	destination : function(req, file, cb) {
		// if(파일형식이 이미지면
		// cb(null, 'uploads/images');
		// else if(text면)
		// cb(null, '어디');
		cb(null, 'public/audio')
	},
	// 객체(함수)디렉에 저장할 파일이름을 정한다
	filename : function(req, file, cb) {
		// if( already file exist)
		// cb(null, file.originalname에 동일이름파일중가장큰수끝에추가);
		// else
		// cb(null,file.originalname);
		cb(null, file.originalname);
	}
});
// 업로드한 파일이 dest에 저장된다
var upload = multer({
	storage : _storage
});

var fs = require('fs');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')));
app.use('/img', express.static(path.join(__dirname, 'img')));

app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	fs.readFile('index3.html', function(error, data) {
		res.writeHead(200, {
			'Content-Type' : 'text/html'
		});
		res.end(data);
	});
});

app.post('/station', function(req, res) {
	var data = JSON.stringify(req.body);
	var element = JSON.parse(data);
	var searchName = urlencode(element.stNm);
	
	var url = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByName?serviceKey='+key.getBusKey()+'&stSrch='+searchName+'&numOfRows=999&pageSize=999&pageNo=1&startPage=1';
	
	request({
		url : url,
		method : 'GET'
	}, function(error, response, body) {
		parser.parseString(body, function(err, result) {
			console.dir(JSON.stringify(result));

			res.writeHead(200, {
				'Content-Type' : 'text/html'
			});
			res.write(JSON.stringify(result));
			res.end();
		});
	});
});

app.post('/bus', function(req, res) {
	console.log('enter bus');
	var data = JSON.stringify(req.body);
	var element = JSON.parse(data);
	var searchName = urlencode(element.arsId);
	
	var url = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey='+key.getBusKey()+'&arsId='+searchName+'&numOfRows=999&pageSize=999&pageNo=1&startPage=1';
	
	console.log(searchName);

	request({
		url : url,
		method : 'GET',

	}, function(error, response, body) {
		parser.parseString(body, function(err, result) {
			console.dir(JSON.stringify(result));
			res.writeHead(200, {
				'Content-Type' : 'text/html'
			});
			res.write(JSON.stringify(result));
			res.end();
		});
	});
});
app.post('/audio', function(req, res) {
	console.log('enter audio');
	sendAudioData(res);
});

app.post('/deleteAudio', function(req, res){ 
	
	var data = JSON.stringify(req.body);
	var element = JSON.parse(data);
	var file = element.file;
	console.log(file);
	var localpath = process.cwd();
	var audiopath = localpath + '\\public\\audio\\' + '\"' +file+'\"';
	console.log(audiopath);
	exec('del /q ' + audiopath, function(error, stdout, stderr) {
		if(error){
			console.log('못지웠음')
		}
		console.log(stdout);
		sendAudioData(res);
		console.log("지웠음");
	});
});

var defaultfile = './img/music-player.png';
var dfData;
fs.readFile(defaultfile, function(err, data) {
	dfData = data;
});

function getFileTags(list, res) {
	var audioInfo = new Array();
	list.forEach(function(file) {
		jsmediatags.read("./public/audio/" + file, {
			onSuccess : function(tag) {
				var audioFile = new Object();
				try {
					var buffer = Buffer.from(tag.tags.picture.data);
					audioFile.data = buffer.toString('base64');
					audioFile.lyrics = tag.tags.lyrics.lyrics;
				} catch (err) {
					audioFile.data = dfData.toString('base64');
					audioFile.lyrics = "No lyric!";
				} finally {	
					audioFile.path = './public/audio/' + file;
					audioFile.name = file;
					console.log(file);
					audioInfo.push(audioFile);
				}
			},
			onError : function(error) {
				console.log(':(', error.type, error.info);
			}		
		});	
	});
	setTimeout(function(){
		sendAudioinfo(res, audioInfo);},2000);
}
function sendAudioinfo(res, audioInfo){
	var jsonf = new Object();
	jsonf.audio = audioInfo;
	var audiojson = JSON.stringify(jsonf);
	res.writeHead(200, {
		'Content-Type' : 'text/html'
	});
	res.write(audiojson);
	res.end();
}
function sendAudioData(res){
	var path = './public/audio/';
	var fileList = new Array();
	// http://mudchobo.tistory.com/542
	fs.readdir(path, function(err, files) {
		if (err)
			throw err;
		files.forEach(function(file) {
			fileList.push(file);
		});
		console.log('sendAudioData');
		getFileTags(fileList, res);		
	});	
}

app.post('/process/audio', upload.single('audio'), function(req, res) {
	var files = req.file;

	// 현재 파일정보 저장변수
	var originalname = '', name = '', mimetype = '', size = 0;

	console.log("파일 개수 : 1");
	originalname = files.originalname;
	name = files.filename;
	mimetype = files.mimetype;
	size = files.size;

	console.log('현재 파일 정보 : ' + originalname + ', ' + name + ', ' + mimetype
			+ ', ' + size);

	// 클라 응답 전송
	res.writeHead('200', {
		'Content-Type' : 'text/html;charset=utf8'
	});
	res.write('<h1>파일 업로드 성공</h1>');
	res.write('<hr/>');
	res.write('<p>원본 파일 이름 : ' + originalname + ' -> 저장 파일 이름 : ' + name
			+ '</p>');
	res.write('<p>MIME TYPE : ' + mimetype + '</p>');
	res.write('<p>파일 크기 : ' + size + '</p>');
	res.end();
});


var errorHandler = expressErrorHandler({
	static : {
		'404' : './public/404.html'
	}
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// app.all('*', function(req, res) {
// res.send(404, '<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>')
// });

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
