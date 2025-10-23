import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const ru = {
  common: {
    inbound: 'Ввоз продукции',
    outbound: 'Вывоз продукции',
    chooseOperation: 'Карщик — Выберите операцию',
    submit: 'Отправить',
    savedOffline: 'Сохранено офлайн, отправим при подключении',
    success: 'Отправлено',
    failed: 'Ошибка отправки',
    tasksFromForeman: 'Задачи от бригадира',
    remaining: 'Осталось',
    category: 'Категория',
    fridge: 'Холодильник',
    unsorted: 'несорт',
    sorted: 'сорт'
  }
};
const en = {
  common: {
    inbound: 'Inbound',
    outbound: 'Outbound',
    chooseOperation: 'Forklift — Choose operation',
    submit: 'Submit',
    savedOffline: 'Saved offline, will sync later',
    success: 'Sent',
    failed: 'Send error',
    tasksFromForeman: 'Tasks from foreman',
    remaining: 'Left',
    category: 'Category',
    fridge: 'Fridge',
    unsorted: 'unsorted',
    sorted: 'sorted'
  }
};

i18next.use(initReactI18next).init({
  lng: 'ru',
  fallbackLng: 'ru',
  resources: { ru: { translation: ru }, en: { translation: en } },
  interpolation: { escapeValue: false }
});

export default i18next;
