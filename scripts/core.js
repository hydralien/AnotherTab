// TODO:
// pluging management
// processlist shortcut - http://www.bitfalls.com/2013/09/build-chrome-extension-killing-chrome.html

function removeNavbar() {
  chrome.tabs.getCurrent(function (tab) {
    console.log("TID: " + tab.id);
  });
}

var nodeBookmark = function (data) {
    var node = {
        id : data.id,
        bookmark: true,
        title : data.title,
        imgURL : 'chrome://favicon/' + data.url,
        href : data.url,
        folder : data.url == undefined,
        parent : data.parentId,
        click : '',
        htmlCode : function () {
            if (this.folder) {
                this.imgURL = 'icons/folder.png';
                this.href = '#';
                //javascript:unrollBookmark(' + kid['id'] + ')"';
            } else if (!this.href.match(/^http/)) {
			    this.imgURL = 'chrome://favicon/';
			    this.href = encodeURI(this.href);
		    }
            
            return Mark.up(templates.bookmark, {item: this, data: data});
        },
    };

    node.clickHandler = $.proxy(function () { unrollBookmark(this) }, node);

    return node;
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
      return Mark.up(templates.bookmark, {item: this, data: data});
    },
    clickHandler : function () { chrome.management.launchApp(data.id); window.close(); }
  }
}

function getConfig() {
    return config;
}

function addBookmarks(nodeType, nodeList, target) {
  var action = function (kids) {
      if (target.hasClass('icon-wrapper')) {
          kids.reverse();
      }

    for (var kid_index = 0; kid_index < kids.length; kid_index++) {
      kid = nodeType(kids[kid_index]);
      if (kid.enabled === false || config.hidden_items.value[kid.id]) {
        continue;
      }
        var kidNode = $(kid.htmlCode());
        if (target.hasClass('icon-wrapper')) {
            kidNode.addClass('folder');
            target.after(kidNode);
        } else {
            target.append(kidNode);
        }
      $('#bookmark_' + kid.id).click(kid.clickHandler);
    }

    target.find('.hide-item').click(hideItem);
    target.find('.drop-item').click(dropItem);
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

function unrollBookmark(parent) {
    var parentNode = $('#bookmark_' + parent.id);


    if ($('.child-of-' + parent.id).length > 0) {
        $('.child-of-' + parent.id).remove();
        return;
    }
    
    addBookmarks(
        nodeBookmark,
        function (action) {
            chrome.bookmarks.getChildren(parent.id, action)
        },
        parentNode.closest('.icon-wrapper')
    );
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

function syncConfig(callback) {
  var supported_keys = Object.keys(config);
  chrome.storage.sync.get(supported_keys, function (stored_config) {
    for (var key_index = 0; key_index < supported_keys.length; key_index++) {
      var current_key = supported_keys[key_index];
      if (stored_config.hasOwnProperty(current_key) && stored_config[current_key]['value']) {
        config[current_key]['value'] = stored_config[current_key]['value'];
      } else if (stored_config.hasOwnProperty(current_key) && typeof( stored_config[current_key] ) != 'object') {
				config[current_key]['value'] = stored_config[current_key];
			}
    }

    applyConfig();

		callback();
  });
}

function dropItem() {
	var drop_id = $(this).attr('item_id');
  var drop_object = $(this);

	if ($(this).hasClass('type-bookmark')) {
		chrome.bookmarks.remove(drop_id);	
		drop_object.parent().remove();	
	} else {
		chrome.management.uninstall(
			drop_id,
			{},
			function () {
				drop_object.parent().remove();
			}
		);
	}
}

function hideItem() {
  var hide_id = $(this).attr('item_id');
  var hide_object = $(this);

  chrome.storage.sync.get(['hidden_items'], function (saved_parameters) {
    var hidden_items = {
			'value' : {}
		};
		if (saved_parameters['hidden_items'] && saved_parameters['hidden_items']['value']) {
			hidden_items = saved_parameters['hidden_items'];
		}

		hidden_items['value'][hide_id] = 1;

		saveConfigParam('hidden_items', hidden_items['value'])

		hide_object.parent().hide();
  });
}

function toggleSettings(off) {
  if (off && $('#settings').is(":hidden")) {
    return true;
  }

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

	return true;
}

function applyLocale() {
  var targets = ["settings", "extensions", "tasks", "cleanup"];

  $.each(targets,
         function (target_key, target_id) {
           $("#" + target_id).attr('title', chrome.i18n.getMessage(target_id));
         });
}

function registerEvents() {
  $(document).mouseup(function (e) {
    var container = $("#settings");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
      if ($('#settings-trigger img').is(e.target)) {// || $('#settings-trigger').has(e.target).length > 0
        return toggleSettings();
      } else {
        return toggleSettings(true);
      }
    }
  });

  $('#extensions').click( function () {chrome.tabs.create({url:'chrome://extensions/'})} );
  $('#cleanup').click( function () {chrome.tabs.create({url:'chrome://settings/clearBrowserData'})} );
  $('#params').click( function () {chrome.tabs.create({url:'chrome://settings'})} );
  $('#cookies').click( function () {chrome.tabs.create({url:'chrome://settings/cookies'})} );
  $('#passwords').click( function () {chrome.tabs.create({url:'chrome://settings/passwords'})} );
  $('#edit').click( function () {
		$('.hide-item').toggle();
		$('.drop-item').toggle();
		$('.icon-wrapper').attr('draggable', $('.icon-wrapper').attr('draggable') == 'true' ? 'false' : 'true' ); 
	});
  $('#settings-form').on('submit', function () { console.log("OHFOR"); toggleSettings(true); return false; });
}

// please keep $(document).ready processing at the end of the file for convenience
$(document).ready(function () {
  syncConfig(function () {
    addBookmarks(
			nodeBookmark,
			function (action) {
				chrome.bookmarks.getChildren(config.bookmarks_root.value, action)
			},
			$('#content-bookmarks')
		);

    addBookmarks(
			nodeExtension,
			chrome.management.getAll,
			$('#content-extensions')
		);

    fillStrings();
    applyLocale();
    registerEvents();
  });
});
// please keep $(document).ready processing at the end of the file for convenience
