#imports
import glob
import RPi.GPIO as GPIO
import time
import json
import requests
from datetime import datetime
from dataBase import dataBase
from heaterController import heaterController
from sendPost import sendPost
import paho.mqtt.client as mqtt
import os, urlparse
# from sendPost import sendPost 

#initals declarations
idsensorInside=1
idsensorOutside=2

# 15 min between readings
timeReadingTemp = 60
timeLastReading = 0

# Creating objects
dataBase = dataBase()
sendPost = sendPost(dataBase)
sendPost.start()

# Get desired temp from database cloud
initialDesiredTemp = sendPost.getTemp()
#creat heater object
heaterController = heaterController(initialDesiredTemp, sendPost)

# -------------START MQTT END--------------
# URL used in the MQTT connection
url_mqtt = 'url_mqtt'

# Define event callbacks
def on_connect(client, userdata, flags, rc):
    if rc==0:
        print("connected OK Returned code=",str(rc))
    else:
        print("Bad connection Returned code=",str(rc))

def on_message(client, obj, msg):
    print("message:" + msg.topic + " " + str(msg.qos) + " " + str(msg.payload))
    data = json.loads(str(msg.payload))
    if(data['type']== 'UPDATE'):
        desiredTemperature = data['data']['desiredTemperature']
        heaterStatus = data['data']['status']
        arrivalTime = data['data']['timer']
        heaterController.updateDesiredTemperature(desiredTemperature)
        heaterController.setHeaterOnOff(heaterStatus)
        heaterController.setArrivalTime(arrivalTime)

def on_publish(client, obj, mid):
    print("mid: " + str(mid))

def on_subscribe(client, obj, mid, granted_qos):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))

def on_log(client, obj, level, string):
    print(string)

def on_disconnect(client, userdata, rc):
    print("disconnecting reason  "  +str(rc))


mqtt.Client.connected_flag =  False
mqtt.Client.bad_connection_flag = False
mqtt.Client.disconnect_flag = False

# create client connection
mqttc = mqtt.Client()
# Assign event callbacks
mqttc.on_message = on_message
mqttc.on_connect = on_connect
mqttc.on_publish = on_publish
mqttc.on_subscribe = on_subscribe

# Uncomment to enable debug messages
mqttc.on_log = on_log

def connectMqtt(mqttc):
    # Parse CLOUDMQTT_URL (or fallback to localhost)
    url_str = os.environ.get('CLOUDMQTT_URL', url_mqtt)
    url = urlparse.urlparse(url_str)
    mqttc.username_pw_set(url.username, url.password)

    # Connect
    mqttc.connect(url.hostname, url.port)

connectMqtt(mqttc)
# Start subscribe, with QoS level 0

mqttc.subscribe('sensors', 0)
mqttc.subscribe('measurements', 0)
mqttc.subscribe('heaters', 0)
mqttc.subscribe('heaters_change_histories', 0)

# -------------END MQTT PART--------------

# -------------START READING SENSOR PART--------------
#Read sensor data
#Inside temp sensor
base_dir = '/sys/bus/w1/devices/'
device_folder1 = glob.glob(base_dir + '28*')[0]
device_file1 = device_folder1 + '/w1_slave'

#outside temp sensor
device_folder2 = glob.glob(base_dir + '28*')[1]
device_file2 = device_folder2 + '/w1_slave'

def read_temp_raw(device_file):
    f = open(device_file, 'r')
    lines = f.readlines()
    f.close()
    return lines

def read_temp(device_file):
    lines = read_temp_raw(device_file)
    while lines[0].strip()[-3:] != 'YES':
        time.sleep(0.2)
        lines = read_temp_raw(device_file)
    equals_pos = lines[1].find('t=')
    if equals_pos != -1:
        temp_string = lines[1][equals_pos+2:]
        temp_c = float(temp_string) / 1000.0
        temp_f = temp_c * 9.0 / 5.0 + 32.0
        return temp_c, temp_f

# -------------END READING SENSOR PART--------------

while True:
    # try:
    #in case to reconnect
    if(not mqttc.disconnect_flag):
        mqttc.loop(0.1)
    else:
        connectMqtt(mqttc)

    if(time.time() - timeLastReading >= timeReadingTemp):
        timeLastReading = time.time()
        #inside temp celcius and fahrenheit
        deg_c1, deg_f1 = read_temp(device_file1)
        #outside temp celcius and fahrenheit
        deg_c2, deg_f2 = read_temp(device_file2)

        #sending data do sqlite
        dataBase.insert_database(idsensorInside, str(deg_c1))
        dataBase.insert_database(idsensorOutside, str(deg_c2))

        #calling heater
        heaterController.checkLevelHeater(deg_c1,deg_c2)
        heaterController.checkToTurnHeaterOn()
    # finally:
    #     # print("Cleaning GPIO and closing tasks")
    #     # GPIO.cleanup()