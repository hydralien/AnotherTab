var templates = {

    bookmark:
    '<div class="icon-wrapper \
{{if item.parent|notempty}}child-of-{{item.parent}}{{/if}} \
{{if item.bookmark|notempty}}item-bookmark{{/if}} \
{{if item.hidden|notempty}}item-hidden{{/if}}" \
draggable="false" itemid="{{item.id}}" itemindex="{{item.index}}">\
<a href="{{item.href}}" {{item.click}} title="{{item.title}}" draggable="false">\
<div class="icon" id="bookmark_{{item.id}}" draggable="false">\
 <div class="icon-image" draggable="false">\
  <img src="{{item.imgURL}}"/ draggable="false">\
 </div>\
 <span draggable="false">{{item.title}}</span>\
</div>\
  </a>\
<div class="{{if item.hidden|empty}}hide-item{{else}}show-item{{/if}}" item_id="{{data.id}}" draggable="false">u/p</div>\
<div class="drop-item {{if item.bookmark|notempty}}type-bookmark{{/if}}" item_id="{{data.id}}" draggable="false">d</div>\
</div>',


}