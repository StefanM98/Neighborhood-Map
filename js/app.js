// Locations in Sarajevo, Bosnia and Herzegovina
var locations = [
    {name: "Sebilj in Sarajevo", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8597142, lng: 18.4313161}},
    {name: "Sacred Heart Cathedral, Sarajevo", visable: true, highlighted: false, type: "church", location: {lat: 43.8594, lng: 18.4254}},
    {name: "Eternal flame (Sarajevo)", visable: true, highlighted: false, type: "memorial", location: {lat: 43.858861, lng: 18.421861}},
    {name: "Sarajevo National Theatre", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8569, lng: 18.4208}},
    {name: "Avaz Twist Tower", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8555008, lng: 18.3972013}},
    {name: "Saint Joseph's Church, Sarajevo", visable: true, highlighted: false, type: "church", location: {lat: 43.855368, lng: 18.4080683}},
    {name: "Ali Pasha Mosque (Sarajevo)", visable: true, highlighted: false, type: "church", location: {lat: 43.8580121, lng: 18.4105339}},
    {name: "National and University Library of Bosnia and Herzegovina", visable: true, highlighted: false, type: "attraction", location: {lat: 43.8574298, lng: 18.4119343}}
];


var markers = [];
var largeInfowindow;
var results = ko.observable();
var wikiData;


var ViewModel = function() {
    var self = this;
    var mapOptions = {
        zoom: 16,
        center: locations[0].location,
        disableDefaultUI: true,
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
    largeInfowindow.map = null;
    this.windowContent = ko.observable();
    var bounds = new google.maps.LatLngBounds();
    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // When the window is resized, reopen the infowindow if it is open
    google.maps.event.addDomListener(window, "resize", function() {
        if (largeInfowindow.map !== null) {
            largeInfowindow.open(self.map);
        }
    });

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
            icon: getIcon("00469F")
        });
        locations[i].id = marker.id;
        markers.push(marker);
        bounds.extend(markers[i].position);
        self.map.fitBounds(bounds);
    }

    // Sets up inital view locations array
    this.locations = ko.observableArray([]);
    for (var x = 0; x < locations.length; x++) {
        self.locations().push(locations[x]);
    }

    self.locations.sort(function (left, right) {
        return left.name == right.name ? 0 : (left.name < right.name ? -1 : 1);
    });

    this.navToggle = ko.observable(false);

    this.toggleNav = function() {
        // Function that toggles the nav side bar

        if ($(window).width() <= 500) {
            if (this.navToggle === true) {
                document.getElementById("menu").style.width = "0";
                this.navToggle = false;
            }
            else {
                document.getElementById("menu").style.width = "260px";
                this.navToggle = true;
            }
        }
        else {
            if (this.navToggle === true) {
                document.getElementById("menu").style.width = "0";
                document.getElementById("main").style.marginLeft = "0";
                this.navToggle = false;
            }
            else {
                document.getElementById("menu").style.width = "270px";
                document.getElementById("main").style.marginLeft = "260px";
                this.navToggle = true;
            }
        }
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
                }
            }

            if (!found) {
                self.locations.push(location);
            }
            location.visable = true;
        }
    };


    this.searchTerm = ko.observable("");

    this.filterList = ko.computed(function() {
        // Filters the list of items and markers using a search term
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            locations.forEach(function(location) {
                self.toggleVisability(location, true);
            });
            return self.locations.sort(function (left, right) {
                return left.name == right.name ? 0 : (left.name < right.name ? -1 : 1);
            });
        }
        else {
            return ko.utils.arrayFilter(locations, function(location) {
                var string = location.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                self.toggleVisability(location, result);
                return result;
            });
        }
    });


    // This is called when user picks a location from the list or clicks on the marker.
    this.focus = function() {

        if ($(window).width() <= 700) {
            self.toggleNav();
        }
        doBounce(markers[this.id]);
        self.map.setCenter(this.location);
        self.map.setZoom(18);
        self.getData(markers[this.id]);
    };


    // "Highlights" the marker by changing it's color
    this.toggleHighlight = function() {
        var thisMarker;
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == this.name) {
                thisMarker = markers[i];
            }
        }
        if (thisMarker.highlighted) {
            thisMarker.setIcon(getIcon("00469F"));
            thisMarker.highlighted = false;
        }
        else {
            thisMarker.setIcon(getIcon("1EADFF"));
            thisMarker.highlighted = true;
        }
    };

    // Gets data from APIs
    this.getData = function(marker) {
        results("");

        // Send API Requests
        getWiki(marker);

        // Once data is recieved, display the data
        ko.computed(function() {
            results();
            var data = {name: marker.title, img: results().img, 
                text: results().text, link: results().wikiLink};
            self.displayData(data, marker);
        });
    };

    this.displayData = function(data, marker) {
        
        if (!data.img || !data.text) {
            // Prevents 404 error by temporarly changing the src
            data.img = "";
            // Displays temporary text instead of 'undefined'
            data.text = "";
            data.name = "Loading...";
            data.link = "#";
        };

        windowContent = 
            "<div class='infowindow'> \
                <div class='wikiimage'> \
                    <img class='locationimg' src='" + data.img + "' onerror='imgError(this);'></img> \
                </div> \
                <div class='wikitext'> \
                    <h3 placeholder='loading'>" + data.name + "</h3> \
                    <p>" + data.text + "</p> \
                    <a href='" + data.link + "'>Powered by Wikipedia</a> \
                </div> \
            </div>";
        populateInfoWindow(marker, largeInfowindow);
    };

    this.addClickListener = function(marker) {
        marker.addListener("click", function() {
            doBounce(this);
            self.getData(this);
        });
    };
    
    for (var m = 0; m < markers.length; m++) {
        self.addClickListener(markers[m]);
    }
};


function getIcon(color) {
    // Simple URL constructor for a colored marker icon
    return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color;
}

function doBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 750);
}



function getWiki(marker) {
    var wikiURL = "http://en.wikipedia.org/w/api.php?";
    var url = wikiURL + "action=parse&format=json&prop=text&section=0&page=" +
    marker.title + "&callback=?";

    $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-8",
        async: true,
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            var result;
            //Checks if there any data is returned
            try {
                result = data.parse.text["*"];
            }
            // If not dispaly error to user
            catch(error) {
                alert("Error. Unable to retrive location data. Error message: " + error);
            }

            // If data is returned extract the paragraph text
            // Create dummy DOM element for easy data extraction
            var dummyNode = document.createElement('div'),
                resultText = '';
            dummyNode.innerHTML = result;
            var p = dummyNode.getElementsByTagName("p")[0];
            // Store text after removing references (ex. [2][3])
            var text = p.textContent.replace(/(\[.*?\])/g, "");


            // Second request to get Wikipedia's image
            // Due to limitations of the API two requests need to be made
            $.ajax({
                type: "GET",
                url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=400&pilimit=20&wbptterms=description&gpssearch=" + marker.title + "&gpslimit=20&callback=?",
                contentType: "application/json; charset=utf-8",
                async: true,
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    if (data.query.pages[0].hasOwnProperty("thumbnail") === true) {
                        var wikiLink = "https://en.wikipedia.org/?curid=" + data.query.pages[0].pageid;
                        var imageURL = data.query.pages[0].thumbnail.source;
                        results({img: imageURL, text: text, wikiLink: wikiLink});
                    } else {
                        alert("No image was found.");
                    }
                },
                error: function (errorMessage) {
                    alert("There was an error getting the image: " + errorMessage);
                }
            });
        },
        error: function (errorMessage) {
            alert("There was an error getting the Wiki text: " + errorMessage);
        }
    });
}

function populateInfoWindow(marker, infowindow) {
    infowindow.marker = marker;
    infowindow.setContent(windowContent);
    infowindow.open(map, marker);

    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener("closeclick", function(){
        infowindow.setMarker = null;
        infowindow.close();
        infowindow.setContent("");
  });
}

// Error Handling

function imgError(image) {
    // Function that displays a loading icon while the ajax requests process
    image.onerror = "";
    image.src = "images/loading_ring.svg";
    image.class = "loading";
    image.parentElement.style.height = '125px';
    image.parentElement.style.width = '125px';
    return true;
}

function gmapsError() {
    alert("Google Maps Failed to load.");
}

function start() {
    ko.applyBindings(new ViewModel());
}

