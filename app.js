// База данных пользователей (используем localStorage для сохранения между сессиями)
let usersDB = JSON.parse(localStorage.getItem('fitnessUsers')) || [];

// Подключаем библиотеку для работы с Excel
const script = document.createElement('script');
script.src = 'https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js';
document.head.appendChild(script);

// Переменные для работы с Excel
let workbook = null;
const EXCEL_FILENAME = 'fitness_users.xlsx';

// Функция инициализации Excel файла
async function initExcelFile() {
  try {
    // Пытаемся загрузить существующий файл
    const response = await fetch(EXCEL_FILENAME);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      workbook = XLSX.read(arrayBuffer);
    } else {
      // Если файла нет, создаем новый
      createNewExcelFile();
    }
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    createNewExcelFile();
  }
}

// Функция создания нового Excel файла
function createNewExcelFile() {
  workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Логин', 'Пароль', 'Рост', 'Вес', 'Норма калорий', 'Баллы'],
  ]);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Пользователи');
  saveExcelFile();
}

// Функция сохранения Excel файла
function saveExcelFile() {
  XLSX.writeFile(workbook, EXCEL_FILENAME);
}

// Функция добавления нового пользователя в Excel
async function addUserToExcel(login, password) {
  await initExcelFile();

  const worksheet = workbook.Sheets['Пользователи'];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  // Проверяем, есть ли уже такой пользователь
  const userExists = jsonData.some((row) => row['Логин'] === login);

  if (!userExists) {
    // Добавляем новую строку
    jsonData.push({
      Логин: login,
      Пароль: password,
      Рост: '',
      Вес: '',
      'Норма калорий': '',
      Баллы: 0,
    });

    // Обновляем worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(jsonData);
    workbook.Sheets['Пользователи'] = newWorksheet;
    saveExcelFile();
  }
}

// Функция обновления данных пользователя в Excel
async function updateUserInExcel(login, data) {
  await initExcelFile();

  const worksheet = workbook.Sheets['Пользователи'];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  // Находим пользователя
  const userIndex = jsonData.findIndex((row) => row['Логин'] === login);

  if (userIndex !== -1) {
    // Обновляем данные
    jsonData[userIndex] = {
      ...jsonData[userIndex],
      Рост: data.height || '',
      Вес: data.weight || '',
      'Норма калорий': data.calories || '',
      Баллы: data.points || 0,
    };

    // Обновляем worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(jsonData);
    workbook.Sheets['Пользователи'] = newWorksheet;
    saveExcelFile();
  }
}

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

  // Добавляем пользователя в Excel
  await addUserToExcel(login, password);

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

tasksTabBtn.addEventListener('click', function () {
  menuGroup.classList.remove('profile-active', 'settings-active', 'calories-active');
  menuGroup.classList.add('tasks-active');
  setActiveTab('tasks');
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

      // Обновляем данные в Excel
      await updateUserInExcel(currentUser, {
        height: height,
        weight: weight,
        calories: calories,
        points: usersDB[userIndex].points,
      });
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
  localStorage.setItem('currentUser', username);
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', function () {
  initExcelFile();

  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    showProfile(currentUser);
  }
});
