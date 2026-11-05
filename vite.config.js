import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Чтобы не пропадали стили на Netlify
  optimizeDeps: {
    include: ['intl-tel-input'] // Принудительно подтягивает библиотеку при локальной разработке
  },
  build: {
    commonjsOptions: {
      include: [/intl-tel-input/, /node_modules/] // Заставляет Vite упаковать модули в финальную сборку dist
    }
  }
});
