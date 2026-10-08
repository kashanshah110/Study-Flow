import { $ } from "./helper.js";
import { initTasks } from "./task.js";
import { initQuiz } from "./quiz.js";

let currentTasks = [];
let currentAverage = null;

const completedCount = $("#completed-count");
const totalCount = $("#total-count");
const taskCountBadge = $("#tasks .pill-count");
const averageScoreDisplay = $("#average-score");

function updateDashboard() {
  const completedTasks = currentTasks.filter(task => task.complete).length;

  if (completedCount) {
    completedCount.textContent = completedTasks;
  }

  if (totalCount) {
    totalCount.textContent = currentTasks.length;
  }

  if (taskCountBadge) {
    taskCountBadge.textContent = currentTasks.length;
  }

  if (averageScoreDisplay) {
    averageScoreDisplay.textContent =
      currentAverage === null ? "—" : currentAverage;
  }
}

const taskManager = initTasks({
  onChange(tasks) {
    currentTasks = tasks;
    updateDashboard();
  }
});

currentTasks = taskManager.getTasks();

const quizManager = initQuiz({
  onAverageChange(average) {
    currentAverage = average;
    updateDashboard();
  }
});

currentAverage = quizManager.getAverageScore();
updateDashboard();