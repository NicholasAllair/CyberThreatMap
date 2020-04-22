import csv
from time import sleep
from json import dumps
from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers=['localhost:9092'],
                         value_serializer=lambda x:
                         dumps(x).encode('utf-8'))

with open('SampleIps/sampleIps.csv') as csv_file:
    line_count = 0
    csv_reader = csv.reader(csv_file, delimiter=',')
    for row in csv_reader:
        if line_count == 0:
            line_count += 1
        else:
            data = {'ip' : row[0], 'bytes' : row[1]}
            print(data)
            producer.send('ips', value=data)
            sleep(5)




