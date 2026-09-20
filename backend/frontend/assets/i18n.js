"use strict";
/* WeatherGPT Interface Localization (i18n): English, Hindi, Gujarati */

const TRANSLATIONS = {
  en: {
    // Navigation & Common
    nav_home: "Home",
    nav_ask: "Ask",
    nav_forecast: "Forecast",
    nav_alerts: "Alerts",
    nav_climate: "Climate",
    nav_safety: "Safety",
    nav_about: "About",
    btn_ask_nav: "Ask a question",
    menu_btn: "Menu",
    theme_btn: "Switch to dark mode",
    
    // Offline Banner
    offline_msg: "⚠️ You are offline. Showing last cached weather forecast & emergency guidance.",
    
    // Home Page
    hero_badge: "Smart India Hackathon 2026 prototype, SIH26068. Live data from Open-Meteo and NDMA SACHET.",
    hero_title: "Rain, heat and official warnings, in your own language.",
    hero_lede: "Get today's forecast and any government alert for your town, explained in English, Hindi, Gujarati, Marathi, Bengali or Tamil. Official alerts always appear exactly as they were issued.",
    city_label: "Your town or city",
    city_placeholder: "For example, Vadodara",
    btn_update: "Update",
    locate_btn: "Use my location",
    locate_note: "\"Use my location\" looks up your town's name once. Only the name is saved on this device.",
    cta_ask: "Ask a question",
    cta_forecast: "Open the 5-day forecast",
    section_head: "Everything you need before the weather turns",
    card_ask_h: "Ask in your language",
    card_ask_p: "Type or speak a question about rain, heat or travel. The answer is written from the live forecast and current alerts, in a few plain sentences.",
    card_ask_go: "Ask a question",
    card_fc_h: "Read the next 5 days",
    card_fc_p: "See the chance of rain and the expected millimetres for each day, so you know how much rain is coming and not only whether.",
    card_fc_go: "Open the forecast",
    card_al_h: "Check official alerts",
    card_al_p: "Warnings from IMD and state authorities, shown exactly as published, with the time each one stops being valid.",
    card_al_go: "See current alerts",
    card_cl_h: "Compare with a normal year",
    card_cl_p: "See whether the coming days are wetter, drier or hotter than the same dates over the last 10 years, and how rain builds through the year.",
    card_cl_go: "Open the climate page",
    card_sf_h: "Prepare before it happens",
    card_sf_p: "Checklists for home, a bag packed before water rises, and who to call if power or mobile network goes down.",
    card_sf_go: "Open the safety guide",

    // Assistant Page
    assistant_h: "Ask",
    assistant_lede: "Pick your place and who you are, choose a language, then ask about the weather or warnings.",
    role_label: "I am a",
    role_general: "General user",
    role_farmer: "Farmer",
    role_commuter: "Commuter",
    empty_h: "Ask about rain, heat or warnings for your area",
    empty_p: "Try one of these, or type your own question.",
    msg_placeholder: "Ask about the weather or warnings",
    mic_label: "Speak your question",
    send_label: "Send question",
    btn_why: "Why this answer?",

    // Forecast Tabs & Hourly
    tab_5day: "5-Day Overview",
    tab_hourly: "24-Hour Timeline",
    hourly_head: "24-Hour Forecast (Hourly)",
    hourly_hint: "Click any card for full details",

    // Footer
    foot_desc: "Forecasts and official warnings, explained in your language. A prototype built for Smart India Hackathon 2026, problem statement SIH26068.",
    foot_sources: "Data sources",
    foot_emergency: "In an emergency",
    foot_emergency_p: "Call 112 and follow instructions from your local authorities. WeatherGPT can be wrong and is not an emergency service."
  },

  hi: {
    // Navigation & Common
    nav_home: "होम",
    nav_ask: "पूछें",
    nav_forecast: "पूर्वानुमान",
    nav_alerts: "चेतावनियाँ",
    nav_climate: "जलवायु",
    nav_safety: "सुरक्षा",
    nav_about: "परिचय",
    btn_ask_nav: "प्रश्न पूछें",
    menu_btn: "मेनू",
    theme_btn: "डार्क मोड बदलें",
    
    // Offline Banner
    offline_msg: "⚠️ आप ऑफ़लाइन हैं। अंतिम सहेजा गया मौसम पूर्वानुमान और आपातकालीन मार्गदर्शिका दिखाई जा रही है।",

    // Home Page
    hero_badge: "स्मार्ट इंडिया हैकाथॉन 2026 प्रोटोटाइप, SIH26068। ओपन-मेटियो और एनडीएमए सचेत से लाइव डेटा।",
    hero_title: "बारिश, गर्मी और आधिकारिक चेतावनियाँ, आपकी अपनी भाषा में।",
    hero_lede: "अपने शहर का आज का पूर्वानुमान और सरकारी अलर्ट प्राप्त करें, जो हिंदी, गुजराती, मराठी, बंगाली, तमिल या अंग्रेजी में समझाया गया है। आधिकारिक अलर्ट हमेशा उसी रूप में दिखते हैं जैसे जारी किए गए थे।",
    city_label: "आपका शहर या कस्बा",
    city_placeholder: "उदाहरण के लिए, वडोदरा",
    btn_update: "अपडेट करें",
    locate_btn: "मेरी लोकेशन का उपयोग करें",
    locate_note: "\"मेरी लोकेशन का उपयोग करें\" केवल एक बार आपके शहर का नाम ढूंढता है। केवल नाम इस डिवाइस पर सहेजा जाता है।",
    cta_ask: "प्रश्न पूछें",
    cta_forecast: "5-दिवसीय पूर्वानुमान देखें",
    section_head: "मौसम बदलने से पहले वह सब कुछ जो आपको चाहिए",
    card_ask_h: "अपनी भाषा में पूछें",
    card_ask_p: "बारिश, गर्मी या यात्रा के बारे में प्रश्न लिखें या बोलें। लाइव पूर्वानुमान और अलर्ट के आधार पर सीधा उत्तर मिलता है।",
    card_ask_go: "प्रश्न पूछें",
    card_fc_h: "अगले 5 दिनों का हाल जानें",
    card_fc_p: "प्रत्येक दिन बारिश की संभावना और अपेक्षित मिलीमीटर देखें, ताकि पता चले कि कितनी बारिश होगी।",
    card_fc_go: "पूर्वानुमान देखें",
    card_al_h: "आधिकारिक अलर्ट देखें",
    card_al_p: "आईएमडी और राज्य आपदा प्राधिकरणों की चेतावनियाँ, बिना किसी बदलाव के समय सीमा के साथ।",
    card_al_go: "वर्तमान अलर्ट देखें",
    card_cl_h: "सामान्य वर्ष से तुलना करें",
    card_cl_p: "देखें कि आने वाले दिन पिछले 10 वर्षों की समान तिथियों की तुलना में अधिक गीले, सूखे या गर्म हैं।",
    card_cl_go: "जलवायु पेज खोलें",
    card_sf_h: "समय रहते तैयारी करें",
    card_sf_p: "घर के लिए चेकलिस्ट, पानी भरने से पहले आपातकालीन बैग और हेल्पलाइन नंबर।",
    card_sf_go: "सुरक्षा गाइड खोलें",

    // Assistant Page
    assistant_h: "पूछें",
    assistant_lede: "अपना स्थान और भूमिका चुनें, भाषा चुनें, और मौसम या चेतावनी के बारे में पूछें।",
    role_label: "मेरी भूमिका",
    role_general: "सामान्य नागरिक",
    role_farmer: "किसान",
    role_commuter: "दैनिक यात्री",
    empty_h: "अपने क्षेत्र में बारिश, गर्मी या चेतावनी के बारे में पूछें",
    empty_p: "इनमें से कोई एक चुनें, या अपना प्रश्न लिखें।",
    msg_placeholder: "मौसम या चेतावनियों के बारे में पूछें",
    mic_label: "अपना प्रश्न बोलें",
    send_label: "प्रश्न भेजें",
    btn_why: "यह उत्तर क्यों?",

    // Forecast Tabs & Hourly
    tab_5day: "5-दिवसीय अवलोकन",
    tab_hourly: "24-घंटे का टाइमलाइन",
    hourly_head: "24 घंटे का पूर्वानुमान (प्रति घंटा)",
    hourly_hint: "विस्तृत विवरण के लिए किसी भी कार्ड पर क्लिक करें",

    // Footer
    foot_desc: "पूर्वानुमान और आधिकारिक चेतावनियाँ, आपकी अपनी भाषा में। स्मार्ट इंडिया हैकाथॉन 2026 के लिए बनाया गया प्रोटोटाइप, समस्या विवरण SIH26068।",
    foot_sources: "डेटा स्रोत",
    foot_emergency: "आपातकालीन स्थिति में",
    foot_emergency_p: "112 पर कॉल करें और स्थानीय प्रशासन के निर्देशों का पालन करें। वेदरजीपीटी आपातकालीन सेवा नहीं है।"
  },

  gu: {
    // Navigation & Common
    nav_home: "હોમ",
    nav_ask: "પૂછો",
    nav_forecast: "આગાહી",
    nav_alerts: "ચેતવણીઓ",
    nav_climate: "આબોહવા",
    nav_safety: "સુરક્ષા",
    nav_about: "વિશે",
    btn_ask_nav: "પ્રશ્ન પૂછો",
    menu_btn: "મેનુ",
    theme_btn: "ડાર્ક મોડ બદલો",
    
    // Offline Banner
    offline_msg: "⚠️ તમે અત્યારે ઑફલાઇન છો. છેલ્લી સેવ કરેલી હવામાન આગાહી અને કટોકટી માર્ગદર્શિકા બતાવાય છે.",

    // Home Page
    hero_badge: "સ્માર્ટ ઇન્ડિયા હેકાથોન 2026 પ્રોટોટાઇપ, SIH26068. ઓપન-મેટિઓ અને એનડીએમએ સચેતનો લાઇવ ડેટા.",
    hero_title: "વરસાદ, ગરમી અને સત્તાવાર ચેતવણીઓ, તમારી પોતાની ભાષામાં.",
    hero_lede: "તમારા શહેરની આજની હવામાન આગાહી અને સરકારી ચેતવણીઓ મેળવો. સત્તાવાર ચેતવણીઓ હંમેશા જેમ જાહેર થઈ હોય તેમ જ દેખાય છે.",
    city_label: "તમારું શહેર કે ગામ",
    city_placeholder: "દાખલા તરીકે, વડોદરા",
    btn_update: "અપડેટ કરો",
    locate_btn: "મારું લોકેશન વાપરો",
    locate_note: "\"મારું લોકેશન વાપરો\" ફક્ત એક વાર તમારા શહેરનું નામ શોધે છે. ફક્ત નામ તમારા ફોન પર સચવાય છે.",
    cta_ask: "પ્રશ્ન પૂછો",
    cta_forecast: "5-દિવસીય આગાહી જુઓ",
    section_head: "હવામાન બદલાય તે પહેલાં જરૂરી તમામ માહિતી",
    card_ask_h: "તમારી ભાષામાં પૂછો",
    card_ask_p: "વરસાદ, ગરમી કે મુસાફરી અંગે પ્રશ્ન લખો કે બોલો. લાઇવ આગાહી અને ચેતવણીઓના આધારે સરળ જવાબ મળે છે.",
    card_ask_go: "પ્રશ્ન પૂછો",
    card_fc_h: "આગામી 5 દિવસની આગાહી",
    card_fc_p: "દરરોજ વરસાદની શક્યતા અને અંદાજિત મિલીમીટર જુઓ, જેથી ખબર પડે કે કેટલો વરસાદ પડશે.",
    card_fc_go: "આગાહી જુઓ",
    card_al_h: "સત્તાવાર ચેતવણીઓ તપાસો",
    card_al_p: "IMD અને રાજ્ય ડિઝાસ્ટર ઓથોરિટીની ચેતવણીઓ, સમયમર્યાદા સાથે મૂળ સ્વરૂપે.",
    card_al_go: "હાલની ચેતવણીઓ જુઓ",
    card_cl_h: "સામાન્ય વર્ષ સાથે સરખામણી",
    card_cl_p: "જુઓ કે આવનારા દિવસો છેલ્લા 10 વર્ષની સરખામણીએ વધુ ભીના, સૂકા કે ગરમ છે.",
    card_cl_go: "આબોહવા પેજ ખોલો",
    card_sf_h: "પહેલેથી તૈયારી રાખો",
    card_sf_p: "ઘર માટે ચેકલિસ્ટ, પૂર પહેલાં તૈયાર કટોકટી બેગ અને હેલ્પલાઇન નંબર.",
    card_sf_go: "સુરક્ષા ગાઇડ ખોલો",

    // Assistant Page
    assistant_h: "પૂછો",
    assistant_lede: "તમારું સ્થળ અને ભૂમિકા પસંદ કરો, ભાષા પસંદ કરો અને હવામાન કે ચેતવણી વિશે પૂછો.",
    role_label: "મારી ભૂમિકા",
    role_general: "સામાન્ય નાગરિક",
    role_farmer: "ખેડૂત",
    role_commuter: "દૈનિક મુસાફર",
    empty_h: "તમારા વિસ્તારમાં વરસાદ, ગરમી કે ચેતવણી વિશે પૂછો",
    empty_p: "આમાંથી એક પસંદ કરો, અથવા તમારો પ્રશ્ન લખો.",
    msg_placeholder: "હવામાન કે ચેતવણીઓ વિશે પૂછો",
    mic_label: "તમારો પ્રશ્ન બોલો",
    send_label: "પ્રશ્ન મોકલો",
    btn_why: "આ જવાબ કેમ?",

    // Forecast Tabs & Hourly
    tab_5day: "5-દિવસીય ઝાંખી",
    tab_hourly: "24-કલાકની સમયરેખા",
    hourly_head: "24 કલાકની આગાહી (કલાકવાર)",
    hourly_hint: "સંપૂર્ણ વિગતો માટે કોઈપણ કાર્ડ પર ક્લિક કરો",

    // Footer
    foot_desc: "આગાહી અને સત્તાવાર ચેતવણીઓ, તમારી પોતાની ભાષામાં. સ્માર્ટ ઇન્ડિયા હેકાથોન 2026 પ્રોટોટાઇપ, સમસ્યા નિવેદન SIH26068.",
    foot_sources: "ડેટા સ્ત્રોતો",
    foot_emergency: "કટોકટીની સ્થિતિમાં",
    foot_emergency_p: "112 પર કૉલ કરો અને સ્થાનિક સત્તાવાળાઓની સૂચનાઓનું પાલન કરો. વેધરજીપીટી કટોકટી સેવા નથી."
  }
};

function getUILang() {
  try {
    return localStorage.getItem("wgpt_ui_lang") || "en";
  } catch (e) {
    return "en";
  }
}

function setUILang(lang) {
  if (!TRANSLATIONS[lang]) lang = "en";
  try {
    localStorage.setItem("wgpt_ui_lang", lang);
  } catch (e) {}
  document.documentElement.lang = lang === "en" ? "en-IN" : (lang === "hi" ? "hi-IN" : "gu-IN");
  applyTranslations(lang);
  
  // Sync assistant radio if on assistant.html
  const langRadio = document.querySelector(`input[name="lang"][value="${lang === 'hi' ? 'Hindi' : (lang === 'gu' ? 'Gujarati' : 'English')}"]`);
  if (langRadio) {
    langRadio.checked = true;
    langRadio.dispatchEvent(new Event("change"));
  }
  
  // Dispatch custom event for pages that want to listen
  window.dispatchEvent(new CustomEvent("wgpt_lang_changed", { detail: { lang } }));
}

function t(key, lang) {
  const l = lang || getUILang();
  const dict = TRANSLATIONS[l] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || "";
}

function applyTranslations(lang) {
  const l = lang || getUILang();
  const dict = TRANSLATIONS[l] || TRANSLATIONS.en;

  // Text content
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  // Placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });

  // Aria labels
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (dict[key]) el.setAttribute("aria-label", dict[key]);
  });

  // Update language selector active state if present
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const isActive = btn.getAttribute("data-lang") === l;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
  const langSelect = document.getElementById("ui-lang-select");
  if (langSelect && langSelect.value !== l) {
    langSelect.value = l;
  }
}

// Auto-init on page load
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const current = getUILang();
    applyTranslations(current);
  });
}
