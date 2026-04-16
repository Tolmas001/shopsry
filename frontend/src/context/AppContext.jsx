import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api';

const AppContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const backendUrl = API_URL.replace('/api', '');

const translations = {
  uz: {
    nav_home: 'Bosh sahifa', nav_shop: 'Do\'kon', nav_categories: 'Kategoriyalar', nav_about: 'Biz haqimizda', nav_contact: 'Bog\'lanish',
    search: 'Qidirish...', login: 'Kirish', register: 'Ro\'yxatdan o\'tish', logout: 'Chiqish', profile: 'Profil', admin: 'Admin Panel',
    add_to_cart: 'Savatga qo\'shish', in_stock: 'Omborda mavjud', out_of_stock: 'Tugagan',
    cart_title: 'Savat', cart_empty: 'Savat bo\'sh', checkout: 'Sotib olish', total: 'Jami',
    profile_title: 'Profil', profile_info: 'Ma\'lumotlar', settings: 'Sozlamalar',
    username: 'Foydalanuvchi ismi', full_name: 'To\'liq ism', email: 'Email', password: 'Yangi parol (ixtiyoriy)', save: 'Saqlash',
    lang_uz: 'O\'zbekcha', lang_ru: 'Русский', lang_en: 'English',
    success_profile: 'Profil muvaffaqiyatli yangilandi', error_auth: 'Username yoki email allaqachon mavjud',
    success_cart: 'Mahsulot savatga qo\'shildi!',
    my_favorites: 'Sevimlilar', favorites_empty: 'Sevimlilar ro\'yxati bo\'sh', items_selected: 'mahsulot tanlangan', browse_products: 'Mahsulotlarni ko\'rish', clear_all: 'Hammasini tozalash',
    hero_title: 'Kelajak Texnologiyasi Sizning Qo\'lingizda', hero_desc: 'Eng sara mahsulotlar, zamonaviy dizayn va sifat uyg\'unligi. O\'z hayotingizni biz bilan yanada yorqinroq qiling.',
    hero_search_placeholder: 'Nima qidiryapsiz?', hero_search_btn: 'Izlash', hero_catalog_btn: 'Katalogga o\'tish', hero_customers: '10k+ Mijozlar', hero_rating: '4.9 Reyting', hero_quality: 'Sifat kafolati',
    cat_title: 'INTERAKTIV', cat_subtitle: 'Kategoriyalar Boyicha Izlash', view_more: 'Ko\'proq',
    new_arrival: 'YANGI TANLOV', view_all: 'Hammasini ko\'rish',
    offer_subtitle: 'MAXSUS TAKLIF', offer_title: 'Haftaning eng katta chegirmalari!', offer_desc: 'Faqatgina shu hafta ichida barcha mahsulotlarga 40% gacha keshbek oling. Fursatni qo\'ldan boy bermang!',
    offer_btn: 'Chegirmalarni ko\'rish', hours: 'Soat', mins: 'Minut', secs: 'Soniya',
    footer_desc: 'Biz eng sifatli va zamonaviy mahsulotlarni sizga yetkazib berishdan faxrlanamiz. Bizning do\'konimizda har doim kutganingizdan ko\'prog\'ini topasiz.',
    comp_title: 'Kompaniya', help_title: 'Yordam', contact_title: 'Bog\'lanish',
    location: 'Toshkent, O\'zbekiston', rights: '© 2024 ShopSRY. Barcha huquqlar himoyalangan.', payment_systems: 'To\'lov tizimlari:',
    cat_electronics: 'Elektronika', cat_clothing: 'Kiyim-kechak', cat_shoes: 'Oyoq kiyimlar', cat_accessories: 'Aksessuarlar', cat_home: 'Uy anjomlari',
    reviews_title: 'MIJOZLAR FIKRI', reviews_subtitle: 'Biz haqimizda nima deyishadi?',
    newsletter_title: 'Yangi mahsulotlardan xabardor bo\'ling', newsletter_desc: 'Elektron pochtangizni qoldiring va barcha yangiliklar hamda chegirmalardan birinchilardan bo\'lib xabardor bo\'ling.',
    newsletter_placeholder: 'Sizning elektron pochtangiz...', newsletter_btn: 'Obuna bo\'lish',
    like: 'Yoqdi', comments: 'Izohlar', quick_view: 'Tezkor ko\'rish', no_comments: 'Hali izohlar yoʻq', write_comment: 'Izoh yozing...', send: 'Yuborish', login_to_comment: 'Izoh yozish uchun tizimga kiring',
    reviews_count: 'sharhlar', select_color: 'Rangini tanlang', select_size: 'O\'lchamini tanlang', currency: 'UZS',
    back_to_catalog: 'Katalogga qaytish', description: 'Tavsif', information: 'Ma\'lumot', share: 'Ulashish', reviews: 'Sharhlar',
    add_to_cart_success: 'Savatga qo\'shildi!', related_products: 'O\'xshash mahsulotlar',
    sort_by: 'Saralash', filter_title: 'Filtr', price_range: 'Narx oralig\'i', brand: 'Brend', apply: 'Qo\'llash', reset: 'Tozalash',
    loading: 'Yuklanmoqda...', product_not_found: 'Mahsulot topilmadi', back_to_shop: 'Do\'konga qaytish',
    specifications: 'Xususiyatlar', leave_review: 'Sharh qoldiring', your_opinion: 'Sizning fikringiz',
    opinion_placeholder: 'Mahsulot haqida nima deb o\'ylaysiz?', upload_image: 'Rasm yuklash (ixtiyoriy)',
    no_reviews: 'Hali sharhlar mavjud emas', be_first_review: 'Birinchi bo\'lib fikringizni bildiring!',
    filters_and_search: 'Filtrlar va Qidiruv', all: 'Hammasi', from: 'Dan', to: 'Gacha',
    products_count: 'Mahsulotlar', newest: 'Eng yangilari', price_asc: 'Narx: Arzonroq', price_desc: 'Narx: Qimmatroq',
    nothing_found: 'Hech narsa topilmadi', clear_filter: 'Filtrni tozalash', items: 'ta mahsulot',
    password_label: 'Parol', error_occurred: 'Xatolik yuz berdi', edit_profile_desc: 'Hisob ma\'lumotlarini tahrirlash',
    profile_picture: 'Profil rasmi', upload_picture_desc: 'PNG, JPG yoki SVG yuklang (maks. 5MB)', select_system_lang: 'Tizim tilini tanlang',
    forgot_password_link: 'Parolni unutdingizmi?', forgot_password_title: 'Parolni tiklash', 
    forgot_password_desc: 'Emailingizni kiriting va biz sizga tasdiqlash kodini yuboramiz',
    enter_code: 'Tasdiqlash kodini kiriting', new_password_label: 'Yangi parol', 
    send_code_btn: 'Kodni yuborish', reset_password_btn: 'Parolni yangilash',
    success_forgot_password: 'Tasdiqlash kodi emailingizga yuborildi', success_reset_password: 'Parol muvaffaqiyatli o\'zgartirildi',
    my_orders: 'Buyurtmalarim', no_orders: 'Sizda hali buyurtmalar mavjud emas', order_id: 'Buyurtma ID',
    order_date: 'Sana', order_status: 'Holati', total_price: 'Jami summa',
    theme_settings: 'Mavzu sozlamalari', dark_mode: 'Tungi rejim', light_mode: 'Yorug\' rejim',
    account_security: 'Hisob xavfsizligi', logout_confirm: 'Haqiqatan ham chiqmoqchimisiz?',
    status_pending: 'Kutilmoqda', status_completed: 'Tugallangan', status_cancelled: 'Bekor qilingan',
    payment_method: 'To\'lov usuli', payment_status: 'To\'lov holati', paid: 'To\'langan', unpaid: 'To\'lanmagan',
    cash: 'Naqd', card: 'Karta',
    saved_addresses: 'Mening manzillarim', add_address: 'Yangi manzil',
    payment_methods: 'To\'lov kartalari', add_card: 'Yangi karta',
    my_reviews: 'Sharhlarim', loyalty_points: 'Mening ballarim',
    member_tier: 'Daraja', profile_completeness: 'Profil to\'liqligi',
    phone_number: 'Telefon raqami', notifications: 'Bildirishnomalar',
    email_notifications: 'Email bildirishnomalar', private_profile: 'Maxfiy profil',
    deactivate_account: 'Hisobni o\'chirish', address_title: 'Manzil nomi',
    address_details: 'Manzil tafsilotlari', card_number: 'Karta raqami',
    card_expiry: 'Yaroqlilik muddati', card_holder: 'Karta egasi',
    bronze_member: 'Bronza a\'zo', silver_member: 'Kumush a\'zo', gold_member: 'Oltin a\'zo',
  },
  ru: {
    nav_home: 'Главная', nav_shop: 'Магазин', nav_categories: 'Категории', nav_about: 'О нас', nav_contact: 'Контакты',
    search: 'Поиск...', login: 'Войти', register: 'Регистрация', logout: 'Выйти', profile: 'Профиль', admin: 'Админ Панель',
    add_to_cart: 'В корзину', in_stock: 'В наличии', out_of_stock: 'Нет в наличии',
    cart_title: 'Корзина', cart_empty: 'Корзина пуста', checkout: 'Оформить заказ', total: 'Итого',
    profile_title: 'Профиль', profile_info: 'Информация', settings: 'Настройки',
    username: 'Имя пользователя', full_name: 'Полное имя', email: 'Email', password: 'Новый пароль (опционально)', save: 'Сохранить',
    lang_uz: 'Узбекский', lang_ru: 'Русский', lang_en: 'Английский',
    success_profile: 'Профиль успешно обновлен', error_auth: 'Имя пользователя или email уже существует',
    success_cart: 'Товар добавлен в корзину!',
    my_favorites: 'Избранное', favorites_empty: 'Список избранного пуст', items_selected: 'товаров выбрано', browse_products: 'Просмотреть товары', clear_all: 'Очистить всё',
    hero_title: 'Технологии будущего в ваших руках', hero_desc: 'Лучшие продукты, современный дизайн и гармония качества. Сделайте свою жизнь ярче вместе с нами.',
    hero_search_placeholder: 'Что вы ищете?', hero_search_btn: 'Поиск', hero_catalog_btn: 'Перейти в каталог', hero_customers: '10k+ Клиентов', hero_rating: '4.9 Рейтинг', hero_quality: 'Гарантия качества',
    cat_title: 'ИНТЕРАКТИВ', cat_subtitle: 'Поиск по категориям', view_more: 'Больше',
    new_arrival: 'НОВЫЙ ВЫБОР', view_all: 'Смотреть все',
    offer_subtitle: 'СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ', offer_title: 'Самые большие скидки недели!', offer_desc: 'Получите кешбэк до 40% на все товары только на этой неделе. Не упустите шанс!',
    offer_btn: 'Посмотреть скидки', hours: 'Часов', mins: 'Минут', secs: 'Секунд',
    footer_desc: 'Мы гордимся тем, что доставляем вам самые качественные и современные товары. В нашем магазине вы всегда найдете больше, чем ожидаете.',
    comp_title: 'Компания', help_title: 'Помощь', contact_title: 'Контакты',
    location: 'Ташкент, Узбекистан', rights: '© 2024 ShopSRY. Все права защищены.', payment_systems: 'Платежные системы:',
    cat_electronics: 'Электроника', cat_clothing: 'Одежда', cat_shoes: 'Обувь', cat_accessories: 'Аксессуары', cat_home: 'Товары для дома',
    reviews_title: 'ОТЗЫВЫ КЛИЕНТОВ', reviews_subtitle: 'Что о нас говорят?',
    newsletter_title: 'Будьте в курсе новинок', newsletter_desc: 'Оставьте свой email и узнавайте о новинках и скидках первыми.',
    newsletter_placeholder: 'Ваш электронный адрес...', newsletter_btn: 'Подписаться',
    like: 'Нравится', comments: 'Комментарии', quick_view: 'Быстрый просмотр', no_comments: 'Комментариев пока нет', write_comment: 'Напишите комментарий...', send: 'Отправить', login_to_comment: 'Войдите, чтобы оставить отзыв',
    reviews_count: 'отзывов', select_color: 'Выберите цвет', select_size: 'Выберите размер', currency: 'сум',
    back_to_catalog: 'Вернуться в каталог', description: 'Описание', information: 'Информация', share: 'Поделиться', reviews: 'Отзывы',
    add_to_cart_success: 'Добавлено в корзину!', related_products: 'Похожие товары',
    sort_by: 'Сортировка', filter_title: 'Фильтр', price_range: 'Диапазон цен', brand: 'Бренд', apply: 'Применить', reset: 'Сбросить',
    loading: 'Загрузка...', product_not_found: 'Товар не найден', back_to_shop: 'Вернуться в магазин',
    specifications: 'Характеристики', leave_review: 'Оставьте отзыв', your_opinion: 'Ваше мнение',
    opinion_placeholder: 'Что вы думаете о товаре?', upload_image: 'Загрузить фото (опционально)',
    no_reviews: 'Отзывов пока нет', be_first_review: 'Будьте первым, кто оставит отзыв!',
    filters_and_search: 'Фильтры и Поиск', all: 'Все', from: 'От', to: 'До',
    products_count: 'Товары', newest: 'Сначала новые', price_asc: 'Цена: Дешевле', price_desc: 'Цена: Дороже',
    nothing_found: 'Ничего не найдено', clear_filter: 'Очистить фильтр', items: 'товаров',
    password_label: 'Пароль', error_occurred: 'Произошла ошибка', edit_profile_desc: 'Редактировать данные аккаунта',
    profile_picture: 'Фото профиля', upload_picture_desc: 'Загрузите PNG, JPG или SVG (макс. 5МБ)', select_system_lang: 'Выберите язык системы',
    forgot_password_link: 'Забыли пароль?', forgot_password_title: 'Восстановление пароля',
    forgot_password_desc: 'Введите ваш email, и мы отправим вам код подтверждения',
    enter_code: 'Введите код подтверждения', new_password_label: 'Новый пароль',
    send_code_btn: 'Отправить код', reset_password_btn: 'Обновить пароль',
    success_forgot_password: 'Код подтверждения отправлен на вашу почту', success_reset_password: 'Пароль успешно изменен',
    my_orders: 'Мои заказы', no_orders: 'У вас пока нет заказов', order_id: 'ID заказа',
    order_date: 'Дата', order_status: 'Статус', total_price: 'Итоговая сумма',
    theme_settings: 'Настройки темы', dark_mode: 'Темный режим', light_mode: 'Светлый режим',
    account_security: 'Безопасность аккаунта', logout_confirm: 'Вы действительно хотите выйти?',
    status_pending: 'В ожидании', status_completed: 'Завершен', status_cancelled: 'Отменен',
    payment_method: 'Способ оплаты', payment_status: 'Статус оплаты', paid: 'Оплачено', unpaid: 'Не оплачено',
    cash: 'Наличные', card: 'Карта',
    saved_addresses: 'Мои адреса', add_address: 'Новый адрес',
    payment_methods: 'Платежные карты', add_card: 'Новая карта',
    my_reviews: 'Мои отзывы', loyalty_points: 'Мои баллы',
    member_tier: 'Уровень', profile_completeness: 'Полнота профиля',
    phone_number: 'Номер телефона', notifications: 'Уведомления',
    email_notifications: 'Email уведомления', private_profile: 'Приватный профиль',
    deactivate_account: 'Удалить аккаунт', address_title: 'Название адреса',
    address_details: 'Детали адреса', card_number: 'Номер карты',
    card_expiry: 'Срок действия', card_holder: 'Владелец карты',
    bronze_member: 'Бронзовый участник', silver_member: 'Серебряный участник', gold_member: 'Золотой участник',
  },
  en: {
    nav_home: 'Home', nav_shop: 'Shop', nav_categories: 'Categories', nav_about: 'About Us', nav_contact: 'Contact',
    search: 'Search...', login: 'Login', register: 'Register', logout: 'Logout', profile: 'Profile', admin: 'Admin Panel',
    add_to_cart: 'Add to Cart', in_stock: 'In Stock', out_of_stock: 'Out of Stock',
    cart_title: 'Cart', cart_empty: 'Cart is empty', checkout: 'Checkout', total: 'Total',
    profile_title: 'Profile', profile_info: 'Information', settings: 'Settings',
    username: 'Username', full_name: 'Full Name', email: 'Email', password: 'New Password (optional)', save: 'Save',
    lang_uz: 'Uzbek', lang_ru: 'Russian', lang_en: 'English',
    success_profile: 'Profile updated successfully', error_auth: 'Username or email already exists',
    success_cart: 'Product added to cart!',
    my_favorites: 'My Favorites', favorites_empty: 'Your Favorites list is empty', items_selected: 'items selected', browse_products: 'Browse Products', clear_all: 'Clear All',
    hero_title: 'Future Technology in Your Hands', hero_desc: 'The best products, modern design, and harmony of quality. Make your life brighter with us.',
    hero_search_placeholder: 'What are you looking for?', hero_search_btn: 'Search', hero_catalog_btn: 'Go to Catalog', hero_customers: '10k+ Customers', hero_rating: '4.9 Rating', hero_quality: 'Quality Warranty',
    cat_title: 'INTERACTIVE', cat_subtitle: 'Search by Categories', view_more: 'More',
    new_arrival: 'NEW ARRIVAL', view_all: 'View All',
    offer_subtitle: 'LIMITED TIME OFFER', offer_title: 'Biggest Discounts of the Week!', offer_desc: 'Get up to 40% cashback on all products only this week. Don\'t miss the chance!',
    offer_btn: 'View Discounts', hours: 'Hours', mins: 'Mins', secs: 'Secs',
    footer_desc: 'We are proud to deliver the highest quality and modern products to you. In our store, you will always find more than you expect.',
    comp_title: 'Company', help_title: 'Help', contact_title: 'Contact',
    location: 'Tashkent, Uzbekistan', rights: '© 2024 ShopSRY. All rights reserved.', payment_systems: 'Payment Systems:',
    cat_electronics: 'Electronics', cat_clothing: 'Clothing', cat_shoes: 'Shoes', cat_accessories: 'Accessories', cat_home: 'Home Goods',
    reviews_title: 'CUSTOMER REVIEWS', reviews_subtitle: 'What they say about us?',
    newsletter_title: 'Stay Informed about New Products', newsletter_desc: 'Leave your email to stay updated on new arrivals and discounts first.',
    newsletter_placeholder: 'Your email address...', newsletter_btn: 'Subscribe',
    like: 'Like', comments: 'Comments', quick_view: 'Quick View', no_comments: 'No comments yet', write_comment: 'Write a comment...', send: 'Send', login_to_comment: 'Login to leave a comment',
    reviews_count: 'reviews', select_color: 'Select color', select_size: 'Select size', currency: 'UZS',
    back_to_catalog: 'Back to Catalog', description: 'Description', information: 'Information', share: 'Share', reviews: 'Reviews',
    add_to_cart_success: 'Added to cart!', related_products: 'Related Products',
    sort_by: 'Sort by', filter_title: 'Filter', price_range: 'Price Range', brand: 'Brand', apply: 'Apply', reset: 'Reset',
    loading: 'Loading...', product_not_found: 'Product not found', back_to_shop: 'Back to Shop',
    specifications: 'Specifications', leave_review: 'Leave a Review', your_opinion: 'Your Opinion',
    opinion_placeholder: 'What do you think about the product?', upload_image: 'Upload Image (optional)',
    no_reviews: 'No reviews yet', be_first_review: 'Be the first to share your opinion!',
    filters_and_search: 'Filters and Search', all: 'All', from: 'From', to: 'To',
    products_count: 'Products', newest: 'Newest', price_asc: 'Price: Low to High', price_desc: 'Price: High to Low',
    nothing_found: 'Nothing found', clear_filter: 'Clear filter', items: 'items',
    password_label: 'Password', error_occurred: 'An error occurred', edit_profile_desc: 'Edit account information',
    profile_picture: 'Profile picture', upload_picture_desc: 'Upload PNG, JPG or SVG (max 5MB)', select_system_lang: 'Select system language',
    forgot_password_link: 'Forgot password?', forgot_password_title: 'Reset Password',
    forgot_password_desc: 'Enter your email and we will send you a verification code',
    enter_code: 'Enter verification code', new_password_label: 'New Password',
    send_code_btn: 'Send Code', reset_password_btn: 'Update Password',
    success_forgot_password: 'Verification code has been sent to your email', success_reset_password: 'Password changed successfully',
    my_orders: 'My Orders', no_orders: 'You have no orders yet', order_id: 'Order ID',
    order_date: 'Date', order_status: 'Status', total_price: 'Total Price',
    theme_settings: 'Theme Settings', dark_mode: 'Dark Mode', light_mode: 'Light Mode',
    account_security: 'Account Security', logout_confirm: 'Are you sure you want to logout?',
    status_pending: 'Pending', status_completed: 'Completed', status_cancelled: 'Cancelled',
    payment_method: 'Payment Method', payment_status: 'Payment Status', paid: 'Paid', unpaid: 'Unpaid',
    cash: 'Cash', card: 'Card',
    saved_addresses: 'My Addresses', add_address: 'Add Address',
    payment_methods: 'Payment Cards', add_card: 'Add Card',
    my_reviews: 'My Reviews', loyalty_points: 'My Points',
    member_tier: 'Member Tier', profile_completeness: 'Profile Completeness',
    phone_number: 'Phone Number', notifications: 'Notifications',
    email_notifications: 'Email Notifications', private_profile: 'Private Profile',
    deactivate_account: 'Deactivate Account', address_title: 'Address Title',
    address_details: 'Address Details', card_number: 'Card Number',
    card_expiry: 'Expiry Date', card_holder: 'Card Holder',
    bronze_member: 'Bronze Member', silver_member: 'Silver Member', gold_member: 'Gold Member',
  }
}

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'uz');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [notifications, setNotifications] = useState([]);

  // Apply theme immediately to document
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      auth.me()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const t = (key) => translations[language][key] || key;

  const login = async (username, password) => {
    const res = await auth.login(username, password);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const googleLogin = async (credential) => {
    const res = await auth.googleLogin(credential);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (username, email, password) => {
    await auth.register(username, email, password);
    await login(username, password);
  };

  const updateProfile = async (data) => {
    const res = await auth.updateProfile(data);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    return await auth.forgotPassword(email);
  };

  const resetPassword = async (email, code, newPassword) => {
    return await auth.resetPassword(email, code, newPassword);
  };

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const addToCart = (product, selectedColor, selectedSize, quantity = 1) => {
    const variant = `${selectedColor}-${selectedSize}`;
    setCart(prev => {
      const existIndex = prev.findIndex(item => item.id === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize);
      if (existIndex > -1) {
        return prev.map((item, index) => index === existIndex ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, selectedColor, selectedSize, variant, quantity }];
    });
    showNotification(t('success_cart'));
  };

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const isExist = prev.find(item => item.id === product.id);
      if (isExist) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromCart = (id, variant) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.variant === variant)));
  };

  const updateQuantity = (id, variant, quantity) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => item.id === id && item.variant === variant ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);
  const clearFavorites = () => setFavorites([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider value={{
      user, setUser, login, register, googleLogin, logout, updateProfile, forgotPassword, resetPassword,
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, loading,
      favorites, toggleFavorite, clearFavorites,
      language, changeLanguage, t, theme, toggleTheme,
      quickViewProduct, setQuickViewProduct,
      notifications, setNotifications, showNotification,
      backendUrl
    }}>
      {children}
    </AppContext.Provider>
  );
};