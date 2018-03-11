
// use undescore_naming to ease localization (_locale config doesn't allow dashes in param names)

var config = {
  "icon_size" : {
    "value" : "32px",
    "css-target" : ".icon img",
    "css-key" : ["width", "height"]
  },
  "cell_height" : {
    "value" : "60px",
    "css-target" : ".icon",
    "css-key" : ["min-height", "max-height", "min-width"]
  },
  "cell_width" : {
    "value" : "60px",
    "css-target" : ".icon",
    "css-key" : ["min-width"]
  },
  "cell_max_width" : {
    "value" : "60px",
		"type" : "range",
		"extra-value" : "none",
    "css-target" : ".icon",
    "css-key" : ["max-width"]
  },
  "tools_position" : {
		"type" : "select",
		"values" : [ "left", "right" ],
    "value" : "left",
    "css-target" : ".tools",
    "css-key" : ["left", "right"]
  },
  "hidden_items" : {
    "value" : {"iblacnngifeaffffeppbnmbmcafmmnpg" : 1}
  },
  "bookmarks_root" : {
    "value" : '1'
  },
  "chrome_icon_cache" : {
    "value" : '',
		"type" : 'checkbox',
		"editable" : true
  },
	"icon_exceptions" : {
		"value" : {}
	},
	"folder_color" : {
		"value" : "#ff3333",
		"type" : "color",
		"css-target" : ".folder .icon",
    "css-key" : ["background-color"]
  },
	"icon_color" : {
		"value" : "#dddddd",
		"type" : "color",
		"css-target" : ".icon",
    "css-key" : ["background-color"]
  },
	"page_background_color" : {
		"value" : "#ffffff",
		"type" : "color",
		"css-target" : ".body",
    "css-key" : ["background-color"]
  },
	"page_background_image" : {
		"value" : "",
		"type" : "file",
		"image" : 'accept="image/*"',
		"css-target" : "body",
    "css-key" : ["background-image"]
  },
};
