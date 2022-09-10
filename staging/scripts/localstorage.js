function buildUrlFromFormMap(fullFormMap) {
    var result = window.location.href.split('?')[0];
    var params = [];
    if (fullFormMap.has('domain'))
        params.push('domain='+encodeURIComponent(fullFormMap.get('domain')));
    if (fullFormMap.has('user'))
        params.push('user='+encodeURIComponent(fullFormMap.get('user')));
    if (fullFormMap.has('revision'))
        params.push('revision='+encodeURIComponent(fullFormMap.get('revision')));
    var withSecret = false;
    if (fullFormMap.has('secret')) {
        params.push('secret='+encodeURIComponent(fullFormMap.get('secret')));
        withSecret = true;
    }
    
    var generateText = '';
    if (fullFormMap.has('generate')) {
        params.push('generate='+encodeURIComponent(fullFormMap.get('generate')));
    }
    if (params.length > 0) {
        result += ('?' + params.join('&'));
    }
    return result;
}
function isLocalStorageSupported() {
    return !!localStorage;
}
function isLocalStorageEnabled() {
    return isLocalStorageSupported() && localStorage.getItem('enabled') == 'true';
}
function getLocalStorageExportTime() {
    if (!isLocalStorageEnabled())
        return null;
    
    var exportTime = localStorage.getItem('exportTime');
    if (!exportTime)
        return null;
    return new Date(exportTime);
}
function getLocalStorageUpdateTime() {
    var updateTime = localStorage.getItem('updateTime');
    if (!updateTime)
        return null;
    return new Date(updateTime);
}
function getLocalStorageForms() {
    var formsJson = localStorage.getItem('forms');
    if (!formsJson)
        formsJson = '{}';
    var formsVersion = localStorage.getItem('forms version');
    if (!formsVersion)
        formsVersion = currentFormsVersion;
    return new Forms(formsJson, formsVersion);
}
function clearLocalStorage() {
    localStorage.clear();
}
var currentFormsVersion = '01.00.00';
var innerParamNames = ['secret', 'revision', 'generate', 'note', 'modified'];
var fullParamNames = ['domain','user','secret', 'revision', 'generate', 'note', 'modified'];
function Forms(formsJson, formsVersion) {
    this.version = formsVersion;
    if (this.version > currentFormsVersion) {
        throw Error('Forms version ' + this.version + ' is greater then the current version ' + currentFormsVersion);
    }
    this.formsObject = JSON.parse(formsJson);
}
Forms.prototype.getDomains = function() {
    var result = [];
    Object.keys(this.formsObject).forEach(key => {
      result.push(key);
    });
    return result;
};
Forms.prototype.getUsers = function(domain) {
    var result = [];
    var domainObject = this.formsObject[domain];
    if (!domainObject)
        return result;
    Object.keys(domainObject).forEach(key => {
      result.push(key);
    });
    return result;
};
Forms.prototype.deleteDomain = function(domain) {
    delete this.formsObject[domain];
    this.save();
};
Forms.prototype.deleteUser = function(domain, user) {
    if (this.formsObject[domain]) {
        delete this.formsObject[domain][user];
    }
    if (this.getUsers(domain).length === 0) {
        delete this.formsObject[domain];
    }
    this.save();
};
Forms.prototype.getFullForm = function(domain, user) {
    var domainObject = this.formsObject[domain];
    if (!domainObject)
        return null;
    var userObject = domainObject[user];
    if (!userObject)
        return null;
    var result = new Map();
    result.set('domain', domain);
    result.set('user', user);
    for (var i =0; i < innerParamNames.length; i++) {
        var paramName = innerParamNames[i];
        if (userObject[paramName])
            result.set(paramName, userObject[paramName]);
    }
    return result;
};
Forms.prototype.setFullForm = function(fullFormMap, forceNote) {
    var domain = fullFormMap.get('domain');
    if (!domain)
        domain = '';
    var user = fullFormMap.get('user');
    if (!user)
        user = '';
    this.setForm(domain, user, fullFormMap, forceNote);
};

Forms.prototype.setForm = function(domain, user, formMap, forceNote) {
    if (!this.formsObject[domain])
        this.formsObject[domain] = {};
    var currUserObject = this.formsObject[domain][user] ? this.formsObject[domain][user] : {};
    var userObject = {};
    if (formMap.has('modified')) {
        if (currUserObject['modified']) {
            var currModified = new Date(currUserObject['modified']);
            var newModified = new Date(formMap.get('modified'))
            if (newModified < currModified) {
                return;
            }
        }
        userObject['modified'] = formMap.get('modified');
    } else {
        userObject['modified'] = (new Date()).toUTCString();
    }
    var hasUpdates = false;
    for (var i =0; i < innerParamNames.length; i++) {
        var paramName = innerParamNames[i];
        if (formMap.has(paramName) && !userObject[paramName]) {
            userObject[paramName] = formMap.get(paramName);
            if (paramName != 'note' && currUserObject[paramName] != userObject[paramName]) {
                hasUpdates = true;
            }
        }
    }
    if (!hasUpdates && currUserObject['modified']) {
        userObject['modified'] = currUserObject['modified'];
    }
    if (!forceNote && !formMap.has('note') && currUserObject['note']) {
        userObject['note'] = this.formsObject[domain][user]['note'];
    }
    this.formsObject[domain][user] = userObject;
    this.save();
};

Forms.prototype.save = function() {
    localStorage.setItem('forms', JSON.stringify(this.formsObject));
    localStorage.setItem('forms version', currentFormsVersion);
    localStorage.setItem('updateTime', (new Date()).toUTCString());
}
Forms.prototype.exportAsJson = function(includeUrl) {
    localStorage.setItem('exportTime', (new Date()).toUTCString());
    var cloneFormsObject =  JSON.parse(JSON.stringify(this.formsObject));
    Object.keys(cloneFormsObject).forEach(domain => {
        Object.keys(cloneFormsObject[domain]).forEach(user => {
            var userForm = cloneFormsObject[domain][user];
            var fullFormMap = new Map();
            fullFormMap.set('domain', domain);
            fullFormMap.set('user', user);
            for (var i =0; i < innerParamNames.length; i++) {
                var paramName = innerParamNames[i];
                if (userForm[paramName] && userForm[paramName].length > 0) {
                    fullFormMap.set(paramName, userForm[paramName]);
                } else {
                    delete cloneFormsObject[domain][user][paramName];
                }
            }
            if (includeUrl) {
                cloneFormsObject[domain][user]['url'] = buildUrlFromFormMap(fullFormMap);
            }
        });
    });
    return JSON.stringify(cloneFormsObject, null, 2);
}

Forms.prototype.importFromJson = function(asJson) {
    var forms = JSON.parse(asJson);
    Object.keys(forms).forEach(domain => {
        Object.keys(forms[domain]).forEach(user => {
            var userForm = forms[domain][user];
            var formMap = new Map();
            for (var i =0; i < innerParamNames.length; i++) {
                var paramName = innerParamNames[i];
                if (userForm[paramName]) {
                    formMap.set(paramName, userForm[paramName]);
                }
            }
            this.setForm(domain, user, formMap);
        });
    });
    this.version = currentFormsVersion;
    this.save();
}
function countchars(str, char) {
    return str.split(char).length - 1;
}
function isLastPartial(finalSplit) {
    var str = finalSplit[finalSplit.length-1];
    return str.match(/\s*"/) && (countchars(str, '"') & 1 == 1);
}
function splitCSVLine(csvline) {
    var firstSplit = csvline.split(',');
    var finalSplit = [firstSplit[0]];
    var partial = isLastPartial(finalSplit);
    for (var i = 1; i < firstSplit.length; i++) {
        if (partial) {
            finalSplit[finalSplit.length-1] += (',' + firstSplit[i]);
        } else {
            finalSplit.push(firstSplit[i]);
        }
        partial = isLastPartial(finalSplit);
    }
    for (var i = 0; i < finalSplit.length; i++) {
        var str = finalSplit[i].trim();
        if (str.match(/^".*"$/)) {
            str = str.substring(1, str.length - 1).replace('""', '"');
        }
        finalSplit[i] = str;
    }
    return finalSplit;
}
Forms.prototype.importFromCSV = function(asCSV) {
    var lines = asCSV.split('\n');
    var headers = splitCSVLine(lines[0]);
    var fullForms = [];
    for (var i = 1; i< lines.length; i++) {
        var fullForm = new Map();
        var items = splitCSVLine(lines[i]);
        for (var j = 0; j < items.length; j++) {
            if (items[j].length > 0) {
                fullForm.set(headers[j], items[j]);
            }
        }
        fullForms.push(fullForm);
    }
    for (var i=0;i< fullForms.length; i++) {
        this.setFullForm(fullForms[i]);
    }
    this.version = currentFormsVersion;
    this.save();
}

Forms.prototype.exportAsCSV = function(includeUrl) {
    localStorage.setItem('exportTime', (new Date()).toUTCString());
    
    const columns = includeUrl ? fullParamNames.concat(['url']) : fullParamNames;
    var result = columns.join(',');
    var domains = this.getDomains();
    for (var i = 0; i < domains.length; i++) {
        var users = this.getUsers(domains[i]);
        for (var j = 0; j < users.length; j++) {
            var fullForm = this.getFullForm(domains[i], users[j]);
            var values = [];
            for (var c = 0; c < columns.length; c++) {
                if (fullForm.has(columns[c])) {
                    var val = fullForm.get(columns[c]);
                    if (val.match(/^\s.*|.*\s|.*[",].*/)) {
                        val = '"' + val.replace('"', '""') + '"';
                    }
                    values.push(val);
                } else if (columns[c] == 'url') {
                    values.push(buildUrlFromFormMap(fullForm));
                } else {
                    values.push('');
                }
            }
            result += '\n' + values.join(',');
        }
    }
    return result;
}