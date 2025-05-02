// Элементы DOM
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const buttonGroup = document.getElementById('buttonGroup');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginSubmit = document.getElementById('loginSubmit');
const registerSubmit = document.getElementById('registerSubmit');

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

  const user = usersDB.find((user) => user.login === login && user.password === password);

  if (user) {
    localStorage.setItem('currentUser', login);
    window.showProfile(login); // Используем глобальную функцию
  } else {
    alert('Такого пользователя не существует или неверный пароль');
  }
});

// Обработчик формы регистрации
registerSubmit.addEventListener('click', function () {
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

  const userExists = usersDB.some((user) => user.login === login);
  if (userExists) {
    alert('Пользователь с таким логином уже существует');
    return;
  }

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

  showRegistrationTest(login, password);

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

// Создаем модальное окно пошагового теста
// Создаем модальное окно пошагового теста
// Создаем модальное окно пошагового теста
function showRegistrationTest(login, password) {
  const steps = [
    {
      question: 'Какова ваша главная цель?',
      type: 'choice',
      options: ['Похудеть', 'Поддержать текущий вес', 'Набрать вес', 'Нарастить мышцы'],
      key: 'goal',
    },
    {
      question: 'Ваш пол',
      type: 'choice',
      options: ['Женский', 'Мужской'],
      key: 'gender',
    },
    {
      question: 'Когда ваш день рождения?',
      type: 'input',
      placeholder: 'ДД.ММ.ГГГГ',
      key: 'birthdate',
    },
    {
      question: 'Какой у вас рост?',
      type: 'input',
      placeholder: 'Введите рост в см',
      key: 'height',
    },
    {
      question: 'Какой ваш вес?',
      type: 'input',
      placeholder: 'Введите вес в кг',
      key: 'weight',
    },
    {
      question: 'Зададим цель, которую вы собираетесь поразить',
      type: 'input',
      placeholder: 'Желаемый вес в кг',
      key: 'targetWeight',
    },
  ];

  const data = { login, password };
  let stepIndex = 0;

  const modal = document.createElement('div');
  modal.className = 'registration-test-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(255,255,255,1)';
  modal.style.zIndex = '1000';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.padding = '20px';
  modal.style.textAlign = 'center';

  function renderStep() {
    const step = steps[stepIndex];
    const progress = Math.round((stepIndex / steps.length) * 100);

    modal.innerHTML = `
      <div class="test-container" style="width:100%;max-width:400px">
        <div class="progress-bar" style="height:10px;background:#eee;border-radius:10px;margin-bottom:20px;overflow:hidden">
          <div class="progress-fill" style="height:100%;width:${progress}%;background:#000;transition:width 0.3s"></div>
        </div>
        <div class="question" style="font-size:20px;font-weight:600;margin-bottom:20px">${
          step.question
        }</div>
        <div class="answer" style="display:flex;flex-direction:column;gap:10px">
          ${
            step.type === 'choice'
              ? step.options
                  .map(
                    (option) =>
                      `<button class="option-btn" style="padding:12px;border-radius:20px;background:#f0f0f0;border:none;font-size:16px">${option}</button>`,
                  )
                  .join('')
              : `<input type="text" class="answer-input" placeholder="${step.placeholder}" style="padding:12px;border-radius:20px;border:1px solid #ccc;font-size:16px" />`
          }
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    if (step.type === 'choice') {
      modal.querySelectorAll('.option-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          data[step.key] = btn.textContent;
          stepIndex++;
          if (stepIndex < steps.length) {
            renderStep();
          } else {
            renderLoading();
          }
        });
      });
    } else {
      const input = modal.querySelector('.answer-input');
      input.focus();
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          data[step.key] = input.value.trim();
          stepIndex++;
          if (stepIndex < steps.length) {
            renderStep();
          } else {
            renderLoading();
          }
        }
      });
    }
  }

  function renderLoading() {
    modal.innerHTML = `
      <div class="loading-container" style="text-align:center">
        <div class="progress-circle" id="loadingCircle" style="font-size:32px;margin-bottom:10px">0%</div>
        <div class="loading-text" style="margin-bottom:20px;font-weight:600">Составляем ваш план...</div>
        <ul class="loading-steps" style="list-style:none;padding:0;color:#aaa">
          <li id="step1">Анализируем ваши ответы</li>
          <li id="step2">Вычисляем целевую калорийность</li>
          <li id="step3">Прогнозируем ваш прогресс</li>
          <li id="step4">Добавляем финальные штрихи</li>
        </ul>
      </div>
    `;

    let progress = 0;
    const circle = modal.querySelector('#loadingCircle');
    const interval = setInterval(() => {
      progress += 5;
      circle.textContent = `${progress}%`;
      if (progress >= 25) modal.querySelector('#step1').style.color = '#000';
      if (progress >= 50) modal.querySelector('#step2').style.color = '#000';
      if (progress >= 75) modal.querySelector('#step3').style.color = '#000';
      if (progress >= 95) modal.querySelector('#step4').style.color = '#000';

      if (progress >= 100) {
        clearInterval(interval);

        const userIndex = usersDB.findIndex((u) => u.login === login);
        if (userIndex !== -1) {
          const user = usersDB[userIndex];
          user.goal = data.goal;
          user.gender = data.gender.toLowerCase() === 'мужской' ? 'male' : 'female';
          user.birthdate = data.birthdate;
          user.height = parseInt(data.height) || 0;
          user.weight = parseInt(data.weight) || 0;
          user.targetWeight = parseInt(data.targetWeight) || 0;

          // Вычисление возраста из даты рождения
          let age = 30;
          const birthParts = data.birthdate.split('.');
          if (birthParts.length === 3) {
            const birthDate = new Date(`${birthParts[2]}-${birthParts[1]}-${birthParts[0]}`);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }

          user.age = age;

          // Расчёт калорий
          if (user.gender === 'male') {
            user.calories = Math.round(
              66.47 + 13.75 * user.weight + 5.003 * user.height - 6.755 * age,
            );
          } else {
            user.calories = Math.round(
              655.1 + 9.563 * user.weight + 1.85 * user.height - 4.676 * age,
            );
          }

          localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
        }

        setTimeout(() => {
          modal.remove();
          showLoginForm();
        }, 500);
      }
    }, 100);
  }

  function showLoginForm() {
    loginBtn.click();
    document.getElementById('login').value = data.login;
    document.getElementById('password').value = data.password;
  }

  renderStep();
}
