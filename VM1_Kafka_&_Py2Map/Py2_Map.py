"""Creates a python socket client that will interact with javascript."""
import socket
import geoip2.database
import csv
import json
import time
from datetime import date

def send(data):
    socket_path = '/tmp/node-python-sock'
    # connect to the unix local socket with a stream type
    client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    client.connect(socket_path)
    # send an initial message (as bytes)
    client.send(data)
    # start a loop
    while True:
        # wait for a response and decode it from bytes
        msg = client.recv(2048).decode('utf-8')
        print(msg)
        if msg == 'end':
            # exit the loop
            break

    # close the connection
    client.close()

reader = geoip2.database.Reader('./GeoLite2-City_20200331/GeoLite2-City.mmdb')

with open('SampleIps/sampleIps.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        time.sleep(2.4)
        if line_count == 0:
            line_count += 1
        else:
            try:
                response = reader.city(row[0])
                this_ip = row[0]
                this_bytecount = row[1]
                this_latitude =response.location.latitude
                this_longitude = response.location.longitude
                this_country_code = response.country.iso_code
                this_country_name = response.country.name
                this_city = response.city.name
                this_region = response.subdivisions.most_specific.name
                this_date = str(date.today())
            except Exception:
                this_ip = row[0]
                this_bytecount = row[1]
                this_latitude = ''
                this_longitude = ''
                this_country_code = ''
                this_country_name = ''
                this_city = ''
                this_region = ''
                this_date = ''



            msg = "{ip: '"+this_ip+"', bytecount: '"+this_bytecount+"', latitude: '"+str(this_latitude)+"', longitude: '"+str(this_longitude)+"',countryCode: '"+str(this_country_code)+"', countryName: '"+str(this_country_name)+"', city: '"+str(this_city)+"', region: '"+str(this_region)+"', date: '"+str(this_date)+"'}"

            msg2 = msg.replace('None', '')

            msg3 = str.encode(msg2)

            send(msg3)

            line_count += 1

    print(f'Processed {line_count} lines.')




#full_data = b"{ip: '160.89.237.99', bytecount: '55839', latitude: '33.824', longitude: '-6.0663', countryCode: 'MA', countryName: 'Morocco', city: 'Khemisset', region: 'Khemisset', date: '2020-04-21'}";

#full_data1 = b"{ip: '129.220.205.77',bytecount: '55000',latitude: '37.751',longitude: '-97.822',countryCode: 'US',countryName: 'United States',city: '',region: '',date: '2020-04-20'}";




#send(full_data)
#send(full_data1)


