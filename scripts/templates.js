var templates = {

    bookmark:
    '<div class="icon-wrapper \
{{if item.parent|notempty}}child-of-{{item.parent}}{{/if}} \
{{if item.bookmark|notempty}}item-bookmark{{else}}item-extension{{/if}} \
{{if item.hidden|notempty}}item-hidden{{/if}} \
group-color-{{item.groupColor}}" \
draggable="false" itemid="{{item.id}}" \
itemindex="{{item.index}}" \
parentid="{{if item.parent|notempty}}{{item.parent}}{{else}}0{{/if}}" \
itemtype="{{if item.folder|notempty}}folder{{/if}}"\
>\
<a class="tooltipit" href="{{item.href}}" {{item.click}} title="{{item.title}}" itemname="{{item.title}}" draggable="false">\
	<div class="icon" id="bookmark_{{item.id}}" draggable="false" style="{{if item.color|notempty}}color:{{item.color}};{{/if}}{{if item.backgroundColor|notempty}}background-color:{{item.backgroundColor}};{{/if}}">\
    <div class="icon-image" draggable="false">\
  		<img src="{{item.imgURL}}"/ draggable="false">\
 		</div>\
    <div class="bookmark-text" draggable="false">\
 		  <span draggable="false">{{item.title}}</span>\
    </div>\
	</div>\
</a>\
<div class="icon-tool pick-item edit-hover" item_id="{{data.id}}" draggable="false"></div>\
<div class="icon-tool {{if item.hidden|empty}}hide-item{{else}}show-item{{/if}}" item_id="{{data.id}}" draggable="false"></div>\
<div class="icon-tool drop-item {{if item.bookmark|notempty}}type-bookmark{{/if}} {{if item.folder|notempty}}recursive{{/if}}" item_id="{{data.id}}" draggable="false"></div>\
{{if item.bookmark|notempty}}<div class="icon-tool edit-item {{if item.bookmark|notempty}}type-bookmark{{/if}}" item_id="{{data.id}}" draggable="false"></div>{{/if}}\
</div>',


	root_folders:
	'<div class="root-selection-holder">\
{{items}}\
<a class="root-directory-select" directory_id="{{id}}" title="{{item.title}}" itemname="{{item.title}}" draggable="false">\
 <div class="icon-image" draggable="false">\
  <img src="icons/folder.png"/ draggable="false">\
  <span>{{title}}</span>\
 </div>\
</a>\
{{/items}}\
</div>',

	ghost_bookmark:
	'<div class="icon-wrapper"><div class="icon ghost"></div></div>',
	
}
