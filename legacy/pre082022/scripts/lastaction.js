var timeoutToLastactionClear = 4000;
var lastactionClearSet = null;
function lastactionClear()
{
	document.getElementById("lastaction").innerHTML = "";
}
function appendLastAction(text)
{
	clearTimeout(lastactionClearSet);
	document.getElementById("lastaction").innerHTML = text;
	lastactionClearSet = setTimeout(lastactionClear, timeoutToLastactionClear);
}