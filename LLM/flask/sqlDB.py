import mysql.connector as sql

def connect_to_DB(db_config):
    """Connects to a SQL database using provided configuration.

    Args:
        db_config (dict): Dictionary containing database connection details,
                         including host, user, password, database name.

    Returns:
        connection object: A connection object to the SQL database.

    Raises:
        Exception: If an error occurs while connecting.
    """
    try:
        connection = sql.connect(**db_config)
        return connection
    except Exception as e:
        raise Exception(f"Error connecting to DB: {e}")

def execute_query(connection, query):
    """Executes a SQL query and returns the results.

    Args:
        connection (object): A connection object to the SQL database.
        query (str): The SQL query string to execute.

    Returns:
        list or tuple: A list or tuple of rows containing the query results.

    Raises:
        Exception: If an error occurs while executing the query.
    """
    try:
        cursor = connection.cursor()
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        return results
    except Exception as e:
        raise Exception(f"Error executing query: {e}")