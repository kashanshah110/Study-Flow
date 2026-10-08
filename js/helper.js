export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

export function createId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeText(value) {
    return String(value ?? "").trim().toLowerCase();
}

export function formatDueDate(value) {
    // Keep labels such as "Today" or "Tomorrow" as they are.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString(
        undefined,
        { month: "short", day: "numeric" }
    );
}

// Read the sample task rows already written in index.html
export function readInitialTasks(taskList) {
    const rows = taskList.querySelectorAll(".task-row");

    return Array.from(rows, row => {
        const title = $(".task-main strong", row)?.textContent.trim() ?? "";
        const info = $(".task-main span", row)?.textContent ?? "";

        const [subject = "JavaScript", duration = "30 min"] =
            info.split("·").map(part => part.trim());

        const number = Number.parseInt(duration, 10) || 30;
        const minutes = duration.includes("hour") ? number * 60 : number;
        const dueDate = $(".task-date", row)?.textContent.trim() ?? "Today";

        return {
            id: createId(),
            title,
            subject,
            minutes,
            dueDate,
            complete: row.classList.contains("is-complete")
        };
    });
}