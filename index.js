const fs = require('fs');
const fetch = require('isomorphic-fetch');
const countryCodes = require('./country_codes');

/**
 * Gathers cities according to the first letter of the name and displays them into the object.
 * 
 * @param {object[]}} response 
 */
const categorize = cities => (
    cities.filter(city => !!city.name.match(/[а-яА-Я]/g))
    .sort((a, b) => a.name > b.name ? 1 : -1)
    .reduce((accum, city) => (
        Object.defineProperty(accum, city.name.charAt(0).toLowerCase(), {
            value: (
                accum[city.name.charAt(0).toLowerCase()] == undefined 
                ? [city] 
                : [...accum[city.name.charAt(0).toLowerCase()], city]),
            enumerable: true,
            configurable: true,
            writable: true
        })
    ), {})
);

Promise.all(countryCodes.map(e => (
    fetch(`http://api.geonames.org/search?country=${e}&type=json&maxRows=200&cities=cities5000&lang=ru&username=wldyslw`)
    .then(response => response.json(), console.error)
)))
.then(citiesByCountry => (
    citiesByCountry.reduce((a, c) => [...a, ...(c.geonames)], []).map(city => ({
        name: city.name,
        lat: city.lat,
        lng: city.lng
    }))
))
.then(cities => fs.writeFile(
    'cities.json', 
    JSON.stringify(categorize(cities)),
    err => err ? console.error(err) : console.log('Success!')
));