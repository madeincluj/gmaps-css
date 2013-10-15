var gcss = (function() {
	var fs = require('fs');
	var parse = require('css-parse');

	function parseColor(str) {
		var hex = /^#[0-9a-f]{6}$/i;
		var short_hex = /^#([0-9a-f]{3})$/i;
		var rgb = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;

		if (str.match(hex)) return str;
		if (str.match(short_hex)) {
			var color = str.match(short_hex)[1];
			return '#' + color.split('').map(function(i) {
				return i + i + '';
			}).join('');
		}
		if (str.match(rgb)) {
			var parts = str.match(rgb);
			return "#" + parts.slice(1,4).map(function(i) {
				return (i < 16 ? '0' : '') + parseInt(i, 10).toString(16);
			}).join('');
		}
	};

	function noop(val) { return val; };

	var parseValue = {
		hue: parseColor,
		lightness: trimQuotes,
		saturation: trimQuotes,
		gamma: trimQuotes,
		inverse_lightness: noop,
		visibility: trimQuotes,
		color: parseColor,
		weight: trimQuotes
	};

	function trimQuotes(str) {
		return str.replace(/\"/g, '').replace(/\'/g, '');
	};

	var STYLERS = {
	    "hue": "(an RGB hex string) indicates the basic color.",
	    "lightness": "(a floating point value between -100 and 100) indicates the percentage change in brightness of the element. Negative values increase darkness (where -100 specifies black) while positive values increase brightness (where +100 specifies white).",
	    "saturation": "(a floating point value between -100 and 100) indicates the percentage change in intensity of the basic color to apply to the element.",
	    "gamma": "(a floating point value between 0.01 and 10.0, where 1.0 applies no correction) indicates the amount of gamma correction to apply to the element. Gammas modify the lightness of hues in a non-linear fashion, while not impacting white or black values. Gammas are typically used to modify the contrast of multiple elements. For example, you could modify the gamma to increase or decrease the contrast between the edges and interiors of elements. Low gamma values (< 1) increase contrast, while high values (> 1) decrease contrast.",
	    "inverse_lightness": "(if true) simply inverts the existing lightness. This is useful, for example, for quickly switching to a darker map with white text.",
	    "visibility": "(on, off, or simplified) indicates whether and how the element appears on the map. A simplified visibility removes some style features from the affected features; roads, for example, are simplified into thinner lines without outlines, while parks lose their label text but retain the label icon.",
	    "color": "(an RGB hex string) sets the color of the feature.",
	    "weight": "(an integer value, greater than or equal to zero) sets the weight of the feature, in pixels. Setting the weight to a high value may result in clipping near tile borders."
	};

	var ELEMENT_TYPES = {
    	"all": "(default) selects all elements of that feature.",
    	"geometry": "selects all geometric elements of that feature.",
        "geometry.fill": "selects only the fill of the feature's geometry.",
        "geometry.stroke": "selects only the stroke of the feature's geometry.",
    	"labels": "selects only textual labels associated with that feature.",
        "labels.icon": "selects only the icon displayed within the feature's label.",
        "labels.text": "selects only the text of the label.",
        "labels.text.fill": "selects only the fill of the label. The fill of a label is typically rendered as a colored outline that surrounds the label text.",
        "labels.text.stroke": "selects only the stroke of the label's text."
	};
	
	var FEATURE_TYPES = {
		"administrative": "Apply the rule to administrative areas.",
		"administrative.country": "Apply the rule to countries.",
		"administrative.land_parcel": "Apply the rule to land parcels.",
		"administrative.locality": "Apply the rule to localities.",
		"administrative.neighborhood": "Apply the rule to neighborhoods.",
		"administrative.province": "Apply the rule to provinces.",
		"all": "Apply the rule to all selector types.",
		"landscape": "Apply the rule to landscapes.",
		"landscape.man_made": "Apply the rule to man made structures.",
		"landscape.natural": "Apply the rule to natural features.",
		"landscape.natural.landcover": "Apply the rule to landcover.",
		"landscape.natural.terrain": "Apply the rule to terrain.",
		"poi": "Apply the rule to points of interest.",
		"poi.attraction": "Apply the rule to attractions for tourists.",
		"poi.business": "Apply the rule to businesses.",
		"poi.government": "Apply the rule to government buildings.",
		"poi.medical": "Apply the rule to emergency services (hospitals, pharmacies, police, doctors, etc).",
		"poi.park": "Apply the rule to parks.",
		"poi.place_of_worship": "Apply the rule to places of worship, such as church, temple, or mosque.",
		"poi.school": "Apply the rule to schools.",
		"poi.sports_complex": "Apply the rule to sports complexes.",
		"road": "Apply the rule to all roads.",
		"road.arterial": "Apply the rule to arterial roads.",
		"road.highway": "Apply the rule to highways.",
		"road.highway.controlled_access": "Apply the rule to controlled-access highways.",
		"road.local": "Apply the rule to local roads.",
		"transit": "Apply the rule to all transit stations and lines.",
		"transit.line": "Apply the rule to transit lines.",
		"transit.station": "Apply the rule to all transit stations.",
		"transit.station.airport": "Apply the rule to airports.",
		"transit.station.bus": "Apply the rule to bus stops.",
		"transit.station.rail": "Apply the rule to rail stations.",
		"water": "Apply the rule to bodies of water."
	};

	return {
		parse: function(css) {
			var json = parse(css);
			var styles = [];
			(json.stylesheet.rules || []).forEach(function(rule) {
				var selectors = (rule.selectors || []).map(function(selector) {
					var parts = selector.split(':');
					return {
						featureType: parts[0] || 'all',
						elementType: parts[1] || 'all'
					};
				}).filter(function(selector) {
					return FEATURE_TYPES[selector.featureType] !== undefined && ELEMENT_TYPES[selector.elementType] !== undefined;
				});

				var stylers = (rule.declarations || []).map(function(declaration) {
					var styler = {};
					var val;
					styler[declaration.property] = (parseValue[declaration.property] || noop)(declaration.value);
					return styler;
				});

				selectors.forEach(function(selector) {
					selector.stylers = stylers;
					styles.push(selector);
				});
			});
			return styles;
		}
	}
})();

module.exports = gcss; 