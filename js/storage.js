const TASKS_KEY = "studyflowTasks";
const QUIZ_SCORES_KEY = "studyflowQuizScores";

function readData(key, fallback) {
    try {
        const savedValue = localStorage.getItem(key);
        return savedValue === null ? fallback : JSON.parse(savedValue);
    } catch (error) {
        console.error(`Could not read ${key}:`, error);
        return fallback;
    }
}

function writeData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Could not save ${key}:`, error);
    }
}

export function loadTasks() {
    const tasks = readData(TASKS_KEY, null);
    return Array.isArray(tasks) ? tasks : null;
}

export function saveTasks(tasks) {
    writeData(TASKS_KEY, tasks);
}

export function loadQuizScores() {
    const scores = readData(QUIZ_SCORES_KEY, []);
    return Array.isArray(scores) ? scores : [];
}

export function saveQuizScore(score) {
    const scores = loadQuizScores();
    scores.push(score);
    writeData(QUIZ_SCORES_KEY, scores);
    return scores;
}