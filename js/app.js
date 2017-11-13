


var locations = [
    {name: "Shop 'n Save", highlighted: false, type: "store", location: {lat: 39.79909749999999, lng: -77.7276519}},
    {name: "Stefan's House", highlighted: false, type: "misc", location: {lat: 39.79924800000001, lng: -77.73107149999998}},
    {name: "Dollar General", highlighted: false, type: "store", location: {lat: 39.799507, lng: -77.7267986}},
    {name: "Domino's Pizza", highlighted: false, type: "restaurant", location: {lat: 39.7992586, lng: -77.7258246}},
    {name: "Goodwill Industries", highlighted: false, type: "store", location: {lat: 39.799414, lng: -77.7264776}},
    {name: "Sunnyway Foods Market", highlighted: false, type: "store", location: {lat: 39.795475, lng: -77.72888739999999}},
    {name: "Sunnyway Diner", highlighted: false, type: "restaurant", location: {lat: 39.7936627, lng: -77.7296104}}
];

var markers = [];
var map;
var largeInfowindow;
var WikiResult;
var windowContent;
var streetviewURL = "https://maps.googleapis.com/maps/api/streetview?";
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
        styles: [{"featureType":"poi.business", "elementType":"all", 
        "stylers":[{"visibility": "off"}], "featureType":"all","elementType":"all",
        "stylers":[{"invert_lightness":true},{"saturation":10},{"lightness":30},{"gamma":0.5},
        {"hue":"#435158"}]}]
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

function getStreetView(marker) {
    var location = locations[marker.id].location.lat + "," + locations[marker.id].location.lng;
    var parms = "location=" + location + "&size=300x250&key=" + googleKey;

    // $.ajax({
    //     type: "GET",
    //     url: streetviewURL + parms,
    //     //contentType: "application/json; charset=utf-8",
    //     async: false,
    //     dataType: "json",
    //     success: function (data, textStatus, jqXHR) {
            
    //         console.log(data);
    //         //populateInfoWindow(marker, largeInfowindow);
    //         //$('#article').html($(blurb).find('p'));
    //     },
    //     error: function (errorMessage) {
    //         console.log("There was an error: " + errorMessage);
    //     }
    // });

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