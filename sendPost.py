import requests
import time
from datetime import datetime
import thread
import threading
import calendar
import traceback
import sys
from dataBase import dataBase

idInsideSensor = "idInsideSensor"
idOutsideSensor = "idOutsideSensor"
idHeater = "idHeater"
api = "api"
apiHeater = "apiHeater" + idHeater

class sendPost:

	condition = True
	dataBase = None

	def __init__(self, dataBase):
		self.dataBase = dataBase
		self.dataBase.create_database()

		self.api_insideSensor = api + idInsideSensor
		self.api_outsideSensor = api + idOutsideSensor

	def start(self):
		thread.start_new_thread(self.send_post, ())

	def send_post(self):
		try:
			while(self.condition):
				rows = self.dataBase.select_from_database()

				try:
					# Se Houver dados
					if(rows is not None):
						for row in rows:
							# first is id_sensor, second is datetime and third is value
							data = {'dateTime':str(row[2]),
									'value': str(row[3])}
							
							if row[1] == 1:
								response = requests.post(url = self.api_insideSensor, data=data)
							
							else:
								response = requests.post(url = self.api_outsideSensor, data=data)

							if response.status_code != 200:
								raise NameError("response of '"+data+"' is "+str(response))

							#update database with sent status
							self.dataBase.update_database(row[1], str(row[2]), str(row[3]))

							# Delay to avoid simultaneous posts
							time.sleep(3)

				except Exception as e:
					#Executed when connection is lost
					print("------------------") 
					print(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) 
					print("Cause: " + str(e)) 
					print("------------------") 
					
					time.sleep(60)
		except Exception as e:
			print("------------------") 
			print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
			print("Cause: " + str(e)) 
			print("------------------")
		finally:
			print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
	    	print("Except. End sendPost method")

	def getTemp(self):
		response = requests.get(apiHeater)
		data = response.json() 
		temp = data['data']['desiredTemperature']
		return temp

	def send_put(self, level):
		data = {"level": level}
		response = requests.put(apiHeater, data)

	def send_put_heater(self):
		data = {"status": "true"}
		response = requests.put(apiHeater, data)

	def stop(self):
		self.condition = False
		self.dataBase.close()
		print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
		print("Finished SendPost")
