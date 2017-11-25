// Locations in Sarajevo, Bosnia and Herzegovina
var locations = [
    {name: "Sebilj in Sarajevo", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8597142, lng: 18.4313161}},
    {name: "Sacred Heart Cathedral", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8594, lng: 18.4254}},
    {name: "Eternal flame", visable: true, highlighted: false, type: "memorial", location: {lat: 43.858861, lng: 18.421861}},
    {name: "National Gallery of Bosnia and Herzegovina", visable: true, highlighted: false, type: "attraction", location: {lat: 43.857778, lng: 18.424444}},
    {name: "Sarajevo National Theatre", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8569, lng: 18.4208}}
];

/*
//My Neighborhood
var locations = [
    {name: "Shop 'n Save", highlighted: false, type: "store", location: {lat: 39.79909749999999, lng: -77.7276519}},
    {name: "Stefan's House", highlighted: false, type: "misc", location: {lat: 39.79924800000001, lng: -77.73107149999998}},
    {name: "Dollar General", highlighted: false, type: "store", location: {lat: 39.799507, lng: -77.7267986}},
    {name: "Domino's Pizza", highlighted: false, type: "restaurant", location: {lat: 39.7992586, lng: -77.7258246}},
    {name: "Goodwill Industries", highlighted: false, type: "store", location: {lat: 39.799414, lng: -77.7264776}},
    {name: "Sunnyway Foods Market", highlighted: false, type: "store", location: {lat: 39.795475, lng: -77.72888739999999}},
    {name: "Sunnyway Diner", highlighted: false, type: "restaurant", location: {lat: 39.7936627, lng: -77.7296104}}
];
*/


var markers = [];
var map;
var largeInfowindow;
var WikiResult;
var windowContent;
var streetviewURL = "https://maps.googleapis.com/maps/api/streetview?";
var googlePlaceSearchURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
var googlePlacePhotoURL = "https://maps.googleapis.com/maps/api/place/photo?";
var googleKey = "AIzaSyCHok7pIXvTWpSVIPwgG5DN_OHmNDiTsds"

var wikiData = ko.observable();
var streetViewData = ko.observable();


var ViewModel = function() {
    var self = this;
    
    // Sets up inital view locations
    this.locations = ko.observableArray([]);

    for (var i = 0; i < locations.length; i++) {
        self.locations().push(locations[i]);
    };


    // Function that toggles the nav side bar
    this.navToggle = ko.observable(false);
    this.toggleNav = function() {
        if (this.navToggle == true) {
            document.getElementById("menu").style.width = "0";
            document.getElementById("main").style.marginLeft = "0";
            this.navToggle = false;
        }
        else {
            document.getElementById("menu").style.width = "260px";
            document.getElementById("main").style.marginLeft = "260px";
            this.navToggle = true;
        }
        
    };
    
    // Function that filters the list of items and markers using a search term
    this.searchTerm = ko.observable("");
    this.filterList = ko.computed(function() {
        var filter = self.searchTerm();
        if (!filter) {
            locations.forEach(function(item) {
                //item.visible(true);
            });
        };
    });


    // This is called when user picks a location from the list or clicks on the marker.
    this.focus = function() {
        map.setCenter(this.location);
        map.setZoom(19);
        self.getData(markers[this.id]);
    };

    // Toggles the visability of the marker and list locations
    this.toggleVisability = function(location) {
        if (location.visable) {
            markers[location.id].setMap(null);

            location.visable = false;
        }
        else {
            markers[location.id].setMap(map);
            location.visable = true;
        }
    }
   
    // "Highlights" the marker by changing it's color
    this.toggleHighlight = function() {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == this.name) {
                var thisMarker = markers[i];
            }
        }
        if (thisMarker.highlighted) {
            thisMarker.setIcon(getIcon('00469F'));
            thisMarker.highlighted = false;
        }
        else {
            thisMarker.setIcon(getIcon('1EADFF'));
            thisMarker.highlighted = true;
        }
        
    }; 
    this.getData = function(marker) {
        var responsesRecieved = 0;
        // Clear window content
        windowContent = '';

        // Send API Requests
        getWiki(marker);
        getStreetView(marker);

        // Check if responses are recieved
        wikiData.subscribe(function (data) {
            responsesRecieved += 1;
            windowContent += data.text;
            windowContent += data.imageUrl;
            //console.log(data.imageUrl);
            //console.log(windowContent);
            if (responsesRecieved == 2) {
                populateInfoWindow(marker, largeInfowindow);
            };
         });

         streetViewData.subscribe(function (data) {
            responsesRecieved += 1;
            windowContent += data;
            //console.log(windowContent);
            if (responsesRecieved == 2) {
                populateInfoWindow(marker, largeInfowindow);
            };
         });

    };



};


function getIcon(color) {
    // Simple URL constructor for a colored marker icon
    return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color;
};

function initMap() {

    var mapOptions = {
        zoom: 16,
        center: locations[0].location,
        clickableIcons: false,
        styles: [
            {
                "featureType": "all",
                "elementType": "all",
                "stylers": [
                    {
                        "invert_lightness": true
                    },
                    {
                        "saturation": 10
                    },
                    {
                        "lightness": 30
                    },
                    {
                        "gamma": 0.5
                    },
                    {
                        "hue": "#435158"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            }
        ]
    };

    largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    map = new google.maps.Map(document.getElementById('map'), mapOptions)
    
    // Adds all locations to markers
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].name;
        var type = locations[i].type;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            type: type,
            animation: google.maps.Animation.DROP,
            id: i,
            icon: getIcon('00469F')
        })
        locations[i].id = marker.id;
        markers.push(marker);
        marker.addListener('click', function() {
            getWiki(this);
        });
        bounds.extend(markers[i].position);
        map.fitBounds(bounds);
    };
    
};

function getGooglePlace(marker) {
    var location = {"lat": locations[marker.id].location.lat, "lng": locations[marker.id].location.lng};
    var parms = "location=" + location + "keyword=" + marker.title + "&radius=300&key=" + googleKey;
    
    var request = {
        location: location,
        radius: '300',
        keyword: marker.title,
      };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var photo = results[0].photos[0];
            var photoUrl = "<img>" + 
            photo.getUrl({'maxWidth': 350, 'maxHeight': 350}) +
            "</img>";
            //console.log(photoUrl);
            //windowContent += photoUrl;
        }
      }

}

function getStreetView(marker) {
    var location = locations[marker.id].location.lat + "," + locations[marker.id].location.lng;
    var parms = "location=" + location + "&size=300x250&key=" + googleKey;

    var imageUrl = streetviewURL + parms;
    convertFunction(imageUrl, function(base64Img){
        var img = "<img src='"+base64Img+"'>";
        streetViewData(img);
    });
            
    function convertFunction (url, callback){
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {
            var reader  = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.send();
    }

};

function getWiki(marker){
    var wikiURL = "http://en.wikipedia.org/w/api.php?";
    var url = wikiURL + "action=parse&format=json&prop=text&section=0&page=" + 
    marker.title + '&callback=?';

    $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            //Checks if there any data is returned
            try {
                var result = data.parse.text["*"];
            }
            // If not try to include the location in the page name
            catch(error) {
                // Alternate URL that includes the location
                var altUrl = wikiURL + 
                    "action=parse&format=json&prop=text&section=0&page=" + 
                    marker.title + " (Sarajevo)" + '&callback=?';
                // Check if the alternate URL is being used. 
                //If not use it and try again
                if (url != altUrl) {
                    url = altUrl;
                    //try again
                    $.ajax(this);
                    return;
                }
                // If both requests fail return message.
                else {
                    var message = "<div>No Wikipedia data to display.</div>";
                    return message;
                }
            }
            // If data is returned add to windowContent
            var blurb = $('<div></div>').html(result);
            // Store text data after removing references ex. [2][3]
            var text = "<p>" + $('p', blurb)[0].textContent.replace(/(\[.*?\])/g, '') + "</p>";
            
            // Second request to get Wikipedia's image
            // Due to limitations of the API two requests need to be made
            $.ajax({
                type: "GET",
                url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=250&pilimit=20&wbptterms=description&gpssearch=" + marker.title + "&gpslimit=20&callback=?",
                contentType: "application/json; charset=utf-8",
                async: false,
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    if (data.query.pages[0].hasOwnProperty("thumbnail") === true) {
                        var imageURL = "<img src=" + data.query.pages[0].thumbnail.source + "></img>";
                        //console.log(imageURL);
                        //console.log(text)
                        wikiData({imageURL: imageURL, text: text});
                    } else {
                        console.log("No image was found.");
                    };
                }})
            //populateInfoWindow(marker, largeInfowindow);
        },
        error: function (errorMessage) {
            console.log("There was an error: " + errorMessage);
        }
    });
};

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent(windowContent);
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
      });
    }
  }


ko.applyBindings(new ViewModel());