var templates = {

    bookmark:
    '<div class="icon-wrapper {{if item.parent|notempty}}child-of-{{item.parent}}{{/if}}">\
<a href="{{item.href}}" {{item.click}} title="{{item.title}}">\
<div class="icon" id="bookmark_{{item.id}}">\
 <div class="icon-image">\
  <img src="{{item.imgURL}}"/>\
 </div>\
 <span>{{item.title}}</span>\
</div>\
  </a>\
<div class="hide-item" item_id="{{data.id}}">x</div>\
</div>',


}