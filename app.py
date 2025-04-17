from flask import Flask, request, jsonify
import openai
import mysql.connector
import os

app = Flask(__name__)

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY")

# Database configuration
db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "database": os.getenv("DB_NAME", "quiz_db")
}

# Establish database connection
try:
    db_connection = mysql.connector.connect(**db_config)
    print("Database connected successfully!")
except mysql.connector.Error as err:
    print(f"Error: {err}")
    db_connection = None

@app.route('/get_question', methods=['POST'])
def get_question():
    data = request.json
    course = data.get("course", "general")
    prompt = f"Generate a word guessing quiz question for {course}. Provide a hint."
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": prompt}]
    )
    question = response["choices"][0]["message"]["content"]

    # Store the question and answer in the database
    correct_answer = "example"  # Replace with logic to extract the correct answer
    if db_connection:
        cursor = db_connection.cursor()
        cursor.execute(
            "INSERT INTO quiz_questions (course, question, correct_answer) VALUES (%s, %s, %s)",
            (course, question, correct_answer)
        )
        db_connection.commit()

    return jsonify({"question": question, "hint": "Think about its common use."})

@app.route('/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    answer = data.get("answer", "").strip().lower()
    question_id = data.get("question_id")

    # Fetch the correct answer from the database
    if db_connection:
        cursor = db_connection.cursor()
        cursor.execute("SELECT correct_answer FROM quiz_questions WHERE id = %s", (question_id,))
        result = cursor.fetchone()
        if result:
            correct_answer = result[0]
            return jsonify({"correct": answer == correct_answer})
        else:
            return jsonify({"error": "Question not found"}), 404
    else:
        return jsonify({"error": "Database connection error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
