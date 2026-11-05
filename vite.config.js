import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Это починит пропавшие стили на Netlify
  optimizeDeps: {
    include: ['intl-tel-input'] // Поможет Vite увидеть библиотеку при сборке
  }
});
