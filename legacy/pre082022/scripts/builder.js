function ShowHide(id)
{
   var input = document.getElementById(id);
   var button = document.getElementById("showhide_"+id);
   if (input.type == "password")
   {
   	input.type = "text";
   	button.innerHTML = "Hide";
   }
   else
   {
   	input.type = "password";
   	button.innerHTML = "Show";
   }
}
function MakeShowHide(id)
{
  eval("var fin = function() {var input = document.getElementById('"+id+"');if (input && input.type == 'password') document.getElementById('showhide_"+id+"').innerHTML = 'Show';}");
  addOnLoad(fin);
  document.write('<button id="showhide_' + id + '" onclick="delayTimeout();ShowHide(\'' + id + '\')" >Hide</button>');
}
var passwordOutputs = [];
function MakePasswordOutput(id, passwordgetter)
{
	passwordOutputs.push(id);
	eval('passwordgetter_' + id + ' = passwordgetter');
	document.write('<div>');
	document.write('<button onclick="delayTimeout();GeneratePassword(\'' + id + '\', passwordgetter_' + id + ')" >Generate!</button>&nbsp;');
	MakeShowHide('input_' + id);
	var readonlyAttrString = !passwordEditing ? 'readOnly="true" ' : '';
	document.write('<input class="password-output" id="input_' + id + '" ' + readonlyAttrString + 'type="password"></input>');
	document.write('<button onclick="delayTimeout();CopyToClipboard(\'' + id + '\')">Copy</button>');
	document.write('<input id="trick_'+id+'" style="width:1px;visibility:hidden" readOnly="true" type="text" onKeyUp="CopyTrickEnd(\'' + id + '\', event)" onblur="CopyTrickEnd(\'' + id + '\', null)"></input>');
	document.write('</div>');
}