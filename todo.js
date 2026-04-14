document.addEventListener("DOMContentLoaded", function () {
  var taskInput = document.getElementById("task-input");
  var addBtn = document.getElementById("add-btn");
  var taskList = document.getElementById("task-list");
  var taskCount = document.getElementById("task-count");
  var clearCompletedBtn = document.getElementById("clear-completed-btn");
  var filterBtns = document.querySelectorAll(".filter-btn");

  var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  var currentFilter = "all";

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function updateTaskCount() {
    var pending = tasks.filter(function (t) {
      return !t.completed;
    }).length;
    var total = tasks.length;
    taskCount.textContent = pending + " of " + total + " task" + (total !== 1 ? "s" : "") + " remaining";
  }

  function createTaskElement(task, index) {
    var li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", function () {
      tasks[index].completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    var taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    var btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    var editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function () {
      startEditing(li, task, index);
    });

    var deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(btnGroup);

    return li;
  }

  function startEditing(li, task, index) {
    li.innerHTML = "";

    var editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "edit-input";
    editInput.value = task.text;

    var saveBtn = document.createElement("button");
    saveBtn.className = "save-btn";
    saveBtn.textContent = "Save";

    function saveEdit() {
      var newText = editInput.value.trim();
      if (newText) {
        tasks[index].text = newText;
        saveTasks();
        renderTasks();
      }
    }

    saveBtn.addEventListener("click", saveEdit);
    editInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        saveEdit();
      }
      if (e.key === "Escape") {
        renderTasks();
      }
    });

    li.appendChild(editInput);
    li.appendChild(saveBtn);

    editInput.focus();
    editInput.select();
  }

  function renderTasks() {
    taskList.innerHTML = "";

    var filteredTasks = tasks.filter(function (task) {
      if (currentFilter === "pending") return !task.completed;
      if (currentFilter === "completed") return task.completed;
      return true;
    });

    filteredTasks.forEach(function (task) {
      var originalIndex = tasks.indexOf(task);
      var li = createTaskElement(task, originalIndex);
      taskList.appendChild(li);
    });

    updateTaskCount();
  }

  function addTask() {
    var text = taskInput.value.trim();
    if (!text) return;

    tasks.push({ text: text, completed: false });
    saveTasks();
    taskInput.value = "";
    taskInput.focus();
    renderTasks();
  }

  addBtn.addEventListener("click", addTask);

  taskInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      addTask();
    }
  });

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      renderTasks();
    });
  });

  clearCompletedBtn.addEventListener("click", function () {
    tasks = tasks.filter(function (t) {
      return !t.completed;
    });
    saveTasks();
    renderTasks();
  });

  renderTasks();
});
