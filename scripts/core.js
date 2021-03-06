var lastDragOver = null;
var ghostBookmark = $(Mark.up(templates.ghost_bookmark));
var editMode = false;
var iconProxy = 'http://hydralien.net/iconproxy/base64/'
var debugMode = false;
var groupColors = 0;
var fontColor = "#0000ff";
var backgroundColor = "#DDDEE2";

if (debugMode) {
	iconProxy = 'http://localhost:8082/base64/';
}

function removeNavbar() {
  chrome.tabs.getCurrent(function (tab) {
    //console.log("TID: " + tab.id);
  });
}

function savedIconUrl(itemId, itemUrl) {
	var itemHostname = itemUrl.prop('hostname');

	var iconExceptions = config.icon_exceptions.value[itemId] || {}
	savedIcon = localStorage.getItem(itemHostname);
		
	if (iconExceptions['source'] == 'custom') {
		savedIcon = localStorage.getItem(itemId) || 'n/a';
	}
		
	if (config.chrome_icon_cache.value == 'on' || savedIcon == 'n/a' || iconExceptions['source'] == 'chrome') {
		savedIcon = 'chrome://favicon/' + itemUrl.attr('href');
	}

	return savedIcon;
}

var nodeBookmark = function (data) {
	savedIcon = 'chrome://favicon/' + data.url;

	var iconExceptions = config.icon_exceptions.value[data.id] || {};
	if (data.url) {	
		var aLink = document.createElement("a");
		aLink.href = data.url;

		savedIcon = savedIconUrl(data.id, $(aLink));
		
		if (!savedIcon) {
			savedIcon = 'chrome://favicon/' + data.url;
			var iconUrl = aLink.hostname;
			$.get(iconProxy + iconUrl).done(
				function (encodedImage) {
					if (!encodedImage) {
						localStorage.setItem(aLink.hostname, 'n/a');
						return;
					}
					if (debugMode) {
						return;
					}
					localStorage.setItem(aLink.hostname, encodedImage);
				}
			).fail(
				function () {
					if (debugMode) {
						return;
					}
					localStorage.setItem(aLink.hostname, 'n/a');
				}
			);
		}
	}
	
	var node = {
		id : data.id,
		bookmark: true,
		title : data.title,
		imgURL : savedIcon,
		href : data.url,
		index: data.index,
		folder : data.url == undefined,
		foldersOnly: data.foldersOnly,
		parent : data.parentId,
		click : '',
		enabled: true,
		groupColor: data.groupColor,
		color: iconExceptions['fontColor'],
		backgroundColor: iconExceptions['backgroundColor'],
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
		index: data.index,
    title : data.name,
    imgURL : 'chrome://extension-icon/' + data.id + '/48/1',
    href : data.optionsUrl ? data.optionsUrl : '#',
    click : '',
    enabled : data.enabled && (data.launchType != undefined || data.optionsUrl) ? true : false,
		launch: data.launchType,
    htmlCode : function () {
      return Mark.up(templates.bookmark, {item: this, data: data});
    },
    clickHandler : function (event) {
			event.preventDefault();
			if (data.launchType) {
				chrome.management.launchApp(data.id);
			} else {
				chrome.tabs.create({url: data.optionsUrl});
			}
			window.close();
		}
  }
}

function getConfig() {
    return config;
}

function addBookmarks(nodeType, nodeList, target, foldersOnly) {
  var action = function (kids) {
    if (target.hasClass('icon-wrapper')) {
      kids.reverse();
    }

    if (foldersOnly) {
    	kids = kids.filter(function (item) {return item.url == undefined});
    }

    for (var kid_index = 0; kid_index < kids.length; kid_index++) {
			var kidData = kids[kid_index];
			kidData.foldersOnly = foldersOnly;
			kidData.groupColor = groupColors && groupColors % 4 + 1;
			
      kid = nodeType(kidData);

      if (kid.enabled === false) {
        continue;
      }

			if (config.hidden_items.value[kid.id]) {
				kid.hidden = true;
			}

      var kidNode = $(kid.htmlCode());

			if (editMode) {
				if (foldersOnly) {
					kidNode.find('.pick-item').toggle();
				} else {
					kidNode.find('.hide-item').toggle();
					kidNode.find('.show-item').toggle();
					kidNode.find('.drop-item').toggle();
					kidNode.find('.edit-item').toggle();
				}
				kidNode.attr('draggable', 'true');
			}
			
			kidNode.find('.hide-item').click(toggleItem);
			kidNode.find('.show-item').click(toggleItem);
			kidNode.find('.drop-item').click(dropItem);
			kidNode.find('.edit-item').click(editItem);
			kidNode.find('.pick-item').click(pickItem);

      if (target.hasClass('icon-wrapper')) {
        kidNode.addClass('folder');
        target.after(kidNode);
				target.parent().find('#bookmark_' + kid.id).click(kid.clickHandler);
      } else {
        target.append(kidNode);
				target.find('#bookmark_' + kid.id).click(kid.clickHandler);
      }

			var kidIcon = kidNode.find('.icon');
			kidNode.find('.bookmark-text').textfill({'maxFontPixels': 16, 'minFontPixels': 7, 'changeLineHeight': 1});

			kidNode.find('.tooltipit').tooltipster();
    }
  };

  nodeList(action);
}

function addExtensions(root_id, target) {
  var action = function (kids) {
    chrome.management.getAll(function (list) {
      //console.log(list)
    });
  };
}

function getColorClass(element) {
	wrapperClasses = element.attr('class').split(' ');

	var colorClassName = '';
	for (var wrapI = 0; wrapI < wrapperClasses.length; wrapI++) {
		if (wrapperClasses[wrapI].search('group-color-') == -1) {
			continue;
		}
		colorClassName = wrapperClasses[wrapI];
		break;
	}

	return colorClassName;
}

function unrollBookmark(parent) {
	if (!parent.folder) {
		return;
	}
	
	var container = parent.foldersOnly ? $('#root-list') : $('#content-bookmarks');
	var parentNode = container.find('#bookmark_' + parent.id);
	var parentIconWrapper = parentNode.parents('.icon-wrapper');
			
  if (container.find('.child-of-' + parent.id).length > 0) {
    container.find('.child-of-' + parent.id).remove();

		var colorClass = getColorClass(parentIconWrapper);
		parentIconWrapper.removeClass( colorClass );

		parentIconWrapper.addClass('group-color-0');
		groupColors -= 1;
    return;
  }

  groupColors += 1;
	parentIconWrapper.removeClass('group-color-0');
	parentIconWrapper.addClass('group-color-' + (groupColors % 4 + 1));
	
  addBookmarks(
    nodeBookmark,
    function (action) {
      chrome.bookmarks.getChildren(parent.id, action)
    },
    parentNode.closest('.icon-wrapper'),
		parent.foldersOnly
  );
}

function fillStrings(locale) {
  var current_locale = chrome.i18n.getMessage("@@ui_locale");
  var main_desc = chrome.i18n.getMessage("main_description");
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
	var objectName = $(this).siblings('a').attr('itemname');

	if ($(this).hasClass('type-bookmark')) {
		if ($(this).hasClass('recursive')) {
			if ( !confirm( Mark.up(chrome.i18n.getMessage("remove_folder"), {name: objectName}) ) ) {
				return;
			}
			chrome.bookmarks.removeTree(drop_id);
		} else {
			if ( !confirm( Mark.up(chrome.i18n.getMessage("remove_bookmark"), {name: objectName}) ) ) {
				return;
			}
			chrome.bookmarks.remove(drop_id);
		}
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

function pickItem() {
	var pick_id = $(this).attr('item_id');

	saveConfigParam(
		'bookmarks_root',
		pick_id,
		function () {
			location.reload();
		}
	);
}

function editItem() {
	var editItemId = $(this).attr('item_id');

	var objectName = $(this).siblings('a').attr('itemname');
	var objectUrl = $(this).siblings('a').attr('href');
	var objectHostname = $(this).siblings('a').prop('hostname');
	var objectIcon = $(this).siblings('a').find('img').attr('src');
	var objectIconSource = 'chrome';
	var objectType = $(this).parent().attr('itemtype');
	var iconExceptions = config.icon_exceptions.value[editItemId] || {};
	
	if (objectType == 'folder') {
		$('#edit-item-modal .form-image').hide();
	} else {
		$('#edit-item-modal .form-image').show();
		
		$('#edit-icon-image-chrome').show();
		$('#edit-icon-image-chrome input').prop("checked", true);
		$('#icon-image-chrome').attr('src', 'chrome://favicon/' + objectUrl);
		objectIconSource = "chrome";

		var	savedSiteIcon = localStorage.getItem(objectHostname);
		$('#icon-image-web').attr('src', savedSiteIcon);
		$('#edit-icon-image-web').show();

		var	savedCustomIcon = localStorage.getItem(editItemId);
		$('#icon-image-custom').attr('src', savedCustomIcon);
		$('#edit-icon-image-custom').show();
		
		if (iconExceptions['source'] == 'custom') {
			$('#edit-icon-image-custom input').prop("checked", true);
			objectIconSource = "custom";
		}

		if (iconExceptions['source'] == 'web') {
			$('#edit-icon-image-web input').prop("checked", true);
			objectIconSource = "web";
		}	
	}

	if (iconExceptions['fontColor']) {
		$('#edit-item-modal #edit-icon-color-font').val( iconExceptions['fontColor'] );
	}
	if (iconExceptions['backgroundColor']) {
		$('#edit-item-modal #edit-icon-color-background').val( iconExceptions['backgroundColor'] );
	}
	
	$('#edit-item-modal #bookmark-edit-name').val( objectName );
	$('#edit-item-modal #bookmark-edit-url').val( objectUrl );
	$('#edit-item-modal #bookmark-edit-type').val( objectType );
	$('#edit-item-modal #bookmark-edit-icon').val( objectIconSource );
	$('#edit-item-modal #bookmark-edit-id').val( editItemId );

	$('#edit-item-modal').modal('show');
}

function toggleItem() {
  var toggle_id = $(this).attr('item_id');
  var toggle_object = $(this);

	if (toggle_object.hasClass('show-item')) {
		chrome.storage.sync.get(['hidden_items'], function (saved_parameters) {
			var hidden_items = {
				'value' : {}
			};
			if (saved_parameters['hidden_items'] && saved_parameters['hidden_items']['value']) {
				hidden_items = saved_parameters['hidden_items'];
			}

			if (hidden_items['value'][toggle_id]) {
				delete hidden_items['value'][toggle_id];
			}

			saveConfigParam('hidden_items', hidden_items['value'])

			toggle_object.parent().removeClass('item-hidden');
			toggle_object.removeClass('show-item');
			toggle_object.addClass('hide-item');
		});
	} else {
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

			hide_object.parent().addClass('item-hidden').css({display: 'flex'});
			toggle_object.removeClass('hide-item');
			toggle_object.addClass('show-item');
		});
	}
}

function toggleSettings() {
	if ($('#menu-container').css('margin-left') == '0px')  {
		// closing settings, saving changes along the way
		$('#menu-container').css({'margin-left': '-250px', 'transition': 'margin 0.5s'});
		$('#settings-trigger').removeClass('active');

		$.each(config, function (config_key, config_data) {
			var setting = $('#setting_' + config_key);
			if (setting.length == 0) {
				return;
			}
      var new_value = setting.val();
			if (setting.attr('type') == 'checkbox') {
				new_value = setting.is(':checked') ? 'on' : 'off';
			}
      if (new_value != '' && new_value != config_data['value']) {
        saveConfigParam(config_key, new_value);
        applyConfigParam(config_key);
      }
    });
	} else {
		// displaying settings
		$('#settings-trigger').addClass('active');
		$('#menu-container').css({'margin-left': 0, 'transition': 'margin 0.5s'});
	}
}

function applyLocale() {
  var targets = ["settings", "extensions", "tasks", "cleanup", "params", "cookies", "passwords", "edit", "all_bookmarks", "settings_trigger"];

  $.each(targets,
         function (target_key, target_id) {
					 var message = chrome.i18n.getMessage(target_id);
           $("#" + target_id).attr('title', message).attr('itemname', message);
         });

  $.each(["bookmarks_header", "extensions_header", "root_bookmark_change_link"],
         function (target_key, target_id) {
					 $("#" + target_id).text(chrome.i18n.getMessage(target_id));
				 });
}

function handleFileSelect(evt) {
	var fileHandle = evt.target.files[0];
	var reader = new FileReader();

	reader.onload = (function(theFile) {
		return function(e) {
			var fileContent = e.target.result;
			$('#edit-item-modal #icon-image-custom').attr('src', fileContent)
			localStorage.setItem($('#edit-item-modal #bookmark-edit-id').val(), fileContent);
		}
	})(fileHandle);

	reader.readAsDataURL(fileHandle);
}

function registerEvents() {
  $('#settings-trigger').click( toggleSettings );
	
  $('#extensions').click( function () {chrome.tabs.create({url:'chrome://extensions/'})} );

  $('#cleanup').click( function () {chrome.tabs.create({url:'chrome://settings/clearBrowserData'})} );

  $('#params').click( function () {chrome.tabs.create({url:'chrome://settings'})} );

  $('#cookies').click( function () {chrome.tabs.create({url:'chrome://settings/cookies'})} );

  $('#passwords').click( function () {chrome.tabs.create({url:'chrome://settings/passwords'})} );

  $('#all_bookmarks').click( function () {chrome.tabs.create({url:'chrome://bookmarks'})} );

	$('#edit-item-modal #bookmark-edit-save').click( function () {
		var editItemId = $('#edit-item-modal #bookmark-edit-id').val();		

		var iconDataUpdate = function () {
			chrome.bookmarks.update(
				editItemId,
				{
					title : $('#edit-item-modal #bookmark-edit-name').val(),
					url : $('#edit-item-modal #bookmark-edit-url').val()
				},
				function () {
					var editItemTitle = $('#edit-item-modal #bookmark-edit-name').val();
					var bookmarkItem = '#bookmark_' + editItemId;
					
					$(bookmarkItem).parent()
						.attr('href', $('#edit-item-modal #bookmark-edit-url').val())
						.attr('itemname', editItemTitle)
						.attr('title', editItemTitle)
						.tooltipster('instance').content(editItemTitle);

					$( + ' .bookmark-text').textfill({'maxFontPixels': 16, 'minFontPixels': 8, 'changeLineHeight': 1});
					$(bookmarkItem + ' span').text(editItemTitle);
					
					if ($('#bookmark-edit-type').val() != 'folder') {
						var iconUrl = savedIconUrl(editItemId, $(bookmarkItem).parent());
						$(bookmarkItem + ' img').attr('src', iconUrl);
					}

					$(bookmarkItem).css({
						'color' : $('#edit-icon-color-font').val(),
						'background-color' : $('#edit-icon-color-background').val()
					});
					
					$('#edit-item-modal').modal('hide');
				}
			);
		};

		var iconExceptions = config.icon_exceptions.value || {};
		if (!iconExceptions[editItemId]) {
			iconExceptions[editItemId] = {}
		}

		var configChanges = false;
		if ($('input[name="edit-icon-image"]:checked').val() != $('#bookmark-edit-icon').val()) {
			iconExceptions[editItemId]['source'] = $('input[name="edit-icon-image"]:checked').val();
			configChanges = true;
		}
		if ($('#edit-icon-color-font').val() != fontColor) {
			iconExceptions[editItemId]['fontColor'] = $('#edit-icon-color-font').val();
			configChanges = true;
		}
		if ($('#edit-icon-color-background').val() != backgroundColor) {
			iconExceptions[editItemId]['backgroundColor'] = $('#edit-icon-color-background').val();
			configChanges = true;
		}
		
		if (configChanges) {
			saveConfigParam('icon_exceptions', iconExceptions, iconDataUpdate);
		} else {
			iconDataUpdate();
		}

	});

	
  $('#edit').click( function () {
		editMode = editMode ? false : true;
		if ($('.item-hidden').css('display') == 'none') {
			$('.item-hidden').css({display: 'flex'});
		} else {
			$('.item-hidden').css({display: 'none'});
		}
		$('.hide-item').toggle();
		$('.show-item').toggle();
		$('.drop-item').toggle();
		$('.edit-item').toggle();
		$('.icon-wrapper.item-bookmark').attr('draggable', $('.icon-wrapper').attr('draggable') == 'true' ? 'false' : 'true' );

		if (editMode) {
			$('#bookmarks').css({'animation': 'edit-highlight 0.3s'});
			$(this).addClass('active');
			$('#root_bookmark_name').addClass('edit').click(
				function () {
					if ($('#root-list').css('display') == 'none') {
						addBookmarks(
							nodeBookmark,
							function (action) {
								chrome.bookmarks.getChildren(
									'0',
									action
								);
							},
							$('#root-list'),
							true // folders only
						);

						$('#root-list').css({display: 'inline-block'});
					} else {
						$('#root-list').css({display: 'none'});
						$('#root-list').html('');
					}
				}
			);
		} else {
			$('#bookmarks').css({'animation': 'none'});
			$(this).removeClass('active');
			$('#root-list').css('display', 'none');
			$('#root_bookmark_name').removeClass('edit').unbind('click');
		}

		$(document).on(
			'dragover',
			'.icon-wrapper.item-bookmark',
			function () {
				$(this).after(ghostBookmark);
				ghostBookmark.show();
				//$(this).css('margin-right', '30px');
				lastDragOver = this;
			}
		);

		$(document).on(
			'dragleave',
			'.icon-wrapper.item-bookmark',
			function () {
				ghostBookmark.hide();
				//$(this).css('margin-right', 0);
			}
		);

		$(document).on(
			'dragstart',
			'.icon-wrapper.item-bookmark',
			function () {
				$(this).css('opacity', '0.4');
			}
		);

		$(document).on(
			'dragend',
			'.icon-wrapper.item-bookmark',
			function () {
				var actionItem = $(this);
				actionItem.css('opacity', '1');
				if (lastDragOver != null) {
					chrome.bookmarks.move(
						actionItem.attr('itemid'),
						{
							parentId: $(lastDragOver).attr('parentid'),
							index: parseInt($(lastDragOver).attr('itemindex')) + 1
						},
						function (result) {
							$(lastDragOver).after(actionItem);

							actionItem.attr('parentid', $(lastDragOver).attr('parentid'));
							actionItem.attr('itemindex', parseInt($(lastDragOver).attr('itemindex')) + 1);
							
							var colorClass = getColorClass(actionItem);
							actionItem.removeClass(colorClass);
							var parentColorClass = getColorClass($(lastDragOver));
							actionItem.addClass( parentColorClass );
						}
					);
				}
			}
		);
	});

 	$('#settings-form').on('submit', function () { toggleSettings(true); return false; });

	$(document).on(
		{
			mouseenter: function (event) {
				if (!editMode) {
					return;
				}
				$(event.target).closest('.icon-wrapper').find('.icon-tool').addClass('edit-hover');
			},
			mouseleave: function (event) {
				if (!editMode) {
					return;
				}
				$(event.target).closest('.icon-wrapper').find('.icon-tool').removeClass('edit-hover');
			}
		},
		'.icon-wrapper'
	);

	$(document).on(
		'click',
		'.icon-wrapper a',
		function (evt) {
			if (!editMode) {
				return;
			}
			evt.preventDefault();
		}
	);
	
	$('#image-file-select').on('change', handleFileSelect);
}

// please keep $(document).ready processing at the end of the file for convenience
$(document).ready(function () {
  syncConfig(function () {
				chrome.bookmarks.get(
						config.bookmarks_root.value,
						function (results) {
								var rootMark = results[0];
								$('#root_bookmark_name').text(rootMark.title);
						}
				);
		
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

	$.tooltipster.setDefaults({
		animation: 'fade',
		delay: 200,
		theme: 'tooltipster-borderless',
		touchDevices: false,
		trigger: 'hover',
		delay: 50,
		side: 'bottom'
	});

	$('.tooltipit').tooltipster();
});
// please keep $(document).ready processing at the end of the file for convenience
