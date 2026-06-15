import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const ru = {
  nav: { works:"Спектакли", projects:"Проекты", lab:"Лаборатории", about:"Обо мне", contacts:"Контакты" },
  home: { scroll:"Листайте", featured:"Избранное" },
  works: { all:"Все", current:"Текущий репертуар", archive:"Архив" },
  about: { bio:"Биография", festivals:"Фестивали и проекты", education:"Образование", download:"Скачать CV" },
  contacts: { title:"Контакты", email:"Email" },
};
const en: typeof ru = {
  nav: { works:"Works", projects:"Projects", lab:"Labs", about:"About", contacts:"Contacts" },
  home: { scroll:"Scroll", featured:"Featured" },
  works: { all:"All", current:"Current", archive:"Archive" },
  about: { bio:"Biography", festivals:"Festivals & Projects", education:"Education", download:"Download CV" },
  contacts: { title:"Contacts", email:"Email" },
};

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en } },
  lng: "ru", fallbackLng: "ru", interpolation: { escapeValue: false },
});

export default i18n;
