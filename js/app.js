// Sarajevo, Bosnia and Herzegovina
var locations = [
    {name: "Latin Bridge", highlighted: false, type: "attraction", location: {lat: 43.857644, lng: 18.4267521}},
    {name: "Sacred Heart Cathedral", highlighted: false, type: "attraction", location: {lat: 43.8594, lng: 18.4254}},
    {name: "Eternal flame", highlighted: false, type: "memorial", location: {lat: 43.858861, lng: 18.421861}},
    {name: "National Gallery of Bosnia and Herzegovina", highlighted: false, type: "attraction", location: {lat: 43.857778, lng: 18.424444}},
    {name: "Sarajevo National Theatre", highlighted: false, type: "attraction", location: {lat: 43.8569, lng: 18.4208}}
]

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

var ViewModel = function() {
    var self = this;

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
        
    } 
    
    this.focus = function() {
        map.setCenter(this.location)
        map.setZoom(19)
        //console.log(getWiki(markers[this.id]))
        getWiki(markers[this.id])
        getGooglePlace(markers[this.id])
    }
   
    this.toggleHighlight = function() {
        //var thisMarker = getMarker(this.name)
        for (var i = 0; i < markers.length; i++) {
            //console.log(markers[i].title);
            if (markers[i].title == this.name) {
                var thisMarker = markers[i];
            }
        }
        //console.log(thisMarker);
        if (thisMarker.highlighted) {
            thisMarker.setIcon(getIcon('00469F'));
            thisMarker.highlighted = false;
        }
        else {
            thisMarker.setIcon(getIcon('1EADFF'));
            thisMarker.highlighted = true;
        }
        
    } 
    
};


function getIcon(color) {
    // Simple URL constructor for a colored marker icon
    return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color;
}

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
        //getWiki(marker);
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
        radius: '500',
        keyword: marker.title,
      };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var photo = results[0].photos[0];
            var photoUrl = photo.getUrl({'maxWidth': 350, 'maxHeight': 350});
        }
      }

}

function getStreetView(marker) {
    var location = locations[marker.id].location.lat + "," + locations[marker.id].location.lng;
    var parms = "location=" + location + "&size=300x250&key=" + googleKey;

    var imageUrl = streetviewURL + parms;
    convertFunction(imageUrl, function(base64Img){
        var img = "<img src='"+base64Img+"'>";
        windowContent = img;
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

    getStreetView(marker);

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
            // If not return message to user
            catch(error) {
                var message = "<div>No Wikipedia data to display.</div>";
                windowContent += message;
                populateInfoWindow(marker, largeInfowindow);
                return;
            }
            // If data is returned add to windowContent
            var blurb = $('<div></div>').html(result);
            // Add to windowContent after removing references ex. [2][3]
            windowContent += $('p', blurb)[0].textContent.replace(/(\[.*?\])/g, '');
            populateInfoWindow(marker, largeInfowindow);
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
      //getWiki(marker);
      //var windowContent = getWiki(marker);
      //console.log(windowContent);
      //var windowContent = '<div>' + marker.title + '</div>';
      infowindow.setContent(windowContent);
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
      });
    }
  }

ko.applyBindings(new ViewModel());