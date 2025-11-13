// ===== Elements =====
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('tasks-list');
const themeToggle = document.getElementById('theme-toggle');
const filterButtons = document.querySelectorAll('.filter button');
const sortButtons = document.querySelectorAll('.sort button');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');

const STORAGE_KEY = 'todo.tasks';
const THEME_KEY = 'todo.theme';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let theme = localStorage.getItem(THEME_KEY) || 'light';
let currentFilter = 'all';
let currentSort = 'newest';

document.body.setAttribute('data-theme', theme);
updateThemeIcon();

// ===== Functions =====
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function saveTheme() {
  localStorage.setItem(THEME_KEY, theme);
}

function updateThemeIcon() {
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

function render() {
  list.innerHTML = '';

  let filtered = tasks;
  if(currentFilter==='active') filtered = tasks.filter(t => !t.done);
  if(currentFilter==='completed') filtered = tasks.filter(t => t.done);

  if(currentSort==='newest') filtered.sort((a,b)=>b.id-a.id);
  if(currentSort==='oldest') filtered.sort((a,b)=>a.id-b.id);
  if(currentSort==='completed') filtered.sort((a,b)=>b.done-a.done);
  if(currentSort==='active') filtered.sort((a,b)=>a.done-b.done);

  if(filtered.length===0){
    const p = document.createElement('p');
    p.textContent = 'No tasks yet';
    list.appendChild(p);
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task' + (task.done?' completed':'');

    const chk = document.createElement('input');
    chk.type='checkbox';
    chk.checked=task.done;
    chk.addEventListener('change', ()=>{
      task.done=chk.checked;
      saveTasks();
      render();
    });

    const title = document.createElement('div');
    title.className='title';
    title.textContent = task.text;

    const date = document.createElement('div');
    date.className='date';
    date.textContent=task.date;

    const editBtn = document.createElement('button');
    editBtn.innerHTML='✏️';
    editBtn.addEventListener('click', ()=>editTask(task.id));

    const editDateBtn = document.createElement('button');
    editDateBtn.innerHTML='📅';
    editDateBtn.addEventListener('click', ()=>editDate(task.id));

    const delBtn = document.createElement('button');
    delBtn.innerHTML='🗑️';
    delBtn.addEventListener('click', ()=>{
      tasks = tasks.filter(t=>t.id!==task.id);
      saveTasks();
      render();
    });

    li.append(chk,title,date,editBtn,editDateBtn,delBtn);
    list.appendChild(li);
  });
}

function editTask(id){
  const task = tasks.find(t=>t.id===id);
  const newText = prompt('Edit Task',task.text);
  if(newText===null) return;
  const txt = newText.trim();
  if(txt==='') tasks = tasks.filter(t=>t.id!==id);
  else task.text=txt;
  saveTasks();
  render();
}

function editDate(id){
  const task = tasks.find(t=>t.id===id);
  const newDate = prompt('Edit Date (YYYY-MM-DD HH:MM)', task.date);
  if(newDate===null) return;
  task.date = newDate.trim()||task.date;
  saveTasks();
  render();
}

// ===== Event Listeners =====
form.addEventListener('submit', e=>{
  e.preventDefault();
  const txt=input.value.trim();
  if(!txt) return;
  const date = new Date().toLocaleString();
  tasks.unshift({id:Date.now(),text:txt,done:false,date});
  input.value='';
  saveTasks();
  render();
});

themeToggle.addEventListener('click', ()=>{
  theme = theme==='light'?'dark':'light';
  document.body.setAttribute('data-theme',theme);
  updateThemeIcon();
  saveTheme();
});

filterButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

sortButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    sortButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.dataset.sort;
    render();
  });
});

clearCompletedBtn.addEventListener('click', ()=>{
  tasks = tasks.filter(t=>!t.done);
  saveTasks();
  render();
});

clearAllBtn.addEventListener('click', ()=>{
  if(!confirm('Clear all tasks?')) return;
  tasks=[];
  saveTasks();
  render();
});

// ===== Initial Render =====
render();
