let usersDB = JSON.parse(localStorage.getItem('fitnessUsers')) || [];

// Подключаем библиотеку для работы с Excel
const script = document.createElement('script');
document.head.appendChild(script);

// Получаем все необходимые элементы DOM
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const buttonGroup = document.getElementById('buttonGroup');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginSubmit = document.getElementById('loginSubmit');
const registerSubmit = document.getElementById('registerSubmit');
const authContainer = document.getElementById('authContainer');
const profileContainer = document.getElementById('profileContainer');
const profileUsername = document.getElementById('profileUsername');
const logoutBtn = document.getElementById('logoutBtn');
const avatarWrapper = document.getElementById('avatarWrapper');
const userAvatar = document.getElementById('userAvatar');
const avatarInput = document.getElementById('avatarInput');
const userPoints = document.getElementById('userPoints');
const userHeight = document.getElementById('userHeight');
const userWeight = document.getElementById('userWeight');
const userCalories = document.getElementById('userCalories');
const userActivity = document.getElementById('userActivity');
const bottomMenu = document.getElementById('bottomMenu');
const menuGroup = document.getElementById('menuGroup');
const profileTabBtn = document.getElementById('profileTabBtn');
const settingsTabBtn = document.getElementById('settingsTabBtn');
const caloriesTabBtn = document.getElementById('caloriesTabBtn');
const tasksTabBtn = document.getElementById('tasksTabBtn');
const profileTab = document.querySelector('.profile-tab');
const settingsTab = document.querySelector('.settings-tab');
const caloriesTab = document.querySelector('.calories-tab');
const tasksTab = document.querySelector('.tasks-tab');

// Элементы для вкладки параметров
const maleBtn = document.getElementById('maleBtn');
const femaleBtn = document.getElementById('femaleBtn');
const ageInput = document.getElementById('ageInput');
const heightInput = document.getElementById('heightInput');
const weightInput = document.getElementById('weightInput');
const calculateBtn = document.getElementById('calculateBtn');
const calculatedCalories = document.getElementById('calculatedCalories');
const resultContainer = document.getElementById('resultContainer');
const genderButtonGroup = document.querySelector('.gender-button-group');

let selectedGender = null; // 'male' или 'female'

const monthSelect = document.getElementById('monthSelect');
const yearSelect = document.getElementById('yearSelect');
const daysContainer = document.getElementById('daysContainer');
const prevDayBtn = document.querySelector('.prev-day');
const nextDayBtn = document.querySelector('.next-day');
const addMealBtns = document.querySelectorAll('.add-meal-btn');
const saveMealBtns = document.querySelectorAll('.save-meal-btn');
const saveDayBtn = document.getElementById('saveDayBtn');
const toggleDayViewBtn = document.getElementById('toggleDayViewBtn');
const fullDayView = document.querySelector('.full-day-view');
const fullDayMeals = document.getElementById('fullDayMeals');
const totalCaloriesSpan = document.getElementById('totalCalories');

let tasksData = {};
let currentStreak = 0;
let totalPoints = 0;

let currentDate = new Date();
let selectedDate = new Date();
let mealsData = {};
let currentDayOffset = 0;

// Обработчики для кнопок входа и регистрации
loginBtn.addEventListener('click', function () {
  buttonGroup.classList.remove('register-active');
  buttonGroup.classList.add('login-active');
  loginBtn.classList.add('active');
  registerBtn.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

registerBtn.addEventListener('click', function () {
  buttonGroup.classList.remove('login-active');
  buttonGroup.classList.add('register-active');
  registerBtn.classList.add('active');
  loginBtn.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

// Обработчик формы входа
loginSubmit.addEventListener('click', function () {
  const login = document.getElementById('login').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!login || !password) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  // Проверяем существует ли пользователь
  const user = usersDB.find((user) => user.login === login && user.password === password);

  if (user) {
    // Пользователь найден - переходим на страницу профиля
    showProfile(login);
  } else {
    // Пользователь не найден
    alert('Такого пользователя не существует или неверный пароль');
  }
});

// Обработчик формы регистрации
registerSubmit.addEventListener('click', async function () {
  const login = document.getElementById('regLogin').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!login || !password || !confirmPassword) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  if (password !== confirmPassword) {
    alert('Пароли не совпадают!');
    return;
  }

  // Проверяем не занят ли логин
  const userExists = usersDB.some((user) => user.login === login);
  if (userExists) {
    alert('Пользователь с таким логином уже существует');
    return;
  }

  // Добавляем нового пользователя
  const newUser = {
    login,
    password,
    points: 0,
    height: 0,
    weight: 0,
    calories: 0,
    activity: 3,
    gender: null,
  };

  usersDB.push(newUser);
  localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));

  alert('Регистрация успешна! Теперь вы можете войти');

  // Очищаем поля и переключаем на форму входа
  document.getElementById('regLogin').value = '';
  document.getElementById('regPassword').value = '';
  document.getElementById('confirmPassword').value = '';

  buttonGroup.classList.remove('register-active');
  buttonGroup.classList.add('login-active');
  loginBtn.classList.add('active');
  registerBtn.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

// Обработчик кнопки выхода
logoutBtn.addEventListener('click', function () {
  localStorage.removeItem('currentUser');
  authContainer.classList.remove('hidden');
  profileContainer.classList.add('hidden');
  bottomMenu.classList.add('hidden');
});

// Обработчик загрузки аватарки
avatarInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const newAvatar = document.createElement('img');
      newAvatar.src = event.target.result;
      newAvatar.style.width = '100%';
      newAvatar.style.height = '100%';
      newAvatar.style.objectFit = 'cover';
      newAvatar.style.borderRadius = '50%';

      avatarWrapper.innerHTML = '';
      avatarWrapper.appendChild(newAvatar);

      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userIndex = usersDB.findIndex((user) => user.login === currentUser);
        if (userIndex !== -1) {
          usersDB[userIndex].avatar = event.target.result;
          localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
        }
      }
    };
    reader.readAsDataURL(file);
  }
});

// Обработчики для нижнего меню
profileTabBtn.addEventListener('click', function () {
  menuGroup.classList.remove('settings-active', 'calories-active', 'tasks-active');
  menuGroup.classList.add('profile-active');
  setActiveTab('profile');
});

settingsTabBtn.addEventListener('click', function () {
  menuGroup.classList.remove('profile-active', 'calories-active', 'tasks-active');
  menuGroup.classList.add('settings-active');
  setActiveTab('settings');
});

caloriesTabBtn.addEventListener('click', function () {
  menuGroup.classList.remove('profile-active', 'settings-active', 'tasks-active');
  menuGroup.classList.add('calories-active');
  setActiveTab('calories');
});

tasksTabBtn.addEventListener('click', () => {
  menuGroup.classList.remove('profile-active', 'settings-active', 'calories-active');
  menuGroup.classList.add('tasks-active');
  setActiveTab('tasks');
  initTasksTab();
});

// Обработчики для кнопок выбора пола
maleBtn.addEventListener('click', function () {
  selectedGender = 'male';
  maleBtn.classList.add('active');
  femaleBtn.classList.remove('active');
  genderButtonGroup.classList.remove('female-active');
  genderButtonGroup.classList.add('male-active');
});

femaleBtn.addEventListener('click', function () {
  selectedGender = 'female';
  femaleBtn.classList.add('active');
  maleBtn.classList.remove('active');
  genderButtonGroup.classList.remove('male-active');
  genderButtonGroup.classList.add('female-active');
});

// Обработчик кнопки расчета калорий
calculateBtn.addEventListener('click', async function () {
  const age = parseInt(ageInput.value);
  const height = parseInt(heightInput.value);
  const weight = parseInt(weightInput.value);

  if (!selectedGender || !age || !height || !weight) {
    alert('Пожалуйста, заполните все поля и выберите пол');
    return;
  }

  let calories;

  // Расчет калорий по формуле Харриса-Бенедикта
  if (selectedGender === 'male') {
    calories = Math.round(66.47 + 13.75 * weight + 5.003 * height - 6.755 * age);
  } else {
    calories = Math.round(655.1 + 9.563 * weight + 1.85 * height - 4.676 * age);
  }

  // Показываем результат
  calculatedCalories.textContent = calories;
  resultContainer.classList.remove('hidden');

  // Обновляем данные пользователя
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const userIndex = usersDB.findIndex((user) => user.login === currentUser);
    if (userIndex !== -1) {
      usersDB[userIndex].height = height;
      usersDB[userIndex].weight = weight;
      usersDB[userIndex].calories = calories;
      usersDB[userIndex].gender = selectedGender;
      localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));

      // Обновляем данные в профиле
      userHeight.textContent = height;
      userWeight.textContent = weight;
      userCalories.textContent = calories;
    }
  }
});

// Функция переключения активной вкладки
function setActiveTab(tabName) {
  document.querySelectorAll('.menu-button').forEach((btn) => {
    btn.classList.remove('active');
  });

  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.remove('active');
  });

  switch (tabName) {
    case 'profile':
      profileTabBtn.classList.add('active');
      profileTab.classList.add('active');
      break;
    case 'settings':
      settingsTabBtn.classList.add('active');
      settingsTab.classList.add('active');
      break;
    case 'calories':
      caloriesTabBtn.classList.add('active');
      caloriesTab.classList.add('active');
      break;
    case 'tasks':
      tasksTabBtn.classList.add('active');
      tasksTab.classList.add('active');
      break;
  }
}

// Функция показа профиля пользователя
function showProfile(username) {
  profileUsername.textContent = username;

  const user = usersDB.find((user) => user.login === username);
  if (user) {
    avatarWrapper.innerHTML = '';

    if (user.avatar) {
      const avatarImg = document.createElement('img');
      avatarImg.src = user.avatar;
      avatarImg.style.width = '100%';
      avatarImg.style.height = '100%';
      avatarImg.style.objectFit = 'cover';
      avatarImg.style.borderRadius = '50%';
      avatarWrapper.appendChild(avatarImg);
    } else {
      const defaultAvatar = document.createElement('img');
      defaultAvatar.className = 'default-avatar';
      defaultAvatar.src =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
      avatarWrapper.appendChild(defaultAvatar);
    }

    userPoints.textContent = user.points || 0;
    userHeight.textContent = user.height || 0;
    userWeight.textContent = user.weight || 0;
    userCalories.textContent = user.calories || 0;
    userActivity.textContent = user.activity || 3;

    // Восстанавливаем выбор пола если он есть
    if (user.gender) {
      selectedGender = user.gender;
      if (user.gender === 'male') {
        maleBtn.click();
      } else {
        femaleBtn.click();
      }
    }

    // Заполняем поля в настройках
    if (user.height) heightInput.value = user.height;
    if (user.weight) weightInput.value = user.weight;
    if (user.age) ageInput.value = user.age;
  }

  authContainer.classList.add('hidden');
  profileContainer.classList.remove('hidden');
  bottomMenu.classList.remove('hidden');
  setActiveTab('profile');
  loadTasksData();
  updatePointsDisplay();
  localStorage.setItem('currentUser', username);
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', function () {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    showProfile(currentUser);
    initCaloriesTab();
  }
});

// Инициализация выбора года
function initYearSelect() {
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 10; year <= currentYear + 10; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === currentYear) {
      option.selected = true;
    }
    yearSelect.appendChild(option);
  }
}

// Обновление отображения дней месяца
function updateDaysDisplay() {
  daysContainer.innerHTML = '';

  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Определяем диапазон дней для отображения (5 дней)
  const startDay = Math.max(1, Math.min(selectedDate.getDate() - 2, daysInMonth - 4));
  const endDay = Math.min(startDay + 4, daysInMonth);

  for (let day = startDay; day <= endDay; day++) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('day-item');
    dayElement.textContent = day;

    if (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    ) {
      dayElement.classList.add('active');
    }

    dayElement.addEventListener('click', () => {
      selectedDate = new Date(year, month, day);
      loadDayData(selectedDate);
      updateDaysDisplay();
    });

    daysContainer.appendChild(dayElement);
  }
}

// Загрузка данных за выбранный день
function loadDayData(date) {
  const dateKey = formatDateKey(date);

  // Проверяем, есть ли данные для этой даты
  if (mealsData[dateKey]) {
    // Заполняем данные из сохраненных
    const dayData = mealsData[dateKey];

    // Обновляем отображение для каждого приема пищи
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
      const mealItemsContainer = document.querySelector(`.meal-items[data-meal="${mealType}"]`);
      mealItemsContainer.innerHTML = '';

      if (dayData[mealType] && dayData[mealType].length > 0) {
        dayData[mealType].forEach((meal, index) => {
          const mealItem = createMealItemElement(meal, mealType, index);
          mealItemsContainer.appendChild(mealItem);
        });
      }
    });

    updateFullDayView();
    updateCaloriesProgress();
  } else {
    // Очищаем все приемы пищи, если данных нет
    document.querySelectorAll('.meal-items').forEach((container) => {
      container.innerHTML = '';
    });
    fullDayMeals.innerHTML = '';
    totalCaloriesSpan.textContent = '0';
  }
}

// Форматирование ключа даты
function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

// Создание элемента приема пищи
function createMealItemElement(meal, mealType, index) {
  const mealItem = document.createElement('div');
  mealItem.classList.add('meal-item');

  const mealInfo = document.createElement('div');
  mealInfo.classList.add('meal-item-info');

  const nameElement = document.createElement('div');
  nameElement.classList.add('meal-item-name');
  nameElement.textContent = meal.name;

  const caloriesElement = document.createElement('div');
  caloriesElement.classList.add('meal-item-calories');
  caloriesElement.textContent = `${meal.calories} ккал`;

  mealInfo.appendChild(nameElement);
  mealInfo.appendChild(caloriesElement);

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-meal-btn');
  deleteBtn.innerHTML = '&times;';
  deleteBtn.addEventListener('click', () => {
    deleteMeal(mealType, index);
  });

  mealItem.appendChild(mealInfo);
  mealItem.appendChild(deleteBtn);

  return mealItem;
}

// Удаление приема пищи
function deleteMeal(mealType, index) {
  const dateKey = formatDateKey(selectedDate);

  if (mealsData[dateKey] && mealsData[dateKey][mealType]) {
    mealsData[dateKey][mealType].splice(index, 1);
    handleMealChange();
    updateCaloriesProgress();
    loadDayData(selectedDate);
  }
}
// Добавление нового приема пищи
function addMeal(mealType, name, calories, protein, fat, carbs) {
  const dateKey = formatDateKey(selectedDate);

  if (!mealsData[dateKey]) {
    mealsData[dateKey] = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
  }

  mealsData[dateKey][mealType].push({
    name,
    calories: parseFloat(calories) || 0,
    protein: parseFloat(protein) || 0,
    fat: parseFloat(fat) || 0,
    carbs: parseFloat(carbs) || 0,
  });

  handleMealChange();
  updateCaloriesProgress();
  loadDayData(selectedDate);
}

// Сохранение данных о приемах пищи
function saveMealsData() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const userIndex = usersDB.findIndex((user) => user.login === currentUser);
    if (userIndex !== -1) {
      usersDB[userIndex].mealsData = mealsData;
      localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
    }
  }
}

// Загрузка данных о приемах пищи
function loadMealsData() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user && user.mealsData) {
      mealsData = user.mealsData;
    }
  }
}

// Обновление полного просмотра дня
function updateFullDayView() {
  fullDayMeals.innerHTML = '';
  let totalCalories = 0;
  const dateKey = formatDateKey(selectedDate);

  if (mealsData[dateKey]) {
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
      if (mealsData[dateKey][mealType] && mealsData[dateKey][mealType].length > 0) {
        const mealTypeHeader = document.createElement('h5');
        mealTypeHeader.textContent = getMealTypeName(mealType);
        fullDayMeals.appendChild(mealTypeHeader);

        mealsData[dateKey][mealType].forEach((meal, index) => {
          const mealItem = createMealItemElement(meal, mealType, index);
          fullDayMeals.appendChild(mealItem);
          totalCalories += meal.calories;
        });
      }
    });
  }

  totalCaloriesSpan.textContent = totalCalories;
}

// Получение названия приема пищи
function getMealTypeName(mealType) {
  switch (mealType) {
    case 'breakfast':
      return 'Завтрак';
    case 'lunch':
      return 'Обед';
    case 'dinner':
      return 'Ужин';
    case 'snack':
      return 'Перекус';
    default:
      return '';
  }
}

// Инициализация вкладки Калории
function initCaloriesTab() {
  initYearSelect();
  updateCaloriesProgress();
  updateCaloriesProgress();

  // Устанавливаем текущую дату
  monthSelect.value = currentDate.getMonth();
  yearSelect.value = currentDate.getFullYear();
  selectedDate = new Date(currentDate);

  // Загружаем данные
  loadMealsData();
  loadDayData(selectedDate);
  updateDaysDisplay();

  // Обработчики событий
  monthSelect.addEventListener('change', () => {
    selectedDate = new Date(parseInt(yearSelect.value), parseInt(monthSelect.value), 1);
    updateDaysDisplay();
  });

  yearSelect.addEventListener('change', () => {
    selectedDate = new Date(parseInt(yearSelect.value), parseInt(monthSelect.value), 1);
    updateDaysDisplay();
  });

  prevDayBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 1);
    loadDayData(selectedDate);
    updateDaysDisplay();
  });

  nextDayBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 1);
    loadDayData(selectedDate);
    updateDaysDisplay();
  });

  addMealBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const mealType = e.target.getAttribute('data-meal');
      document
        .querySelector(`.meal-input-container[data-meal="${mealType}"]`)
        .classList.toggle('hidden');
    });
  });

  saveMealBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const mealType = e.target.getAttribute('data-meal');
      const container = document.querySelector(`.meal-input-container[data-meal="${mealType}"]`);
      const nameInput = container.querySelector('.meal-name-input');
      const caloriesInput = container.querySelector('.meal-calories-input');

      if (nameInput.value && caloriesInput.value) {
        addMeal(mealType, nameInput.value, caloriesInput.value);

        // Очищаем поля
        nameInput.value = '';
        caloriesInput.value = '';

        // Скрываем контейнер
        container.classList.add('hidden');

        // Обновляем отображение
        loadDayData(selectedDate);
      }
    });
  });

  saveDayBtn.addEventListener('click', () => {
    saveMealsData();
    alert('Данные за день сохранены!');
  });

  toggleDayViewBtn.addEventListener('click', () => {
    fullDayView.classList.toggle('hidden');
    toggleDayViewBtn.textContent = fullDayView.classList.contains('hidden')
      ? 'Открыть весь день'
      : 'Скрыть весь день';
    updateFullDayView();
  });
}

// Вызываем инициализацию при загрузке страницы
window.addEventListener('DOMContentLoaded', function () {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    showProfile(currentUser);
    initCaloriesTab();
  }
  // Проверяем смену дня
  checkDayChange();
  // Устанавливаем интервал для проверки смены дня (каждые 10 минут)
  setInterval(checkDayChange, 600000);

  // Инициализируем вкладку Калории при переключении на нее
  caloriesTabBtn.addEventListener('click', initCaloriesTab);
});

// Функция для создания модального окна поиска продуктов
function createFoodModal(mealType) {
  const modal = document.createElement('div');
  modal.className = 'food-modal';

  modal.innerHTML = `
    <div class="food-modal-content">
      <div class="food-modal-header">
        <h3 class="food-modal-title">Выберите продукт для ${getMealTypeName(mealType)}</h3>
        <button class="close-food-modal">&times;</button>
      </div>
      <div class="food-search-container">
        <input type="text" class="food-search-input" placeholder="Начните вводить название">
        <button class="food-search-button">Поиск</button>
      </div>
      <div class="food-search-results"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const searchInput = modal.querySelector('.food-search-input');
  const searchButton = modal.querySelector('.food-search-button');
  const resultsContainer = modal.querySelector('.food-search-results');
  const closeButton = modal.querySelector('.close-food-modal');

  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  const performSearch = () => {
    const query = searchInput.value.trim();
    if (!query) return;

    const results = window.foodDB.searchFoodItems(query);
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>Ничего не найдено</p>';
      return;
    }

    results.forEach((item) => {
      const foodItem = document.createElement('div');
      foodItem.className = 'food-item';
      foodItem.dataset.id = item.id;

      foodItem.innerHTML = `
        <div class="food-item-info">
          <div class="food-item-name">${item.name}</div>
        </div>
        <button class="select-food-button">Выбрать</button>
      `;

      foodItem.querySelector('.select-food-button').addEventListener('click', () => {
        modal.remove();
        createProductPage(mealType, item.id);
      });

      resultsContainer.appendChild(foodItem);
    });
  };

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  searchInput.focus();
}

// Обновленная функция создания элемента приема пищи
function createMealItemElement(meal, mealType, index) {
  const mealItem = document.createElement('div');
  mealItem.classList.add('meal-item');

  const mealInfo = document.createElement('div');
  mealInfo.classList.add('meal-item-info');

  const nameElement = document.createElement('div');
  nameElement.classList.add('meal-item-name');
  nameElement.textContent = meal.name;

  const detailsElement = document.createElement('div');
  detailsElement.classList.add('meal-item-details');

  const caloriesElement = document.createElement('span');
  caloriesElement.classList.add('meal-item-calories');
  caloriesElement.textContent = `${meal.calories} ккал`;

  const macrosElement = document.createElement('span');
  macrosElement.classList.add('meal-item-macros');
  macrosElement.textContent = `Б: ${meal.protein || 0}г, Ж: ${meal.fat || 0}г, У: ${
    meal.carbs || 0
  }г`;

  detailsElement.appendChild(caloriesElement);
  detailsElement.appendChild(document.createTextNode(' '));
  detailsElement.appendChild(macrosElement);

  mealInfo.appendChild(nameElement);
  mealInfo.appendChild(detailsElement);

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-meal-btn');
  deleteBtn.innerHTML = '&times;';
  deleteBtn.addEventListener('click', () => {
    deleteMeal(mealType, index);
  });

  mealItem.appendChild(mealInfo);
  mealItem.appendChild(deleteBtn);

  return mealItem;
}

function handleMealChange() {
  updateCaloriesProgress();
  saveMealsData();
}

// Обновляем обработчики кнопок добавления еды
addMealBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const mealType = e.target.getAttribute('data-meal');
    createFoodModal(mealType);
    updateCaloriesProgress();
  });
});

// Новая функция для создания страницы продукта
function createProductPage(mealType, productId) {
  const product = window.foodDB.getFoodById(productId);
  if (!product) return;

  const [proteinPer100, fatPer100, carbsPer100] = product.bgu.split(',').map(Number);
  const kcalPer100 = Number(product.kcal);

  const modal = document.createElement('div');
  modal.className = 'product-modal';

  modal.innerHTML = `
    <div class="product-modal-content">
      <div class="product-modal-header">
        <h3>${product.name}</h3>
        <button class="close-product-modal">&times;</button>
      </div>
      
      <div class="product-info">
        <div class="product-macros">
          <div>Калории: <span id="productKcal">${kcalPer100}</span> ккал</div>
          <div>Белки: <span id="productProtein">${proteinPer100}</span> г</div>
          <div>Жиры: <span id="productFat">${fatPer100}</span> г</div>
          <div>Углеводы: <span id="productCarbs">${carbsPer100}</span> г</div>
          <small>На 100 грамм продукта</small>
        </div>
        
        <div class="product-calculator">
          <label>Введите количество (грамм):</label>
          <input type="number" id="productWeight" value="100" min="1" class="weight-input">
        </div>
        
        <button id="addProductToMeal" data-meal="${mealType}">Добавить в ${getMealTypeName(
    mealType,
  )}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Обработчики событий
  modal.querySelector('.close-product-modal').addEventListener('click', () => {
    modal.remove();
  });

  const weightInput = modal.querySelector('#productWeight');
  const addBtn = modal.querySelector('#addProductToMeal');

  // Функция для обновления значений
  const updateValues = () => {
    const weight = parseInt(weightInput.value) || 100;
    const factor = weight / 100;

    document.getElementById('productKcal').textContent = (kcalPer100 * factor).toFixed(1);
    document.getElementById('productProtein').textContent = (proteinPer100 * factor).toFixed(1);
    document.getElementById('productFat').textContent = (fatPer100 * factor).toFixed(1);
    document.getElementById('productCarbs').textContent = (carbsPer100 * factor).toFixed(1);
  };

  // Пересчет при изменении веса
  weightInput.addEventListener('input', updateValues);

  // Добавление продукта
  addBtn.addEventListener('click', () => {
    const weight = parseInt(weightInput.value) || 100;
    const factor = weight / 100;

    addMeal(
      mealType,
      `${product.name} (${weight}г)`,
      (kcalPer100 * factor).toFixed(1),
      (proteinPer100 * factor).toFixed(1),
      (fatPer100 * factor).toFixed(1),
      (carbsPer100 * factor).toFixed(1),
    );

    modal.remove();
    loadDayData(selectedDate);
  });

  // Первоначальный расчет
  updateValues();
}

function updateCaloriesProgress() {
  const dateKey = formatDateKey(selectedDate);
  let totalCalories = 0;

  if (mealsData[dateKey]) {
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
      if (mealsData[dateKey][mealType]) {
        mealsData[dateKey][mealType].forEach((meal) => {
          totalCalories += parseFloat(meal.calories) || 0;
        });
      }
    });
  }

  // Получаем норму калорий из профиля
  const currentUser = localStorage.getItem('currentUser');
  let maxCalories = 2000; // Значение по умолчанию

  if (currentUser) {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user && user.calories) {
      maxCalories = parseInt(user.calories) || 2000;
    }
  }

  const progress = Math.min((totalCalories / maxCalories) * 100, 100);
  const circumference = 2 * Math.PI * 45; // 2πr, где r=45 (радиус круга)
  const offset = circumference - (progress / 100) * circumference;

  const circleFill = document.querySelector('.calories-progress-circle-fill');
  const progressText = document.querySelector('.calories-progress-text');

  if (circleFill && progressText) {
    // Удаляем предыдущие transition, чтобы избежать конфликтов
    circleFill.style.transition = 'none';

    // Устанавливаем цвет в зависимости от прогресса
    if (progress < 50) {
      circleFill.style.stroke = '#ff3b30'; // Красный
    } else if (progress < 99) {
      circleFill.style.stroke = '#ff9500'; // Оранжевый
    } else {
      circleFill.style.stroke = '#34c759'; // Зеленый
    }

    // Принудительно перерисовываем элемент
    circleFill.getBoundingClientRect();

    // Теперь применяем анимацию
    circleFill.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
    circleFill.setAttribute('stroke-dasharray', circumference);
    circleFill.setAttribute('stroke-dashoffset', offset);

    // Обновляем текст
    progressText.innerHTML = `${Math.round(totalCalories)}<small>из ${maxCalories}</small>`;
  }
}

// В функции saveDayBtn.addEventListener добавьте вызов обновления шкалы:
saveDayBtn.addEventListener('click', () => {
  saveMealsData();
  const dateKey = formatDateKey(selectedDate);
  let dayCalories = 0;

  if (mealsData[dateKey]) {
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
      if (mealsData[dateKey][mealType]) {
        mealsData[dateKey][mealType].forEach((meal) => {
          dayCalories += parseFloat(meal.calories) || 0;
        });
      }
    });
  }
  const currentUser = localStorage.getItem('currentUser');
  let maxCalories = 2000;

  if (currentUser) {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user && user.calories) {
      maxCalories = parseInt(user.calories) || 2000;
    }
  }
  if (dayCalories >= maxCalories) {
    currentStreak++;
    const today = new Date();
    const dayOfMonth = today.getDate();
    const pointsToAdd = Math.min(currentStreak, dayOfMonth);

    totalPoints += pointsToAdd;
    if (totalPoints > 465) totalPoints = 465;

    saveTasksData();
    updatePointsDisplay();

    alert(`Данные за день сохранены! Вы получили ${pointsToAdd} баллов.`);
  } else {
    currentStreak = 0;
    saveTasksData();
    alert('Данные за день сохранены! Норма калорий не выполнена.');
  }
});

function loadTasksData() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user && user.tasksData) {
      tasksData = user.tasksData;
      currentStreak = tasksData.currentStreak || 0;
      totalPoints = tasksData.totalPoints || 0;
    }
  }
}

function saveTasksData() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const userIndex = usersDB.findIndex((user) => user.login === currentUser);
    if (userIndex !== -1) {
      tasksData.currentStreak = currentStreak;
      tasksData.totalPoints = totalPoints;
      usersDB[userIndex].tasksData = tasksData;
      usersDB[userIndex].points = totalPoints;
      localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
    }
  }
}

function updatePointsDisplay() {
  userPoints.textContent = totalPoints;
  updateProgressBar();
}

function updateProgressBar() {
  const progressBar = document.querySelector('.progress-bar-fill');
  if (progressBar) {
    const progress = (totalPoints / 465) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
    progressBar.textContent = `${totalPoints}/465`;
  }
}

function initTasksTab() {
  const tasksContainer = document.querySelector('.tasks-tab .profile-container');
  tasksContainer.innerHTML = `
    <div class="profile-header">Задания</div>
    <div class="tasks-content">
      <div class="task-description">
        <p>Выполняйте норму калорий каждый день, чтобы получать баллы!</p>
        <p>Каждый день увеличивает количество баллов за выполнение нормы.</p>
        <p>Если пропустите день - счётчик начнётся заново.</p>
      </div>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: 0%">0/465</div>
        </div>
        <div class="progress-text">Максимально можно получить 465 баллов в этом месяце</div>
      </div>
      <div class="current-streak">
        <h3>Текущая серия: <span id="currentStreak">${currentStreak}</span> дней</h3>
        <p>Следующий день принесёт вам ${currentStreak + 1} баллов</p>
      </div>
    </div>
  `;

  updateProgressBar();
}

function checkDayChange() {
  const lastCheck = localStorage.getItem('lastDayCheck');
  const now = new Date();
  const today = now.toDateString();

  if (!lastCheck || lastCheck !== today) {
    // День изменился
    localStorage.setItem('lastDayCheck', today);

    // Если сейчас полночь (или около того), сбрасываем currentStreak если не выполнена норма
    const hours = now.getHours();
    if (hours >= 0 && hours < 6) {
      // Проверяем с 00:00 до 06:00
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = formatDateKey(yesterday);

      let yesterdayCalories = 0;
      if (mealsData[yesterdayKey]) {
        ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
          if (mealsData[yesterdayKey][mealType]) {
            mealsData[yesterdayKey][mealType].forEach((meal) => {
              yesterdayCalories += parseFloat(meal.calories) || 0;
            });
          }
        });
      }

      const currentUser = localStorage.getItem('currentUser');
      let maxCalories = 2000;

      if (currentUser) {
        const user = usersDB.find((user) => user.login === currentUser);
        if (user && user.calories) {
          maxCalories = parseInt(user.calories) || 2000;
        }
      }

      if (yesterdayCalories < maxCalories) {
        currentStreak = 0;
        saveTasksData();
      }
    }
  }
}
