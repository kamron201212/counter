import intlTelInput from 'intl-tel-input'
import 'intl-tel-input/styles'
import './style.css'

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

const iti = intlTelInput(phoneInput, {
  initialCountry: 'uz',
  countrySearch: true,
  separateDialCode: true, // код страны рядом с флагом, в инпуте только номер
  nationalMode: true,
  formatAsYouType: false, // библиотека не трогает пробелы, которые ты вводишь
  loadUtils: () => import('intl-tel-input/utils'),
})

// работает и в новых, и в старых версиях библиотеки
function getCountry() {
  const data =
    typeof iti.getSelectedCountry === 'function'
      ? iti.getSelectedCountry()
      : iti.getSelectedCountryData()
  return data || { iso2: '', dialCode: '' }
}

let currentIso = getCountry().iso2

function limitDigits() {
  const max = MAX_DIGITS[getCountry().iso2]

  // только цифры и пробелы
  let value = phoneInput.value.replace(/[^\d\s]/g, '')

  // режем лишние цифры, только если их стало больше лимита
  if (max) {
    while (value.replace(/\D/g, '').length > max) {
      value = value.slice(0, -1)
    }
    if (value.replace(/\D/g, '').length === max) {
      value = value.trimEnd()
    }
  }

  // меняем значение только если оно реально изменилось
  if (value !== phoneInput.value) {
    phoneInput.value = value
  }
}

phoneInput.addEventListener('input', limitDigits)

// после выбора другой страны инпут пустой
phoneInput.addEventListener('countrychange', () => {
  const iso = getCountry().iso2
  if (iso !== currentIso) {
    currentIso = iso
    phoneInput.value = ''
  }
})