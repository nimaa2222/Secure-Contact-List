var form_to_submit;

const process_address = (street, city, state, zip, form) => {

    var comma = ', ';
    
    //retrieve the address (street, city, state zip)
    var address = document.getElementById(street).value + comma;
    address += document.getElementById(city).value + comma;
    address += document.getElementById(state).value + " ";
    address += document.getElementById(zip).value;

    console.log("Full address:", address);

    //provide access token to perform query 
    L.mapbox.accessToken = 'pk.eyJ1IjoibGlsaTIyMjIiLCJhIjoiY2tpaWRja2c0MDF5ZDJ4bGIybTBndWdiOCJ9.FKzFuhlP7QPd-i_U6-PHQg';

    form_to_submit = form;
    
    //query the address
    const geocoder = L.mapbox.geocoder('mapbox.places');
    geocoder.query(address, find_location);
}

const find_location = (err, data) => { 

   if (err){
    console.error("There was an error in geocoding!");
   }

   if (data.latlng){
    console.log(data.latlng);
    record_coordinate(data.latlng);
    }

   else 
    console.log("Place couldn’t be located");

    //submit the form
    document.getElementById(form_to_submit).submit();
}

const record_coordinate = (coordinate) => {
    const x = parseFloat(coordinate[0])
    const y = parseFloat(coordinate[1])
    document.getElementById("latitude").value = x;
    document.getElementById("longitude").value = y;
}
