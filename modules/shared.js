// Общие переменные и функции
let usersDB = JSON.parse(localStorage.getItem('fitnessUsers')) || [];
let currentStreak = 0;
let totalPoints = 0;
let mealsData = {};
let selectedDate = new Date();
let selectedGender = null;

// DOM элементы
const authContainer = document.getElementById('authContainer');
const profileContainer = document.getElementById('profileContainer');
const bottomMenu = document.getElementById('bottomMenu');
const menuGroup = document.getElementById('menuGroup');
const profileTabBtn = document.getElementById('profileTabBtn');
const settingsTabBtn = document.getElementById('settingsTabBtn');
const caloriesTabBtn = document.getElementById('caloriesTabBtn');
const tasksTabBtn = document.getElementById('tasksTabBtn');

// Общие функции
function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function showProfile(username) {
  authContainer.classList.add('hidden');
  profileContainer.classList.remove('hidden');
  bottomMenu.classList.remove('hidden');

  // Очищаем контейнер перед инициализацией новых вкладок
  profileContainer.innerHTML = '';

  // Загружаем данные пользователя перед инициализацией вкладок
  const user = usersDB.find((u) => u.login === username);
  if (user) {
    if (user.calories) {
      calculatedCalories = user.calories;
    }
    if (user.gender) {
      selectedGender = user.gender;
    }
    if (user.mealsData) {
      mealsData = user.mealsData;
    }
  }

  // Инициализируем вкладки в правильном порядке
  initProfileTab(username);
  initSettingsTab();
  initCalendarTab();
  initTasksTab();

  setActiveTab('profile');
}

function setActiveTab(tabName) {
  // Удаляем все активные классы
  document.querySelectorAll('.menu-button').forEach((btn) => {
    btn.classList.remove('active');
  });

  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.remove('active');
  });

  // Удаляем все классы активности у меню
  menuGroup.classList.remove(
    'profile-active',
    'settings-active',
    'calories-active',
    'tasks-active',
  );

  // Устанавливаем активную вкладку
  switch (tabName) {
    case 'profile':
      profileTabBtn.classList.add('active');
      document.querySelector('.profile-tab')?.classList.add('active');
      menuGroup.classList.add('profile-active');
      break;
    case 'settings':
      settingsTabBtn.classList.add('active');
      document.querySelector('.settings-tab')?.classList.add('active');
      menuGroup.classList.add('settings-active');
      break;
    case 'calories':
      caloriesTabBtn.classList.add('active');
      document.querySelector('.calories-tab')?.classList.add('active');
      menuGroup.classList.add('calories-active');
      break;
    case 'tasks':
      tasksTabBtn.classList.add('active');
      document.querySelector('.tasks-tab')?.classList.add('active');
      menuGroup.classList.add('tasks-active');
      break;
  }
}

// Назначение обработчиков для нижнего меню
profileTabBtn.addEventListener('click', () => setActiveTab('profile'));
settingsTabBtn.addEventListener('click', () => setActiveTab('settings'));
caloriesTabBtn.addEventListener('click', () => setActiveTab('calories'));
tasksTabBtn.addEventListener('click', () => setActiveTab('tasks'));

// Экспортируем функцию для использования в других модулях
window.showProfile = showProfile;
