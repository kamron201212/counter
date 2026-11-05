import intlTelInput from 'intl-tel-input'
import 'intl-tel-input/styles'
import './style.css'

const phoneInput = document.getElementById('phone')

const iti = intlTelInput(phoneInput, {
  initialCountry: 'uz',
  countrySearch: true,
  separateDialCode: true,        // код страны рядом с флагом, в инпуте только номер
  nationalMode: true,            // формат, как принято внутри страны
  formatAsYouType: false,        // форматирование делаем сами по маске
  autoPlaceholder: 'aggressive', // пример номера ставится всегда
  placeholderNumberType: 'MOBILE',
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

const digitsOnly = (s) => s.replace(/\D/g, '')

// маска из примера номера: "(201) 555-0123" -> "(###) ###-####"
function getMask() {
  const example = phoneInput.placeholder || ''
  return /\d/.test(example) ? example.replace(/\d/g, '#') : null
}

// подставляет цифры в маску, лишние символы в конце не добавляет
function applyMask(digits, mask) {
  let result = ''
  let i = 0
  for (const ch of mask) {
    if (i >= digits.length) break
    if (ch === '#') {
      result += digits[i++]
    } else {
      result += ch
    }
  }
  return result
}

// позиция курсора после N-й цифры
function caretAfterDigits(formatted, count) {
  if (count === 0) return 0
  let seen = 0
  for (let p = 0; p < formatted.length; p++) {
    if (/\d/.test(formatted[p])) {
      seen++
      if (seen === count) return p + 1
    }
  }
  return formatted.length
}

function formatInput() {
  const dial = String(getCountry().dialCode || '')
  const mask = getMask()

  // длина по маске; если маски ещё нет — по стандарту не больше 15 цифр вместе с кодом
  const max = mask ? (mask.match(/#/g) || []).length : 15 - dial.length

  const raw = phoneInput.value
  const caret = phoneInput.selectionStart ?? raw.length
  const digitsBeforeCaret = digitsOnly(raw.slice(0, caret)).length

  let digits = digitsOnly(raw)
  let removed = 0

  // вставили номер вместе с кодом страны — убираем код
  if (dial && digits.length > max && digits.startsWith(dial)) {
    digits = digits.slice(dial.length)
    removed = dial.length
  }
  digits = digits.slice(0, max)

  const formatted = mask ? applyMask(digits, mask) : digits

  if (formatted !== raw) {
    phoneInput.value = formatted
    const digitsCaret = Math.min(Math.max(digitsBeforeCaret - removed, 0), digits.length)
    const pos = caretAfterDigits(formatted, digitsCaret)
    phoneInput.setSelectionRange(pos, pos)
  }
}

let currentIso = getCountry().iso2

phoneInput.addEventListener('input', formatInput)

// после выбора другой страны инпут пустой
phoneInput.addEventListener('countrychange', () => {
  const iso = getCountry().iso2
  if (iso !== currentIso) {
    currentIso = iso
    phoneInput.value = ''
  }
})