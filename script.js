// Internal subject map - hidden from user
const subjectMap = {
  "Computer Technology": [
    "Programming",
    "Data Structures",
    "Networking",
    "Databases",
    "Operating Systems",
    "Cybersecurity"
  ],
  "Tool and Die": [
    "Mechanical Drawing",
    "Material Science",
    "CNC Machining",
    "Die Design",
    "Manufacturing Processes"
  ],
  "Mechatronics": [
    "Sensors and Actuators",
    "Microcontrollers",
    "Control Systems",
    "Robotics",
    "PLCs and Automation"
  ],
  "Electronics": [
    "Basic Circuits",
    "Analog and Digital Electronics",
    "Embedded Systems",
    "Signal Processing",
    "PCB Design"
  ],
  "Electrical": [
    "Power Systems",
    "Electrical Machines",
    "Circuit Theory",
    "Renewable Energy",
    "Industrial Wiring"
  ]
};

// User input (in a real app, this would come from UI)
const userSelection = {
  course: "Mechatronics",
  difficulty: "Intermediate" // or "Easy", "Hard"
};

// Function to get subjects for the selected course (used by AI)
function getSubjectsForAI(course) {
  return subjectMap[course] || [];
}

// Example: AI prepares to generate questions
const selectedCourse = userSelection.course;
const difficultyLevel = userSelection.difficulty;
const aiSubjects = getSubjectsForAI(selectedCourse);

// This would be sent to the AI for question generation
const aiRequestPayload = {
  course: selectedCourse,
  difficulty: difficultyLevel,
  subjects: aiSubjects
};

console.log("AI receives this payload:", aiRequestPayload);


function nextStep() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'block';
    } else {
        alert('Please enter your name to continue.');
    }
}

function selectCourse(course) {
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('quiz-area').style.display = 'block';
    fetchQuestion(course);
}

function fetchQuestion(course) {
    fetch('/get_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
            return;
        }
        document.getElementById('question').innerText = data.question;
        document.getElementById('hint').innerText = `Hint: ${data.hint}`;
        startTimer();
    })
    .catch(error => {
        alert('Failed to fetch question. Please try again.');
    });

}

function startTimer() {
    let timeLeft = 30;
    document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
    let timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
        if (timeLeft === 0) {
            clearInterval(timer);
            alert('Time up!');
            fetchQuestion();
        }
    }, 1000);
}

function submitAnswer() {
    let answer = document.getElementById('answer').value.toLowerCase();
    fetch('/check_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.correct ? 'Correct!' : 'Wrong! Try again.');
        fetchQuestion();
    });
}
