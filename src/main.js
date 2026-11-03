import './style.css'

let count = 1

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