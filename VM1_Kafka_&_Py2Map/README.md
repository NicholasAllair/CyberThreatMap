# Kafka and Python File to send Data

Before setup of the server, is it important to download the librarys for the python file:

pip install kafka-python

Open terminal and navigate to the kafka directory then run the following statement:

bin/zookeeper-server-start.sh config/zookeeper.properties

Note the default port
    INFO binding to port 0.0.0.0/0.0.0.0:2181

Open a new terminal, navigate too the directory for the kafka server, and start the kafka server:

Starting the kafka server:
bin/kafka-server-start.sh config/server.properties

Create a the topic for the project.  Open another new terminal, naviagte to the kafka directory and use:

bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic ips

this will create the topics ‘ips’


Running the python file producer.py will send messages to the kafka server.

Too test the system:
    run the kafka server as mentioned above
    run python3 producer.py
    run python3 Py2_Map.python

