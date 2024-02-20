# AI-powered Chatbot

[![My Skills](https://skillicons.dev/icons?i=js,python,html,css)](https://skillicons.dev)

This repo aims at developing an AI-powered chatbot to chat with a SQL database. 

## Project data flow

![arch cb](https://github.com/guitmonk-1290/AI-Chatbot/assets/104564065/a28e80b5-4cc2-42a8-bd1b-e32190204f85)

## API response formats

The responses from the nodeJS and Flask APIs looks something like this:

### nodeJS
The API takes in a key called "message" as input.<br>
```
{
  "message": "How many total clients are there?"
}
```
It then passes this to the flask API. On getting the response, it is passed to the angular front-end.<br>
nodeJS acts as a mediator between our front-end and the LLM API.<br>
It includes the following API routes:
<ul>
  <li><b>/process-text: </b>This route interfaces with the Flask API or the GPT model</li><br>
  <li><b>/data: </b>For large data, it cannot be displayed in the chatbot. This route renders the data in a table for display. An additional link can be passed as response to the chatbot for detailed display.</li><br>
</ul>

### Flask
The API takes in input as follows:
```
{
  "inputText": "How many total clients are there?"
}
```

This inputText is then appended to the prompt template created for the LLM. <br>
The output of the API would look something like this:
```
{
  response : {
    input: "How many total clients are there?",
    output: {
      input: "How many total clients are there?",
      query: "SELECT COUNT(*) from clients;",
      data: "[('COUNT(*)': 3)]",
      nlp_response: "<p>There are 3 clients in the database</p>"
    }
  }
}
```

Note that the "nlp_response" field in the above json object is formatted with HTML tags for displaying in the UI. This formatting is done by the LLM model itself.

## Prompt Template
Defining a good prompt template is crucial for the LLM to understand our requirements. This is a prompt template defined in our code:
```
system_prefix = """You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct SQL query to run, then look at the results of the query and return the answer.
ALWAYS return the final output to the user in the form of a JSON object, with the following fields: "input" which represents the user input, "query" which represents the syntactically corrent SQL query, "data" which contains the data returned from the database by the corresponding syntactically correct SQL query and "nlp_response" which contains a natural language description of the data in the "data" field. MAKE SURE that the "nlp_response" data contains the necessary formatting in the form of html tags and spacing. For example, if the user asks to get all the clients and there are about 1000 clients in the database, the "nlp_response" should tell the user that there are 1000 clients in the database.
The database contains the following tables: 
lead_managements: This represents all the leads.
clients: This represents all the clients.
admin: This represents all the admins there are.
admin_roles: This represents all the admin roles.
amc_overrides: This contains all the AMCs.
Apart from these tables, all the tables represent data based on their names.
YOU MUST get the relevant columns based on the user query by reading the table schema and matching the column names with the query's requirements.
You can order the results by a relevant column to return the most interesting examples in the database.
ALWAYS query all the columns from a table unless specified in the input question. MAKE SURE that the number of columns in the "nlp_response" is never all of the columns. MAKE SURE to include only 1 or 2 examples in the "nlp_response".
You have access to tools for interacting with the database.
Only use the given tools. Only use the information returned by the tools to construct your final answer.
You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.

If the SQL query is correct but there is no data, tell the user that there is no data present informatively according to the user query.

If the question does not seem related to the database, just return "I don't know" as the answer.

Here are some examples of user inputs and their corresponding SQL queries:"""
```

This prompt template is subjected to change as different user questions are tested against the model. With changing requirements, the prompt template will also be changed.

## Working of the LLM
The LLM uses something called few-shot prompting. In this, we give a few examples to the LLM to steer the model in the right direction. <br>
All of this functionality is handled by the ```utils.py``` file.<br><br>
The connection with our SQL database is handled by the ```sqlDB.py``` file.<br><br>
The API functionality is handled in the ```app.py``` file<br><br>

You can now more about dynamic few shot prompting here: https://medium.com/@iryna230520/dynamic-few-shot-prompting-overcoming-context-limit-for-chatgpt-text-classification-2f70c3bd86f9
