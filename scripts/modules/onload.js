var menuApp;
export default menuApp;

function registerEvents() {
  $('#settings-trigger').click( toggleSettings );
	
  $('#extensions').click( function () {chrome.tabs.create({url:'chrome://extensions/'})} );

  $('#cleanup').click( function () {chrome.tabs.create({url:'chrome://settings/clearBrowserData'})} );

  $('#params').click( function () {chrome.tabs.create({url:'chrome://settings'})} );

  $('#cookies').click( function () {chrome.tabs.create({url:'chrome://settings/cookies'})} );

  $('#passwords').click( function () {chrome.tabs.create({url:'chrome://settings/passwords'})} );

  $('#all_bookmarks').click( function () {chrome.tabs.create({url:'chrome://bookmarks'})} );

	$('#cookies').click( function () {chrome.tabs.create({url:'chrome://settings/siteData'})} );

	$('#chrome_reload').click(
		function () {
			$('#confirm-modal').modal('show');
		}
	);
	
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

					//$( + ' .bookmark-text').textfill({'maxFontPixels': 16, 'minFontPixels': 8, 'changeLineHeight': 1});
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

	$('#copy-restart-command-button').on(
		'click',
		function (event) {
			var copyTextarea = $('#copy-restart-command-text');
			copyTextarea.focus();
			copyTextarea.select();

			document.execCommand('copy');
		}
	);
}




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

menuApp = new Vue({
	el: '#menu',
	data: config
});

toggleSettings();


