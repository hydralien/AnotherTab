// TODO:
// pluging management
// processlist shortcut - http://www.bitfalls.com/2013/09/build-chrome-extension-killing-chrome.html

function removeNavbar() {
  chrome.tabs.getCurrent(function (tab) {
    console.log("TID: " + tab.id);
  });
}

var nodeBookmark = function (data) {
  return {
    id : data.id,
    title : data.title,
    imgURL : 'chrome://favicon/' + data.url,
    href : data.url,
    click : '',
    htmlCode : function () {
      if (this.href == undefined) {
        this.imgURL = 'icons/folder.png';
        this.href = '#';
        //javascript:unrollBookmark(' + kid['id'] + ')"';
      }

      return '<a href="' + this.href + '"' + this.click + ' title="' + this.title + '">' +
        '<div class="icon" id="bookmark_' + this.id + '">' +
        '<div>' + 
        '<img src="' + this.imgURL + '"/>' +
        '<br/><span>' + this.title + '</span>' + 
        '</div>' +
        '</div>' +
        '</a>';
    },
    clickHandler : function () { unrollBookmark(this.id) }
  }
}

var nodeExtension = function (data) {
  return {
    id : data.id,
    title : data.name,
    imgURL : 'chrome://extension-icon/' + data.id + '/48/1',
    href : '#',
    click : '',
    enabled : data.enabled,
    htmlCode : function () {
      return '<div class="icon" id="bookmark_' + this.id + '">' +
        '<div>' + 
        '<img src="' + this.imgURL + '"/>' +
        '<br/><span>' + this.title + '</span>' + 
        '</div>' +
        '<div class="hide-item"><a onclick="hideItem(\'' + data.id + '\')">x</a></div>' +
        '</div>';
    },
    clickHandler : function () { chrome.management.launchApp(data.id); window.close(); }
  }
}

function addBookmarks(nodeType, nodeList, target) {
  var action = function (kids) {
    for (var kid_index = 0; kid_index < kids.length; kid_index++) {
      kid = nodeType(kids[kid_index]);
      if (kid.enabled === false || config.hidden_items.value[kid.id]) {
        continue;
      }
      target.append(kid.htmlCode());
      $('#bookmark_' + kid.id).click(kid.clickHandler);
    }
  };

  nodeList(action);
}

function addExtensions(root_id, target) {
  var action = function (kids) {
    chrome.management.getAll(function (list) {
      console.log(list)
    });
  };
}

function unrollBookmark(parent_id) {
  var parent = $('#bookmark_' + parent_id);
  console.log('yet to come');
}

function fillStrings(locale) {
  var current_locale = chrome.i18n.getMessage("@@ui_locale");
  var main_desc = chrome.i18n.getMessage("main_description");

  console.log("LOC: " + current_locale + " / " + main_desc);
}

function getImage(img_url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', img_url, true);
  xhr.responseType = 'blob';
  xhr.onload = function(e) {
    var img = document.createElement('img');
    img.src = window.URL.createObjectURL(this.response);
    document.body.appendChild(img);
  };

  xhr.send();
}

function syncConfig() {
  var supported_keys = Object.keys(config);
  chrome.storage.sync.get(supported_keys, function (stored_config) {
    for (var key_index = 0; key_index < supported_keys.length; key_index++) {
      var current_key = supported_keys[key_index];
      if (stored_config.hasOwnProperty(current_key)) {
        config[current_key]['value'] = stored_config[current_key];
      }
    }

    applyConfig();
  });
}

function applyConfigParam(param_name, param_data) {
  if (!param_data) {
    param_data = config[param_name];
  }

  var stylesheet = document.styleSheets[0];
  if (param_data['css-target']) {
    var styles = "";
    for (var key_index = 0; key_index < param_data['css-key'].length; key_index++) {
      var css_key = param_data['css-key'][key_index];
      // handle position (left/right/top/bottom) as value
      if (['left','right','top','bottom'].indexOf(css_key) > -1) {
        if (css_key == param_data['value']) {
          styles += css_key + ': 0px; ';
          break;
        }
        continue;
      }
      styles += css_key + ': ' + param_data['value'] + '; ';
    }
    stylesheet.insertRule(param_data['css-target'] + ' {' + styles + '}', stylesheet.cssRules.length);
  }
}

function saveConfigParam(param_name, param_value) {
  config[param_name]['value'] = param_value;
  var new_setting = {};
  new_setting[param_name] = config[param_name]['value'];

  chrome.storage.sync.set(new_setting);
}

function applyConfig() {
  var settings_form = '<table>';

  var config_keys = Object.keys(config);

  for (var key_index = 0; key_index < config_keys.length; key_index++) {
    var config_key = config_keys[key_index];

    applyConfigParam(config_key, config[config_key]);

    if (!config['css-target']) {
      continue;
    }

    settings_form += '<tr><td class="name">' + chrome.i18n.getMessage(config_key) + '</td>' +
      '<td class="setting"><input type="text" id="setting_' + config_key + '" value="' + config[config_key]['value'] + '"/><br/>' +
      '<span>' + chrome.i18n.getMessage(config_key + '_hint') + '</span></td></tr>';
  };

  settings_form += '</form>';

  $('#settings').html(settings_form);
  $('#settings input').keyup(function (event) {
    if (event.keyCode == 13) {
      toggleSettings(true);
    }
  });
}

function toggleSettings(off) {
  if (off) {
    $('#settings').hide();
  } else {
    $('#settings').toggle();
  }

  if ($('#settings').is(":hidden")) {
    $.each(config, function (config_key, config_data) {
      var new_value = $('#setting_' + config_key).val();
      if (new_value != '' && new_value != config_data['value']) {
        saveConfigParam(config_key, new_value);
        applyConfigParam(config_key);
      }
    });
  }
}

function applyLocale() {
  var targets = ["settings", "extensions", "tasks", "cleanup"];

  $.each(targets,
         function (target_key, target_id) {
           $("#" + target_id).attr('title', chrome.i18n.getMessage(target_id));
         });
}

function registerEvents() {
  $('#extensions').click( function () {chrome.tabs.create({url:'chrome://extensions/'})} );
  $('#cleanup').click( function () {chrome.tabs.create({url:'chrome://settings/clearBrowserData'})} );
  //$('#settings-form').on('submit', function () { console.log("OHFOR"); toggleSettings(true); return false; });
}

// please keep $(document).ready processing at the end of the field for convenience
$(document).ready(function () {
  addBookmarks(nodeBookmark, function (action) {chrome.bookmarks.getChildren('1', action)}, $('#content-bookmarks'));
  addBookmarks(nodeExtension, chrome.management.getAll, $('#content-extensions'));
  fillStrings();
  syncConfig();
  applyLocale();
  registerEvents();

  $(document).mouseup(function (e) {
    var container = $("#settings");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
      if ($('#settings-trigger img').is(e.target)) {// || $('#settings-trigger').has(e.target).length > 0
        toggleSettings();
      } else {
        toggleSettings(true);
      }
    }
  });

});
// please keep $(document).ready processing at the end of the fiel for convenience
