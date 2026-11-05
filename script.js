 
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const dueDate = document.getElementById("dueDate");
const priority = document.getElementById("priority");
const category = document.getElementById("category");
const searchInput = document.getElementById("searchInput");
const cancelEdit = document.getElementById("cancelEdit");

let tasks = JSON.parse(localStorage.getItem("myTasks")) || [];
let currentFilter = "all";
let editingId = null;

tasks = tasks.map(task => ({
    id: task.id || Date.now() + Math.random(),
    text: task.text || "",
    completed: Boolean(task.completed),
    dueDate: task.dueDate || "",
    priority: task.priority || "Medium",
    category: task.category || "Study"
}));

function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

function getToday() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000)
        .toISOString().slice(0, 10);
}

function updateDate() {
    document.getElementById("today").textContent =
        new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const today = getToday();

    const overdue = tasks.filter(task =>
        !task.completed && task.dueDate && task.dueDate < today
    ).length;

    const progress = total === 0 ? 0 :
        Math.round((completed / total) * 100);

    document.getElementById("total").textContent = total;
    document.getElementById("completed").textContent = completed;
    document.getElementById("pending").textContent = pending;
    document.getElementById("overdue").textContent = overdue;
    document.getElementById("progressText").textContent = progress + "%";
    document.getElementById("progressBar").style.width = progress + "%";
}

function resetForm() {
    taskInput.value = "";
    dueDate.value = "";
    priority.value = "Medium";
    category.value = "Study";
    editingId = null;

    addBtn.textContent = "+ Add Task";
    document.getElementById("formTitle").textContent = "Add a New Task";
    cancelEdit.classList.add("hidden");
}

function addOrUpdateTask() {
    const text = taskInput.value.trim();

    if (!text) {
        alert("Please enter a task!");
        taskInput.focus();
        return;
    }

    if (editingId !== null) {
        const task = tasks.find(task => task.id === editingId);

        if (task) {
            task.text = text;
            task.dueDate = dueDate.value;
            task.priority = priority.value;
            task.category = category.value;
        }
    } else {
        tasks.unshift({
            id: Date.now() + Math.random(),
            text,
            completed: false,
            dueDate: dueDate.value,
            priority: priority.value,
            category: category.value
        });
    }

    saveTasks();
    resetForm();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    taskInput.value = task.text;
    dueDate.value = task.dueDate;
    priority.value = task.priority;
    category.value = task.category;
    editingId = id;

    addBtn.textContent = "Save Changes";
    document.getElementById("formTitle").textContent = "Edit Task";
    cancelEdit.classList.remove("hidden");
    taskInput.focus();
}

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    tasks = tasks.filter(task => task.id !== id);

    if (editingId === id) resetForm();

    saveTasks();
    renderTasks();
}

function clearCompleted() {
    const count = tasks.filter(task => task.completed).length;

    if (!count) {
        alert("No completed tasks to clear!");
        return;
    }

    if (!confirm("Delete all completed tasks?")) return;

    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";

    const today = getToday();
    const search = searchInput.value.trim().toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(search);

        let matchesFilter = true;

        if (currentFilter === "pending") {
            matchesFilter = !task.completed;
        } else if (currentFilter === "completed") {
            matchesFilter = task.completed;
        } else if (currentFilter === "overdue") {
            matchesFilter = !task.completed &&
                task.dueDate && task.dueDate < today;
        }

        return matchesSearch && matchesFilter;
    });

    if (filteredTasks.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent = "No tasks found. Add a new task! ✨";
        taskList.appendChild(empty);
    }

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item" + (task.completed ? " done" : "");

        const info = document.createElement("div");
        info.className = "task-info";

        const name = document.createElement("div");
        name.className = "task-name";
        name.textContent = task.text;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const categoryTag = document.createElement("span");
        categoryTag.className = "tag";
        categoryTag.textContent = task.category;

        const priorityTag = document.createElement("span");
        priorityTag.className = "tag priority-" + task.priority;
        priorityTag.textContent = task.priority + " Priority";

        meta.append(categoryTag, priorityTag);

        if (task.dueDate) {
            const dateTag = document.createElement("span");
            dateTag.className = "tag";
            dateTag.textContent = "Due: " + task.dueDate;

            if (!task.completed && task.dueDate < today) {
                dateTag.classList.add("overdue");
                dateTag.textContent += " (Overdue)";
            }

            meta.appendChild(dateTag);
        }

        info.append(name, meta);

        const buttons = document.createElement("div");
        buttons.className = "task-buttons";

        const doneBtn = document.createElement("button");
        doneBtn.className = "done-btn";
        doneBtn.textContent = task.completed ? "Undo" : "Done";
        doneBtn.onclick = () => toggleTask(task.id);

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editTask(task.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => deleteTask(task.id);

        buttons.append(doneBtn, editBtn, deleteBtn);
        li.append(info, buttons);
        taskList.appendChild(li);
    });

    updateStats();
}

addBtn.addEventListener("click", addOrUpdateTask);

taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") addOrUpdateTask();
});

cancelEdit.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderTasks);

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

document.getElementById("clearBtn").addEventListener("click", clearCompleted);

const themeBtn = document.getElementById("themeBtn");

if (localStorage.getItem("taskTheme") === "dark") {
    document.body.classList.add("dark");
}

function updateThemeButton() {
    themeBtn.textContent = document.body.classList.contains("dark")
        ? "☀️ Light"
        : "🌙 Dark";
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const theme = document.body.classList.contains("dark")
        ? "dark"
        : "light";

    localStorage.setItem("taskTheme", theme);
    updateThemeButton();
});

updateDate();
updateThemeButton();
renderTasks();
