
queueOnMouseDetect = [];
mousedetected = false;
function addOnMouseDetect(callback) {
    if(!mousedetected) queueOnMouseDetect.push(callback);
    else callback();
}
queueOnMouseGiveup = [];
mousegiveup = false;
function addOnMouseGiveup(callback) {
    if(!mousegiveup) queueOnMouseGiveup.push(callback);
    else callback();
}

mousemovecount = -15;
nomouserate = -15;
var lastmousemoveX = -1;
var lastmousemoveY = -1;
document.onmousemove = function(e) {
    if (mousemovecount > 0)
    {
    	mousedetected = true;
	document.onmousemove = null;
	document.onmousedown = null;    
	for(var i = 0; i < queueOnMouseDetect.length; i++)
    	{
	   queueOnMouseDetect[i]();
    	}
    	queueOnMouseDetect = [];
    }
    else
    {
    	if (e.clientX == lastmousemoveX && e.clientY == lastmousemoveY)
    		mousemovecount--;
    	else if (Math.abs(e.clientX - lastmousemoveX) < 2 && Math.abs(e.clientY - lastmousemoveY) < 2)
    		mousemovecount += 3;
    	else mousemovecount++;
    	lastmousemoveX = e.clientX;
    	lastmousemoveY = e.clientY;
    }
}
document.onmousedown = function(e) {
    nomouserate -= 5;
    mousemovecount = nomouserate;
    if (nomouserate < -100)
    {
    	mousegiveup = true;
    	document.onmousemove = null;
    	document.onmousedown = null;
	for(var i = 0; i < queueOnMouseGiveup.length; i++)
    	{
	   queueOnMouseGiveup[i]();
    	}
    	queueOnMouseGiveup = [];
    }
}
