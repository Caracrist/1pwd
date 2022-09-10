var timeoutToClear = 600000;
var clearOnTimeoutSet = null;
passwordEditing = false;
generating = {};
var clearOnTimeout = function() {
	var timeleft = parseInt(document.getElementById('timeouttoclear').innerHTML);
	timeleft = timeleft - 1;
	if (timeleft === 0) {
		timeleft = timeoutToClear / 60000;
		var fullMap = buildFullFormMap();
		if (isLocalStorageEnabled() && getLocalStorageForms().getFullForm(fullMap.get('domain'), fullMap.get('user'))) {
        	document.getElementById('password').value = '';
        	document.getElementById('password_confirm').value = '';
	        ValidatePassword(true);
    		appendLastAction('Password cleared by timeout');
		} else {
    		Reset();
    		appendLastAction('All cleared by timeout');
		}
	}
	clearOnTimeoutSet = setTimeout(clearOnTimeout, 60000);
	document.getElementById('timeouttoclear').innerHTML = timeleft+'';
};
panic = function (message) {
    panic = function(){};
    clearOnTimeout = function(){};
    Reset();
    var body = document.getElementsByTagName('body')[0];
    body.className = 'panic-class';
    var pathname = (document.location.protocol == 'file:') ? '' : document.location.pathname;
    body.innerHTML = 'Error!!!<br><br>' + message + '<br><br>Disable the translation or other page modifiers and reload it from <a href="https://1pwd.org'+pathname+'">https://1pwd.org'+pathname+'</a>';
}
function detectIntervention() {
    if (document.location.protocol != 'file:' && document.location.protocol != 'https:' ) {
        panic('The page is loaded from unsecured location with a protocol ' + document.location.protocol);
        return;
    }
    if (document.location.protocol == 'https:' && document.location.origin != 'https://1pwd.org') {
        panic('The page is loaded from unsecured location with an origin: ' + document.location.origin);
        return;
    }
    var html = document.getElementsByTagName('html')[0];
    if (html.classList.length > 0) {
        panic('The page was modified by the browser. Added html class name: ' + html.classList[0] + ' detected.<br>This may indicate a <b>critical security breach</b>.<br>Most browsers will send all your passwords to their server in such mode.');
        return;
    }
}
function delayTimeout() {
    detectIntervention();
	if (clearOnTimeoutSet && document.getElementById('timeouttoclear')) {
		document.getElementById('timeouttoclear').innerHTML = timeoutToClear / 60000;
	}
}
function Reset() {
	document.getElementById('domain').value = '';
	document.getElementById('user').value = '';
	document.getElementById('password').value = '';
	document.getElementById('password_confirm').value = '';
	document.getElementById('secret').value = '';
	document.getElementById('revision').value = '1';
	ValidatePassword(true);
	appendLastAction('All cleared');
}
function buildFullFormMap() {
    var result = new Map();
    var input = null;
    input = document.getElementById('domain');
    if (input.value.length > 0)
        result.set('domain', input.value);
        
    input = document.getElementById('user');
    if (input.value.length > 0)
        result.set('user', input.value);
        
    input = document.getElementById('revision');
    if (input.value.length > 0 && input.value != '1')
        result.set('revision', input.value);
        
    input = document.getElementById('secret');
    if (input.value.length > 0) {
        if (document.getElementById('showhide_secret').innerText == 'Hide') {
            result.set('secret', input.value);
        }
    }
    
    var generatingkeys = [];
    Object.keys(generating).forEach(key => {
        if (generating[key]) {
            if (key == 'Policy_N') {
                var select = document.getElementById('policyPwdLengthOption');
                generatingkeys.push('Policy_' + select.value);
            } else {
                generatingkeys.push(key);
            }
        }
    });
    var generateText = '';
    
    if (generatingkeys.length > 0) {
        result.set('generate', generatingkeys.join(','));
    }
    return result;
}

function CopyFormUrl() {
    var fullFormMap = buildFullFormMap();
    var result = buildUrlFromFormMap(fullFormMap);
    
    var generateText = '';
    if (fullFormMap.has('generate')) {
        generateText = ' Including password selection.'
    }
    CopyTextToClipboard(result);
    var secretText = '';
    if (document.getElementById('secret').value.length > 0) {
        if (withSecret)
            secretText = ' Uncluding The Secret.';
        else
            secretText = ' Without The Secret.'
    }
    appendLastAction('Form URL copied to clipboard.' + secretText + generateText);
}
function AlertSelf(img) {
 alert(img.title);
}
function ValidateNoSpaces(input) {
  var input_comm = document.getElementById(input.id+'_comment');
  if (input.length === 0) {
   input_comm.innerHTML = '';
   return;
  }
  var spaces = (input.value.replace(' ', '').replace('\t','') != input.value);
  var cases = (input.value.toLowerCase() != input.value);
  input_comm.innerHTML = '';
  if (!spaces && !cases) {
   return;
  }
  if (spaces) {  
   input_comm.innerHTML += '<img src="images/warn.png" onclick="AlertSelf(this)" title="Field contains Spaces or Tabs. Invisible characters are used for password generating as well. Make sure they are here not by mistake."></img>';
  }
  if (cases) {
   input_comm.innerHTML += '<img src="images/warn.png" onclick="AlertSelf(this)" title="Field contains Upper cased characters. Characters are case sensitive for password generating. Make sure it is not a mistake."></img>';
  }
}

function ValidatePassword(calc) {
    if (window.ValidatePasswordCalcTimeout) {
        clearTimeout(window.ValidatePasswordCalcTimeout);
    }
    var pass = document.getElementById('password');
    var pass_conf = document.getElementById('password_confirm');
    var out = document.getElementById('output');
    var pass_conf_comm = document.getElementById('password_confirm_comment');
    if (pass.value.length === 0 || pass.value != pass_conf.value) {
        out.style.display = 'none';
        if (pass.value.length > 0 || pass_conf.value.length > 0 ) {
        	pass_conf_comm.innerHTML = '<img src="images/no.png" onclick="AlertSelf(this)" title="Password does not match"></img>';
        } else {
        	pass_conf_comm.innerHTML = '';
        }
    } else {
        GeneratePasswords();
        if (out.style.display != 'block') appendLastAction('Password confirmed');
        out.style.display = 'block';
        pass_conf_comm.innerHTML = '<img src="images/ok.png" onclick="AlertSelf(this)" title="Password confirmed"></img>';
        calc = true;
    }
    if (calc) {
        ValidatePasswordCalc();
    } else {
        window.ValidatePasswordCalcTimeout = setTimeout(ValidatePasswordCalc, 2000);
    }
    detectIntervention();
}
function ValidatePasswordCalc() {
  var pass = document.getElementById('password');
  var pass_comm = document.getElementById('password_comment');
  var ps = CalcPasswordStrength(pass.value);
  var c = '';
  if (ps > 30) {    	
    var h=CryptoJS.SHA3(pass.value,{outputLength: 256});
    var ch = h.toString(CryptoJS.enc.Hex);
    c = '#' + ch.substr(0,1) + '0' + ch.substr(1,1) + '0' + ch.substr(2,1) + '0';
  }
  if (ps > 60) {
    pass_comm.innerHTML = '<span style="background-color:'+c+'">' + ps +'</span>&nbsp;<img src="images/ok.png" onclick="AlertSelf(this)" title="Good password"></img>';    
  } else {
    if (pass.value.length > 0) {
    	pass_comm.innerHTML = '<span style="background-color:'+c+'">' + ps + '</span>&nbsp;<img src="images/warn.png" onclick="AlertSelf(this)" title="Password is too weak!"></img>';
    } else {
      	pass_comm.innerHTML = '';
    }
  }
}
function ValidateRevision(input) {
  for(var i=0; i< input.value.length;i++) {
     if (input.value.charAt(i) < '0' || input.value.charAt(i) > '9' || (i === 0 && input.value.charAt(i) == '0')) {
        input.value = input.value.substr(0, i) + input.value.substr(i+1);
        i--;
     }
  }
  if (input.value > 99999)
    input.value = '99999';
}
function GeneratePasswords() {
    var copyButtons = document.getElementsByClassName('input-copy-button');
    for(var i=0; i< copyButtons.length;i++) {
        copyButtons[i].style.visibility = 'hidden';
    }
    Object.keys(generating).forEach(id => {
        if (generating[id]) {
            var copyButton = document.getElementById('input_copy_'+id);
            copyButton.style.visibility = 'visible';
            GeneratePassword(id, generating[id]);
        }
    });
}
function BeginEndGeneratePassword(id, passwordgetter) {
   var button = document.getElementById('generate_button_'+id);
   var copyButton = document.getElementById('input_copy_'+id);
   if (button.innerHTML == 'Generate!') {
       GeneratePassword(id, passwordgetter);
       generating[id] = passwordgetter;
       button.innerHTML = 'Cancel';
       copyButton.style.visibility = 'visible';
   } else {
       delete generating[id];
       var input = document.getElementById('input_'+id);
       input.value = '';
       button.innerHTML = 'Generate!';
       appendLastAction('Password generating canceled for ' + id);
       copyButton.style.visibility = 'hidden';
   }
}
function GeneratePassword(id, passwordgetter) {
   var input = document.getElementById('input_'+id);
   input.value = passwordgetter();
   appendLastAction('Password generated');
}
function clearPasswords() {
	var c = false;
	for(var i = 0; i < passwordOutputs.length; i++) {
        if (generating[passwordOutputs[i]])
            continue;
	   var e = document.getElementById('input_'+passwordOutputs[i]);
	   c = c || e.value.length > 0;
	   e.value = '';	   
    }
    if (c)
        appendLastAction('Cleared generated passwords');
        
    GeneratePasswords();
}
function stopGeneratePasswords() {
    generating = {};
    var buttons = document.getElementsByClassName('generate-button');
    for(var i =0; i< buttons.length; i++) {
        buttons[i].innerHTML = 'Generate!';
    }
    clearPasswords();
}

function autoclearChanged(input) {
	document.getElementById('timeouttoclear').innerHTML = timeoutToClear / 60000;
	if (input.checked) {
		clearOnTimeoutSet = setTimeout(clearOnTimeout, 60000);
		appendLastAction('Enabled automatic form reset');
	} else {
		clearTimeout(clearOnTimeoutSet);
		clearOnTimeoutSet = null;
		appendLastAction('Disabled automatic form reset');
	}
}
function localStorageOperationChange() {
    var button = document.getElementById('local_storage_operation_button');
    var select = document.getElementById('local_storage_operation_select');
    var operation = select.value;
    button.innerHTML = operation;
	appendLastAction('Local Storage operation selected: ' + operation);
}
function localStorageExportWarning() {
    var img = document.getElementById('localstorage_cb_warn_img');
    if (!isLocalStorageSupported()) {
        img.style.visibility = 'hidden';
        return;
    } 
    var exportTime = getLocalStorageExportTime();
    var updateTime = getLocalStorageUpdateTime();

    if (getLocalStorageForms() && (getLocalStorageForms().getDomains().length > 0)) {
        if (!isLocalStorageEnabled()) {
            img.style.visibility = 'visible';
            img.title = 'WARNING: Local Storage is not empty, but disabled!';
            return;
        }
        if (!exportTime && updateTime) {
            img.style.visibility = 'visible';
    		img.title = 'WARNING: Local Storage Never Exported!';
    		return;
        }
        if (exportTime && updateTime && (exportTime < updateTime)) {
            img.style.visibility = 'visible';
            img.title = 'WARNING: Did not export since last update!\nLast update: ' + updateTime + '\nLast export: ' + exportTime;
            return;
        }
    }
    img.style.visibility = 'hidden';
}
function updateStorageOperationItems() {
    var button = document.getElementById('local_storage_operation_button');
    button.disabled = !isLocalStorageEnabled();
    localStorageExportWarning();
}
function localStorageChanged(input) {
    if (input.checked) {
        localStorage.setItem('enabled', true);
		appendLastAction('Local Storage enabled.');
    } else {
        localStorage.setItem('enabled', false);
		appendLastAction('Local Storage disabled.');
    }
    updateStorageOperationItems();
}
function clipboardChanged(input) {
	var elements = document.getElementsByClassName('clipboard-trick');
	if (input.checked) {
		for (var i in elements) {
			if (elements[i].style)
			    elements[i].style.visibility = 'visible';
		}
		appendLastAction('Enabled copy to clipboard trick');
	} else {
		for (var i in elements) {
			if (elements[i].style)
			elements[i].style.visibility = 'hidden';
		}
		appendLastAction('Disabled copy to clipboard trick');
	}
}
function editingChanged(input) {
	if (input.checked) {
		passwordEditing = true;
		var elements = document.getElementsByClassName('password-output');
		for (var i in elements) {
			elements[i].readOnly = false;
		}
		appendLastAction('Enabled editing in generated passwords');
	} else {
		passwordEditing = false;
		var elements = document.getElementsByClassName('password-output');
		for (var i in elements) {
			elements[i].readOnly = true;
		}
		appendLastAction('Disabled editing in generated passwords');	
	}
}

function selectBody(next) {
    if (inDialog) {
        backFromLocalStorage(inDialog, true);
    }
	var prev = document.getElementsByClassName('selected-menu-item')[0];
	if (prev == next) return;
	appendLastAction('Selected menu: ' + next.innerHTML);
	prev.className = prev.className.replace(' selected-menu-item', '');
	next.className += ' selected-menu-item';
	var prevItem = document.getElementById(prev.id.replace('menu-','body-'));
	var nextItem = document.getElementById(next.id.replace('menu-','body-'));
	prevItem.style.display = 'none';
	nextItem.style.display = 'block';
}
function sendFeedback() {
    var textElement = document.getElementById('feedback-text');
    var emailElement = document.getElementById('feedback-email');
    var text = textElement.value;
    var email = emailElement.value;
    if (text.length < 2)
        return;
    var theUrl = window.location.href.split('?')[0] + 'feedback.php';
    theUrl = theUrl + '?email='+encodeURIComponent(email);
    theUrl = theUrl + '&text='+encodeURIComponent(text);
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', theUrl, false );
	try {
    xmlHttp.send(null);
		if (xmlHttp.status >= 200 &&  xmlHttp.status < 300) {
			textElement.value = '';
			emailElement.value = '';
			appendLastAction('Feedback sent.');
		} else {
			throw 'HTTP status ' + xmlHttp.status;
		}
	} catch (e) {
		appendLastAction('Feedback send failed with: ' + e);
	}
    updateCharsLeftTotal();
}
function updateCharsLeftTotal() {
    var textElement = document.getElementById('feedback-text');
    var emailElement = document.getElementById('feedback-email');
    var text = textElement.value;
    var email = emailElement.value;
    var theParams = encodeURIComponent(email) + encodeURIComponent(text);
    var leftTotal = 3000 - theParams.length;
    document.getElementById('chars-left-total').innerText = leftTotal;
    var sendButton = document.getElementById('feedback-send-button');
    sendButton.disabled = (text.length < 2 || leftTotal < 0);
}
function setupForm(params) {
	document.getElementById('domain').value = '';
	document.getElementById('user').value = '';
	document.getElementById('secret').value = '';
	document.getElementById('revision').value = '1';
	
    var paramNames = ['domain', 'user', 'secret', 'revision'];
    for (var i =0; i < paramNames.length; i++) {
        var paramName = paramNames[i];
        if (params.has(paramName)) {
            var input = document.getElementById(paramName);
            input.value = params.get(paramName);
            input.onchange();
        }
    }
    stopGeneratePasswords();
    if (params.has('generate')) {
        var generateList = params.get('generate').split(',');
        for (var i = 0; i < generateList.length; i++) {
            var pwdType = generateList[i];
            if (pwdType.startsWith('Policy_')) {
                var button = document.getElementById('generate_button_Policy_N');
                var select = document.getElementById('policyPwdLengthOption');
                var len = pwdType.substring(7);
                select.value = len;
                if (button)
                    button.click();
            } else {
                var button = document.getElementById('generate_button_' + pwdType);
                if (button)
                    button.click();
            }
        }
    }
}

function localStorageOperation(button) {
    var operation = button.innerHTML;
    var opDiv = document.getElementById('local_storage_' + operation);
    var formDiv = document.getElementById('form');
    var checkbox = document.getElementById('localstorage_cb_input');
	formDiv.style.display = 'none';
	formDiv.style.visibility = 'hidden';
	opDiv.style.display = 'block';
	opDiv.style.visibility = 'visible';
	checkbox.disabled = true;
	var dialogDiv =  document.getElementById('local_storage_' + operation + '_dialog');
	dialogBuilder[operation](dialogDiv);
	appendLastAction('Entered Local Storage ' + operation + ' operation dialog.');
}
function backFromLocalStorage(operation, backButton) {
    var opDiv = document.getElementById('local_storage_' + operation);
    var formDiv = document.getElementById('form');
    var checkbox = document.getElementById('localstorage_cb_input');
	opDiv.style.display = 'none';
	opDiv.style.visibility = 'hidden';
	formDiv.style.display = 'block';
	formDiv.style.visibility = 'visible';
	checkbox.disabled = false;
	localStorageExportWarning();
	if (backButton) {
	    appendLastAction('Back from Local Storage ' + operation + ' operation dialog.');
	}
	inDialog = null;
}
function localStorageLoad() {
    var domainSelect = document.getElementById('local_storage_Load_domain_select');
    var userSelect = document.getElementById('local_storage_Load_user_select');
    var domainValue = domainSelect.value;
    var userValue = userSelect.value;
    var formMap = getLocalStorageForms().getFullForm(domainValue, userValue);
    setupForm(formMap);
    GeneratePasswords();
    backFromLocalStorage('Load');
    appendLastAction('Loaded from Local Storage.');
}
function localStorageSave() {
    var noteInput = document.getElementById('local_storage_Save_note');
    var fullMap = buildFullFormMap();
    fullMap.set('note', noteInput.value);
    getLocalStorageForms().setFullForm(fullMap);
    backFromLocalStorage('Save');
    appendLastAction('Saved to Local Storage.');
}
function localStorageExport() {
    var select = document.getElementById('local_storage_Export_select');
    var textarea = document.getElementById('local_storage_Export_text');
    var urlChkBox = document.getElementById('local_storage_Export_url');
    if (select.value == 'JSON') {
        textarea.value = getLocalStorageForms().exportAsJson(urlChkBox.checked);
    } else if (select.value == 'CSV') {
        textarea.value = getLocalStorageForms().exportAsCSV(urlChkBox.checked);
    } else {
        return;
    }
	localStorageExportWarning();
	var copyButton = document.getElementById('local_storage_Export_copy');
	var saveButton = document.getElementById('local_storage_Export_save');
	copyButton.disabled = false;
	saveButton.disabled = false;
    appendLastAction('Local Storage exported as ' + select.value);
}
function localStorageExportCopy() {
    var textarea = document.getElementById('local_storage_Export_text');
    if (CopyTextToClipboard(textarea.value)) {
		appendLastAction('Exported Local Storage copied to clipboard');
	}
}
function localStorageExportSave() {
    var select = document.getElementById('local_storage_Export_select');
    var textarea = document.getElementById('local_storage_Export_text');
    download(textarea.value, '1pwd.org.' + select.value.toLowerCase());
	appendLastAction('Exported Local Storage downloading...');
}
function localStorageImportDrop(ev)
{
    var textarea = document.getElementById('local_storage_Import_text');
    ev.preventDefault();
    if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile();
        file.text().then(function(value) {
            textarea.value = value;
            localStorageImportOnInput();
        });
      }
    });
  }
}
function localStorageImport() {
    var textarea = document.getElementById('local_storage_Import_text');
    var button = document.getElementById('local_storage_Import_button');
    var select = document.getElementById('local_storage_Import_select');
    var format = select.value;
    if (format == 'AUTO') {
        if (textarea.value.match(/\s*\{/)) {
            format = 'JSON';
        } else {
            format = 'CSV';
        }
        select.value = format;
    }
    if (format == 'JSON') {
        getLocalStorageForms().importFromJson(textarea.value);
    } else {
        getLocalStorageForms().importFromCSV(textarea.value);
    }
	appendLastAction('Imported Local Storage from ' + format);
	textarea.value = '';
	localStorageImportOnInput();
}
function localStorageImportOnInput() {
    var textarea = document.getElementById('local_storage_Import_text');
    var button = document.getElementById('local_storage_Import_button');
    if (textarea.value.length > 1) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}
function localStorageManageClear() {
    if (confirm('Are you sure you want to clear Local Storage? This operation is irreversible. All forms data will be lost unless you have exported it and stored in additional location.\n\nPlease confirm deletion of all Forms for all Domains and Users.')) {
        clearLocalStorage();
        backFromLocalStorage('Manage');
        
        var checkbox = document.getElementById('localstorage_cb_input');
        checkbox.checked = false;
        localStorageChanged(checkbox);
	    appendLastAction('Local Storage cleared.');
    }
}
function localStorageDeleteDomain() {
    var domainSelect = document.getElementById('local_storage_Manage_domain_select');
    if (confirm('Are you sure you want to delete Domain "'+domainSelect.value+'" from Local Storage. This operation is irreversible. \n\nPlease confirm deletion of this Domain.')) {
        getLocalStorageForms().deleteDomain(domainSelect.value);
        dialogBuilder.Manage();
	    localStorageExportWarning();
    }
}
function localStorageDeleteUser() {
    var domainSelect = document.getElementById('local_storage_Manage_domain_select');
    var userSelect = document.getElementById('local_storage_Manage_user_select');
    if (confirm('Are you sure you want to delete User "'+userSelect.value+'" in Domain "'+domainSelect.value+'" from Local Storage. This operation is irreversible. \n\nPlease confirm deletion of this User.')) {
        getLocalStorageForms().deleteUser(domainSelect.value, userSelect.value);
        dialogBuilder.Manage();
	    localStorageExportWarning();
    }
}
function localStorageManageNote(button) {
    if (button.innerHTML == 'Edit') {
        button.innerHTML = 'Save';
        dialogBuilder.Manage();
    } else {
        var domainSelect = document.getElementById('local_storage_Manage_domain_select');
        var userSelect = document.getElementById('local_storage_Manage_user_select');
        var fullForm =  getLocalStorageForms().getFullForm(domainSelect.value, userSelect.value);
        if (fullForm) {
            var input = document.getElementById('local_storage_Manage_note_input');
            var note = fullForm.get('note');
            var oldNote = note ? note : '';
            var newNote = input.value;
            if (oldNote != newNote) {
                fullForm.set('note', newNote);
                getLocalStorageForms().setFullForm(fullForm, true);
	            appendLastAction('Updated note saved in Local Storage.');
            }
        }
        button.innerHTML = 'Edit';
        dialogBuilder.Manage();
    }
}