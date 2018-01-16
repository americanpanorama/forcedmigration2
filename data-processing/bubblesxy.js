const d3 = require("d3");
const hexData = require("./simplified_hexes.json");

var projection = d3.geo.azimuthalEqualArea()
	.scale(1)
	.rotate([-100, 45].map(latlng => latlng * -1))
	.center([11, -10]);

var processed = hexData.map(hex => {
	var xy = projection([hex.lng, hex.lat]);
	delete hex.lng;
	delete hex.lat;
	hex.cx = xy[0] - 480;
	hex.cy = xy[1] - 250;
	return hex;
});

console.log(JSON.stringify(processed));