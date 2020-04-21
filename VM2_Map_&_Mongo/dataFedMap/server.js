var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var d3   = require('d3');
var dgram  = require("dgram");
var server = dgram.createSocket("udp4");
const net = require('net');
const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

app.use(express.static('public'));

function getTodaysDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  if(dd<10) {dd='0'+dd;}
  if(mm<10) {mm='0'+mm;}
  today = yyyy+'-'+mm+'-'+dd;
  return today;
}

function getXDaysAgoDate(x){
  var date = new Date();
  date.setDate(date.getDate() - x);
  var dd = date.getDate();
  var mm = date.getMonth()+1;
  var yyyy = date.getFullYear();
  if(dd<10) {dd='0'+dd;}
  if(mm<10) {mm='0'+mm;}
  today = yyyy+'-'+mm+'-'+dd;
  return today;
}


function updadePanels(){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("HonoursProjectThreatMap");
    var col = dbo.collection('Threats');
    //query for top Countries
    var topCountries = col.aggregate(
                  [
                    { $group : { _id : "$countryName" , number : { $sum : 1 } } },
                    { $sort : { number : -1 } },
                    { $limit : 5 }
                  ]).toArray(function(err, results) {
    if (err) throw err;
    io.emit('updateCountries', {'updateCountries': results, for: 'everyone'});
    db.close();
    });
    //query for top IPS
    col.aggregate(
                  [
                    { $group : { _id : "$ip" , number : { $sum : 1 } } },
                    { $sort : { number : -1 } },
                    { $limit : 5 }
                  ]).toArray(function(err, results) {
    if (err) throw err;
    io.emit('updateIPs', {'updateIPs': results, for: 'everyone'});
    db.close();
    });
    //query for attacks today
    col.aggregate(
                  [
                    {$match: {date: getTodaysDate()}},
                    {$count: "attackCount"}
                      ]).next(function(err, results) {
    if (err) throw err;
    if (results == null){results = { attackCount: 0 };}
    io.emit('updateAttackCount', {'updateAttackCount': results, for: 'everyone'});
    db.close();
    });
  });
}

var daysago1, daysago2, daysago3, daysago4, daysago5, daysago6, daysago7;
function updateLastWeekGraph(){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("HonoursProjectThreatMap");
    var col = dbo.collection('Threats');
    //get attacks from 7 days ago
    col.aggregate(
                  [
                    {$match: {date: getXDaysAgoDate(7)}},
                    {$count: "attackCount"}
                      ]).next(function(err, results) {
    if (err) throw err;
    daysago7 = results;
    db.close();
    });
    //get attacks from 6 days ago
    col.aggregate(
                  [
                    {$match: {date: getXDaysAgoDate(6)}},
                    {$count: "attackCount"}
                      ]).next(function(err, results) {
    if (err) throw err;
    daysago6 = results;
    db.close();
    });
    //get attacks from 5 days ago
    col.aggregate(
                  [
                    {$match: {date: getXDaysAgoDate(5)}},
                    {$count: "attackCount"}
                      ]).next(function(err, results) {
    if (err) throw err;
    daysago5 = results;
    db.close();
    });
    //get attacks from 4 days ago
    col.aggregate(
                  [
                    {$match: {date: getXDaysAgoDate(4)}},
                    {$count: "attackCount"}
                      ]).next(function(err, results) {
    if (err) throw err;
    daysago4 = results;
    db.close();
    });
    //get attacks from 3 days ago
    col.aggregate(
                  [
                    {$match: {date: getXDaysAgoDate(3)}},
                    {$count: "attackCount"}
                      ]).next(function(err, results) {
    if (err) throw err;
    daysago3 = results;
    db.close();
    });
    //get attacks from 2 days ago
    col.aggregate(
                  [
                    {$match: {date: getXDaysAgoDate(2)}},
                    {$count: "attackCount"}
                      ]).next(function(err, results) {
    if (err) throw err;
    daysago2 = results;
    db.close();
    });
    //get attacks from 1 days ago
    col.aggregate(
                  [
                    {$match: {date: getXDaysAgoDate(1)}},
                    {$count: "attackCount"}
                      ]).next(function(err, results) {
    if (err) throw err;
    daysago1 = results;
    db.close();
    });

    var weekArray = [daysago1, daysago2, daysago3, daysago4, daysago5, daysago6, daysago7];
    io.emit('lastWeekAttacks', {'lastWeekAttacks': weekArray, for: 'everyone'});
  });
}

function getMatches(string, regex, index) {
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

function send(emitMsg){
  console.log(emitMsg);
  io.emit('message', {'message': emitMsg, for: 'everyone'});

  //Send message to MongoDBDB

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("HonoursProjectThreatMap");
    var col = dbo.collection('Threats');
    var myobj = emitMsg;
    col.insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
    });
  });

  //update the map with info from the DB
  updadePanels();
  updateLastWeekGraph();
}

server.on("message", function incoming(rawMessage) {


  //decode incoming raw message to json

  var ipRegex = /(?<=ip:.)'(.*?)',/gm;
  var byteCountRegex = /(?<=bytecount:.)'(.*?)',/gm;
  var latitudeRegex = /(?<=latitude:.)'(.*?)',/gm;
  var longitudeRegex = /(?<=longitude:.)'(.*?)',/gm;
  var countryCodeRegex = /(?<=countryCode:.)'(.*?)',/gm;
  var countryNameregex = /(?<=countryName:.)'(.*?)',/gm;
  var cityRegex = /(?<=city:.)'(.*?)',/gm;
  var regeionRegex = /(?<=region:.)'(.*?)',/gm;
  var dateRegex = /(?<=date:.)'(.*?)'/gm;

  var ipMatches = getMatches(rawMessage, ipRegex, 1);
  var bytecountMatches = getMatches(rawMessage, byteCountRegex, 1);
  var latitudeMatches = getMatches(rawMessage, latitudeRegex, 1);
  var longitudeMatches = getMatches(rawMessage, longitudeRegex, 1);
  var countryCodeMatches = getMatches(rawMessage, countryCodeRegex, 1);
  var countryNameMatches = getMatches(rawMessage, countryNameregex, 1);
  var cityMatches = getMatches(rawMessage, cityRegex, 1);
  var regionMatches = getMatches(rawMessage, regeionRegex, 1);
  var dateMatches = getMatches(rawMessage, dateRegex, 1 );

  console.log(dateMatches);

  var ipEmit = String(ipMatches[0]);
  var byteCountEmit = String(bytecountMatches[0]);
  var latitudeEmit = String(latitudeMatches[0]);
  var longitudeEmit = String(longitudeMatches[0]);
  var countryCodeEmit = String(countryCodeMatches[0]);
  var countryNameEmit = String(countryNameMatches[0]);
  var cityEmit = String(cityMatches[0]);
  var regionEmit = String(regionMatches[0]);
  var dateEmit = String(dateMatches[0]);

  var emitMsg = {ip: ipEmit,bytecount: byteCountEmit,latitude: latitudeEmit,longitude: longitudeEmit,countryCode: countryCodeEmit,countryName: countryNameEmit,city: cityEmit,region: regionEmit,date: dateEmit}

  send(emitMsg);
});



const socketPath = '/tmp/node-python-sock';
// Callback for socket
const handler = (socket) => {

  // Listen for data from client
  socket.on('data', (rawMessage) => {

    //console.log(rawMessage);
    // Decode byte string
    var ipRegex = /(?<=ip:.)'(.*?)',/gm;
    var byteCountRegex = /(?<=bytecount:.)'(.*?)',/gm;
    var latitudeRegex = /(?<=latitude:.)'(.*?)',/gm;
    var longitudeRegex = /(?<=longitude:.)'(.*?)',/gm;
    var countryCodeRegex = /(?<=countryCode:.)'(.*?)',/gm;
    var countryNameregex = /(?<=countryName:.)'(.*?)',/gm;
    var cityRegex = /(?<=city:.)'(.*?)',/gm;
    var regeionRegex = /(?<=region:.)'(.*?)',/gm;
    var dateRegex = /(?<=date:.)'(.*?)'/gm;

    var ipMatches = getMatches(rawMessage, ipRegex, 1);
    var bytecountMatches = getMatches(rawMessage, byteCountRegex, 1);
    var latitudeMatches = getMatches(rawMessage, latitudeRegex, 1);
    var longitudeMatches = getMatches(rawMessage, longitudeRegex, 1);
    var countryCodeMatches = getMatches(rawMessage, countryCodeRegex, 1);
    var countryNameMatches = getMatches(rawMessage, countryNameregex, 1);
    var cityMatches = getMatches(rawMessage, cityRegex, 1);
    var regionMatches = getMatches(rawMessage, regeionRegex, 1);
    var dateMatches = getMatches(rawMessage, dateRegex, 1 );

    //console.log(dateMatches);

    var ipEmit = String(ipMatches[0]);
    var byteCountEmit = String(bytecountMatches[0]);
    var latitudeEmit = String(latitudeMatches[0]);
    var longitudeEmit = String(longitudeMatches[0]);
    var countryCodeEmit = String(countryCodeMatches[0]);
    var countryNameEmit = String(countryNameMatches[0]);
    var cityEmit = String(cityMatches[0]);
    var regionEmit = String(regionMatches[0]);
    var dateEmit = String(dateMatches[0]);

    var emitMsg = {ip: ipEmit,bytecount: byteCountEmit,latitude: latitudeEmit,longitude: longitudeEmit,countryCode: countryCodeEmit,countryName: countryNameEmit,city: cityEmit,region: regionEmit,date: dateEmit}

    //console.log(emitMsg);
    send(emitMsg);

    // Let python know we want it to close
    socket.write('end');
    // Exit the process


  });

};

// Remove an existing socket
fs.unlink(
  socketPath,
  // Create the server, give it our callback handler and listen at the path
  () => net.createServer(handler).listen(socketPath)
);

server.on("listening", function() {
    var address = server.address();
    console.log("UDP Server now listening at " +
        address.address + ":" + address.port);
});

server.bind(514); // Remember ports < 1024 need suid


http.listen(3000);
console.log("web server listening on port 3000")



