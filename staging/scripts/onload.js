var queueOnLoad = [];
var loaded = false;
function addOnLoad(callback)
{
    if(!loaded) queueOnLoad.push(callback);
    else callback();
}
window.onload = function()
{
    loaded = true;
    for(var i = 0; i < queueOnLoad.length; i++)
    {
        queueOnLoad[i]();
    }
    queueOnLoad = [];
}