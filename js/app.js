
var locations = [
    {name: "Shop 'n Save", highlighted: false, type: "store", location: {lat: 39.79909749999999, lng: -77.7276519}},
    {name: "Stefan's House", highlighted: false, type: "misc", location: {lat: 39.79924800000001, lng: -77.73107149999998}},
    {name: "Dollar General", highlighted: false, type: "store", location: {lat: 39.799507, lng: -77.7267986}},
    {name: "Domino's Pizza", highlighted: false, type: "restaurant", location: {lat: 39.7992586, lng: -77.7258246}},
    {name: "Goodwill", highlighted: false, type: "store", location: {lat: 39.799414, lng: -77.7264776}},
    {name: "Sunnyway Foods Market", highlighted: false, type: "store", location: {lat: 39.795475, lng: -77.72888739999999}},
    {name: "Sunnyway Diner", highlighted: false, type: "restaurant", location: {lat: 39.7936627, lng: -77.7296104}}
];

var markers = [];
var map;
var largeInfowindow;

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
        populateInfoWindow(markers[this.id], largeInfowindow)
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
        styles: [{"featureType":"poi", "elementType":"labels", "stylers":[{"visibility": "off"}], "featureType":"all","elementType":"all","stylers":[{"invert_lightness":true},{"saturation":10},{"lightness":30},{"gamma":0.5},{"hue":"#435158"}]}]
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
            populateInfoWindow(this, largeInfowindow);
        });
        bounds.extend(markers[i].position);
        map.fitBounds(bounds);
    };
    
};

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      var windowContent = '<div>' + marker.title + '</div>';
      infowindow.setContent(windowContent);
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
      });
    }
  }

ko.applyBindings(new ViewModel());