// DOM элементы
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const buttonGroup = document.getElementById('buttonGroup');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginSubmit = document.getElementById('loginSubmit');
const registerSubmit = document.getElementById('registerSubmit');

// Переключение между формами
loginBtn.addEventListener('click', () => {
  buttonGroup.classList.remove('register-active');
  buttonGroup.classList.add('login-active');
  loginBtn.classList.add('active');
  registerBtn.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

registerBtn.addEventListener('click', () => {
  buttonGroup.classList.remove('login-active');
  buttonGroup.classList.add('register-active');
  registerBtn.classList.add('active');
  loginBtn.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

// Вход
loginSubmit.addEventListener('click', () => {
  const login = document.getElementById('login').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!login || !password) return alert('Заполните все поля');

  const user = usersDB.find((u) => u.login === login && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', login);
    window.showProfile(login);
  } else {
    alert('Неверный логин или пароль');
  }
});

// Регистрация
registerSubmit.addEventListener('click', () => {
  const login = document.getElementById('regLogin').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!login || !password || !confirmPassword) return alert('Заполните все поля');
  if (password !== confirmPassword) return alert('Пароли не совпадают');

  if (usersDB.some((u) => u.login === login)) return alert('Пользователь уже существует');

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

  document.getElementById('regLogin').value = '';
  document.getElementById('regPassword').value = '';
  document.getElementById('confirmPassword').value = '';

  showRegistrationTest(login, password);
});

// Модальное пошаговое окно
function showRegistrationTest(login, password) {
  const steps = [
    {
      question: 'Какова ваша главная цель?',
      type: 'choice',
      options: [
        { text: 'Похудеть', icon: 'icon-weight-loss' },
        { text: 'Поддержать вес', icon: 'icon-weight-maintain' },
        { text: 'Набрать вес', icon: 'icon-weight-gain' },
        { text: 'Нарастить мышцы', icon: 'icon-muscle' },
      ],
      key: 'goal',
    },
    {
      question: 'Ваш пол',
      type: 'choice',
      options: [
        { text: 'Женский', icon: 'icon-female' },
        { text: 'Мужской', icon: 'icon-male' },
      ],
      key: 'gender',
    },
    {
      question: 'Сколько вам лет?',
      type: 'input',
      placeholder: 'Введите ваш возраст',
      key: 'age',
      validate: (value) => {
        const age = parseInt(value);
        if (isNaN(age)) return 'Пожалуйста, введите число';
        if (age < 10 || age > 100) return 'Возраст должен быть от 10 до 100 лет';
        return null;
      },
    },
    {
      question: 'Какой у вас рост?',
      type: 'input',
      placeholder: 'Рост в см',
      key: 'height',
      validate: (value) => {
        const height = parseInt(value);
        if (isNaN(height)) return 'Пожалуйста, введите число';
        if (height < 100 || height > 250) return 'Рост должен быть от 100 до 250 см';
        return null;
      },
    },
    {
      question: 'Какой ваш вес?',
      type: 'input',
      placeholder: 'Вес в кг',
      key: 'weight',
      validate: (value) => {
        const weight = parseInt(value);
        if (isNaN(weight)) return 'Пожалуйста, введите число';
        if (weight < 30 || weight > 300) return 'Вес должен быть от 30 до 300 кг';
        return null;
      },
    },
    {
      question: 'Желаемый вес?',
      type: 'input',
      placeholder: 'Желаемый вес в кг',
      key: 'targetWeight',
      validate: (value) => {
        const targetWeight = parseInt(value);
        if (isNaN(targetWeight)) return 'Пожалуйста, введите число';
        if (targetWeight < 30 || targetWeight > 300) return 'Вес должен быть от 30 до 300 кг';
        return null;
      },
    },
  ];

  const data = { login, password };
  let stepIndex = 0;

  const modal = document.createElement('div');
  modal.className = 'registration-test-modal';
  document.body.appendChild(modal);

  function renderStep() {
    const step = steps[stepIndex];
    const progress = Math.round((stepIndex / steps.length) * 100);

    modal.innerHTML = `
      <div class="test-container">
        <div class="progress-container2">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
        <div class="question">${step.question}</div>
        <div class="answer-options">
          ${
            step.type === 'choice'
              ? step.options
                  .map(
                    (opt) => `
                      <button class="option-btn">
                        <span class="icon ${opt.icon}"></span>
                        <span>${opt.text}</span>
                      </button>
                    `,
                  )
                  .join('')
              : `
                <input type="text" class="answer-input" placeholder="${step.placeholder}" />
                <div class="input-error"></div>
              `
          }
        </div>
      </div>
    `;

    if (step.type === 'choice') {
      modal.querySelectorAll('.option-btn').forEach((btn, index) => {
        btn.onclick = () => {
          data[step.key] = step.options[index].text;
          nextStep();
        };
      });
    } else {
      const input = modal.querySelector('.answer-input');
      const error = modal.querySelector('.input-error');

      input.focus();

      input.onkeypress = (e) => {
        if (e.key === 'Enter') {
          validateAndProceed();
        }
      };

      // Добавляем кнопку "Далее" для мобильных устройств
      if (window.innerWidth <= 768) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'option-btn';
        nextBtn.textContent = 'Далее';
        nextBtn.style.marginTop = '10px';
        nextBtn.onclick = validateAndProceed;
        modal.querySelector('.answer-options').appendChild(nextBtn);
      }

      function validateAndProceed() {
        const value = input.value.trim();
        if (!value) {
          error.textContent = 'Пожалуйста, заполните это поле';
          error.style.display = 'block';
          return;
        }

        if (step.validate) {
          const validationError = step.validate(value);
          if (validationError) {
            error.textContent = validationError;
            error.style.display = 'block';
            return;
          }
        }

        data[step.key] = value;
        nextStep();
      }
    }
  }

  function nextStep() {
    stepIndex++;
    if (stepIndex < steps.length) {
      renderStep();
    } else {
      renderLoading();
    }
  }

  function renderLoading() {
    modal.innerHTML = `
      <div class="loading-container">
        <div id="loadingCircle" class="progress-circle">0%</div>
        <div class="loading-text">Составляем ваш план...</div>
        <ul class="loading-steps">
          <li id="step1">Анализируем ответы</li>
          <li id="step2">Считаем калории</li>
          <li id="step3">Строим прогноз</li>
          <li id="step4">Готовим профиль</li>
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
        saveUserData();
      }
    }, 100);
  }

  function saveUserData() {
    const user = usersDB.find((u) => u.login === login);
    if (user) {
      user.goal = data.goal;
      user.gender = data.gender === 'Мужской' ? 'male' : 'female';
      user.age = parseInt(data.age) || 30;
      user.height = parseInt(data.height) || 0;
      user.weight = parseInt(data.weight) || 0;
      user.targetWeight = parseInt(data.targetWeight) || 0;

      // Расчет базового метаболизма (формула Миффлина-Сан Жеора)
      if (user.gender === 'male') {
        user.calories = Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5);
      } else {
        user.calories = Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age - 161);
      }

      // Корректировка по цели
      if (user.goal === 'Похудеть') user.calories -= 300;
      else if (user.goal === 'Набрать вес') user.calories += 300;

      localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
      localStorage.setItem('currentUser', login);

      setTimeout(() => {
        modal.remove();
        window.showProfile(login);
      }, 500);
    }
  }

  renderStep();
}
