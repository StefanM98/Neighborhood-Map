// Locations in Sarajevo, Bosnia and Herzegovina
var locations = [
    {name: "Sebilj in Sarajevo", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8597142, lng: 18.4313161}},
    {name: "Sacred Heart Cathedral, Sarajevo", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8594, lng: 18.4254}},
    {name: "Eternal flame (Sarajevo)", visable: true, highlighted: false, type: "memorial", location: {lat: 43.858861, lng: 18.421861}},
    {name: "Sarajevo National Theatre", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8569, lng: 18.4208}},
    {name: "Avaz Twist Tower", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8555008, lng: 18.3972013}}
];


var markers = [];
var largeInfowindow;
var results = ko.observable();
var wikiData;


var ViewModel = function() {
    var self = this;
    this.map;
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
    this.windowContent = ko.observable();
    var bounds = new google.maps.LatLngBounds();
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions)
    
    // Adds all locations to markers
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].name;
        var type = locations[i].type;
        var marker = new google.maps.Marker({
            map: self.map,
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
            self.getData(marker);
        });
        bounds.extend(markers[i].position);
        self.map.fitBounds(bounds);
    };

    // Sets up inital view locations array
    this.locations = ko.observableArray([]);
    
    for (var i = 0; i < locations.length; i++) {
        self.locations().push(locations[i]);
    };
    
    self.locations.sort(function (left, right) { return left.name == right.name ? 0 : (left.name < right.name ? -1 : 1) });

    this.navToggle = ko.observable(false);

    this.toggleNav = function() {
        // Function that toggles the nav side bar
        if (this.navToggle == true) {
            document.getElementById("menu").style.width = "0";
            document.getElementById("main").style.marginLeft = "0";
            this.navToggle = false;
        }
        else {
            document.getElementById("menu").style.width = "260px";
            document.getElementById("main").style.marginLeft = "260px";
            this.navToggle = true;
        };
    };

    // Toggles the visability of the marker and list locations
    this.toggleVisability = function(location, bool) {
        if (!bool) {
            markers[location.id].setMap(null);
            self.locations.remove(location);
            location.visable = false;
        }
        else {
            markers[location.id].setMap(self.map);
            var found = false;
            for (var i = 0; i < self.locations().length; i++) {
                if (self.locations()[i].name == location.name) {
                    found = true;
                    break;
                };
            };

            if (!found) {
                self.locations.push(location);
            };
            location.visable = true;
        };
    };
    

    this.searchTerm = ko.observable("");

    this.filterList = ko.computed(function() {
        // Filters the list of items and markers using a search term
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            locations.forEach(function(location) {
                self.toggleVisability(location, true);
            });
            return self.locations.sort(function (left, right) { return left.name == right.name ? 0 : (left.name < right.name ? -1 : 1) });;
        }
        else {
            return ko.utils.arrayFilter(locations, function(location) {
                var string = location.name.toLowerCase();
				var result = (string.search(filter) >= 0);
                self.toggleVisability(location, result);
				return result;
            });
        };
    });


    // This is called when user picks a location from the list or clicks on the marker.
    this.focus = function() {
        self.map.setCenter(this.location);
        self.map.setZoom(19);
        self.getData(markers[this.id]);
    };


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
        results("");
        
        // Send API Requests
        getWiki(marker);

        ko.computed(function() {
            results();
            self.windowContent({name: marker.title, img: results().img, text: results().text});
            populateInfoWindow(marker, largeInfowindow);
        });
    };
};


function getIcon(color) {
    // Simple URL constructor for a colored marker icon
    return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color;
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
        };
    };
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
            var text = $('p', blurb)[0].textContent.replace(/(\[.*?\])/g, '');
            
            // Second request to get Wikipedia's image
            // Due to limitations of the API two requests need to be made
            $.ajax({
                type: "GET",
                url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=400&pilimit=20&wbptterms=description&gpssearch=" + marker.title + "&gpslimit=20&callback=?",
                contentType: "application/json; charset=utf-8",
                async: false,
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    if (data.query.pages[0].hasOwnProperty("thumbnail") === true) {
                        var imageURL = data.query.pages[0].thumbnail.source;
                        results({img: imageURL, text: text});
                    } else {
                        console.log("No image was found.");
                    };
                }});
        },
        error: function (errorMessage) {
            console.log("There was an error: " + errorMessage);
        }
    });
};


function populateInfoWindow(marker, infowindow) {
    infowindow.marker = marker;
    infowindow.setContent(document.getElementById("infowindow").innerHTML);
    infowindow.open(map, marker);
    
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
        infowindow.setContent("");
  });
};

function start() {
    ko.applyBindings(new ViewModel());
};

