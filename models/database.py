import mysql.connector
from mysql.connector import pooling

# Crear un pool de conexiones para optimizar el rendimiento
connection_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=10,
    host="localhost",
    user="root",
    password="",
    database="indu"
)


def get_db_connection():
    return connection_pool.get_connection()
