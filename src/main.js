import './style.css';          // Ваши собственные стили


/* ========== ТЕЛЕФОН ========== */

// Сколько цифр можно вводить ПОСЛЕ кода страны.
// Ключ — код страны (iso2). Для стран, которых тут нет,
// лимит ставит сама библиотека (strictMode).
const MAX_DIGITS = {
  uz: 9,
  ru: 10,
  kz: 10,
  kg: 9,
  tj: 9,
  tm: 8,
  az: 9,
  am: 8,
  ge: 9,
  ua: 9,
  by: 9,
  tr: 10,
  us: 10,
  ca: 10,
  gb: 10,
  ae: 9,
  in: 10,
  cn: 11,
}

const phoneInput = document.getElementById('phone')
const phoneStatus = document.getElementById('phone-status')

const iti = intlTelInput(phoneInput, {
  initialCountry: 'uz',
  countrySearch: true,
  strictMode: true,
  autoInsertDialCode: true,
  countrySelectorMode: 'DROPDOWN', // v29+
  numberDisplayFormat: 'INTERNATIONAL', // v29+
  nationalMode: false, // для старых версий
})

// работает и в новых, и в старых версиях библиотеки
function getCountry() {
  return typeof iti.getSelectedCountry === 'function'
    ? iti.getSelectedCountry()
    : iti.getSelectedCountryData()
}

function limitDigits() {
  const { iso2, dialCode } = getCountry()
  const max = MAX_DIGITS[iso2]
  if (!max) return

  const codeLength = String(dialCode).length
  let value = phoneInput.value

  // обрезаем с конца, пока цифр после кода больше лимита
  while (value.replace(/\D/g, '').length - codeLength > max) {
    value = value.slice(0, -1)
  }
  phoneInput.value = value.trimEnd()
}

function checkPhone() {
  const dial = '+' + getCountry().dialCode
  const value = phoneInput.value.trim()

  phoneInput.classList.remove('valid', 'invalid')

  if (value === '' || value === dial) {
    phoneStatus.textContent = 'Выбери страну и введи номер'
    phoneStatus.className = 'status'
    return
  }

  if (iti.isValidNumber()) {
    phoneInput.classList.add('valid')
    phoneStatus.textContent = '✓ Номер выглядит правильно'
    phoneStatus.className = 'status ok'
  } else {
    phoneInput.classList.add('invalid')
    phoneStatus.textContent = 'Проверь номер, он неполный или неверный'
    phoneStatus.className = 'status error'
  }
}

phoneInput.addEventListener('input', () => {
  limitDigits()
  checkPhone()
})

phoneInput.addEventListener('countrychange', () => {
  // если инпут пустой — ставим код выбранной страны
  if (phoneInput.value.trim() === '') {
    phoneInput.value = '+' + getCountry().dialCode
  }
  limitDigits()
  checkPhone()
})

/* ========== СЧЁТЧИК ========== */
let count = 0

const valueEl = document.getElementById('value')
const plusBtn = document.getElementById('plus')
const minusBtn = document.getElementById('minus')

function render() {
  valueEl.textContent = count
  minusBtn.disabled = count === 0
  valueEl.classList.add('bump')
  setTimeout(() => valueEl.classList.remove('bump'), 150)
}

plusBtn.addEventListener('click', () => {
  count++
  render()
})

minusBtn.addEventListener('click', () => {
  if (count > 0) {
    count--
    render()
  }
})

render()