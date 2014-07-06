
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
        '<div class="icon" id="bookmark_' + kid['id'] + '">' +
          '<a href="' + href + '"' + click + '>' +
            '<div>' + 
              '<img src="' + img_url + '"/>' +
              '<br/><span>' + kid['title'] + '</span>' + 
            '</div>' +
          '</a>' +
        '</div>'
      );
        
      $('#bookmark_' + kid['id']).click(function () { unrollBookmark(kid['id']) } );
    }
  };

  chrome.bookmarks.getChildren(root_id, action);
}

function unrollBookmark(parent_id) {
  var parent = $('#bookmark_' + parent_id);
  alert('yet to come');
}

function fillStrings(locale) {
  var current_locale = chrome.i18n.getMessage("@@ui_locale");
  var main_desc = chrome.i18n.getMessage("main_description");

  console.log("LOC: " + current_locale + " / " + main_desc);
}

$(document).ready(function () {
  addBookmarks('1', $('#content'));
  fillStrings();
});
