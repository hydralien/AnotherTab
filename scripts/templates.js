var templates = {

    bookmark:
    '<div class="icon-wrapper {{if item.parent|notempty}}child-of-{{item.parent}}{{/if}}" draggable="false">\
<a href="{{item.href}}" {{item.click}} title="{{item.title}}" draggable="false">\
<div class="icon" id="bookmark_{{item.id}}" draggable="false">\
 <div class="icon-image" draggable="false">\
  <img src="{{item.imgURL}}"/ draggable="false">\
 </div>\
 <span draggable="false">{{item.title}}</span>\
</div>\
  </a>\
<div class="hide-item" item_id="{{data.id}}" draggable="false">x</div>\
<div class="drop-item {{if item.bookmark|notempty}}type-bookmark{{/if}}" item_id="{{data.id}}" draggable="false">d</div>\
</div>',


}