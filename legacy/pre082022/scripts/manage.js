var timeoutToClear = 600000;
var clearOnTimeoutSet = null;
passwordEditing = false;
var clearOnTimeout = function() {
	var timeleft = parseInt(document.getElementById("timeouttoclear").innerHTML);
	timeleft = timeleft - 1;
	if (timeleft == 0)
	{
		timeleft = timeoutToClear / 60000;
		Reset();
		appendLastAction("All cleared by timeout");
	}
	clearOnTimeoutSet = setTimeout(clearOnTimeout, 60000);
	document.getElementById("timeouttoclear").innerHTML = timeleft+"";
};
function delayTimeout()
{
	if (clearOnTimeoutSet)
	{
		document.getElementById("timeouttoclear").innerHTML = timeoutToClear / 60000;;
	}
}

function Reset()
{
	document.getElementById("domain").value = "";
	document.getElementById("user").value = "";
	document.getElementById("password").value = "";
	document.getElementById("password_confirm").value = "";
	document.getElementById("secret").value = "";
	document.getElementById("seqnum").value = "1";
	ValidatePassword();
	appendLastAction("All cleared");
}
function AlertSelf(img)
{
 alert(img.title);
}
function ValidateNoSpaces(input)
{
  var input_comm = document.getElementById(input.id+"_comment");
  if (input.length == 0)
  {
   input_comm.innerHTML = "";
   return;
  }
  var spaces = (input.value.replace(" ", "").replace("\t","") != input.value);
  var cases = (input.value.toLowerCase() != input.value);
  input_comm.innerHTML = "";
  if (!spaces && !cases)
  {
   return;
  }
  if (spaces)
  {  
   input_comm.innerHTML += "<img src='images/warn.png' onclick='AlertSelf(this)' title=\"Field contains Spaces or Tabs. Invisible characters are used for password generating as well. Make sure they are here not by mistake.\"></img>";
  }
  if (cases)
  {
   input_comm.innerHTML += "<img src='images/warn.png' onclick='AlertSelf(this)' title=\"Field contains Upper cased characters. Characters are case sensitive for password generating. Make sure it is not a mistake.\"></img>";
  }
}
function ValidatePassword()
{
  var pass = document.getElementById("password");
  var pass_conf = document.getElementById("password_confirm");
  var out = document.getElementById("output");
  var pass_conf_comm = document.getElementById("password_confirm_comment");
  var pass_comm = document.getElementById("password_comment");
  if (pass.value.length == 0 || pass.value != pass_conf.value)
  {
    out.style.display = "none";
    if (pass.value.length > 0 || pass_conf.value.length > 0 )
    {
    	pass_conf_comm.innerHTML = "<img src='images/no.png' onclick='AlertSelf(this)' title=\"Password doesn't match\"></img>";
    }
    else
    {
    	pass_conf_comm.innerHTML = "";
    }
  }
  else
  {
    if (out.style.display != "block") appendLastAction("Password confirmed");
    out.style.display = "block";
    pass_conf_comm.innerHTML = "<img src='images/ok.png' onclick='AlertSelf(this)' title=\"Password confirmed\"></img>";
  }
  var ps = CalcPasswordStrength(pass.value);
  var c = "";
  if (ps > 30) {    	
    var h=CryptoJS.SHA3(pass.value,{outputLength: 256});
    var c = h.toString(CryptoJS.enc.Hex);
    c = "#" + c.substr(0,1) + "0" + c.substr(1,1) + "0" + c.substr(2,1) + "0";
  }
  if (ps > 60)
  {
    pass_comm.innerHTML = '<span style="background-color:'+c+'">' + ps +"</span>&nbsp;<img src='images/ok.png' onclick='AlertSelf(this)' title=\"Good password\"></img>";    
  }
  else
  {

    if (pass.value.length > 0)
    {
    	pass_comm.innerHTML = '<span style="background-color:'+c+'">' + ps + "</span>&nbsp;<img src='images/warn.png' onclick='AlertSelf(this)' title=\"Password is too weak!\"></img>";
    }
    else
    {
      	pass_comm.innerHTML = "";
    }
  }
}
function ValidateRevision(input)
{
  for(var i=0; i< input.value.length;i++)
  {
     if (input.value.charAt(i) < '0' || input.value.charAt(i) > '9'
        || (i == 0 && input.value.charAt(i) == '0'))
     {
        input.value = input.value.substr(0, i) + input.value.substr(i+1);
        i--;
     }
  }
  if (input.value > 99999)
    input.value = "99999";
}


function GeneratePassword(id, passwordgetter)
{
   var input = document.getElementById("input_"+id);
   input.value = passwordgetter();
   appendLastAction("Password generated");
}
function clearPasswords()
{
	var c = false;
	for(var i = 0; i < passwordOutputs.length; i++)
    	{
	   var e = document.getElementById("input_"+passwordOutputs[i]);
	   c = c || e.value.length > 0;
	   e.value = "";	   
    	}
    	if (c) appendLastAction("Cleared generated passwords");
}


function autoclearChanged(input)
{
	document.getElementById("timeouttoclear").innerHTML = timeoutToClear / 60000;
	if (input.checked)
	{
		clearOnTimeoutSet = setTimeout(clearOnTimeout, 60000);
		appendLastAction("Enabled automatic form reset");
	}
	else
	{
		clearTimeout(clearOnTimeoutSet);
		clearOnTimeoutSet = null;
		appendLastAction("Disabled automatic form reset");
	}
}
function clipboardChanged(input)
{
	if (input.checked)
	{
		var elements = document.getElementsByClassName("clipboard-trick");
		for (var i in elements) {
			if (elements[i].style)
			elements[i].style.visibility = 'visible';
		}
		appendLastAction("Enabled copy to clipboard trick");
	}
	else
	{
		var elements = document.getElementsByClassName("clipboard-trick");
		for (var i in elements) {
			if (elements[i].style)
			elements[i].style.visibility = 'hidden';
		}
		appendLastAction("Disabled copy to clipboard trick");
	}
}
function editingChanged(input)
{
	if (input.checked)
	{
		passwordEditing = true;
		var elements = document.getElementsByClassName("password-output");
		for (var i in elements) {
			elements[i].readOnly = false;
		}
		appendLastAction("Enabled editing in generated passwords");	}
	else
	{
		passwordEditing = false;
		var elements = document.getElementsByClassName("password-output");
		for (var i in elements) {
			elements[i].readOnly = true;
		}
		appendLastAction("Disabled editing in generated passwords");	
	}
}

function selectBody(next)
{
	var prev = document.getElementsByClassName("selected-menu-item")[0];
	if (prev == next) return;
	appendLastAction("Selected menu: " + next.innerHTML);
	prev.className = prev.className.replace(" selected-menu-item", "");
	next.className += " selected-menu-item";
	var prevItem = document.getElementById(prev.id.replace("menu-","body-"));
	var nextItem = document.getElementById(next.id.replace("menu-","body-"));
	prevItem.style.display = "none";
	nextItem.style.display = "block";
}