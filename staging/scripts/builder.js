function ShowHide(id)
{
   var input = document.getElementById(id);
   var button = document.getElementById('showhide_'+id);
   if (input.type == 'password') {
   	input.type = 'text';
   	button.innerHTML = 'Hide';
   }
   else
   {
   	input.type = 'password';
   	button.innerHTML = 'Show';
   }
}
function MakeShowHide(id) {
  addOnLoad(function() {
      var input = document.getElementById(id);
      if (input && input.type == 'password')
        document.getElementById('showhide_'+id).innerHTML = 'Show';
  });
  document.write('<button class="show_hide_button" id="showhide_' + id + '" onclick="delayTimeout();ShowHide(\'' + id + '\')" >Hide</button>');
}
var passwordOutputs = [];
function MakePasswordOutput(id, passwordgetter) {
	passwordOutputs.push(id);
	window['passwordgetter_' + id] = passwordgetter;
	document.write('<div>');
	document.write('<button id="generate_button_' + id + '" class="generate-button" onclick="delayTimeout();BeginEndGeneratePassword(\'' + id + '\', passwordgetter_' + id + ')" >Generate!</button>&nbsp;');
	MakeShowHide('input_' + id);
	var readonlyAttrString = !passwordEditing ? 'readOnly="true" ' : '';
	document.write('<input class="password-output" id="input_' + id + '" ' + readonlyAttrString + 'type="password"></input>');
	document.write('<button id="input_copy_'+id+'" class="input-copy-button" onclick="delayTimeout();CopyToClipboard(\'' + id + '\')">Copy</button>');
	document.write('<input id="trick_'+id+'" style="width:1px;visibility:hidden" readOnly="true" type="text" onKeyUp="CopyTrickEnd(\'' + id + '\', event)" onblur="CopyTrickEnd(\'' + id + '\', null)"></input>');
	document.write('</div>');
}
var inDialog = null;
dialogBuilder = {
    Load : function(dialogDiv) { 
        inDialog = 'Load';
        var userSelect = document.getElementById('local_storage_Load_user_select');
        var userFilter = document.getElementById('local_storage_Load_user_filter');
        var domainSelect = document.getElementById('local_storage_Load_domain_select');
        var domainFilter = document.getElementById('local_storage_Load_domain_filter');
        var noteDiv = document.getElementById('local_storage_Load_note');
        var loadButton = document.getElementById('local_storage_Load_button');
        var domainPrevValue = domainSelect.options.length > 0 ? domainSelect.value : null;
        
        while (domainSelect.options.length > 0) domainSelect.options.remove(0);
        var domainSelectedIndex = -1;
        var domains = getLocalStorageForms().getDomains();
        for (var i = 0; i < domains.length; i++) {
            if (domains[i].toLowerCase().includes(domainFilter.value.toLowerCase())) {
                var option = document.createElement('option');
                option.value = domains[i];
                option.text = '"' + domains[i] +'"';
                domainSelect.add(option);
                if (option.value == domainPrevValue)
                    domainSelectedIndex = domainSelect.options.length - 1;
            }
        }
        domainSelect.onchange = function() {
            var userPrevValue = userSelect.options.length > 0 ? userSelect.value : null;
            
            while (userSelect.options.length > 0) userSelect.options.remove(0);
            var userSelectedIndex = -1;
            var domainValue = domainSelect.value;
            var users = getLocalStorageForms().getUsers(domainValue);
            for (var i = 0; i < users.length; i++) {
                if (users[i].toLowerCase().includes(userFilter.value.toLowerCase())) {
                    var option = document.createElement('option');
                    option.value = users[i] ;
                    option.text = '"' + users[i] +'"';
                    userSelect.add(option);
                    if (option.value == userPrevValue)
                        userSelectedIndex = userSelect.options.length - 1;
                }
            }
            userSelect.onchange = function() {
                var userData = getLocalStorageForms().getFullForm(domainValue, userSelect.value);
                noteDiv.innerHTML = '';
                if (userData && userData.has('note')) {
                    noteDiv.innerHTML = escapeHtml(userData.get('note'));
                }
            };
            if (userSelect.options.length > 0) {
                loadButton.disabled = false;
                userSelect.selectedIndex =  (userSelectedIndex == -1) ? 0 : userSelectedIndex;
                userSelect.onchange();
            } else {
                noteDiv.innerHTML = '';
                loadButton.disabled = true;
            }
        };
        if (domainSelect.options.length > 0) {
            loadButton.disabled = false;
            domainSelect.selectedIndex = (domainSelectedIndex == -1) ? 0 : domainSelectedIndex;
            domainSelect.onchange();
        } else {
            while (userSelect.options.length > 0) userSelect.options.remove(0);
            userSelect.selectedIndex = -1;
            loadButton.disabled = true;
            noteDiv.innerHTML = '';
        }
    },
    Save : function(dialogDiv) {
        inDialog = 'Save';
        var fromMap = buildFullFormMap();
        var text = '<table>';
        fromMap.forEach(function(value, key, map) {
            text += '<tr><td><b>' + key + ':</b></td><td>' + escapeHtml(value) + '</td></tr>';
        });
        text += '<tr><td><b>note:</b></td><td><input type="text" id="local_storage_Save_note"></td></tr></table>';
        var saveButton = document.getElementById('local_storage_Save_button');
        if (fromMap.size === 0) {
            dialogDiv.innerHTML = 'No form data to save.';
            saveButton.disabled = true;
        } else {
            dialogDiv.innerHTML = text;
            saveButton.disabled = false;
        }
        var userData = getLocalStorageForms().getFullForm(fromMap.has('domain') ? fromMap.get('domain') : '', fromMap.has('user') ? fromMap.get('user') : '');
        if (userData && userData.has('note')) {
            var noteInput = document.getElementById('local_storage_Save_note');
            noteInput.value = userData.get('note');
            noteInput.title = noteInput.value;
            noteInput.oninput = function() {
                noteInput.title = noteInput.value;
            };
        }
    },
    Import : function(dialogDiv) {
        inDialog = 'Import';
        var textarea = document.getElementById('local_storage_Import_text');
        var button = document.getElementById('local_storage_Import_button');
        var select = document.getElementById('local_storage_Import_select');
        select.selectedIndex = 0;
        textarea.value = '';
        button.disabled = true;
        
    },
    Export : function(dialogDiv) {
        inDialog = 'Export';
        var textarea = document.getElementById('local_storage_Export_text');
    	var copyButton = document.getElementById('local_storage_Export_copy');
    	var saveButton = document.getElementById('local_storage_Export_save');
    	textarea.value = '';
    	copyButton.disabled = true;
    	saveButton.disabled = true;
    },
    Manage : function(dialogDiv) {
        inDialog = 'Manage';
        var domainSelect = document.getElementById('local_storage_Manage_domain_select');
        var userSelect = document.getElementById('local_storage_Manage_user_select');
        var domainFilter = document.getElementById('local_storage_Manage_domain_filter');
        var userFilter = document.getElementById('local_storage_Manage_user_filter');
        var noteDiv = document.getElementById('local_storage_Manage_note');
        var modifiedDiv = document.getElementById('local_storage_Manage_modified');
        var button = document.getElementById('local_storage_Manage_note_button');
        var domainPrevValue = domainSelect.options.length > 0 ? domainSelect.value : null;
        var setNoteText = null;
        if (button.innerHTML == 'Edit') {
            setNoteText = function(text) {
                noteDiv.innerHTML = escapeHtml(text);
            };
        } else {
            setNoteText = function(text) {
                noteDiv.innerHTML = '<input id="local_storage_Manage_note_input" style="width:300px">';
                var input = document.getElementById('local_storage_Manage_note_input');
                input.value = text;
                input.title = text;
                input.oninput = function() {
                    input.title = input.value;
                }
            };
        }
        
        while (domainSelect.options.length > 0) domainSelect.options.remove(0); domainSelect.value = '';
        var domainSelectedIndex = -1;
        var domains = getLocalStorageForms().getDomains();
        for (var i = 0; i < domains.length; i++) {
            if (domains[i].toLowerCase().includes(domainFilter.value.toLowerCase())) {
                var option = document.createElement('option');
                option.value = domains[i];
                option.text = '"' + domains[i] +'"';
                domainSelect.add(option);
                if (option.value == domainPrevValue)
                    domainSelectedIndex = domainSelect.options.length - 1;
            }
        }
        domainSelect.onchange = function() {
            domainSelect.title = domainSelect.value;
            var userPrevValue = userSelect.options.length > 0 ? userSelect.value : null;
            
            while (userSelect.options.length > 0) userSelect.options.remove(0); userSelect.value = '';
            var userSelectedIndex = -1;
            var domainValue = domainSelect.value;
            var users = getLocalStorageForms().getUsers(domainValue);
            for (var i = 0; i < users.length; i++) {
                if (users[i].toLowerCase().includes(userFilter.value.toLowerCase())) {
                    var option = document.createElement('option');
                    option.value = users[i] ;
                    option.text = '"' + users[i] +'"';
                    userSelect.add(option);
                    if (option.value == userPrevValue)
                        userSelectedIndex = userSelect.options.length - 1;
                }
            }
            var deleteUserButton = document.getElementById('local_storage_Manage_delete_user');
            if (userSelect.options.length > 0) {
                deleteUserButton.disabled = false;
                userSelect.selectedIndex =  (userSelectedIndex == -1) ? 0 : userSelectedIndex;
                userSelect.onchange();
            } else {
                deleteUserButton.disabled = true;
                setNoteText('');
            }
        }
        userSelect.onchange = function () {
            userSelect.title = userSelect.value;
            var userData = getLocalStorageForms().getFullForm(domainSelect.value, userSelect.value);
            setNoteText('');
            if (userData && userData.has('note')) {
                setNoteText(userData.get('note'));
            }
            if (userData && userData.has('modified')) {
                modifiedDiv.innerHTML = userData.get('modified');
            }
        }
        var deleteDomainButton = document.getElementById('local_storage_Manage_delete_domain');
        if (domainSelect.options.length > 0) {
            deleteDomainButton.disabled = false;
            domainSelect.selectedIndex = (domainSelectedIndex == -1) ? 0 : domainSelectedIndex;
            domainSelect.onchange();
        } else {
            var deleteUserButton = document.getElementById('local_storage_Manage_delete_user');
            while (userSelect.options.length > 0) userSelect.options.remove(0);
            userSelect.selectedIndex = -1;
            deleteDomainButton.disabled = true;
            deleteUserButton.disabled = true;
            setNoteText('');;
        }
    }
};