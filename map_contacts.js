const init_geocoding = () => {
  
    L.mapbox.accessToken = 'pk.eyJ1IjoibGlsaTIyMjIiLCJhIjoiY2tpaWRja2c0MDF5ZDJ4bGIybTBndWdiOCJ9.FKzFuhlP7QPd-i_U6-PHQg';
    
    //create the map
    map = L.mapbox.map('map')
    .setView([40.8859, -74.0435], 10)
    .addLayer(L.mapbox.styleLayer('mapbox://styles/lili2222/ckiih32061ow11ao23kengv8l'));
   
    console.log("Map initialized");
}

setTimeout(function() {
    plot_points();
}, 250)

// plots location of all contacts
const plot_points = () => {

    const contact_nums = parseInt(document.getElementById("num_contacts").value);

    var k = 0;
    for (var i=0; i<contact_nums; i++)
    {
        var tempX = k.toString();
        k++;
        var tempY = k.toString();

        var x = document.getElementById(tempX).value;
        var y = document.getElementById(tempY).value;

        add_marker(x,y);
        k ++;
    }    
}

const add_marker = (x,y) => {
    
    const marker = {
  
     icon: L.mapbox.marker.icon({
  
               'marker-size': 'large',
               'marker-color': '#fa0'
  
           })};
  
    L.marker([x,y], marker).addTo(map);
};

const zoom_in = (str_coordinate) => {

    console.log("Full coordinate:", str_coordinate);

    //capturing latitude and longitude as a long string
    //format: "[40.883415,-74.055652]"

    var lat = '';
    var lng = '';

    //The first character is '['
    var i = 1;

    //parse latitude (i.e. everything after "[" and before ",")
    while(str_coordinate[i] != ','){
        lat += str_coordinate[i];
        i++;
    }

    //skip the comma
    i++;

    //parse longitude (i.e. everything after "," and before "]")
    while(str_coordinate[i] != ']'){
        lng += str_coordinate[i];
        i++;
    }

    console.log("x:", lat);
    console.log("y:", lng);

    const x = parseFloat(lat);
    const y = parseFloat(lng);

    map.flyTo([x,y], 14);
}
