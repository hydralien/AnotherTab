
function removeNavbar() {
  chrome.tabs.getCurrent(function (tab) {
    console.log("TID: " + tab.id);
  });
}

function addBookmarks(root_id, target) {
  var action = function (kids) {
    for (kid_index = 0; kid_index < kids.length; kid_index++) {
      kid = kids[kid_index];
      var img_url = 'chrome://favicon/' + kid['url'];
      var href = kid['url'];
      var click = '';
      if (kid['url'] == undefined) {
        img_url = 'icons/folder.png';
        href = '#';
        //javascript:unrollBookmark(' + kid['id'] + ')"';
      }

      target.append(
          '<a href="' + href + '"' + click + '>' +
        '<div class="icon" id="bookmark_' + kid['id'] + '">' +
            '<div>' + 
              '<img src="' + img_url + '"/>' +
              '<br/><span>' + kid['title'] + '</span>' + 
            '</div>' +
        '</div>' +
          '</a>'
      );
        
      $('#bookmark_' + kid['id']).click(function () { unrollBookmark(kid['id']) } );
    }
  };

  chrome.bookmarks.getChildren(root_id, action);
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
  chrome.storage.sync.get(Object.keys(config), function (stored_config) {
    config = $.extend({}, config, stored_config);
  });

  return config;
}

function applyConfigParam(param_name, param_data) {
  if (!param_data) {
    param_data = config[param_name];
  }
  var stylesheet = document.styleSheets[0];
  if (param_data['css-target']) {
    var styles = "";
    $.each(param_data['css-key'], function (key_index, css_key) {
      styles += css_key + ': ' + param_data['value'] + '; ';
    });
    stylesheet.insertRule(param_data['css-target'] + ' {' + styles + '}', stylesheet.cssRules.length);
  }
}

function saveConfigParam(param_name, param_value) {
  config[param_name]['value'] = param_value;
  var new_setting = {};
  new_setting[param_name] = config[param_name];
  chrome.storage.sync.set(new_setting);
}

function applyConfig(config_to_apply) {
  var settings_form = "<table>";

  $.each(config_to_apply, function (config_key, config_data) {
    applyConfigParam(config_key, config_data);

    settings_form += '<tr><td class="name">' + chrome.i18n.getMessage(config_key) + '</td>' +
      '<td class="setting"><input type="text" id="setting_' + config_key + '" value="' + config_data['value'] + '"/><br/>' +
      '<span>' + chrome.i18n.getMessage(config_key + '_hint') + '</span></td></tr>';
  });

  settings_form += "</table>";

  $('#settings').html(settings_form);
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


// please keep $(document).ready processing at the end of the fiel for convenience
$(document).ready(function () {
  addBookmarks('1', $('#content'));
  fillStrings();
  config = syncConfig();
  applyConfig(config);

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
