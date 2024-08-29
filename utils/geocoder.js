const NodeGeocoder = require("node-geocoder");

const options = {
    provider: process.env.G_PROVIDER,
    apiKey: process.env.G_API_KEY,
    formatter: null
}

const geoCoder = NodeGeocoder(options);
module.exports = geoCoder;