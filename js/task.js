import { $, createId, formatDueDate, normalizeText, readInitialTasks } from "./helper.js";
import { loadTasks, saveTasks } from "./storage.js";

export function initTasks({ onChange = () => { } } = {}) {
    const taskList = $(".task-list");
    const searchInput = $("#task-search");
    const taskForm = $("#task-form");
    const taskDialog = $("#task-dialog");
    const addTaskButton = $(".button-primary");
    const addAnotherTaskButton = $(".add-task-inline");
    const closeDialogButton = $(".dialog-close");
    const cancelDialogButton = $(".dialog-cancel");
    const searchForm = searchInput.closest("form");

    const savedTasks = loadTasks();

    let tasks = savedTasks === null
        ? readInitialTasks(taskList)
        : savedTasks.map(task => ({
            ...task,
            id: task.id || createId()
        }));

    function saveAndUpdate() {
        saveTasks(tasks);
        renderTasks();
        onChange(tasks);
    }

    function renderTasks() {
        const searchTerm = normalizeText(searchInput.value);
        taskList.replaceChildren();

        for (const task of tasks) {
            const row = document.createElement("article");
            row.className = "task-row";

            if (task.complete) {
                row.classList.add("is-complete");
            }

            const checkbox = document.createElement("button");
            checkbox.className = "task-check";
            checkbox.type = "button";
            checkbox.dataset.taskId = task.id;
            checkbox.setAttribute("aria-pressed", String(task.complete));
            checkbox.setAttribute(
                "aria-label",
                task.complete ? "Mark task as incomplete" : "Mark task as complete"
            );

            const color = document.createElement("span");
            color.className = "task-color";

            if (task.subject === "UI Design") {
                color.classList.add("task-orange");
            } else if (task.subject === "Mathematics") {
                color.classList.add("task-blue");
            } else {
                color.classList.add("task-purple");
            }

            const details = document.createElement("div");
            details.className = "task-main";

            const title = document.createElement("strong");
            title.textContent = task.title;

            const info = document.createElement("span");
            info.textContent = `${task.subject} · ${task.minutes} min`;
            details.append(title, info);

            const date = document.createElement("span");
            date.className = "task-date";

            if (task.dueDate === "Today") {
                date.classList.add("date-today");
            }

            const dateDot = document.createElement("i");
            date.append(dateDot, document.createTextNode(formatDueDate(task.dueDate)));

            const moreButton = document.createElement("button");
            moreButton.className = "row-more";
            moreButton.type = "button";
            moreButton.dataset.taskId = task.id;
            moreButton.setAttribute("aria-label", `More options for ${task.title}`);
            moreButton.textContent = "···";

            row.append(checkbox, color, details, date, moreButton);

            const taskSearchText = normalizeText(
                `${task.title} ${task.subject} ${task.dueDate}`
            );
            row.hidden = !taskSearchText.includes(searchTerm);

            taskList.append(row);
        }
    }

    function openDialog() {
        taskDialog.showModal();
        $("#task-title").focus();
    }

    addTaskButton.addEventListener("click", openDialog);
    addAnotherTaskButton.addEventListener("click", openDialog);

    closeDialogButton.addEventListener("click", () => taskDialog.close());
    cancelDialogButton.addEventListener("click", () => taskDialog.close());

    taskForm.addEventListener("submit", event => {
        event.preventDefault();

        const formData = new FormData(taskForm);
        const title = String(formData.get("title") ?? "").trim();

        if (!title) return;

        tasks.unshift({
            id: createId(),
            title,
            subject: formData.get("subject"),
            minutes: Number(formData.get("minutes")),
            dueDate: formData.get("dueDate"),
            complete: false
        });

        saveAndUpdate();
        taskForm.reset();
        taskDialog.close();
    });

    // Event delegation handles task buttons, including buttons rendered later.
    taskList.addEventListener("click", event => {
        const checkbox = event.target.closest(".task-check");

        if (checkbox) {
            const task = tasks.find(item => item.id === checkbox.dataset.taskId);

            if (task) {
                task.complete = !task.complete;
                saveAndUpdate();
            }

            return;
        }

        const deleteButton = event.target.closest(".task-delete-action");

        if (deleteButton) {
            const row = deleteButton.closest(".task-row");
            const moreButton = row.querySelector(".row-more");
            const taskId = moreButton.dataset.taskId;

            tasks = tasks.filter(task => task.id !== taskId);
            saveAndUpdate();
            return;
        }

        const moreButton = event.target.closest(".row-more");

        if (!moreButton) return;

        const row = moreButton.closest(".task-row");
        const menuWasOpen = row.querySelector(".task-action-menu");

        taskList.querySelectorAll(".task-action-menu").forEach(menu => menu.remove());

        if (menuWasOpen) return;

        const menu = document.createElement("div");
        menu.className = "task-action-menu";

        const deleteButtonElement = document.createElement("button");
        deleteButtonElement.className = "task-delete-action";
        deleteButtonElement.type = "button";
        deleteButtonElement.textContent = "Delete task";

        menu.append(deleteButtonElement);
        row.append(menu);
    });

    searchInput.addEventListener("input", renderTasks);

    searchForm.addEventListener("submit", event => {
        event.preventDefault();

        const url = new URL(window.location.href);
        const searchTerm = searchInput.value.trim();

        if (searchTerm) {
            url.searchParams.set("q", searchTerm);
        } else {
            url.searchParams.delete("q");
        }

        history.pushState({}, "", url);
    });

    window.addEventListener("popstate", () => {
        const url = new URL(window.location.href);
        searchInput.value = url.searchParams.get("q") || "";
        renderTasks();
    });

    const startingUrl = new URL(window.location.href);
    searchInput.value = startingUrl.searchParams.get("q") || "";

    // Save the sample HTML tasks on the first run.
    if (savedTasks === null) {
        saveTasks(tasks);
    }

    renderTasks();
    onChange(tasks);

    return {
        getTasks() {
            return tasks;
        }
    };
}