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
 * @version 1.0.0 July 2020 
 *          1.0.1 August 2021. Bootstrap removed
 *                             Style improvements
 */
    
    let latitude = 0;
    let longitude = 0;
 
    // "Town Information" button clicked 
    $("#btnTownInfo").click(function(e) {
        e.preventDefault();

        const townName = $("#txtTown").val().trim();
        if (townName == "") {
            showError("empty");
            return;
        }

        const URL = 'https://api.openweathermap.org/data/2.5/weather?q=' + townName + '&units=metric&appid=' + weatherAPIKey;

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

                $("#weatherInfo").show();

                longitude = data.coord.lon;
                latitude = data.coord.lat;

                showMap(longitude, latitude);
                showEvents(data.name);                
            })
            .fail(function(data) {
                showError(data.status.toString());
            })
        });   

    $(window).on("resize", function() {
        if ($("#weatherInfo").css("display") !== "none") {
            showMap(longitude, latitude);
        }
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
    let mapWidth;

    if ($("#map").css("display") === "block") {
        mapWidth = ($("#weatherInfo").width()).toFixed(0);
    } else {
        const padding = 32;
        mapWidth = ($("#weatherInfo").width() - $("#weather").width() - padding).toFixed(0);
    }    
    $("#map").width(mapWidth);

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
                    "class": "alert"
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