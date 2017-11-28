# Neighborhood-Map
A simple application that displays a map of a given neighborhood with points of interest within it and information about those points. 

![Screenshot of the app](/screenshots/img1.JPG?raw=true)

By default the application shows historic buildings and landmarks in Sarajevo, Bosnia and Herzegovina and displays a brief description of them along with an image. However, the application simply uses the cordinates and name of the location to find it, meaning that you can change the locations to just about any place that has a Wikipedia page!

![Screenshot of the infowindow](/screenshots/img2.JPG?raw=true)

## How it works
This application was created using Knockout.js, the Google Maps API, and Wikipedia API. It loads a list of locations that the user can click to learn more about. Once clicked, the map focuses on the location and provides the user with custom information about the location along with an image that is pulled directly from the location's Wikipedia article. Users can also filter or search the map for specific locations.

### How to use
1. Click [here](http://stefandev.com/Neighborhood-Map/) to try it out.
2. Click on any marker on map or location in sidebar. Information is automatically fetched from Wikipedia.
3. Type in the white search bar to filter the list and make the place easier to spot.

### How to run locally
A very simplistic and lightweight python HTTP server script is included if you want to host your own version of the app. Using it is as simple as running one command! Just follow these simple steps:

1. Ensure python is installed
2. Open command prompt and navigate to the script directory (Example: cd C:\Users\Public\Neighborhood-Map)
3. Start the server by entering 'python server.py'
4. Access the app by navigating to http://localhost:8000
5. To stop the server use Ctrl+C

### Future Updates
- Store the locations on a database
- Implement a way for the user to add their own locations
- Filter the locations by type (ex: attraction, landmark etc.)
- Add other APIs like Foursquare or Yelp for more information
- Add light or dark theme options
- Handle layout changes with knockout rather than jQuery
- Replace deprecated success and error with .done() and .fail()