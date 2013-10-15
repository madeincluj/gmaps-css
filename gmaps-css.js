var fs = require('fs');
var parse = require('css-parse');

var css = fs.readFileSync('test.css', 'utf-8');
var json = parse(css);

var styles = [];
json.stylesheet.rules.forEach(function(rule) {
	var selectors = rule.selectors.map(function(selector) {
		var parts = selector.split(':');
		return {
			elementType: parts[0] || 'all',
			featureType: parts[1] || 'all'
		};
	});

	var stylers = rule.declarations.map(function(declaration) {
		var styler = {};
		styler[declaration.property] = declaration.value;
		return styler;
	});

	selectors.forEach(function(selector) {
		selector.stylers = stylers;
		styles.push(selector);
	});
});

console.log(JSON.stringify(styles, null, 2));