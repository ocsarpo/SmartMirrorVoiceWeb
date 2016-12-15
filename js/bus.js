function addBusPoint(arsId, stId, stNm, X, Y) {
	addPoint(X, Y, arsId, stNm);
}

function stationInfo(arsId) {
	var data = {};
	data.arsId = arsId;

	$.ajax({
		type : 'POST',
		contentType : 'application/json',
		data : JSON.stringify(data),
		url : 'http://127.0.0.1:3000/bus',
		success : function(data) {
			console.log('success');
			var mydata = JSON.parse(data);
			$.each(mydata.ServiceResult.msgBody[0].itemList, function(i, d) {
				//console.log(d["rtNm"], d["nxtStn"], d["arrmsg1"], d["routeType"], d["stNm"]);
				addBusInfo(d["rtNm"], d["nxtStn"], d["arrmsg1"], d["routeType"], d["stNm"]);
			});
		}
	});
}

function addBusInfo(stNm, rtNm, nxtStn, arrmsg, rType){
	 var div = document.createElement('div');
	 div.innerHTML = stNm + ', ' + rtNm + ', ' + nxtStn+', '+arrmsg+', '+rType;
	 document.getElementById('stoplist').appendChild(div);
	 console.log('hi');
}


function removeStation() {
	var cell = document.getElementById("stoplist");

	while (cell.hasChildNodes()) {
		cell.removeChild(cell.firstChild);
	}
	clearNeighbor();
}