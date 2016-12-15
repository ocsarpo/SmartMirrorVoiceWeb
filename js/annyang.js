var i = 0;
var badtalk = false;
var m;
if (annyang) {
	// Let's define our first command. First the text we expect, and then the
	// function it should call
	var commands = {
		'*term 정류장' : function(tag) {
			if ($("#youtube").css("display") == "none") {
			} else {
				$('#lpack').slideUp("slow", function() {
					stopVideo();
					console.log('complete');
				});
			}
			$('#greeting').slideUp('slow');
			$('#question').slideUp('slow');
			$('#gMap').slideDown('slow', function() {
				initMap();
			});
			removeStation();
			tag = tag.replace(/\s/gi, '');
			var data = {};
			data.stNm = tag;

			$.ajax({
				type : 'POST',
				contentType : 'application/json',
				data : JSON.stringify(data),
				url : 'http://127.0.0.1:3000/station',
				success : function(data) {
					console.log('success');
					var mydata = JSON.parse(data);
					$.each(mydata.ServiceResult.msgBody[0].itemList, function(
							i, d) {
						addBusPoint(d["arsId"], d["stId"], d["stNm"], d["tmX"],
								d["tmY"]);
					});
					dropMarker();
				}
			});
		},
		"*term 정보" : function(tag) {
			tag = tag.replace(/\s/gi, '');
			console.log(tag);
			stationInfo(tag);
		},
		"지도 사이즈 *term" : function(tag) {
			zoomNum(tag);
		},
		"지도 *term" : function(tag) {
			if (tag == "확대")
				zoomIn();
			else if (tag == "축소")
				zoomOut();
			else if (tag == "위로")
				moveCenter('u');
			else if (tag == "아래로")
				moveCenter('d');
			else if (tag == "오른쪽으로")
				moveCenter('r');
			else if (tag == "왼쪽으로")
				moveCenter('l');
			else if (tag == "줌 크기") {
				responsiveVoice.speak("현재 지도의 줌 크기는," + getZoom() + ", 입니다.",
						"Korean Female");
				$('#result2').html("현재 지도의 줌 크기는 " + getZoom() + "입니다.");
			}
		},
		'*term 동영상 재생' : function(tag) {
			$('#greeting').slideUp("slow");
			$('#question').slideUp('slow');
			$('#gMap').slideUp('slow');
			showVideo(tag);
			// showVideo(tag);
		},
		'동영상 *term' : function(tag) {
			if (tag == "그만" || tag == "정지") {
				console.log('sdfkjhdasfg');
				stopVideo();
			} else if (tag == "재생" || tag == "시작" || tag == "플레이")
				playVideo();
			else if (tag == "일시정지" || tag == "멈춰")
				pauseVideo();
		},
		'*term초 뒤로' : function(tag) {
			seekTo(tag * -1);
		},
		'*term초 앞으로' : function(tag) {
			seekTo(tag * 1);
		},
		'다음 *term' : function(tag) {
			if (tag == "동영상")
				nextVideo();
			else if (tag == "곡")
				mpNext();
		},
		'이전 *term' : function(tag) {
			if (tag == "동영상")
				previousVideo();
			else if (tag == "곡")
				mpPrev();
		},
		'동영상 *term' : function(tag) {
			if (tag == "그만" || tag == "정지")
				stopVideo();
			else if (tag == "재생" || tag == "시작" || tag == "플레이")
				playVideo();
			else if (tag == "일시정지" || tag == "멈춰")
				pauseVideo();
		},
		/* 페이지 전환 */
		'옷(장)(짱)' : function() {
			parent.bottom.location = "./webcam.html";
		},
		'음악 *term' : function(tag) {
			if (tag == "재생" || tag == "틀어")
				// parent.result.location = "./mp3_player.html";
				mp3Show();
			else if (tag == "꺼" || tag == "정지")
				// parent.result.location = "./voiceResult.html";
				resultShow();
			else if (tag == "일시정지")
				mpPause();
			else if (tag == "다시 재생")
				mpRestart();			
			else if (tag == "새로고침") {
				mpStop();
				getAudio();
			}
		},
		'*term 음악 삭제' : function(tag){
			mpStop();
			tag = tag.replace(/\s/gi, '');
			deleteAudio(tag);
		}
		,
		'가사' : function(tag) {
			showLyrics();
		},
		'홈으로' : function() {
			if ($("#youtube").css("display") == "none") {
			} else {
				$('#lpack').slideUp("slow", function() {
					stopVideo();
					console.log('complete');
				});
			}
			$('#greeting').slideDown('slow');
			$('#question').slideUp('slow');
			$('#gMap').slideUp('slow');
			resultShow();
		},
		/* 상호작용 */
		'안녕' : function() {
			m = greetResponse();
			responsiveVoice.speak(m, "Korean Female");
			$('#result2').html(m);
		},
		'몇 살이(야)(니)' : function() {
			m = oldResponse();
			responsiveVoice.speak(m, "Korean Female");
			$('#result2').html(m);
		},
		'지금 몇 시(야)' : function() {
			responsiveVoice.speak(whatTimeIsIt(), "Korean Female");
			$('#result2').html(whatTimeIsIt());
		},
		'사용 가능한 질문' : function() {
			if ($("#youtube").css("display") == "none") {
			} else {
				$('#lpack').slideUp("slow", function() {
					stopVideo();
					console.log('complete');
				});
			}
			$('#greeting').slideUp('slow');
			$('#gMap').slideUp('slow');
			$('#question').slideDown('slow');
		},
		'*term 날짜 (말해 줘)' : function(tag) {
			if (tag == "오늘" || tag == "") {
				responsiveVoice.speak(whatDay(true), "Korean Female");
				$('#result2').html(whatDay(true));
			}
		},
		'사라져' : function() {
			m = byeResponse();
			responsiveVoice.speak(m, "Korean Female");
			$('#result2').html(m);
			$('#mirror').slideUp('slow');
			mpStop();
		},
		'돌아와' : function() {
			m = returnResponse();
			responsiveVoice.speak(m, "Korean Female");
			$('#result2').html(m);
			$('#mirror').slideDown('slow');
		},
		'*allSpeech' : function(tag) {
			if (findBadword(tag)) {
				m = "욕 하지마세요! " + tag + "!";
				$("#greeting").html(".\\/. 욕하디망 <br/>" + tag);
				badtalk = true;
			} else if (tag == "메롱")
				m = "놀리지마세요! " + tag + "!";
			else
				m = errorResponse();
			responsiveVoice.speak(m, "Korean Female");
			$('#result2').html(m);
		},
	};

	annyang.addCallback('resultMatch',
			function(userSaid, commandText, phrases) {
				console.log(userSaid); // sample output: 'hello'
				console.log(commandText); // sample output: 'hello
				// (there)'
				console.log(phrases); // sample output: ['hello',
				// 'halo',
				// 'yellow', 'polo', 'hello kitty']
				$('#result').html(userSaid);
				if (!findBadword(userSaid) && badtalk) {
					getGreeting();
					badtalk = false;
				}
			});
	// annyang.debug();
	annyang.setLanguage("ko");
	// Add our commands to annyang
	annyang.addCommands(commands);

	// Start listening. You can call this here, or attach this call to an event,
	// button, etc.
	annyang.start();
}