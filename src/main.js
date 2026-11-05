import intlTelInput from 'intl-tel-input'
import 'intl-tel-input/styles'
import './style.css'

// # = цифра, остальное (скобки, пробелы, дефисы) подставляется само
const FORMATS = {
  // СНГ и соседи
  uz: '(##) ###-##-##',   // (90) 123-45-67
  ru: '(###) ###-##-##',  // (912) 345-67-89
  kz: '(###) ###-##-##',  // (701) 234-56-78
  kg: '(###) ##-##-##',   // (555) 12-34-56
  tj: '(##) ###-##-##',   // (91) 234-56-78
  tm: '(##) ##-##-##',    // (65) 12-34-56
  az: '(##) ###-##-##',   // (50) 123-45-67
  am: '(##) ###-###',     // (77) 123-456
  ge: '(###) ###-###',    // (555) 123-456
  ua: '(##) ###-##-##',   // (50) 123-45-67
  by: '(##) ###-##-##',   // (29) 123-45-67
  // Америка
  us: '(###) ###-####',   // (202) 555-0123
  ca: '(###) ###-####',   // (416) 555-0123
  // Европа
  gb: '#### ######',      // 7911 123456
  fr: '# ## ## ## ##',    // 6 12 34 56 78
  it: '### ### ####',     // 312 345 6789
  es: '### ## ## ##',     // 612 34 56 78
  pl: '### ### ###',      // 512 345 678
  nl: '# ########',       // 6 12345678
  tr: '(###) ###-##-##',  // (532) 123-45-67
  // Азия и Ближний Восток
  ae: '(##) ###-####',    // (50) 123-4567
  il: '##-###-####',      // 50-123-4567
  in: '##### #####',      // 98765 43210
  cn: '### #### ####',    // 138 0013 8000
  jp: '##-####-####',     // 90-1234-5678
  kr: '##-####-####',     // 10-1234-5678
}

const phoneInput = document.getElementById('phone')

const iti = intlTelInput(phoneInput, {
  initialCountry: 'uz',
  countrySearch: true,
  separateDialCode: true, // код страны рядом с флагом, в инпуте только номер
  nationalMode: true,
  formatAsYouType: false, // форматирование делаем сами
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
const countDigits = (pattern) => (pattern.match(/#/g) || []).length

/* ---------- длина номера для стран не из списка ---------- */
const maxCache = {}

function getFallbackMax(iso2, dialCode) {
  if (maxCache[iso2]) return maxCache[iso2]

  // пример мобильного номера из библиотеки (международный вид)
  try {
    const u = intlTelInput.utils || window.intlTelInputUtils
    if (u && iso2) {
      const example = u.getExampleNumber(iso2, false, u.numberType?.MOBILE ?? 1)
      const len = digitsOnly(example || '').length - String(dialCode).length
      if (len >= 6 && len <= 12) {
        maxCache[iso2] = len
        return len
      }
    }
  } catch (e) {
    // utils ещё не загрузились — берём значение по умолчанию
  }

  return 10
}

// общий шаблон для стран не из списка: (XX) XXX-XX-XX, (XXX) XXX-XX-XX
function buildGenericPattern(max) {
  const area = max >= 10 ? 3 : 2
  let rest = max - area
  const groups = []
  if (rest % 2 === 1) {
    groups.push('###')
    rest -= 3
  }
  while (rest > 0) {
    groups.push('##')
    rest -= 2
  }
  return `(${'#'.repeat(area)}) ${groups.join('-')}`
}

function getPattern(iso2, dialCode) {
  return FORMATS[iso2] || buildGenericPattern(getFallbackMax(iso2, dialCode))
}

// подставляет цифры в шаблон, лишние символы в конце не добавляет
function applyMask(digits, pattern) {
  let result = ''
  let i = 0
  for (const ch of pattern) {
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
  const { iso2, dialCode } = getCountry()
  const pattern = getPattern(iso2, dialCode)
  const max = countDigits(pattern)

  const raw = phoneInput.value
  const caret = phoneInput.selectionStart ?? raw.length
  const digitsBeforeCaret = digitsOnly(raw.slice(0, caret)).length

  let digits = digitsOnly(raw)
  let removed = 0

  // вставили номер вместе с кодом страны — убираем код
  if (dialCode && digits.length > max && digits.startsWith(String(dialCode))) {
    digits = digits.slice(String(dialCode).length)
    removed = String(dialCode).length
  }
  digits = digits.slice(0, max)

  const formatted = applyMask(digits, pattern)

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