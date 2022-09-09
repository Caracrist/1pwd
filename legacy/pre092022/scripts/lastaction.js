var timeoutToLastactionClear = 4000;
var lastactionClearSet = null;
function lastactionClear()
{
	var lastaction = document.getElementById("lastaction");
	if (lastaction)
	    lastaction.innerHTML = "";
}
function appendLastAction(text)
{
	clearTimeout(lastactionClearSet);
	var lastaction = document.getElementById("lastaction");
	if (lastaction)
	    lastaction.innerHTML = text;
	lastactionClearSet = setTimeout(lastactionClear, timeoutToLastactionClear);
}