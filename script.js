 ```javascript
const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");

let tasks = JSON.parse(localStorage.getItem("myTasks")) || [];
let currentFilter = "all";
let searchText = "";

document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

function addTask() {
    const text = input.value.trim();

    if (!text) {
        alert("Please enter a task!");
        return;
    }

    tasks.push({
        id: Date.now() + Math.random(),
        text: text,
        completed: false
    });

    input.value = "";
    saveTasks();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const newText = prompt("Edit your task:", task.text);

    if (newText === null) return;

    if (!newText.trim()) {
        alert("Task cannot be empty!");
        return;
    }

    task.text = newText.trim();

    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        const matchesSearch =
            task.text.toLowerCase().includes(searchText.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    document.getElementById("total").textContent = tasks.length;

    document.getElementById("pending").textContent =
        tasks.filter(task => !task.completed).length;

    document.getElementById("completed").textContent =
        tasks.filter(task => task.completed).length;

    if (filteredTasks.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent = "No tasks found!";
        taskList.appendChild(empty);
    }

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = task.completed ? "task done" : "task";

        const span = document.createElement("span");
        span.textContent = task.text;

        const doneBtn = document.createElement("button");
        doneBtn.className = "done-btn";
        doneBtn.textContent = task.completed ? "Undo" : "Done";
        doneBtn.onclick = () => toggleTask(task.id);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editTask(task.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => deleteTask(task.id);

        li.append(span, doneBtn, editBtn, deleteBtn);
        taskList.appendChild(li);
    });
}

addBtn.addEventListener("click", addTask);

input.addEventListener("keydown", event => {
    if (event.key === "Enter") addTask();
});

searchInput.addEventListener("input", () => {
    searchText = searchInput.value.trim