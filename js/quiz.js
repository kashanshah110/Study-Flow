import { $, } from "./helper.js";
import { loadQuizScores, saveQuizScore } from "./storage.js";

const questions = [
    {
        question: "Which keyword declares a variable that can be reassigned?",
        options: ["const", "let", "function"],
        answer: 1
    },
    {
        question: "Which array method transforms every item into a new array?",
        options: ["map()", "find()", "every()"],
        answer: 0
    },
    {
        question: "What does JSON.stringify() do?",
        options: [
            "Turns JSON text into an object",
            "Turns JavaScript data into JSON text",
            "Deletes an object"
        ],
        answer: 1
    },
    {
        question: "Which storage remains after closing the browser?",
        options: ["sessionStorage", "localStorage", "prompt()"],
        answer: 1
    },
    {
        question: "Which function repeats code at a set interval?",
        options: ["setTimeout()", "setInterval()", "clearInterval()"],
        answer: 1
    }
];

export function initQuiz({ onAverageChange = () => { } } = {}) {
    const startButton = $(".quiz-button");
    const dialog = $("#quiz-dialog");
    const closeButton = $(".quiz-close");
    const timerDisplay = $("#quiz-timer");
    const progress = $("#quiz-progress");
    const questionDisplay = $("#quiz-question");
    const optionsContainer = $("#quiz-options");
    const nextButton = $("#quiz-next");
    const resultDisplay = $("#quiz-result");

    let questionIndex = 0;
    let score = 0;
    let selectedAnswer = null;
    let secondsLeft = 60;
    let timerId = null;
    let hasFinished = false;

    function getAverageScore() {
        const scores = loadQuizScores();

        if (scores.length === 0) return null;

        const total = scores.reduce((sum, value) => sum + value, 0);
        return Math.round(total / scores.length);
    }

    function updateAverage() {
        onAverageChange(getAverageScore());
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;

        timerDisplay.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function showQuestion() {
        const current = questions[questionIndex];

        progress.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
        questionDisplay.textContent = current.question;
        optionsContainer.replaceChildren();
        resultDisplay.hidden = true;
        nextButton.hidden = false;
        nextButton.disabled = true;
        nextButton.textContent =
            questionIndex === questions.length - 1
                ? "Finish quiz →"
                : "Next question →";

        selectedAnswer = null;

        current.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.className = "quiz-option";
            button.type = "button";
            button.dataset.choice = index;
            button.setAttribute("aria-pressed", "false");
            button.textContent = option;
            optionsContainer.append(button);
        });
    }

    function finishQuiz() {
        if (hasFinished) return;

        hasFinished = true;
        clearInterval(timerId);

        const percentage = Math.round((score / questions.length) * 100);
        saveQuizScore(percentage);
        updateAverage();

        progress.textContent = "Quiz complete";
        questionDisplay.textContent = "Nice work!";
        optionsContainer.replaceChildren();
        nextButton.hidden = true;
        resultDisplay.textContent =
            `You scored ${score} out of ${questions.length} (${percentage}%).`;
        resultDisplay.hidden = false;
    }

    function startQuiz() {
        clearInterval(timerId);

        questionIndex = 0;
        score = 0;
        selectedAnswer = null;
        secondsLeft = 60;
        hasFinished = false;

        updateTimerDisplay();
        showQuestion();
        dialog.showModal();

        timerId = setInterval(() => {
            secondsLeft--;
            updateTimerDisplay();

            if (secondsLeft <= 0) {
                finishQuiz();
            }
        }, 1000);
    }

    startButton.addEventListener("click", startQuiz);

    closeButton.addEventListener("click", () => {
        clearInterval(timerId);
        dialog.close();
    });

    optionsContainer.addEventListener("click", event => {
        const selectedButton = event.target.closest(".quiz-option");

        if (!selectedButton) return;

        selectedAnswer = Number(selectedButton.dataset.choice);

        optionsContainer.querySelectorAll(".quiz-option").forEach(button => {
            const isSelected = button === selectedButton;
            button.classList.toggle("is-selected", isSelected);
            button.setAttribute("aria-pressed", String(isSelected));
        });

        nextButton.disabled = false;
    });

    nextButton.addEventListener("click", () => {
        if (selectedAnswer === null) return;

        if (selectedAnswer === questions[questionIndex].answer) {
            score++;
        }

        questionIndex++;

        if (questionIndex === questions.length) {
            finishQuiz();
        } else {
            showQuestion();
        }
    });

    dialog.addEventListener("close", () => clearInterval(timerId));

    updateAverage();

    return {
        getAverageScore
    };
}