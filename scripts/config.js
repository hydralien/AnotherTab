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

function saveConfigParam(param_name, param_value, callback) {
  config[param_name]['value'] = param_value;
  var new_setting = {};
  new_setting[param_name] = config[param_name];

	if (callback) {
		chrome.storage.sync.set(new_setting, callback);
	} else {
		chrome.storage.sync.set(new_setting);
	}
}

function applyConfig() {
  var settings_form = '<table><form id="settings-form">';

  var config_keys = Object.keys(config);

  for (var key_index = 0; key_index < config_keys.length; key_index++) {
    var config_key = config_keys[key_index];

    applyConfigParam(config_key, config[config_key]);

    if (!config[config_key]['css-target'] && !config[config_key]['editable']) {
      continue;
    }

		var configValue = 'value="' + config[config_key]['value'] + '"';
		var configType = 'text';
		if (config[config_key]['type'] && config[config_key]['type'] == 'checkbox') {
			configValue = config[config_key]['value'] == 'on' ? 'checked="checked"' : '';
			configType = 'checkbox';
		}
    settings_form += '<tr><td class="name">' + chrome.i18n.getMessage(config_key) + '</td>' +
      '<td class="setting"><input type="' + configType + '" id="setting_' + config_key + '" ' + configValue + '/><br/>' +
      '<span>' + chrome.i18n.getMessage(config_key + '_hint') + '</span></td></tr>';
  };

  settings_form += '</form></table>';

  $('#settings').html(settings_form);
  $('#settings input').keyup(function (event) {
    if (event.keyCode == 13) {
      toggleSettings(true);
    }
  });
}
