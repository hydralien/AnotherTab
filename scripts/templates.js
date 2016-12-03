var templates = {

    bookmark:
    '<div class="icon-wrapper \
{{if item.parent|notempty}}child-of-{{item.parent}}{{/if}} \
{{if item.bookmark|notempty}}item-bookmark{{else}}item-extension{{/if}} \
{{if item.hidden|notempty}}item-hidden{{/if}}" \
draggable="false" itemid="{{item.id}}" itemindex="{{item.index}}">\
<a class="tooltipit" href="{{item.href}}" {{item.click}} title="{{item.title}}" extratitle="{{item.title}}" draggable="false">\
<div class="icon" id="bookmark_{{item.id}}" draggable="false">\
 <div class="icon-image" draggable="false">\
  <img src="{{item.imgURL}}"/ draggable="false">\
 </div>\
 <span draggable="false">{{item.title}}</span>\
</div>\
  </a>\
<div class="pick-item" item_id="{{data.id}}" draggable="false"></div>\
<div class="{{if item.hidden|empty}}hide-item{{else}}show-item{{/if}}" item_id="{{data.id}}" draggable="false"></div>\
<div class="drop-item {{if item.bookmark|notempty}}type-bookmark{{/if}} {{if item.folder|notempty}}recursive{{/if}}" item_id="{{data.id}}" draggable="false"></div>\
{{if item.bookmark|notempty}}<div class="edit-item {{if item.bookmark|notempty}}type-bookmark{{/if}}" item_id="{{data.id}}" draggable="false"></div>{{/if}}\
</div>',


	root_folders:
	'<div class="root-selection-holder">\
{{items}}\
<a class="root-directory-select" directory_id="{{id}}" title="{{item.title}}" extratitle="{{item.title}}" draggable="false">\
 <div class="icon-image" draggable="false">\
  <img src="icons/folder.png"/ draggable="false">\
  <span>{{title}}</span>\
 </div>\
</a>\
{{/items}}\
</div>'
	
}
