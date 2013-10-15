var gcss = (function() {
	var fs = require('fs');
	var parse = require('css-parse');

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
				});

				var stylers = (rule.declarations || []).map(function(declaration) {
					var styler = {};
					styler[declaration.property] = declaration.value;
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