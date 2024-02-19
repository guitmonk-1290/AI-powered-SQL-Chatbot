import os
from config import OPENAI_API_KEY
from flask import Flask, request, jsonify

from langchain.agents import create_sql_agent
from langchain.sql_database import SQLDatabase
from langchain.chat_models import ChatOpenAI

from utils import get_full_prompt

app = Flask(__name__)


@app.route('/process-text', methods=['POST'])
def process_text():
    input = request.json.get('inputText')

    try:
        os.environ['OPENAI_API_KEY']=OPENAI_API_KEY

        # get the database
        db = SQLDatabase.from_uri("mysql://<username>:<password>@<url>:<port>/<database>")
        print("DB: ", db)

        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
        llm.cache = False

        # get full formatted prompt
        prompt = get_full_prompt()

        # get SQL Agent -> set verbose to true for thought process of the LLM
        agent_executor = create_sql_agent(
            llm=llm,
            db=db,
            prompt=prompt,
            verbose=True,
            agent_type="openai-tools"
        )

        response = agent_executor.invoke({"input": f'{input}'})
        return jsonify({ "response": response })
        

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

