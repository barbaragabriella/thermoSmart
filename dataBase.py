# coding=utf-8
import sqlite3
import threading
from datetime import datetime

class dataBase:

	conn = None
	curs = None
	status_sent = 0
	db_mutex = threading.Lock()

	def __init__(self):	
		# Connect to database to get track of the data
		self.conn= sqlite3.connect('database.db', check_same_thread=False)
		self.curs= self.conn.cursor()

	# send data to BD
	def insert_database(self, id_sensor, value):

	    self.db_mutex.acquire()

	    dateTime_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

	    self.curs.execute("""INSERT INTO data (id_sensor, dateTime_now, value, status_sent) values(?, ?, ?, ?)""", [id_sensor, dateTime_now, value, self.status_sent])
	    self.conn.commit()

	    self.db_mutex.release()

	# update data on DB
	def update_database(self, id_sensor, dateTime_now, value):
	    self.db_mutex.acquire()
	    self.curs.execute("""UPDATE data SET status_sent = 1 WHERE id_sensor = ? and dateTime_now = ? and value = ?""", [id_sensor, dateTime_now, value])
	    self.conn.commit()
	    self.db_mutex.release()

	# Create table in case it doesn't exist
	def create_database(self):
		self.curs.execute("""
		CREATE TABLE IF NOT EXISTS data (
			id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
			id_sensor INTEGER NOT NULL,
			dateTime_now TEXT NOT NULL,
			value TEXT NOT NULL,
			status_sent INTEGER NOT NULL
		);
		""")

    #get first data
	def select_first(self):
		self.db_mutex.acquire()
		self.curs.execute("SELECT * FROM data LIMIT 1")
		row = self.curs.fetchone()
		self.db_mutex.release()
		return row

    #delete first data
	def delete_first(self):
		self.db_mutex.acquire()
		self.curs.execute("DELETE FROM data LIMIT 1")
		self.conn.commit()
		self.db_mutex.release()

	# get n data
	def select_from_database(self):
		self.db_mutex.acquire()
		self.curs.execute("SELECT * FROM data WHERE status_sent = 0")
		rows = self.curs.fetchall()
		self.db_mutex.release()
		return rows

    #delete all data
	def delete_all(self):
		self.db_mutex.acquire()
		self.curs.execute("DELETE FROM data")
		self.conn.commit()
		self.db_mutex.release()

	def close(self):
		self.conn.close()
