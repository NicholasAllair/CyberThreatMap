# CyberThreatMap

MongoDB setup required:

    The name of the database and collection can be changed, the connection will have to be changed in the server.js file.
    To make a mongo db consistant with the connection in the server.  Name the DB as such:


        DB Name: HonoursProjectThreatMap
        Collection Name: Threats

    With the database initailized, the server can run quries in order to update the map.

    Import the Sample Data from SampleData.csv in order to have existing data for the panels

Start server using: node server.js

Without the python2Map file (from VM#1, the application can be run using netcat)

try:

echo -n "{ip: '129.220.205.77',bytecount: '55000',latitude: '37.751',longitude: '-97.822',countryCode: 'US',countryName: 'United States',city: '',region: '',date: '2020-04-20'}"|nc -4u -w1 127.0.0.1 514

or:

echo -n "{ip: '160.89.237.99', bytecount: '55839', latitude: '33.824', longitude: '-6.0663', countryCode: 'MA', countryName: 'Morocco', city: 'Khemisset', region: 'Khemisset', date: '2020-04-20'}"|nc -4u -w1 127.0.0.1 514

