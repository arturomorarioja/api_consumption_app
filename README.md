# KEA.dk. Front-End Sample App
# API Consumption

## Purpose
This is a sample front-end web application for the students at KEA (Københavns Erhvervsakademi / Copenhagen School of Design and Technology). 

The application consumes three APIs:<br>
- OpenWeather Current Weather: https://openweathermap.org/current
- MapBox Static Images: https://docs.mapbox.com/api/maps/#static-images
- TicketMaster Discovery API: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

In order to run the app, it is necessary to add the file js/keys.js, which contains the following:
```javascript
var weatherAPIKey = '<key_provided_by_OpenWeather>';
var mapAPIKey = '<key_provided_by_MapBox>';
var eventsAPIKey = '<key_provided_by_TicketMaster>';
```

## Tools
JavaScript / jQuery / CSS3 / HTML5