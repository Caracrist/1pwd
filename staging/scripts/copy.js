function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;')
         .replace(/ /g, '&nbsp;');
}
function CopyTextareaToClipboard(text) {
  var textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    if (document.execCommand('copy'))
        appendLastAction('Successfully copied to clipboard');
  } catch (e) {
    appendLastAction('Something went wrong with copy: ' + e);
  }
  
  document.body.removeChild(textArea);
}
function CopyTextToClipboard (textToClipboard) {	
	if (window.clipboardData) { // Internet Explorer
		window.clipboardData.setData ('Text', textToClipboard);
		appendLastAction('Successfully copied to clipboard');
		return true;
	}
	if (navigator && navigator.clipboard) {
	    navigator.clipboard.writeText(textToClipboard)
	        .then(function () {
		        appendLastAction('Successfully copied to clipboard');
              })
            .catch(function (e) {
                CopyTextareaToClipboard(textToClipboard);
              });
	    return true;
	}
	return CopyTextareaToClipboard(textToClipboard);
}
function CopyToClipboard(id) {
	var input = document.getElementById('input_'+id);
	if (!CopyTextToClipboard(input.value)) {
		CopyTrickBegin(id);
	}
}
function CopyTrickBegin(id) {
	var input = document.getElementById('input_'+id);
	if (input.value.length == 0) {
		appendLastAction('No password to copy');
		return;
	}
	alert('Submit and copy to clipboard: ENTER, CTRL + C\n\n\tIn Mac OS X:\tENTER, CMD + C');
	appendLastAction('Password copy trick begin');
	var trick = document.getElementById('trick_'+id);

	trick.value = input.value;
	trick.style.visibility = 'visible';
	trick.focus();
	trick.select();
}
function CopyTrickEnd(id, e) {
	if (e && (e.keyCode == 32 || e.keyCode == 13 || e.keyCode == 17)) return;
	if (e && (e.keyCode == 67 || e.keyCode == 99))
		appendLastAction('Password copied to clipboard');
	else 
		alert(e.keyCode);
	var trick = document.getElementById('trick_'+id);
	trick.value = '';
	trick.style.visibility = 'hidden';
	trick.blur();
}

function download(text, filename){
    try {
      var blob = new Blob([text], {type: 'text/plain'});
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) {
        alert(e);
    }
}