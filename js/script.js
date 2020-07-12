$(document).ready(function() {
/**
 * Front-end API consumption - sample application
 * 
 * This application consumes the following APIs:
 * - OpenWeather (openweathermap.org). Current weather data: https://openweathermap.org/current
 * - MapBox (mapbox.com). Maps: https://docs.mapbox.com/api/maps/#static-images
 * - TicketMaster (developer.ticketmaster.com/). Events (Discovery API): https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 * 
 * @author  Arturo Mora-Rioja
 * @version 1.0, July 2020 
 */
    $("#weatherInfo").hide();
    $("#eventInfo").hide();
 
    // "Check the Weather" button clicked 
    $("#btnTownInfo").click(function() {
        if ($("#txtTown").val().trim() == "") {
            showError("empty");
            return;
        }

        const URL = 'https://api.openweathermap.org/data/2.5/weather?q=' + $("#txtTown").val() + '&units=metric&appid=' + weatherAPIKey;

        $("#errorMessage").hide();
        $.ajax({
                url: URL,
                type: "GET"
            }).
            done(function(data) {
                // Load weather information
                $("#townName").html(data.name + ', ' + data.sys.country);
                $("#mainWeather").html(data.weather[0].main);
                $("#temperature").html(data.main.temp);
                $("#feelsLike").html(data.main.feels_like);
                $("#humidity").html(data.main.humidity);
                $("#wind").html(data.wind.speed);

                showMap(data.coord.lon, data.coord.lat);
                showEvents(data.name);
                
                $("#weatherInfo").show();
            })
            .fail(function(data) {
                showError(data.status.toString());
            })
        });   
});

// Shows an error message corresponding to the code it receives as parameter
function showError(code) {
    let msgError;

    switch (code) {
        case "empty": msgError = "Please insert a town name"; break;
        case "404": msgError = "There is no information for this town"; break;
        default: msgError = "There was an error while processing the request"; break;
    }
    $("#errorMessage").html(msgError);
    $("#weatherInfo").hide();
    $("#eventInfo").hide();
    $("#errorMessage").show();
}

// Shows the map corresponding to the geographical coordinates received as parameters
function showMap(longitude, latitude) {
    const userName = 'mapbox';
    const mapWidth = ($("#mapDiv").width()).toFixed(0);

    const URL = 'https://api.mapbox.com/styles/v1/' + userName + '/streets-v11/static/' + 
        longitude + ',' + latitude + ',12,0,60/' + mapWidth + 'x200?access_token=' + mapAPIKey;
    $("#map").prop("src", URL);
}

// Shows the events in the specified location
function showEvents(townName) {
    const URL = 'https://app.ticketmaster.com/discovery/v2/events?apikey=' + eventsAPIKey + 
        '&locale=*&city=' + townName;
    $("#eventList").html("");

    $.ajax({
        url: URL,
        type: "GET"
    }).
    done(function(data) {
        if (data.page.totalElements == 0) {
            $("#eventList").html("There are no events scheduled for the selected town");
            $("#eventInfo").show();
            return;
        }

        data._embedded.events.forEach (function(item) {
            let venues = item._embedded.venues;
            let eventText = item.name + '<br>';
            eventText += item.dates.start.localDate + ' ' + item.dates.start.localTime;
            for (let venue of venues) {
                eventText += ', ' + venue.name;
            }
            
            let event = $('<p />', {
                "html": eventText,
                "class": "event"
            });

            // If the show has been cancelled or rescheduled, an informative text is added
            let statusCode = item.dates.status.code;
            if (statusCode !== 'onsale') {
                let status = $('<span />', {
                    "text": ' (' + statusCode + ')',
                    "class": "red"
                });
                event.append(status);
            }

            $("#eventList").append(event);
        });
        // A light blue background is set on odd events; white background remains in even events
        $("#eventList > p:odd").addClass("oddEvent");
        $("#eventInfo").show();
    }).
    fail(function(data) {
        $("#eventInfo").hide();
    });
}