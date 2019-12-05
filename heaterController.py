import RPi.GPIO as GPIO
import requests
import time
import datetime
import thread
import threading
from sendPost import sendPost

idInsideSensor = "idInsideSensor"
idOutsideSensor = "idOutsideSensor"
idHeater = "idHeater"
api = "api"
apiHeater = "apiHeater" + idHeater

class heaterController:
    # heater levels assigned to a GPIO for LED
    #0 is for level 0, 1 is for level1, 2 is for level 2... 6 is for heater status on/off
    pinGPIOLevel = [18, 23, 24, 17, 27, 22, 10]

    # number of levels
    levelsCount = 5

    # Potencia do heater pra saber gradiente de calor
    thresholdDiferenceTempsMax = 40
    thresholdDiferenceTempsMin = 10
    rangeTreshold = (thresholdDiferenceTempsMax - thresholdDiferenceTempsMin) / levelsCount
    thresholdTime = 900 # sec

    desiredTemp = 20
    differenceTemp = 0
    # keep track of the levels
    currentLevel = 5
    # to know how long the heater was on
    timeHeater = 0
    powerNedded = 0
    heaterStatus = False

    timeToTurnHeaterOn = 3600

    arrivalTime = datetime.datetime.now()
    flagSendPost = False
    # flagOverWriteDecison = False
    sendPost = None

    def __init__(self, desiredTemp, sendPost):
        # setting GPIO
        self.sendPost = sendPost

        if(desiredTemp is not None):
            self.desiredTemp = desiredTemp
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        for pinGPIO in self.pinGPIOLevel:
            GPIO.setup(pinGPIO, GPIO.OUT)

    #update desired temperature based on new data coming from app
    def updateDesiredTemperature(self,newTemp):
        if(self.desiredTemp != newTemp):
            self.desiredTemp = newTemp
            print("NEW DESIRED TEMP SET TO: "+ str(self.desiredTemp))

    # turn LED on
    def set_On(self, pin):
        GPIO.output(self.pinGPIOLevel[pin], GPIO.HIGH)

    # turn LED off
    def set_Off(self, pin):
        GPIO.output(self.pinGPIOLevel[pin], GPIO.LOW)

    # set heater on/off based on info coming from app
    def setHeaterOnOff(self,status):
        if(self.heaterStatus != status):
            if(not self.heaterStatus):
                self.heaterStatus = True
                print("TURNING HEATER ON")
                self.set_On(6)
                self.timeheater = time.time()
                self.set_On(self.currentLevel)
                self.sendPost.send_put(self.currentLevel)
                if(self.flagSendPost):
                    self.flagSendPost = False
                    self.sendPost.send_put_heater()
                print("SETTING LEVEL TO " + str(self.currentLevel))
            else:
                self.heaterStatus = False
                print("TURNING HEATER OFF")
                self.set_Off(6)
                self.set_Off(self.currentLevel)
                self.currentLevel = 5

    # check level and return heater level based on temp difference between outside and desired temp
    def checkLevelHeater(self, tempInside, tempOutside):
        # see if inside temp is close to the desired temp
        if(self.heaterStatus):
            if (tempInside >= (self.desiredTemp - self.desiredTemp * 0.05) and tempInside <= (self.desiredTemp + self.desiredTemp * 0.05)):
                # only change if new level is different from the current level
                levelNeeded = abs(self.desiredTemp - tempOutside) * self.levelsCount / self.thresholdDiferenceTempsMax
                if(levelNeeded < 1):
                    levelNeeded = 1
                elif (levelNeeded > 5):
                    levelNeeded = 5

                if(levelNeeded != self.currentLevel):
                    # if yes, check what level should be set and change level
                    self.set_Off(self.currentLevel)
                    self.currentLevel = levelNeeded
                    self.set_On(self.currentLevel)
                    self.sendPost.send_put(self.currentLevel)
                    print("SETTING LEVEL TO " + str(self.currentLevel))
                    self.sendPost.send_put(self.currentLevel)
            elif (tempInside >= (self.desiredTemp + self.desiredTemp * 0.05)):
                if(self.currentLevel == 1):
                    self.set_Off(self.currentLevel)
                    self.currentLevel = 0
                    self.set_On(self.currentLevel)
                    self.sendPost.send_put(self.currentLevel)
                    print("SETTING LEVEL TO " + str(self.currentLevel))
                    self.sendPost.send_put(self.currentLevel)
                else:
                    if(self.currentLevel >0):
                        self.set_Off(self.currentLevel)
                        self.currentLevel = self.currentLevel - 1
                        self.set_On(self.currentLevel)
                        self.sendPost.send_put(self.currentLevel)
                        print("SETTING LEVEL TO " + str(self.currentLevel))
                        self.sendPost.send_put(self.currentLevel)
            elif (tempInside <= (self.desiredTemp - self.desiredTemp * 0.05) and self.currentLevel != 5):
                self.set_Off(self.currentLevel)
                self.currentLevel = 5
                self.set_On(self.currentLevel)
                self.sendPost.send_put(self.currentLevel)
                print("SETTING LEVEL TO " + str(self.currentLevel))
                self.sendPost.send_put(self.currentLevel)

    def setArrivalTime(self, newTime):
        settingNewTime = datetime.datetime.strptime(newTime, '%Y-%m-%dT%H:%M:%S.%fZ')
        if(self.arrivalTime != settingNewTime):
            self.arrivalTime = settingNewTime
            
    def checkToTurnHeaterOn(self):
        self.arrivalTime = datetime.datetime.strptime(str(datetime.date.today()), "%Y-%m-%d") + datetime.timedelta(hours=self.arrivalTime.hour, minutes=self.arrivalTime.minute)
        difference = time.mktime(self.arrivalTime.timetuple())-time.time()
        if( difference <= self.timeToTurnHeaterOn and difference >= 0):
            self.flagSendPost = True
            self.setHeaterOnOff(True)