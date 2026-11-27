/* Online Converter — lightweight i18n (no dependencies) */
(function () {
  'use strict';

  const DICTS = {
    en: {
      nav_merge: 'Merge PDF', nav_split: 'Split PDF', nav_compress: 'Compress PDF',
      nav_convert: 'Convert PDF', nav_all: 'All PDF tools', nav_other: 'All Tools', nav_login: 'Login', nav_signup: 'Sign up',
      hero_title: 'Every tool you need to work with PDFs in one place',
      hero_desc: 'Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.',
      search_tools: 'Search tools... (Ctrl + K)', recent: 'Recently used',
      hero_chip_free: '100% free', hero_chip_private: 'Private by design', hero_chip_offline: 'Works offline', hero_chip_tools: '44 tools',
      filter_all: 'All', cat_organize: 'Organize PDF', cat_optimize: 'Optimize PDF',
      cat_convert_to: 'Convert to PDF', cat_convert_from: 'Convert from PDF', cat_edit: 'Edit PDF', cat_security: 'PDF Security', cat_intelligence: 'PDF Intelligence',
      all_tools: 'All tools', about_title: 'About Online Converter',
      footer_product: 'Product', footer_resources: 'Resources', footer_solutions: 'Solutions',
      footer_legal: 'Legal', footer_company: 'Company', footer_apps: 'Apps',
      footer_home: 'Home', footer_features: 'Features', footer_pricing: 'Pricing', footer_faq: 'FAQ',
      footer_business: 'Business', footer_education: 'Education', footer_developers: 'Developers', footer_integrations: 'Integrations',
      footer_security: 'Security', footer_privacy: 'Privacy policy', footer_terms: 'Terms & conditions', footer_cookies: 'Cookies',
      footer_aboutus: 'About us', footer_contact: 'Contact us', footer_blog: 'Blog', footer_press: 'Press',
      footer_googleplay: 'Google Play', footer_appstore: 'App Store', footer_microsoft: 'Microsoft Store', footer_mac: 'Mac Store',
      footer_language: 'Language', footer_copy: '© 2026 Online Converter · Developed by',
      drop_title: 'Select or drop files', drop_supported: 'Supported:',
      btn_download: 'Download', btn_install: 'Install app', btn_feedback: 'Report a problem',
      theme_light: 'Switch to light mode', theme_dark: 'Switch to dark mode', back_to_top: 'Back to top',
      privacy_notice: 'Files stay on your device',
      status_select: 'Select a file first.', status_error: 'Something went wrong:', status_ready: 'Ready:',
      feedback_title: 'Report a problem', feedback_desc: 'Tell us what went wrong. Details are copied below.',
      feedback_send: 'Open email', feedback_copy: 'Copy details', feedback_cancel: 'Cancel',
      lang_en: 'English', lang_bn: 'বাংলা', lang_es: 'Español', lang_hi: 'हिन्दी', lang_ar: 'العربية'
    },
    bn: {
      nav_merge: 'PDF মার্জ', nav_split: 'PDF স্প্লিট', nav_compress: 'PDF কম্প্রেস',
      nav_convert: 'PDF কনভার্ট', nav_all: 'সব PDF টুল', nav_other: 'সব টুল', nav_login: 'লগইন', nav_signup: 'সাইন আপ',
      hero_title: 'PDF-এর জন্য দরকারি সব টুল এক জায়গায়',
      hero_desc: 'PDF ব্যবহারের জন্য যা কিছু দরকার, সব আপনার হাতে। সবগুলো ১০০% ফ্রি এবং ব্যবহার করা সহজ! কয়েক ক্লিকে মার্জ, স্প্লিট, কম্প্রেস, কনভার্ট, ঘোরান, আনলক ও ওয়াটারমার্ক করুন।',
      search_tools: 'টুল খুঁজুন... (Ctrl + K)', recent: 'সাম্প্রতিক ব্যবহৃত',
      hero_chip_free: '১০০% ফ্রি', hero_chip_private: 'সম্পূর্ণ প্রাইভেট', hero_chip_offline: 'অফলাইনে চলে', hero_chip_tools: '৪৪টি টুল',
      filter_all: 'সব', cat_organize: 'PDF সংগঠিত', cat_optimize: 'PDF অপটিমাইজ',
      cat_convert_to: 'PDF তৈরি করুন', cat_convert_from: 'PDF থেকে কনভার্ট', cat_edit: 'PDF এডিট', cat_security: 'PDF নিরাপত্তা', cat_intelligence: 'PDF ইন্টেলিজেন্স',
      all_tools: 'সব টুল', about_title: 'Online Converter সম্পর্কে',
      footer_product: 'প্রডাক্ট', footer_resources: 'রিসোর্স', footer_solutions: 'সল্যুশন',
      footer_legal: 'আইনি', footer_company: 'কোম্পানি', footer_apps: 'অ্যাপস',
      footer_home: 'হোম', footer_features: 'ফিচার', footer_pricing: 'মূল্য', footer_faq: 'প্রশ্নোত্তর',
      footer_business: 'ব্যবসা', footer_education: 'শিক্ষা', footer_developers: 'ডেভেলপার', footer_integrations: 'ইন্টিগ্রেশন',
      footer_security: 'নিরাপত্তা', footer_privacy: 'গোপনীয়তা নীতি', footer_terms: 'শর্তাবলী', footer_cookies: 'কুকিজ',
      footer_aboutus: 'আমাদের সম্পর্কে', footer_contact: 'যোগাযোগ', footer_blog: 'ব্লগ', footer_press: 'প্রেস',
      footer_googleplay: 'Google Play', footer_appstore: 'App Store', footer_microsoft: 'Microsoft Store', footer_mac: 'Mac Store',
      footer_language: 'ভাষা', footer_copy: '© ২০২৬ Online Converter · ডেভেলপ করেছেন',
      drop_title: 'ফাইল নির্বাচন বা ড্র্যাগ করুন', drop_supported: 'সমর্থিত:',
      btn_download: 'ডাউনলোড', btn_install: 'অ্যাপ ইনস্টল', btn_feedback: 'সমস্যা জানান',
      theme_light: 'লাইট মোড', theme_dark: 'ডার্ক মোড', back_to_top: 'উপরে যান',
      privacy_notice: 'ফাইল আপনার ডিভাইসেই থাকে',
      status_select: 'প্রথমে একটি ফাইল নির্বাচন করুন।', status_error: 'সমস্যা হয়েছে:', status_ready: 'প্রস্তুত:',
      feedback_title: 'সমস্যা জানান', feedback_desc: 'কী সমস্যা হয়েছে জানান। বিশদ নিচে কপি করা আছে।',
      feedback_send: 'ইমেইল খুলুন', feedback_copy: 'বিশদ কপি', feedback_cancel: 'বাতিল',
      lang_en: 'English', lang_bn: 'বাংলা', lang_es: 'Español', lang_hi: 'हिन्दी', lang_ar: 'العربية'
    },
    es: {
      nav_merge: 'Combinar PDF', nav_split: 'Dividir PDF', nav_compress: 'Comprimir PDF',
      nav_convert: 'Convertir PDF', nav_all: 'Todas las herramientas', nav_other: 'Todas las herramientas', nav_login: 'Iniciar sesión', nav_signup: 'Registrarse',
      hero_title: 'Todas las herramientas que necesitas para PDF en un solo lugar',
      hero_desc: 'Todo lo que necesitas para usar PDF al alcance de tu mano. ¡Todo es 100% GRATIS y fácil de usar! Combinar, dividir, comprimir, convertir, rotar, desbloquear y marcar con agua.',
      search_tools: 'Buscar herramientas... (Ctrl + K)', recent: 'Usadas recientemente',
      hero_chip_free: '100% gratis', hero_chip_private: 'Privado por diseño', hero_chip_offline: 'Funciona sin conexión', hero_chip_tools: '44 herramientas',
      filter_all: 'Todas', cat_organize: 'Organizar PDF', cat_optimize: 'Optimizar PDF',
      cat_convert_to: 'Convertir a PDF', cat_convert_from: 'Convertir desde PDF', cat_edit: 'Editar PDF', cat_security: 'Seguridad PDF', cat_intelligence: 'Inteligencia PDF',
      all_tools: 'Todas las herramientas', about_title: 'Acerca de Online Converter',
      footer_product: 'Producto', footer_resources: 'Recursos', footer_solutions: 'Soluciones',
      footer_legal: 'Legal', footer_company: 'Empresa', footer_apps: 'Aplicaciones',
      footer_home: 'Inicio', footer_features: 'Características', footer_pricing: 'Precios', footer_faq: 'Preguntas',
      footer_business: 'Empresas', footer_education: 'Educación', footer_developers: 'Desarrolladores', footer_integrations: 'Integraciones',
      footer_security: 'Seguridad', footer_privacy: 'Política de privacidad', footer_terms: 'Términos', footer_cookies: 'Cookies',
      footer_aboutus: 'Sobre nosotros', footer_contact: 'Contacto', footer_blog: 'Blog', footer_press: 'Prensa',
      footer_googleplay: 'Google Play', footer_appstore: 'App Store', footer_microsoft: 'Microsoft Store', footer_mac: 'Mac Store',
      footer_language: 'Idioma', footer_copy: '© 2026 Online Converter · Desarrollado por',
      drop_title: 'Selecciona o arrastra archivos', drop_supported: 'Soportados:',
      btn_download: 'Descargar', btn_install: 'Instalar app', btn_feedback: 'Informar problema',
      theme_light: 'Modo claro', theme_dark: 'Modo oscuro', back_to_top: 'Volver arriba',
      privacy_notice: 'Tus archivos se quedan en tu dispositivo',
      status_select: 'Selecciona un archivo primero.', status_error: 'Algo salió mal:', status_ready: 'Listo:',
      feedback_title: 'Informar problema', feedback_desc: 'Cuéntanos qué pasó. Los detalles se copian abajo.',
      feedback_send: 'Abrir email', feedback_copy: 'Copiar detalles', feedback_cancel: 'Cancelar',
      lang_en: 'English', lang_bn: 'বাংলা', lang_es: 'Español', lang_hi: 'हिन्दी', lang_ar: 'العربية'
    },
    hi: {
      nav_merge: 'PDF मर्ज', nav_split: 'PDF स्प्लिट', nav_compress: 'PDF कंप्रेस',
      nav_convert: 'PDF कन्वर्ट', nav_all: 'सभी PDF टूल', nav_other: 'सभी टूल', nav_login: 'लॉगिन', nav_signup: 'साइन अप',
      hero_title: 'PDF के लिए ज़रूरी सभी टूल एक जगह',
      hero_desc: 'PDF इस्तेमाल करने के लिए आपको जो कुछ चाहिए, सब आपके हाथ में। सब 100% फ्री और इस्तेमाल में आसान! मर्ज, स्प्लिट, कंप्रेस, कन्वर्ट, घुमाएँ, अनलॉक और वॉटरमार्क करें।',
      search_tools: 'टूल खोजें... (Ctrl + K)', recent: 'हाल ही में इस्तेमाल',
      hero_chip_free: '100% मुफ़्त', hero_chip_private: 'पूरी तरह निजी', hero_chip_offline: 'ऑफ़लाइन काम करता है', hero_chip_tools: '44 टूल',
      filter_all: 'सभी', cat_organize: 'PDF व्यवस्थित', cat_optimize: 'PDF ऑप्टिमाइज़',
      cat_convert_to: 'PDF बनाएँ', cat_convert_from: 'PDF से कन्वर्ट', cat_edit: 'PDF एडिट', cat_security: 'PDF सुरक्षा', cat_intelligence: 'PDF इंटेलिजेंस',
      all_tools: 'सभी टूल', about_title: 'Online Converter के बारे में',
      footer_product: 'प्रोडक्ट', footer_resources: 'संसाधन', footer_solutions: 'समाधान',
      footer_legal: 'कानूनी', footer_company: 'कंपनी', footer_apps: 'ऐप्स',
      footer_home: 'होम', footer_features: 'फीचर्स', footer_pricing: 'मूल्य', footer_faq: 'प्रश्न',
      footer_business: 'व्यापार', footer_education: 'शिक्षा', footer_developers: 'डेवलपर्स', footer_integrations: 'इंटीग्रेशन',
      footer_security: 'सुरक्षा', footer_privacy: 'गोपनीयता नीति', footer_terms: 'नियम', footer_cookies: 'कुकीज़',
      footer_aboutus: 'हमारे बारे में', footer_contact: 'संपर्क', footer_blog: 'ब्लॉग', footer_press: 'प्रेस',
      footer_googleplay: 'Google Play', footer_appstore: 'App Store', footer_microsoft: 'Microsoft Store', footer_mac: 'Mac Store',
      footer_language: 'भाषा', footer_copy: '© 2026 Online Converter · द्वारा विकसित',
      drop_title: 'फ़ाइल चुनें या छोड़ें', drop_supported: 'समर्थित:',
      btn_download: 'डाउनलोड', btn_install: 'ऐप इंस्टॉल', btn_feedback: 'समस्या बताएँ',
      theme_light: 'लाइट मोड', theme_dark: 'डार्क मोड', back_to_top: 'ऊपर जाएँ',
      privacy_notice: 'फ़ाइलें आपके डिवाइस पर रहती हैं',
      status_select: 'पहले एक फ़ाइल चुनें।', status_error: 'कुछ गलत हो गया:', status_ready: 'तैयार:',
      feedback_title: 'समस्या बताएँ', feedback_desc: 'बताएँ कि क्या गलत हुआ। विवरण नीचे कॉपी है।',
      feedback_send: 'ईमेल खोलें', feedback_copy: 'विवरण कॉपी', feedback_cancel: 'रद्द करें',
      lang_en: 'English', lang_bn: 'বাংলা', lang_es: 'Español', lang_hi: 'हिन्दी', lang_ar: 'العربية'
    },
    ar: {
      nav_merge: 'دمج PDF', nav_split: 'تقسيم PDF', nav_compress: 'ضغط PDF',
      nav_convert: 'تحويل PDF', nav_all: 'كل أدوات PDF', nav_other: 'كل الأدوات', nav_login: 'تسجيل الدخول', nav_signup: 'إنشاء حساب',
      hero_title: 'كل الأدوات التي تحتاجها للعمل مع PDF في مكان واحد',
      hero_desc: 'كل ما تحتاجه لاستخدام ملفات PDF بين يديك. كل الأدوات مجانية 100% وسهلة الاستخدام! ادمج وقسّم واضغط وحوّل وأدر وافتح القفل وأضف علامة مائية.',
      search_tools: 'ابحث عن الأدوات... (Ctrl + K)', recent: 'المستخدم مؤخرًا',
      hero_chip_free: 'مجاني 100%', hero_chip_private: 'خصوصية بالتصميم', hero_chip_offline: 'يعمل دون اتصال', hero_chip_tools: '44 أداة',
      filter_all: 'الكل', cat_organize: 'تنظيم PDF', cat_optimize: 'تحسين PDF',
      cat_convert_to: 'تحويل إلى PDF', cat_convert_from: 'تحويل من PDF', cat_edit: 'تحرير PDF', cat_security: 'أمان PDF', cat_intelligence: 'ذكاء PDF',
      all_tools: 'كل الأدوات', about_title: 'عن Online Converter',
      footer_product: 'المنتج', footer_resources: 'الموارد', footer_solutions: 'الحلول',
      footer_legal: 'قانوني', footer_company: 'الشركة', footer_apps: 'التطبيقات',
      footer_home: 'الرئيسية', footer_features: 'المزايا', footer_pricing: 'الأسعار', footer_faq: 'الأسئلة',
      footer_business: 'الأعمال', footer_education: 'التعليم', footer_developers: 'المطورون', footer_integrations: 'التكاملات',
      footer_security: 'الأمان', footer_privacy: 'سياسة الخصوصية', footer_terms: 'الشروط', footer_cookies: 'ملفات تعريف الارتباط',
      footer_aboutus: 'من نحن', footer_contact: 'اتصل بنا', footer_blog: 'المدونة', footer_press: 'الصحافة',
      footer_googleplay: 'Google Play', footer_appstore: 'App Store', footer_microsoft: 'Microsoft Store', footer_mac: 'Mac Store',
      footer_language: 'اللغة', footer_copy: '© 2026 Online Converter · تطوير',
      drop_title: 'اختر أو اسحب الملفات', drop_supported: 'المدعوم:',
      btn_download: 'تنزيل', btn_install: 'تثبيت التطبيق', btn_feedback: 'الإبلاغ عن مشكلة',
      theme_light: 'الوضع الفاتح', theme_dark: 'الوضع الداكن', back_to_top: 'العودة للأعلى',
      privacy_notice: 'ملفاتك تبقى على جهازك',
      status_select: 'اختر ملفًا أولًا.', status_error: 'حدث خطأ:', status_ready: 'جاهز:',
      feedback_title: 'الإبلاغ عن مشكلة', feedback_desc: 'أخبرنا بما حدث. التفاصيل منسوخة أدناه.',
      feedback_send: 'فتح البريد', feedback_copy: 'نسخ التفاصيل', feedback_cancel: 'إلغاء',
      lang_en: 'English', lang_bn: 'বাংলা', lang_es: 'Español', lang_hi: 'हिन्दी', lang_ar: 'العربية'
    }
  };

  const LANGS = ['en', 'bn', 'es', 'hi', 'ar'];
  let lang = 'en';
  try {
    const saved = localStorage.getItem('oc-lang');
    if (saved && DICTS[saved]) lang = saved;
  } catch (e) {}

  function t(key) {
    return (DICTS[lang] && DICTS[lang][key]) || DICTS.en[key] || key;
  }
  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      const v = t(el.getAttribute('data-i18n'));
      if (el.getAttribute('data-i18n-attr')) {
        el.setAttribute(el.getAttribute('data-i18n-attr'), v);
      } else {
        el.textContent = v;
      }
    });
  }
  function setLang(next) {
    if (!DICTS[next]) next = 'en';
    lang = next;
    try { localStorage.setItem('oc-lang', lang); } catch (e) {}
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    apply(document);
    const sel = document.getElementById('langSelect');
    if (sel) sel.value = lang;
    if (typeof window.route === 'function') window.route();
  }
  function init() {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    apply(document);
  }
  window.I18N = { DICTS: DICTS, LANGS: LANGS, get lang() { return lang; }, t: t, apply: apply, setLang: setLang };
  window.t = t;
  window.applyI18n = apply;
  window.setLang = setLang;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
