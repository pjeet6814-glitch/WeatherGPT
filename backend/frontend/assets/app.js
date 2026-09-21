"use strict";
/* WeatherGPT frontend: shared helpers plus one init function per page. */

// Hosted (Vercel): the API lives on the same site under /api. Local development: the page is served on
// port 5500 (or opened as a file) and the backend runs on port 8000.
const LOCAL_DEV = typeof location !== "undefined" &&
  (location.protocol === "file:" || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port === "5500"));
// config.js can set window.WEATHERGPT_API to point a static host (such as GitHub Pages) at a backend elsewhere.
const CONFIGURED_API = (typeof window !== "undefined" && window.WEATHERGPT_API) ? String(window.WEATHERGPT_API).replace(/\/+$/, "") : "";
const API = CONFIGURED_API || (LOCAL_DEV ? "http://127.0.0.1:8000" : "");

const LANGS = [
  ["English", "en-IN"],
  ["Hindi", "hi-IN"],
  ["Gujarati", "gu-IN"],
  ["Marathi", "mr-IN"],
  ["Bengali", "bn-IN"],
  ["Tamil", "ta-IN"],
  ["Telugu", "te-IN"],
  ["Kannada", "kn-IN"],
  ["Malayalam", "ml-IN"],
  ["Punjabi", "pa-IN"],
  ["Odia", "or-IN"],
];
const EXAMPLES = {
  general: {
    English: ["Will it rain today?", "Are there any official warnings for my area?", "What should I plan for tomorrow?", "Is this rain normal for this time of year?"],
    Hindi: ["क्या आज बारिश होगी?", "क्या मेरे इलाके में कोई आधिकारिक चेतावनी है?", "कल के लिए मुझे क्या तैयारी करनी चाहिए?", "क्या यह बारिश साल के इस समय के हिसाब से सामान्य है?"],
    Gujarati: ["શું આજે વરસાદ પડશે?", "શું મારા વિસ્તારમાં કોઈ સત્તાવાર ચેતવણી છે?", "કાલ માટે મારે શું તૈયારી કરવી જોઈએ?", "શું વર્ષના આ સમય માટે આ વરસાદ સામાન્ય છે?"],
  },
  farmer: {
    English: ["Will rain affect harvesting in the next 5 days?", "Should I delay spraying because of rain?", "How much rain is expected in the next 5 days?"],
    Hindi: ["क्या अगले 5 दिनों में बारिश से कटाई पर असर पड़ेगा?", "क्या बारिश की वजह से छिड़काव टाल देना चाहिए?", "अगले 5 दिनों में कितनी बारिश होने की संभावना है?"],
    Gujarati: ["શું આગામી 5 દિવસમાં વરસાદથી લણણી પર અસર થશે?", "શું વરસાદને કારણે છંટકાવ મુલતવી રાખવો જોઈએ?", "આગામી 5 દિવસમાં કેટલો વરસાદ પડવાની શક્યતા છે?"],
  },
  commuter: {
    English: ["Should I carry an umbrella today?", "Will it rain tomorrow?", "Are there any alerts that could affect travel today?"],
    Hindi: ["क्या आज छाता ले जाना चाहिए?", "क्या कल बारिश होगी?", "क्या आज यात्रा पर असर डालने वाली कोई चेतावनी है?"],
    Gujarati: ["શું આજે છત્રી લઈ જવી જોઈએ?", "શું કાલે વરસાદ પડશે?", "શું આજે મુસાફરીને અસર કરે તેવી કોઈ ચેતવણી છે?"],
  },
  student: {
    English: ["Is it safe to go to school or college today?", "Will it rain heavily during morning commute hours?", "Are there any heat advisories for outdoor sports?"],
    Hindi: ["क्या आज स्कूल/कॉलेज जाने के लिए मौसम सुरक्षित है?", "क्या सुबह स्कूल के समय भारी बारिश होगी?", "क्या खेलकूद के लिए लू की चेतावनी है?"],
    Gujarati: ["શું આજે સ્કૂલ કે કોલેજ જવા માટે હવામાન સલામત છે?", "શું સવારે સ્કૂલના સમયે ભારે વરસાદ પડશે?", "શું ગરમી કે લૂની કોઈ ચેતવણી છે?"],
  },
  outdoor_worker: {
    English: ["Is it safe to work outdoors on scaffolds today?", "What is the peak heat time to avoid direct sun?", "Are there lightning or thunderstorm warnings?"],
    Hindi: ["क्या आज बाहर काम करना सुरक्षित है?", "धूप से बचने के लिए सबसे गर्म समय कौन सा रहेगा?", "क्या बिजली गिरने या आंधी-तूफान की चेतावनी है?"],
    Gujarati: ["શું આજે બહાર કામ કરવું સલામત છે?", "લૂથી બચવા માટે સૌથી ગરમ સમય કયો રહેશે?", "શું વીજળી કે વાવાઝોડાની કોઈ ચેતવણી છે?"],
  },
  fisherman: {
    English: ["Are there high wind or squall alerts for the coast?", "Is it safe to venture into the sea in the next 24 hours?", "What is the wind speed and wave forecast?"],
    Hindi: ["क्या तटीय क्षेत्र के लिए तेज हवा या तूफान का अलर्ट है?", "क्या अगले 24 घंटों में समुद्र में जाना सुरक्षित है?", "हवा की गति और मौसम का पूर्वानुमान क्या है?"],
    Gujarati: ["શું દરિયાકાંઠે ભારે પવન કે વાવાઝોડાની ચેતવણી છે?", "શું આગામી 24 કલાકમાં દરિયો ખેડવો સલામત છે?", "પવનની ગતિ અને દરિયાનું હવામાન કેવું રહેશે?"],
  },
  elderly: {
    English: ["Is the air quality safe for a morning walk?", "What time is best for elderly people to go outside today?", "Will extreme heat or pollution trigger breathing issues?"],
    Hindi: ["क्या सुबह की सैर के लिए हवा की गुणवत्ता ठीक है?", "बुजुर्गों के लिए आज बाहर जाने का सबसे अच्छा समय कौन सा है?", "क्या प्रदूषण या गर्मी से सांस लेने में परेशानी होगी?"],
    Gujarati: ["શું સવારની વોક માટે હવાની ગુણવત્તા સારી છે?", "વરિષ્ઠ નાગરિકો માટે આજે બહાર જવા કયો સમય શ્રેષ્ઠ છે?", "શું પ્રદૂષણ કે ગરમીથી શ્વાસ લેવામાં તકલીફ થઈ શકે?"],
  },
  delivery: {
    English: ["Will rain or waterlogged roads affect deliveries today?", "Are there alerts for gusty winds while riding bikes?", "What should I prepare for tonight's delivery shift?"],
    Hindi: ["क्या आज बारिश से जलभराव या डिलीवरी में बाधा आएगी?", "क्या बाइक चलाने के लिए तेज हवा का अलर्ट है?", "आज रात की डिलीवरी शिफ्ट के लिए क्या सावधानी रखूं?"],
    Gujarati: ["શું આજે વરસાદ કે પાણી ભરાવાથી ડિલિવરીમાં અડચણ આવશે?", "શું બાઇક ચલાવતી વખતે ભારે પવનનું જોખમ છે?", "આજની ડિલિવરી શિફ્ટ માટે શું સાવચેતી રાખવી?"],
  },
  tourist: {
    English: ["Is today good for sightseeing and travel?", "Will it rain during evening outdoor events?", "What weather precautions should I pack for?"],
    Hindi: ["क्या आज पर्यटन और बाहर घूमने के लिए मौसम अनुकूल है?", "क्या शाम के आउटडोर कार्यक्रम में बारिश होगी?", "यात्रा के लिए किन मौसम सावधानियों की जरूरत है?"],
    Gujarati: ["શું આજે ફરવા જવા અને જોવાલાયક સ્થળો માટે હવામાન સારું છે?", "શું સાંજના આઉટડોર કાર્યક્રમોમાં વરસાદ પડશે?", "મુસાફરી માટે કઈ સાવચેતી રાખવી જોઈએ?"],
  },
};
const QUICK_CITIES = ["Vadodara", "Ahmedabad", "Mumbai", "Delhi", "Chennai"];
const STATES = ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const KIT = ["Drinking water for at least 3 days", "Dry food that needs no cooking", "Torch and spare batteries",
  "Charged power bank", "Medicines and a first-aid kit", "ID and important papers in a waterproof bag",
  "Cash in small notes", "Whistle", "Family phone numbers written on paper", "ORS packets"];

/* ---------------------------------------------------------------- icons (24x24 line icons) */
const CLOUD = '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>';
const ICONS = {
  sun: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  cloud: CLOUD,
  partly: '<circle cx="7" cy="7" r="3"/><path d="M7 1v1.5M1 7h1.5M2.8 2.8l1 1"/><g transform="translate(6 6) scale(.75)">' + CLOUD + "</g>",
  drizzle: '<path d="M8 19v2M8 13v2M16 19v2M16 13v2M12 21v2M12 15v2M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
  rain: '<path d="M16 13v8M8 13v8M12 15v8M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
  storm: '<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><path d="M13 11l-4 6h6l-4 6"/>',
  fog: '<path d="M4 10h16M2 14h16M6 18h16"/>',
  wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
  drop: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  whatsapp: '<path d="M17.47 14.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.09-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.25-.59-.5-.51-.68-.52-.17-.01-.38-.01-.58-.01-.2 0-.52.08-.8.38s-1.06 1.03-1.06 2.51 1.08 2.91 1.23 3.11c.15.2 2.13 3.24 5.15 4.55.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.12-.28-.2-.58-.35zM12 2a10 10 0 0 0-8.66 15l-1.34 4.9 5.02-1.32A10 10 0 1 0 12 2z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  speaker: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
};
function iconSvg(name, cls) {
  return `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

/* ---------------------------------------------------------------- helpers */
const $ = (sel, root) => (root || document).querySelector(sel);

function h(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// Safe, minimal formatting for AI text: **bold**, bullets, links, paragraphs.
function renderRich(text) {
  let t = esc(text);
  t = t.replace(/^[ \t]*[*\-][ \t]+/gm, "• ");
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(https?:\/\/[^\s<)）।"']+)/g, (u) => {
    const shown = u.length > 46 ? u.slice(0, 43) + "…" : u;
    return `<a href="${u}" target="_blank" rel="noopener noreferrer">${shown}</a>`;
  });
  return t.split(/\n{2,}/).map((p) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`).join("");
}

function store(k, v) { try { localStorage.setItem("wgpt_" + k, v); } catch (e) { /* storage blocked */ } }
function load(k) { try { return localStorage.getItem("wgpt_" + k); } catch (e) { return null; } }
function myCity() { return load("city") || "Vadodara"; }
function langCode(name) { return (LANGS.find((l) => l[0] === name) || LANGS[0])[1]; }
function num(n) { return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10); }
function timeIST() {
  return new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }) + " IST";
}
function shortDay(t) {
  const d = new Date(t + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short" }) + " " + d.getDate();
}
function longDay(t) {
  return new Date(t + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
}

/* ---------------------------------------------------------------- api */
function friendly(status, detail, city) {
  const d = typeof detail === "string" ? detail : "";
  if (status === 404 && d === "Not Found") return "The server has no such address. The website files and main.py are probably from different versions. Use the matching set.";
  if (status === 404) return `Couldn't find "${city}". Check the spelling or try a larger nearby town.`;
  if (status === 429) return d || "You're asking too quickly. Please wait a minute and try again.";
  if (status === 500 && /GEMINI/i.test(d)) return "The server has no Gemini key. Add GEMINI_API_KEY (in .env locally, or in the Vercel project settings) and restart or redeploy.";
  if (status === 502) return "The AI service returned an error. " + d;
  if (status === 503) return d || "The service is unavailable right now. Try again in a few seconds.";
  return d || `Something went wrong (error ${status}).`;
}
async function api(path, options, city) {
  let r;
  try {
    r = await fetch(API + path, options);
  } catch (e) {
    const err = new Error(LOCAL_DEV
      ? `Can't reach the WeatherGPT server at ${API}. Start it from the project folder with: python -m uvicorn main:app --reload`
      : API
        ? `Can't reach the WeatherGPT service at ${API}. If it runs on a free host it may be waking up, so wait a minute and try again.`
        : "Can't reach the WeatherGPT service. Check your internet connection and try again.");
    err.network = true;
    throw err;
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(friendly(r.status, d.detail, city));
    err.status = r.status;
    throw err;
  }
  return d;
}
async function getWeather(city) {
  try {
    return await api(`/api/weather?city=${encodeURIComponent(city)}`, undefined, city);
  } catch (e) {
    // If backend is unreachable, fetch directly from Open-Meteo so frontend never breaks
    try {
      const geoR = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      const geoD = await geoR.json();
      if (!geoD.results || !geoD.results.length) throw e;
      const place = geoD.results[0];
      const fcR = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,is_day&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,is_day,wind_speed_10m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=5`);
      const fcD = await fcR.json();
      return {
        place: `${place.name}, ${place.admin1 || ""}`.replace(/,\s*$/, ""),
        state: place.admin1 || "",
        latitude: place.latitude,
        longitude: place.longitude,
        fetched_at: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) + " IST",
        source: "Open-Meteo (direct)",
        forecast: fcD,
      };
    } catch (_) {
      throw e;
    }
  }
}
const getAlerts = (state, city) => api(`/api/alerts?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`, undefined, city);

const getClimate = (city) => api(`/api/climate?city=${encodeURIComponent(city)}`, undefined, city);

async function getAqi(city) {
  try {
    return await api(`/api/aqi?city=${encodeURIComponent(city)}`, undefined, city);
  } catch (e) {
    try {
      const geoR = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      const geoD = await geoR.json();
      if (!geoD.results || !geoD.results.length) throw e;
      const place = geoD.results[0];
      const r = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.latitude}&longitude=${place.longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&timezone=auto`);
      const d = await r.json();
      const pm25 = (d.current && d.current.pm2_5) || 0;
      let cat = "Good", code = "good", adv = "Air quality is clean and healthy for all outdoor activities.";
      if (pm25 > 250) { cat = "Severe"; code = "severe"; adv = "Emergency pollution level. Avoid outdoor exposure."; }
      else if (pm25 > 120) { cat = "Very Poor"; code = "very_poor"; adv = "Significantly poor air. Vulnerable groups stay indoors."; }
      else if (pm25 > 90) { cat = "Poor"; code = "poor"; adv = "Unhealthy air. Limit prolonged outdoor exertion."; }
      else if (pm25 > 60) { cat = "Moderate"; code = "moderate"; adv = "Breathing discomfort possible for sensitive people."; }
      else if (pm25 > 30) { cat = "Satisfactory"; code = "satisfactory"; adv = "Air quality is acceptable. Minor discomfort possible for sensitive groups."; }
      return { place: place.name, pm2_5: pm25, pm10: d.current.pm10, category: cat, code, advisory: adv };
    } catch (_) {
      throw e;
    }
  }
}

function renderAqiCard(aqi) {
  const card = h("div", "aqi-card");
  card.innerHTML = `
    <div class="aqi-header">
      <span class="aqi-badge ${aqi.code}">${aqi.category}</span>
      <span class="aqi-title">Air Quality (AQI) • <b>PM2.5: ${Math.round(aqi.pm2_5)} µg/m³</b>${aqi.pm10 != null ? ` | PM10: ${Math.round(aqi.pm10)} µg/m³` : ""}</span>
    </div>
    <p class="aqi-advisory">💡 ${aqi.advisory}</p>
  `;
  return card;
}

function errBox(e) {
  const box = h("div", "error");
  box.append(h("p", null, e.message));
  return box;
}

/* ---------------------------------------------------------------- forecast reading (same rules as the backend prompt) */
function dayClass(prob, mm) {
  if (prob >= 60 && mm >= 2) return { key: "likely", label: "Rain likely" };
  if (prob >= 60) return { key: "drizzle", label: "Light drizzle" };
  if (mm >= 2) return { key: "possible", label: "Rain possible" };
  return { key: "dry", label: "Mostly dry" };
}
function todayLine(daily) {
  const p = daily.precipitation_probability_max[0], mm = daily.precipitation_sum[0];
  switch (dayClass(p, mm).key) {
    case "likely": return `Rain likely today, about ${num(mm)} mm.`;
    case "drizzle": return `Only light drizzle today, ${num(mm)} mm.`;
    case "possible": return `Rain possible today: ${p}% chance of ${num(mm)} mm.`;
    default: return "Mostly dry today.";
  }
}
function alertSummary(a, city) {
  if (!a || a.status === "unavailable") {
    return { tone: "warn", text: "Official alerts could not be loaded. That does not mean there are none. Check IMD or your local authority." };
  }
  if (!a.alerts.length) return { tone: "none", text: `No active alerts from NDMA SACHET for ${a.state} right now.` };
  const n = a.alerts.length, names = a.alerts.some((x) => x.mentions_city);
  const who = names ? `, and ${n === 1 ? "it names" : "at least one names"} ${city}` : " for this state";
  return { tone: "alert", text: `${n} official ${n === 1 ? "alert is" : "alerts are"} active${who}.` };
}

// WMO weather codes from Open-Meteo. Falls back to the rain reading if the backend does not send a code.
function wmo(code, day) {
  if (code === 0) return { label: "Clear sky", icon: day ? "sun" : "moon" };
  if (code === 1) return { label: "Mainly clear", icon: day ? "sun" : "moon" };
  if (code === 2) return { label: "Partly cloudy", icon: "partly" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", icon: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "drizzle" };
  if (code === 61) return { label: "Light rain", icon: "rain" };
  if (code === 63) return { label: "Rain", icon: "rain" };
  if (code === 65) return { label: "Heavy rain", icon: "rain" };
  if (code === 66 || code === 67) return { label: "Freezing rain", icon: "rain" };
  if (code === 80) return { label: "Light showers", icon: "rain" };
  if (code === 81) return { label: "Showers", icon: "rain" };
  if (code === 82) return { label: "Heavy showers", icon: "rain" };
  if (code >= 95) return { label: "Thunderstorm", icon: "storm" };
  return { label: "", icon: "cloud" };
}
function conditionOf(current, daily) {
  if (typeof current.weather_code === "number") return wmo(current.weather_code, current.is_day !== 0);
  const k = dayClass(daily.precipitation_probability_max[0], daily.precipitation_sum[0]).key;
  if (k === "likely") return { label: "Rain likely today", icon: "rain" };
  if (k === "drizzle" || k === "possible") return { label: "Showers possible", icon: "drizzle" };
  return null;   // no cloud data to say more, so show no icon rather than guess
}

/* ---------------------------------------------------------------- charts (SVG strings, numbers only) */
// Rain lines: streak length = expected mm. Solid = likely (60% or more). Dots = possible (under 60%).
function rainLines(daily, opts) {
  const o = opts || {};
  const n = daily.time.length, W = o.width || 600, colW = W / n, cloudY = 30, top = 48, maxLen = 130;
  const compact = colW < 84, half = Math.min(30, colW / 2 - 8);
  const H = top + maxLen + 84;
  let body = "", label = [];
  for (let i = 0; i < n; i++) {
    const cx = colW * i + colW / 2, mm = daily.precipitation_sum[i], p = daily.precipitation_probability_max[i];
    const len = 6 + (Math.min(mm, 12) / 12) * maxLen;
    body += `<line class="cloud" x1="${cx - half}" x2="${cx + half}" y1="${cloudY}" y2="${cloudY}"/>`;
    body += `<line class="streak${p >= 60 ? "" : " dots"}" style="--i:${i}" x1="${cx}" x2="${cx}" y1="${top}" y2="${top + len}"/>`;
    const y0 = top + maxLen + 28;
    body += `<text x="${cx}" y="${y0}" text-anchor="middle">${shortDay(daily.time[i])}</text>`;
    body += `<text class="muted" x="${cx}" y="${y0 + 24}" text-anchor="middle">${num(mm)} mm</text>`;
    body += `<text class="muted" x="${cx}" y="${y0 + 46}" text-anchor="middle">${compact ? p + "%" : p + "% chance"}</text>`;
    label.push(`${shortDay(daily.time[i])}: ${num(mm)} millimetres, ${p} percent chance`);
  }
  return `<svg class="rl${o.animate ? " animate" : ""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Rain forecast. ${label.join(". ")}.">${body}</svg>`;
}
function rainKey() {
  return `<div class="rl-key"><span><svg viewBox="0 0 26 14" aria-hidden="true"><line x1="4" x2="22" y1="7" y2="7"/></svg>Likely (60% chance or more)</span>` +
    `<span><svg viewBox="0 0 26 14" aria-hidden="true"><line class="d" x1="4" x2="22" y1="7" y2="7"/></svg>Possible (under 60%)</span>` +
    `<span>Longer line means more rain</span></div>`;
}
function tempChart(daily, opts) {
  const o = opts || {};
  const n = daily.time.length, W = o.width || 600, H = 250, colW = W / n, yTop = 52, yBot = 176;
  const hi = daily.temperature_2m_max, lo = daily.temperature_2m_min;
  const mx = Math.max(...hi), mn = Math.min(...lo), span = mx - mn || 1;
  const y = (t) => yBot - ((t - mn) / span) * (yBot - yTop);
  let body = "", label = [];
  for (let i = 0; i < n; i++) {
    const cx = colW * i + colW / 2;
    body += `<line class="trange" x1="${cx}" x2="${cx}" y1="${y(hi[i])}" y2="${y(lo[i])}"/>`;
    body += `<text x="${cx}" y="${y(hi[i]) - 16}" text-anchor="middle">${Math.round(hi[i])}°</text>`;
    body += `<text class="muted" x="${cx}" y="${y(lo[i]) + 30}" text-anchor="middle">${Math.round(lo[i])}°</text>`;
    body += `<text x="${cx}" y="${H - 12}" text-anchor="middle">${shortDay(daily.time[i])}</text>`;
    label.push(`${shortDay(daily.time[i])}: high ${Math.round(hi[i])}, low ${Math.round(lo[i])} degrees`);
  }
  return `<svg class="rl" viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperature range. ${label.join(". ")}.">${body}</svg>`;
}
// Draws a chart at the container's real width so labels stay readable on phones, and redraws on resize.
function mountChart(el, build) {
  const width = () => Math.max(280, Math.min(640, Math.round(el.clientWidth || 600)));
  let last = width();
  el.innerHTML = build(last, true);
  if (el._ro) el._ro.disconnect();
  if (typeof ResizeObserver !== "undefined") {
    el._ro = new ResizeObserver(() => {
      const w = width();
      if (Math.abs(w - last) >= 24) { last = w; el.innerHTML = build(w, false); }
    });
    el._ro.observe(el);
  }
}
function skeletonBars() {
  const heights = [120, 60, 90, 130, 80];
  return `<div class="sk-bars" aria-hidden="true">${heights.map((x) => `<div class="sk" style="height:${x}px"></div>`).join("")}</div>`;
}
function skeletonLive() {
  const wrap = h("div", "sk-live");
  wrap.setAttribute("aria-hidden", "true");
  [[36, 18], [62, 44], [78, 22]].forEach(([w, ht]) => { const b = h("div", "sk"); b.style.width = w + "%"; b.style.height = ht + "px"; wrap.append(b); });
  const bars = h("div"); bars.innerHTML = skeletonBars(); wrap.append(bars);
  return wrap;
}

/* ---------------------------------------------------------------- climate (what is usual) */
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// The wording comes from the backend's fixed rules; this only picks a label and a colour.
const CMP = {
  much_wetter: ["Much wetter than usual", "likely"], wetter: ["Wetter than usual", "likely"],
  usual: ["Close to usual", "dry"], drier: ["Drier than usual", "possible"],
  much_drier: ["Much drier than usual", "possible"], unusual: ["Unusual for these dates", "possible"],
};
function tempPhrase(kind, forecast, usual) {
  if (forecast == null || usual == null) return "";
  const d = Math.round((forecast - usual) * 10) / 10;
  const how = Math.abs(d) < 1 ? "close to usual" : `${num(Math.abs(d))}°C ${d > 0 ? "warmer" : "cooler"} than usual`;
  return `${kind}: ${num(forecast)}°C forecast on average, ${num(usual)}°C usual (${how}).`;
}
// Where this forecast's rain total sits inside what the same 5 dates got in each of the last 10 years.
function rangeBar(w, total, opts) {
  const o = opts || {};
  const W = o.width || 600, H = 138, pad = 30, y = 74;
  const lo = w.driest_mm, hi = w.wettest_mm, usual = w.normal_rain_mm;
  const max = (Math.max(hi, total, usual) * 1.1) || 1;
  const x = (v) => pad + (v / max) * (W - 2 * pad);
  const anchor = (px) => (px < 100 ? "start" : px > W - 100 ? "end" : "middle");
  let b = `<line class="rb-axis" x1="${pad}" x2="${W - pad}" y1="${y}" y2="${y}"/>`;
  b += `<rect class="rb-range" x="${x(lo)}" y="${y - 13}" width="${Math.max(x(hi) - x(lo), 4)}" height="26" rx="13"/>`;
  b += `<line class="rb-usual" x1="${x(usual)}" x2="${x(usual)}" y1="${y - 22}" y2="${y + 22}"/>`;
  b += `<circle class="rb-fc" cx="${x(total)}" cy="${y}" r="9"/>`;
  b += `<text x="${x(total)}" y="${y - 32}" text-anchor="${anchor(x(total))}">Forecast ${num(total)} mm</text>`;
  b += `<text class="muted" x="${x(usual)}" y="${y + 44}" text-anchor="${anchor(x(usual))}">Usual ${num(usual)} mm</text>`;
  b += `<text class="muted" x="${(x(lo) + x(hi)) / 2}" y="${H - 6}" text-anchor="${anchor((x(lo) + x(hi)) / 2)}">Driest year ${num(lo)} mm, wettest ${num(hi)} mm</text>`;
  const desc = `Forecast rain ${num(total)} millimetres. Usual ${num(usual)}. The last years ranged from ${num(lo)} to ${num(hi)}.`;
  return `<svg class="rl" viewBox="0 0 ${W} ${H}" role="img" aria-label="${desc}">${b}</svg>`;
}
// Usual rainfall for each month (lines hanging from clouds), with this year's total marked on each line.
function seasonChart(usual, thisYear, opts) {
  const o = opts || {};
  const n = 12, W = o.width || 600, colW = W / n, cloudY = 30, top = 48, maxLen = 130, H = top + maxLen + 70;
  const compact = colW < 44, half = Math.min(18, colW / 2 - 3);
  const yr = {};
  (thisYear || []).forEach((m) => { yr[m.month] = m; });
  const maxMm = Math.max(1, ...usual, ...(thisYear || []).map((m) => m.rain_mm || 0));
  const len = (mm) => 6 + (Math.min(mm, maxMm) / maxMm) * maxLen;
  let body = "", label = [];
  for (let i = 0; i < n; i++) {
    const cx = colW * i + colW / 2, u = usual[i] || 0, y0 = top + maxLen + 26;
    body += `<line class="cloud" x1="${cx - half}" x2="${cx + half}" y1="${cloudY}" y2="${cloudY}"/>`;
    body += `<line class="streak" style="--i:${i}" x1="${cx}" x2="${cx}" y1="${top}" y2="${top + len(u)}"/>`;
    const m = yr[i + 1];
    if (m && m.rain_mm != null) {
      body += `<line class="yearmark${m.partial ? " part" : ""}" x1="${cx - half - 2}" x2="${cx + half + 2}" y1="${top + len(m.rain_mm)}" y2="${top + len(m.rain_mm)}"/>`;
    }
    body += `<text${o.nowIndex === i ? ' class="now"' : ""} x="${cx}" y="${y0}" text-anchor="middle">${compact ? MONTH_SHORT[i][0] : MONTH_SHORT[i]}</text>`;
    body += `<text class="muted" x="${cx}" y="${y0 + 22}" text-anchor="middle">${Math.round(u)}</text>`;
    if (o.nowIndex === i) body += `<circle class="nowdot" cx="${cx}" cy="${y0 + 40}" r="3"/>`;
    label.push(`${MONTH_LONG[i]}: usual ${Math.round(u)} millimetres${m && m.rain_mm != null ? `, this year ${Math.round(m.rain_mm)}${m.partial ? " so far" : ""}` : ""}`);
  }
  return `<svg class="rl${o.animate ? " animate" : ""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Rainfall by month. ${label.join(". ")}.">${body}</svg>`;
}
function seasonKey(c) {
  return `<div class="rl-key"><span><svg viewBox="0 0 26 14" aria-hidden="true"><line x1="4" x2="22" y1="7" y2="7"/></svg>Usual for the month (average of ${c.period}), mm</span>` +
    `<span><svg viewBox="0 0 26 14" aria-hidden="true"><line class="y" x1="4" x2="22" y1="7" y2="7"/></svg>${c.this_year.year} so far</span></div>`;
}
// The short version used on the forecast page: label, one sentence, link.
function climateLine(box, c) {
  box.replaceChildren();
  if (c.comparison) {
    const [lab, cls] = CMP[c.comparison.key] || ["", "dry"];
    const head = h("p", "cmp-head"); head.append(h("span", "chip " + cls, lab));
    box.append(head, h("p", "cmp-text", c.comparison.text));
  }
  const w = c.window;
  if (w) box.append(h("p", "cmp-text", tempPhrase("Daytime highs", c.forecast_tmax_mean, w.normal_tmax)));
  box.append(h("p", "note", `Compared with the same dates in the last ${c.years} years (${c.period}), from modelled data.`));
}

/* ---------------------------------------------------------------- official alerts block (never rewritten by AI) */
function buildAlerts(a, city) {
  const wrap = h("section", "alerts");
  wrap.setAttribute("aria-label", "Official alerts");
  if (!a || a.status === "unavailable") {
    wrap.append(h("p", "status warn", "Official alerts could not be loaded. This does not mean there are none. Check IMD (mausam.imd.gov.in) or your local authority."));
    return wrap;
  }
  if (!a.alerts.length) {
    wrap.append(h("p", "status", `No active alerts from NDMA SACHET for ${a.state} right now. Alerts can be issued at any time, so check again before you travel.`));
    return wrap;
  }
  const t = h("p", "section-title", "Official alerts ");
  t.append(h("span", null, "exactly as published by NDMA SACHET"));
  wrap.append(t);
  a.alerts.forEach((al) => {
    const card = h("div", "alert");
    card.append(h("p", "text", al.title));
    const facts = h("div", "facts");
    const who = h("span"); who.append(h("b", null, al.mentions_city ? `Names ${city}` : "State-level alert")); facts.append(who);
    facts.append(h("span", null, `Issued by ${al.issuer}`));
    facts.append(h("span", null, `Issued ${al.published}`));
    facts.append(h("span", null, `Valid until about ${al.valid_until}`));
    card.append(facts);
    const link = h("a", null, "Open the official alert");
    link.href = al.link; link.target = "_blank"; link.rel = "noopener noreferrer";
    card.append(link);

    const waAlert = h("a", "btn-whatsapp", null);
    waAlert.target = "_blank";
    waAlert.rel = "noopener noreferrer";
    waAlert.innerHTML = iconSvg("whatsapp") + "<span>🚨 Share Official Alert on WhatsApp</span>";
    const waText = `🚨 *OFFICIAL WEATHER ALERT*\n` +
      `📍 *Area:* ${al.mentions_city ? city : a.state}\n` +
      `📢 *Warning:* ${al.title}\n` +
      `🏛️ *Issued by:* ${al.issuer}\n` +
      `⏳ *Valid until:* ${al.valid_until}\n\n` +
      `📞 In an emergency, call 112.\n` +
      `🔗 NDMA SACHET: ${al.link}\n` +
      `Shared via WeatherGPT`;
    waAlert.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    card.append(waAlert);

    wrap.append(card);
  });
  if (a.stale) wrap.append(h("p", "meta", "Could not refresh the alert feed. These are the last known alerts."));
  return wrap;
}

/* ---------------------------------------------------------------- theme toggle (works on every page) */
function initTheme() {
  const btn = $("#theme");
  if (!btn) return;
  const root = document.documentElement;
  const current = () => root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function paint() {
    const dark = current() === "dark";
    btn.innerHTML = iconSvg(dark ? "sun" : "moon");
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  btn.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    store("theme", next);
    paint();
  });
  paint();
}

/* ---------------------------------------------------------------- 24-hour hourly view & detail popup */
function ensureHourlyModal() {
  let modal = $("#hourly-modal");
  if (!modal) {
    modal = h("div", "hourly-modal-overlay");
    modal.id = "hourly-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="hourly-modal-card">
        <div class="hourly-modal-head">
          <div>
            <span class="hourly-modal-badge">Hourly Weather Detail</span>
            <h3 class="hourly-modal-time" id="hm-time"></h3>
          </div>
          <button type="button" class="hourly-modal-close" id="hm-close" aria-label="Close detail card">&times;</button>
        </div>
        <div class="hourly-modal-hero">
          <div class="hourly-modal-icon" id="hm-icon"></div>
          <div class="hourly-modal-temp-wrap">
            <div class="hourly-modal-temp" id="hm-temp"></div>
            <div class="hourly-modal-feels" id="hm-feels"></div>
          </div>
          <div class="hourly-modal-condition" id="hm-cond"></div>
        </div>
        <div class="hourly-modal-grid">
          <div class="hourly-stat-box"><span class="stat-lbl">Rain Chance</span><div class="stat-val" id="hm-prob"></div></div>
          <div class="hourly-stat-box"><span class="stat-lbl">Precipitation</span><div class="stat-val" id="hm-mm"></div></div>
          <div class="hourly-stat-box"><span class="stat-lbl">Humidity</span><div class="stat-val" id="hm-humidity"></div></div>
          <div class="hourly-stat-box"><span class="stat-lbl">Wind Speed</span><div class="stat-val" id="hm-wind"></div></div>
        </div>
        <div class="hourly-modal-tip" id="hm-tip"></div>
      </div>
    `;
    document.body.append(modal);

    const close = () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    };
    $("#hm-close", modal).addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) close();
    });
  }
  return modal;
}

function openHourlyDetail(d) {
  const modal = ensureHourlyModal();
  $("#hm-time", modal).textContent = d.fullTime;
  $("#hm-icon", modal).innerHTML = iconSvg(d.icon);
  $("#hm-temp", modal).textContent = `${d.temp}°C`;
  $("#hm-feels", modal).textContent = d.feels != null ? `Feels like ${d.feels}°C` : "";
  $("#hm-cond", modal).textContent = d.label || "Weather";
  $("#hm-prob", modal).textContent = `${d.prob}%`;
  $("#hm-mm", modal).textContent = `${num(d.mm)} mm`;
  $("#hm-humidity", modal).textContent = d.humidity != null ? `${d.humidity}%` : "—";
  $("#hm-wind", modal).textContent = d.wind != null ? `${num(d.wind)} km/h` : "—";

  const tipEl = $("#hm-tip", modal);
  let tipText = "Standard weather conditions expected during this hour.";
  let tipClass = "hourly-modal-tip";

  if (d.code >= 95) {
    tipText = "Thunderstorm warning: Stay indoors and avoid open fields or tall structures.";
    tipClass += " storm";
  } else if (d.prob >= 60 || d.mm >= 2) {
    tipText = `Rain expected (${num(d.mm)} mm, ${d.prob}% chance): Carry an umbrella or rain gear.`;
    tipClass += " warn";
  } else if (d.prob > 20) {
    tipText = `Light shower possible (${d.prob}% chance). Keep an eye on the sky if traveling.`;
  } else if (d.temp >= 38) {
    tipText = "High heat during this hour: Stay hydrated, wear light clothing, and seek shade.";
    tipClass += " warn";
  } else if (d.temp <= 12) {
    tipText = "Cold temperature expected: Layer up warmly if heading outside.";
  } else if (d.code <= 1) {
    tipText = d.isDay ? "Clear, bright skies expected during this hour." : "Clear, calm night skies expected.";
  }
  tipEl.className = tipClass;
  tipEl.textContent = tipText;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function buildHourlyView(hourly, opts) {
  const o = opts || {};
  if (!hourly || !hourly.time || !hourly.time.length) {
    return h("p", "note", "Hourly forecast is not available for this location.");
  }

  // Find index of current hour closest to now
  const nowMs = Date.now();
  let startIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < hourly.time.length; i++) {
    const tMs = new Date(hourly.time[i]).getTime();
    const diff = Math.abs(tMs - nowMs);
    if (diff < minDiff) {
      minDiff = diff;
      startIdx = i;
    }
  }

  const count = Math.min(24, hourly.time.length - startIdx);
  const container = h("div", "hourly-container" + (o.light ? " light" : ""));

  const head = h("div", "hourly-head");
  head.innerHTML = `<span class="hourly-label">Next 24 Hours</span><span class="hourly-hint">Click any card for full details</span>`;
  container.append(head);

  const wrap = h("div", "hourly-wrap");
  const track = h("div", "hourly-track");

  for (let step = 0; step < count; step++) {
    const idx = startIdx + step;
    const timeStr = hourly.time[idx];
    const temp = Math.round(hourly.temperature_2m[idx]);
    const prob = hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0;
    const mm = hourly.precipitation ? hourly.precipitation[idx] : 0;
    const code = typeof hourly.weather_code[idx] === "number" ? hourly.weather_code[idx] : 0;
    const isDay = hourly.is_day ? hourly.is_day[idx] !== 0 : true;

    const isCurrent = step === 0;
    const d = new Date(timeStr);
    let hourDisplay = "Now";
    if (!isCurrent) {
      let hNum = d.getHours();
      const ampm = hNum >= 12 ? "PM" : "AM";
      hNum = hNum % 12 || 12;
      hourDisplay = `${hNum} ${ampm}`;
    }

    const cond = wmo(code, isDay);
    const card = h("div", "hourly-card" + (isCurrent ? " current" : ""));
    card.setAttribute("title", `Click to view details for ${hourDisplay}: ${temp}°C, ${cond.label || "Weather"}`);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Weather details for ${hourDisplay}`);

    // Time
    card.append(h("div", "hourly-time", hourDisplay));

    // Weather Icon
    const iconWrap = h("div", "hourly-icon-wrap");
    iconWrap.innerHTML = iconSvg(cond.icon || "cloud");
    card.append(iconWrap);

    // Temp
    card.append(h("div", "hourly-temp", `${temp}°`));

    // Rain probability
    const probEl = h("div", "hourly-prob" + (prob === 0 ? " zero" : ""));
    probEl.innerHTML = iconSvg("drop") + `<span>${prob}%</span>`;
    card.append(probEl);

    if (mm >= 0.5) {
      card.append(h("div", "hourly-mm", `${num(mm)} mm`));
    }

    const cardData = {
      hourDisplay,
      fullTime: `${longDay(timeStr.split("T")[0])} • ${hourDisplay}${isCurrent ? " (Current hour)" : ""}`,
      temp,
      feels: hourly.apparent_temperature ? Math.round(hourly.apparent_temperature[idx]) : null,
      prob,
      mm,
      humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[idx] : null,
      wind: hourly.wind_speed_10m ? hourly.wind_speed_10m[idx] : null,
      code,
      isDay,
      label: cond.label,
      icon: cond.icon || "cloud",
    };

    card.addEventListener("click", () => openHourlyDetail(cardData));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openHourlyDetail(cardData);
      }
    });

    track.append(card);
  }

  wrap.append(track);
  container.append(wrap);
  return container;
}

/* ---------------------------------------------------------------- live weather atmosphere */
function resolveWeatherAtmosphere(c, d, alertData) {
  if (!c) return "clear-day";
  const code = typeof c.weather_code === "number" ? c.weather_code : null;
  const isDay = c.is_day !== 0;
  const temp = c.temperature_2m || 0;
  const rainProb = (d && d.precipitation_probability_max && d.precipitation_probability_max[0]) || 0;
  const rainMm = (d && d.precipitation_sum && d.precipitation_sum[0]) || c.precipitation || 0;

  let hasStormAlert = false;
  let hasHeatAlert = false;
  if (alertData && Array.isArray(alertData.alerts)) {
    for (const alt of alertData.alerts) {
      const text = `${alt.headline || ""} ${alt.description || ""} ${alt.event || ""}`.toLowerCase();
      if (/thunderstorm|lightning|squall|cyclone|tornado|gusty/.test(text)) {
        hasStormAlert = true;
      }
      if (/heat wave|heatwave|warm night|high temperature/.test(text)) {
        hasHeatAlert = true;
      }
    }
  }

  // 1. Severe storm / Thunderstorm
  if ((code !== null && code >= 95) || hasStormAlert) {
    return "thunderstorm";
  }

  // 2. Extreme heatwave
  if (temp >= 38 || hasHeatAlert) {
    return isDay ? "heatwave" : "clear-night";
  }

  // 3. Rain / heavy rain
  if ((code !== null && [61, 63, 65, 66, 67, 81, 82].includes(code)) || rainMm >= 3.0 || rainProb >= 65) {
    return "rain";
  }

  // 4. Drizzle / light showers
  if ((code !== null && [51, 53, 55, 56, 57, 80].includes(code)) || rainMm >= 0.6 || rainProb >= 40) {
    return "drizzle";
  }

  // 5. Fog
  if (code === 45 || code === 48) {
    return "fog";
  }

  // 6. Overcast
  if (code === 3) {
    return "overcast";
  }

  // 7. Partly cloudy
  if (code === 2) {
    return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
  }

  // 8. Clear / default
  return isDay ? "clear-day" : "clear-night";
}

function setupLiveWeatherAtmosphere() {
  const hero = document.getElementById("hero-section") || document.querySelector(".hero");
  const canvas = document.getElementById("weather-bg-canvas");
  const lightning = document.getElementById("hero-lightning");
  const tag = document.getElementById("hero-weather-tag");
  const tagLabel = document.getElementById("hero-weather-label");

  if (!hero || !canvas) {
    return { update: () => {} };
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { update: () => {} };
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let currentAtmosphere = "clear-day";
  let particles = [];
  let clouds = [];
  let shootingStars = [];
  let nextShootingStarTime = 0;
  let lightningTimer = null;
  let animFrameId = null;
  let isRunning = false;
  let isHeroVisible = true;
  let mouseX = -999, mouseY = -999, mouseActive = false;

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  });
  hero.addEventListener("mouseleave", () => {
    mouseActive = false;
    mouseX = -999;
    mouseY = -999;
  });

  function resize() {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles(currentAtmosphere);
  }

  function initParticles(type) {
    particles = [];
    clouds = [];
    shootingStars = [];
    if (width <= 0 || height <= 0) return;

    if (type === "rain" || type === "thunderstorm") {
      const isThunder = type === "thunderstorm";
      const count = isThunder ? Math.min(130, Math.max(45, Math.floor(width / 7))) : Math.min(90, Math.max(35, Math.floor(width / 10)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * (width + 100) - 50,
          y: Math.random() * height,
          speed: isThunder ? 18 + Math.random() * 12 : 14 + Math.random() * 8,
          len: isThunder ? 24 + Math.random() * 20 : 16 + Math.random() * 16,
          thickness: isThunder ? 1.4 + Math.random() * 0.8 : 1.1 + Math.random() * 0.6,
          alpha: 0.25 + Math.random() * 0.45,
          drift: isThunder ? -3.5 - Math.random() * 2.5 : -1.8 - Math.random() * 1.5,
        });
      }
    } else if (type === "drizzle") {
      const count = Math.min(65, Math.max(25, Math.floor(width / 14)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * (width + 60) - 30,
          y: Math.random() * height,
          speed: 6 + Math.random() * 5,
          len: 8 + Math.random() * 8,
          thickness: 1,
          alpha: 0.18 + Math.random() * 0.3,
          drift: -0.8 - Math.random() * 0.8,
        });
      }
    } else if (type === "clear-night" || type === "partly-cloudy-night") {
      const count = type === "clear-night" ? Math.min(80, Math.max(30, Math.floor(width / 12))) : Math.min(45, Math.max(20, Math.floor(width / 18)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.9),
          r: 0.8 + Math.random() * 1.6,
          baseAlpha: 0.2 + Math.random() * 0.6,
          twinkleSpeed: 1.5 + Math.random() * 3,
          phase: Math.random() * Math.PI * 2,
        });
      }
      nextShootingStarTime = performance.now() + 3000 + Math.random() * 4000;
    } else if (type === "clear-day") {
      const count = Math.min(32, Math.max(15, Math.floor(width / 26)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1.5 + Math.random() * 2.5,
          alpha: 0.12 + Math.random() * 0.25,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.2 - Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
        });
      }
    } else if (type === "heatwave") {
      const count = Math.min(45, Math.max(20, Math.floor(width / 18)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1.5 + Math.random() * 3,
          alpha: 0.15 + Math.random() * 0.35,
          speed: 0.6 + Math.random() * 1.2,
          driftOffset: Math.random() * 100,
          hue: Math.random() > 0.4 ? "251, 146, 60" : "248, 113, 113",
        });
      }
    } else if (type === "fog") {
      const count = Math.min(16, Math.max(7, Math.floor(width / 60)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: height * 0.2 + Math.random() * (height * 0.7),
          rx: 70 + Math.random() * 110,
          ry: 25 + Math.random() * 40,
          alpha: 0.07 + Math.random() * 0.12,
          speed: 0.15 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    if (type === "partly-cloudy-day" || type === "partly-cloudy-night" || type === "overcast") {
      const isOvercast = type === "overcast";
      const cloudCount = isOvercast ? 6 : 4;
      for (let i = 0; i < cloudCount; i++) {
        clouds.push({
          x: (i / cloudCount) * width + (Math.random() * 60 - 30),
          y: 20 + Math.random() * (height * 0.45),
          rx: (isOvercast ? 140 : 100) + Math.random() * 90,
          ry: (isOvercast ? 45 : 35) + Math.random() * 30,
          speed: 0.08 + Math.random() * 0.14,
          alpha: isOvercast ? 0.22 + Math.random() * 0.16 : 0.14 + Math.random() * 0.12,
        });
      }
    }
  }

  function scheduleLightning() {
    if (lightningTimer) clearTimeout(lightningTimer);
    if (currentAtmosphere !== "thunderstorm" || !lightning) return;
    const delay = 4500 + Math.random() * 6500;
    lightningTimer = setTimeout(() => {
      triggerLightning();
      scheduleLightning();
    }, delay);
  }

  function triggerLightning() {
    if (!lightning || document.hidden || !isHeroVisible) return;
    lightning.classList.add("flash");
    setTimeout(() => {
      lightning.classList.remove("flash");
      setTimeout(() => {
        lightning.classList.add("flash");
        setTimeout(() => lightning.classList.remove("flash"), 90);
      }, 60);
    }, 70);
  }

  function drawScene(now) {
    const t = now * 0.001;
    const type = currentAtmosphere;

    if (type === "clear-day") {
      const sunX = width * 0.82;
      const sunY = height * 0.18;
      const rad = Math.max(width, height) * 0.6;
      const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, rad);
      glow.addColorStop(0, "rgba(254, 240, 138, 0.18)");
      glow.addColorStop(0.35, "rgba(253, 224, 71, 0.07)");
      glow.addColorStop(1, "rgba(253, 224, 71, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    if (type === "clear-night" || type === "partly-cloudy-night") {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const alpha = Math.max(0.08, Math.min(1, p.baseAlpha + Math.sin(t * p.twinkleSpeed + p.phase) * 0.35));
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (now > nextShootingStarTime && shootingStars.length === 0) {
        shootingStars.push({
          x: Math.random() * (width * 0.7),
          y: Math.random() * (height * 0.35),
          vx: 5 + Math.random() * 4,
          vy: 2.5 + Math.random() * 2,
          len: 80 + Math.random() * 60,
          life: 0,
          maxLife: 35 + Math.random() * 20,
        });
        nextShootingStarTime = now + 8000 + Math.random() * 10000;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        const prog = s.life / s.maxLife;
        const alpha = prog < 0.2 ? prog / 0.2 : (1 - prog);
        if (alpha > 0) {
          const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * (s.len / 8), s.y - s.vy * (s.len / 8));
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * (s.len / 8), s.y - s.vy * (s.len / 8));
          ctx.stroke();
        }
        if (s.life >= s.maxLife || s.x > width + 100 || s.y > height + 100) {
          shootingStars.splice(i, 1);
        }
      }
    }

    if (clouds.length > 0) {
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        c.x += c.speed;
        if (c.x - c.rx > width) {
          c.x = -c.rx;
        }
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.rx);
        const isOvercast = type === "overcast";
        const cloudColor = isOvercast ? "200, 215, 230" : "255, 255, 255";
        grad.addColorStop(0, `rgba(${cloudColor}, ${c.alpha})`);
        grad.addColorStop(0.7, `rgba(${cloudColor}, ${c.alpha * 0.65})`);
        grad.addColorStop(1, `rgba(${cloudColor}, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }
    }

    if (type === "rain" || type === "thunderstorm" || type === "drizzle") {
      ctx.strokeStyle = type === "thunderstorm" ? "rgba(200, 225, 255, 0.75)" : "rgba(186, 218, 250, 0.65)";
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speed;
        p.x += p.drift;

        // Dynamic mouse wake deflection
        if (mouseActive) {
          const mdx = p.x - mouseX;
          const mdy = p.y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 110) {
            const force = (1 - mdist / 110) * 4;
            p.x += (mdx / (mdist + 1)) * force;
            p.y -= force * 0.4;
          }
        }

        if (p.y > height) {
          p.y = -p.len;
          p.x = Math.random() * (width + 100) - 50;
        }
        ctx.globalAlpha = p.alpha;
        ctx.lineWidth = p.thickness;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.drift * 1.8, p.y + p.len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    if (type === "clear-day") {
      if (mouseActive) {
        const aura = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 85);
        aura.addColorStop(0, "rgba(254, 240, 138, 0.16)");
        aura.addColorStop(0.6, "rgba(253, 224, 71, 0.05)");
        aura.addColorStop(1, "rgba(253, 224, 71, 0)");
        ctx.fillStyle = aura;
        ctx.fillRect(mouseX - 85, mouseY - 85, 170, 170);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy;
        p.x += p.vx + Math.sin(t + p.phase) * 0.25;

        // Dynamic solar mote swirl towards pointer
        if (mouseActive) {
          const mdx = mouseX - p.x;
          const mdy = mouseY - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140 && mdist > 4) {
            p.x += (mdx / mdist) * 1.1;
            p.y += (mdy / mdist) * 1.1;
          }
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "rgba(255, 255, 240, 0.9)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    if (type === "heatwave") {
      const glow = ctx.createLinearGradient(0, height, 0, height * 0.5);
      glow.addColorStop(0, "rgba(234, 88, 12, 0.15)");
      glow.addColorStop(1, "rgba(234, 88, 12, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed;
        p.x += Math.sin((p.y + p.driftOffset) * 0.03 + t * 2) * 0.7;

        // Dynamic thermal updraft near pointer
        if (mouseActive) {
          const mdx = Math.abs(p.x - mouseX);
          if (mdx < 90) {
            p.y -= (1 - mdx / 90) * 1.6;
          }
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        const fade = Math.sin((p.y / height) * Math.PI);
        ctx.globalAlpha = Math.max(0.05, p.alpha * fade);
        ctx.fillStyle = `rgba(${p.hue}, 0.9)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    if (type === "fog") {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speed;
        if (p.x - p.rx > width) {
          p.x = -p.rx;
        }
        const breathe = 0.85 + Math.sin(t * 0.8 + p.phase) * 0.15;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.rx * breathe, p.ry * breathe, 0, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.rx * breathe);
        grad.addColorStop(0, `rgba(220, 230, 242, ${p.alpha})`);
        grad.addColorStop(0.7, `rgba(220, 230, 242, ${p.alpha * 0.5})`);
        grad.addColorStop(1, "rgba(220, 230, 242, 0)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function animate(now) {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);
    drawScene(now);
    animFrameId = requestAnimationFrame(animate);
  }

  function start() {
    if (isRunning) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    isRunning = true;
    animFrameId = requestAnimationFrame(animate);
    if (currentAtmosphere === "thunderstorm") scheduleLightning();
  }

  function stop() {
    isRunning = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (lightningTimer) {
      clearTimeout(lightningTimer);
      lightningTimer = null;
    }
    if (lightning) lightning.classList.remove("flash");
  }

  window.addEventListener("resize", resize);

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible && !document.hidden) {
          start();
        } else {
          stop();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(hero);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else if (isHeroVisible) {
      start();
    }
  });

  resize();
  start();

  function formatAtmosphereName(key) {
    if (!key) return "Live Atmosphere";
    return key.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  return {
    update(newAtmosphere, label, place) {
      const validAtmosphere = newAtmosphere || "clear-day";
      hero.setAttribute("data-weather", validAtmosphere);

      if (tag && tagLabel) {
        tag.hidden = false;
        const cityName = place ? place.split(",")[0] : "";
        const desc = label || formatAtmosphereName(validAtmosphere);
        tagLabel.textContent = cityName ? `${cityName} • ${desc}` : desc;
      }

      if (validAtmosphere !== currentAtmosphere) {
        currentAtmosphere = validAtmosphere;
        initParticles(currentAtmosphere);
        if (currentAtmosphere === "thunderstorm") {
          scheduleLightning();
        } else if (lightningTimer) {
          clearTimeout(lightningTimer);
          lightningTimer = null;
          if (lightning) lightning.classList.remove("flash");
        }
      }

      if (!isRunning && isHeroVisible && !document.hidden) {
        start();
      }
    }
  };
}

/* ---------------------------------------------------------------- secondary page atmosphere */
function setupPageAtmosphere(pageType) {
  const banner = document.getElementById("page-banner") || document.querySelector(".page-hero-banner");
  const canvas = document.getElementById("page-bg-canvas") || (banner && banner.querySelector(".page-bg-canvas"));
  if (!banner || !canvas) {
    return { updateWeather: () => {}, setTone: () => {}, pulse: () => {} };
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { updateWeather: () => {}, setTone: () => {}, pulse: () => {} };
  }

  let width = 0, height = 0, dpr = 1;
  let particles = [];
  let animFrameId = null;
  let isRunning = false;
  let isVisible = true;
  let pulseEnergy = 1.0;

  let forecastMode = "sun";
  let alertTone = "green";
  let radarAngle = 0;
  let scanX = 0;
  let mouseX = -999, mouseY = -999, mouseActive = false;

  banner.addEventListener("mousemove", (e) => {
    const rect = banner.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  });
  banner.addEventListener("mouseleave", () => {
    mouseActive = false;
    mouseX = -999;
    mouseY = -999;
  });

  function resize() {
    const rect = banner.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    particles = [];
    if (width <= 0 || height <= 0) return;

    if (pageType === "forecast") {
      if (forecastMode === "rain") {
        const count = Math.min(50, Math.max(20, Math.floor(width / 18)));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * (width + 50) - 25,
            y: Math.random() * height,
            speed: 10 + Math.random() * 8,
            len: 12 + Math.random() * 12,
            alpha: 0.2 + Math.random() * 0.4,
          });
        }
      } else {
        const count = Math.min(25, Math.max(12, Math.floor(width / 35)));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 1.5 + Math.random() * 2.5,
            alpha: 0.15 + Math.random() * 0.35,
            vy: -0.2 - Math.random() * 0.35,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    } else if (pageType === "alerts") {
      const blipCount = 6;
      for (let i = 0; i < blipCount; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          dist: 30 + Math.random() * 110,
          size: 2.5 + Math.random() * 2,
          alpha: 0.2 + Math.random() * 0.7,
          blinkSpeed: 1 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
        });
      }
    } else if (pageType === "climate") {
      const count = Math.min(28, Math.max(14, Math.floor(width / 30)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1.5 + Math.random() * 3,
          alpha: 0.15 + Math.random() * 0.35,
          speed: 0.4 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.5 ? "245, 158, 11" : "20, 184, 166",
        });
      }
    } else if (pageType === "safety") {
      const count = Math.min(26, Math.max(12, Math.floor(width / 32)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 2 + Math.random() * 3.5,
          alpha: 0.18 + Math.random() * 0.35,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          phase: Math.random() * Math.PI * 2,
          type: Math.random() > 0.5 ? "shield" : "vital",
        });
      }
    } else if (pageType === "assistant") {
      const count = Math.min(35, Math.max(18, Math.floor(width / 22)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          r: 1.5 + Math.random() * 2.2,
          alpha: 0.3 + Math.random() * 0.4,
        });
      }
    } else if (pageType === "map") {
      particles = [
        { r: 20, maxR: 140, alpha: 0.6, speed: 0.5 },
        { r: 70, maxR: 140, alpha: 0.4, speed: 0.5 },
        { r: 110, maxR: 140, alpha: 0.2, speed: 0.5 }
      ];
    } else if (pageType === "about") {
      const count = Math.min(32, Math.max(16, Math.floor(width / 26)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 0.8 + Math.random() * 1.6,
          len: 12 + Math.random() * 24,
          alpha: 0.15 + Math.random() * 0.4,
          char: Math.random() > 0.6 ? (Math.random() > 0.5 ? "1" : "0") : "•",
        });
      }
    }
  }

  function drawScene(now) {
    const t = now * 0.001;

    if (pulseEnergy > 1.0) {
      pulseEnergy = Math.max(1.0, pulseEnergy - 0.02);
    }

    if (pageType === "forecast") {
      if (forecastMode === "rain") {
        ctx.strokeStyle = "rgba(186, 218, 250, 0.6)";
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.speed;
          p.x -= p.speed * 0.15;

          // Dynamic mouse wind deflection
          if (mouseActive) {
            const mdx = p.x - mouseX;
            const mdy = p.y - mouseY;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 110) {
              const force = (1 - mdist / 110) * 3.5;
              p.x += (mdx / (mdist + 1)) * force;
              p.y -= force * 0.3;
            }
          }

          if (p.y > height) {
            p.y = -p.len;
            p.x = Math.random() * (width + 50) - 25;
          }
          ctx.globalAlpha = p.alpha;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 4, p.y + p.len);
          ctx.stroke();
        }

        if (mouseActive) {
          ctx.strokeStyle = "rgba(186, 230, 253, 0.4)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          const r = ((t * 35) % 28) + 5;
          ctx.arc(mouseX, mouseY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else {
        const sunX = width * 0.85;
        const sunY = height * 0.25;
        const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, Math.max(width, height) * 0.55);
        glow.addColorStop(0, "rgba(254, 240, 138, 0.18)");
        glow.addColorStop(0.4, "rgba(253, 224, 71, 0.06)");
        glow.addColorStop(1, "rgba(253, 224, 71, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        if (mouseActive) {
          const halo = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 80);
          halo.addColorStop(0, "rgba(254, 240, 138, 0.18)");
          halo.addColorStop(0.6, "rgba(253, 224, 71, 0.05)");
          halo.addColorStop(1, "rgba(253, 224, 71, 0)");
          ctx.fillStyle = halo;
          ctx.fillRect(mouseX - 80, mouseY - 80, 160, 160);
        }

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.vy;
          p.x += Math.sin(t + p.phase) * 0.3;

          // Dynamic solar mote swirl
          if (mouseActive) {
            const mdx = mouseX - p.x;
            const mdy = mouseY - p.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 130 && mdist > 4) {
              p.x += (mdx / mdist) * 1.0;
              p.y += (mdy / mdist) * 1.0;
            }
          }

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = "rgba(255, 255, 240, 0.85)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    } else if (pageType === "alerts") {
      const isRed = alertTone === "alert";
      const isYellow = alertTone === "warn";
      const radarColor = isRed ? "244, 63, 94" : (isYellow ? "245, 158, 11" : "52, 211, 153");
      const rcx = width > 600 ? width * 0.82 : width * 0.5;
      const rcy = height * 0.5;
      const maxRadius = Math.min(width * 0.4, Math.max(90, height * 0.7));

      radarAngle += isRed ? 0.035 : 0.022;

      ctx.lineWidth = 1;
      for (let r of [maxRadius * 0.3, maxRadius * 0.65, maxRadius]) {
        ctx.strokeStyle = `rgba(${radarColor}, 0.22)`;
        ctx.beginPath();
        ctx.arc(rcx, rcy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = `rgba(${radarColor}, 0.15)`;
      ctx.beginPath();
      ctx.moveTo(rcx - maxRadius, rcy);
      ctx.lineTo(rcx + maxRadius, rcy);
      ctx.moveTo(rcx, rcy - maxRadius);
      ctx.lineTo(rcx, rcy + maxRadius);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rcx, rcy);
      ctx.arc(rcx, rcy, maxRadius, radarAngle - 0.45, radarAngle);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(rcx, rcy, 0, rcx, rcy, maxRadius);
      sweepGrad.addColorStop(0, `rgba(${radarColor}, 0.28)`);
      sweepGrad.addColorStop(1, `rgba(${radarColor}, 0.03)`);
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = `rgba(${radarColor}, 0.85)`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rcx, rcy);
      ctx.lineTo(rcx + Math.cos(radarAngle) * maxRadius, rcy + Math.sin(radarAngle) * maxRadius);
      ctx.stroke();

      // Interactive HUD targeting crosshair on mouse
      if (mouseActive) {
        ctx.save();
        ctx.strokeStyle = `rgba(${radarColor}, 0.45)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(rcx, rcy);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = `rgba(${radarColor}, 0.85)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(mouseX - 20, mouseY); ctx.lineTo(mouseX - 14, mouseY);
        ctx.moveTo(mouseX + 14, mouseY); ctx.lineTo(mouseX + 20, mouseY);
        ctx.moveTo(mouseX, mouseY - 20); ctx.lineTo(mouseX, mouseY - 14);
        ctx.moveTo(mouseX, mouseY + 14); ctx.lineTo(mouseX, mouseY + 20);
        ctx.stroke();
        ctx.restore();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const bx = rcx + Math.cos(p.angle) * (p.dist * (maxRadius / 140));
        const by = rcy + Math.sin(p.angle) * (p.dist * (maxRadius / 140));
        let bAlpha = Math.max(0.1, Math.min(0.9, p.alpha + Math.sin(t * p.blinkSpeed + p.phase) * 0.4));
        if (mouseActive) {
          const mdist = Math.hypot(bx - mouseX, by - mouseY);
          if (mdist < 40) bAlpha = Math.min(1, bAlpha + 0.4);
        }
        ctx.fillStyle = `rgba(${radarColor}, ${bAlpha})`;
        ctx.beginPath();
        ctx.arc(bx, by, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (pageType === "climate") {
      for (let layer = 0; layer < 3; layer++) {
        const baseOffset = height * (0.45 + layer * 0.2);
        const freq = 0.008 + layer * 0.004;
        const speed = (0.7 + layer * 0.5) * (layer % 2 === 0 ? 1 : -1);
        const amp = 14 + layer * 6;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 15) {
          let wave = Math.sin(x * freq + t * speed) * amp + Math.cos(x * 0.003 + t * 0.4) * 8;
          // Dynamic fluid ripple at cursor
          if (mouseActive) {
            const dx = Math.abs(x - mouseX);
            if (dx < 120) {
              const ripple = Math.cos((dx / 120) * Math.PI * 0.5) * 16 * Math.sin(t * 6 - dx * 0.08);
              wave += ripple;
            }
          }
          const y = baseOffset + wave;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        const color = layer === 0 ? "245, 158, 11" : (layer === 1 ? "20, 184, 166" : "59, 130, 246");
        ctx.fillStyle = `rgba(${color}, 0.06)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${color}, 0.22)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed;
        p.x += Math.sin(t + p.phase) * 0.4;

        // Dynamic thermal mote gravitation
        if (mouseActive) {
          const mdx = mouseX - p.x;
          const mdy = mouseY - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 120 && mdist > 4) {
            p.x += (mdx / mdist) * 0.9;
            p.y += (mdy / mdist) * 0.9;
          }
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `rgba(${p.hue}, 0.8)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (pageType === "safety") {
      const hexR = 34;
      const hexW = hexR * Math.sqrt(3);
      const hexH = hexR * 1.5;
      ctx.lineWidth = 1;
      for (let y = -hexR; y < height + hexR; y += hexH) {
        const row = Math.floor(y / hexH);
        const xOffset = (row % 2 === 0) ? 0 : hexW / 2;
        for (let x = -hexW + xOffset; x < width + hexW; x += hexW) {
          const breathe = Math.sin(t * 1.4 + (x + y) * 0.01) * 0.04;
          let cellAlpha = 0.08 + breathe;

          // Dynamic hexagonal shield illumination near cursor
          if (mouseActive) {
            const hdx = x - mouseX;
            const hdy = y - mouseY;
            const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
            if (hdist < 140) {
              cellAlpha += (1 - hdist / 140) * 0.35;
            }
          }

          if (cellAlpha > 0.04) {
            ctx.save();
            ctx.strokeStyle = `rgba(45, 212, 191, ${Math.min(0.7, cellAlpha)})`;
            ctx.beginPath();
            for (let a = 0; a < 6; a++) {
              const angle = (Math.PI / 3) * a;
              const hx = x + hexR * Math.cos(angle);
              const hy = y + hexR * Math.sin(angle);
              if (a === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Dynamic forcefield pulse ring around cursor
      if (mouseActive) {
        ctx.save();
        ctx.strokeStyle = "rgba(45, 212, 191, 0.55)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        const pR = ((t * 30) % 36) + 8;
        ctx.arc(mouseX, mouseY, pR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Repel slightly near pointer
        if (mouseActive) {
          const mdx = p.x - mouseX;
          const mdy = p.y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 80 && mdist > 2) {
            p.x += (mdx / mdist) * 1.2;
            p.y += (mdy / mdist) * 1.2;
          }
        }

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        const breathe = Math.sin(t * 2 + p.phase) * 0.2;
        ctx.globalAlpha = Math.max(0.1, p.alpha + breathe);
        ctx.fillStyle = p.type === "shield" ? "rgba(45, 212, 191, 0.8)" : "rgba(96, 165, 250, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (pageType === "assistant") {
      const maxConnectDist = 85;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * pulseEnergy;
        p.y += p.vy * pulseEnergy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.38 * pulseEnergy;
            ctx.strokeStyle = `rgba(147, 197, 253, ${lineAlpha})`;
            ctx.lineWidth = pulseEnergy > 1.2 ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = Math.min(1, p.alpha * pulseEnergy);
        ctx.fillStyle = pulseEnergy > 1.2 ? "rgba(191, 219, 254, 0.95)" : "rgba(147, 197, 253, 0.85)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (pulseEnergy > 1.2 ? 1.3 : 1), 0, Math.PI * 2);
        ctx.fill();
      }

      // Dynamic synaptic connection to cursor!
      if (mouseActive) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const mdx = mouseX - p.x;
          const mdy = mouseY - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 135) {
            const lineAlpha = (1 - mdist / 135) * 0.65;
            ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }
        // AI neural core node at cursor
        ctx.fillStyle = "rgba(196, 181, 253, 0.95)";
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(167, 139, 250, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 12 + Math.sin(t * 4) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (pageType === "map") {
      scanX += 1.8;
      if (scanX > width + 60) scanX = -60;

      const scanGrad = ctx.createLinearGradient(scanX - 50, 0, scanX, 0);
      scanGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
      scanGrad.addColorStop(0.8, "rgba(56, 189, 248, 0.12)");
      scanGrad.addColorStop(1, "rgba(56, 189, 248, 0.45)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - 50, 0, 50, height);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, height);
      ctx.stroke();

      ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
      const stepX = 120, stepY = 60;
      for (let x = 30; x < width; x += stepX) {
        for (let y = 20; y < height; y += stepY) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y);
          ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5);
          ctx.stroke();
        }
      }

      // Dynamic GPS tracking reticle brackets at cursor
      if (mouseActive) {
        ctx.save();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
        ctx.lineWidth = 1.5;
        const sz = 16;
        ctx.beginPath();
        // top-left corner
        ctx.moveTo(mouseX - sz, mouseY - sz + 6); ctx.lineTo(mouseX - sz, mouseY - sz); ctx.lineTo(mouseX - sz + 6, mouseY - sz);
        // top-right corner
        ctx.moveTo(mouseX + sz - 6, mouseY - sz); ctx.lineTo(mouseX + sz, mouseY - sz); ctx.lineTo(mouseX + sz, mouseY - sz + 6);
        // bottom-left corner
        ctx.moveTo(mouseX - sz, mouseY + sz - 6); ctx.lineTo(mouseX - sz, mouseY + sz); ctx.lineTo(mouseX - sz + 6, mouseY + sz);
        // bottom-right corner
        ctx.moveTo(mouseX + sz - 6, mouseY + sz); ctx.lineTo(mouseX + sz, mouseY + sz); ctx.lineTo(mouseX + sz, mouseY + sz - 6);
        ctx.stroke();

        ctx.fillStyle = "rgba(56, 189, 248, 0.95)";
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.r += p.speed;
        if (p.r > p.maxR) p.r = 10;
        const rAlpha = (1 - p.r / p.maxR) * 0.35;
        ctx.strokeStyle = `rgba(56, 189, 248, ${rAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(width * 0.88, height * 0.5, p.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (pageType === "about") {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed;

        let charAlpha = p.alpha;
        let charColor = "125, 211, 252";
        let charFont = "11px monospace";

        // Dynamic cyber scatter on hover
        if (mouseActive) {
          const mdx = mouseX - p.x;
          const mdy = mouseY - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 85) {
            p.x -= (mdx / (mdist + 1)) * 1.6;
            charColor = "56, 189, 248";
            charAlpha = Math.min(1, p.alpha + 0.5);
            charFont = "bold 13px monospace";
          }
        }

        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        ctx.globalAlpha = charAlpha;
        ctx.fillStyle = `rgba(${charColor}, 0.9)`;
        ctx.font = charFont;
        ctx.fillText(p.char, p.x, p.y);
      }
      ctx.globalAlpha = 1;
    }
  }

  function animate(now) {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);
    drawScene(now);
    animFrameId = requestAnimationFrame(animate);
  }

  function start() {
    if (isRunning) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    isRunning = true;
    animFrameId = requestAnimationFrame(animate);
  }

  function stop() {
    isRunning = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  window.addEventListener("resize", resize);

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !document.hidden) {
          start();
        } else {
          stop();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(banner);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else if (isVisible) {
      start();
    }
  });

  resize();
  start();

  return {
    updateWeather(code, isDay, rainProb) {
      if (pageType !== "forecast") return;
      if (rainProb >= 45 || (typeof code === "number" && [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code))) {
        forecastMode = "rain";
        banner.setAttribute("data-forecast-weather", "rain");
      } else if (code === 0 || code === 1) {
        forecastMode = "sun";
        banner.setAttribute("data-forecast-weather", "sun");
      } else {
        forecastMode = "cloud";
        banner.removeAttribute("data-forecast-weather");
      }
      initParticles();
    },
    setTone(tone) {
      if (pageType !== "alerts") return;
      alertTone = tone || "green";
      if (alertTone === "alert") {
        banner.setAttribute("data-alert-status", "active");
      } else {
        banner.removeAttribute("data-alert-status");
      }
    },
    pulse() {
      pulseEnergy = 2.4;
    }
  };
}

/* ---------------------------------------------------------------- home */
async function initHome() {
  const input = $("#city"), form = $("#home-form"), live = $("#live"), quick = $("#quick"), qnote = $("#quick-note");
  input.value = myCity();
  const atmosphere = setupLiveWeatherAtmosphere();

  async function refresh() {
    const city = input.value.trim() || "Vadodara";
    live.replaceChildren(skeletonLive());
    try {
      const w = await getWeather(city);
      store("city", city);
      const d = w.forecast.daily, c = w.forecast.current;
      live.replaceChildren();
      live.append(h("p", "place", w.place));

      const cond = conditionOf(c, d);
      const baseAtmosphere = resolveWeatherAtmosphere(c, d, null);
      atmosphere.update(baseAtmosphere, cond ? cond.label : null, w.place || city);
      const row = h("div", "cond-row");
      if (cond) row.innerHTML = iconSvg(cond.icon, "cond-icon");
      row.append(h("span", "temp", `${Math.round(c.temperature_2m)}°C`));
      if (cond && cond.label) row.append(h("span", "label", cond.label));
      live.append(row);

      live.append(h("p", "summary", todayLine(d)));
      const stats = h("div", "stats");
      [["drop", `${c.relative_humidity_2m}%`, "humidity"], ["wind", `${num(c.wind_speed_10m)} km/h`, "wind"],
       ["rain", `${d.precipitation_probability_max[0]}%`, "chance of rain today"]].forEach(([ic, val, lab]) => {
        const s = h("div", "stat"); s.innerHTML = iconSvg(ic);
        s.append(h("b", null, val), h("span", null, lab)); stats.append(s);
      });
      live.append(stats);

      // Forecast view switcher tabs: Next 24 hours vs 5-day rain chart
      if (w.forecast.hourly) {
        const tabs = h("div", "forecast-tabs");
        const btnHourly = h("button", "tab-btn active", null);
        btnHourly.type = "button";
        btnHourly.innerHTML = iconSvg("sun") + "<span>Next 24 hours</span>";

        const btnDaily = h("button", "tab-btn", null);
        btnDaily.type = "button";
        btnDaily.innerHTML = iconSvg("rain") + "<span>5-day rain chart</span>";

        tabs.append(btnHourly, btnDaily);
        live.append(tabs);

        const viewArea = h("div", "forecast-view-area");
        live.append(viewArea);

        const hourlyView = buildHourlyView(w.forecast.hourly, { light: false });
        const chartView = h("div", "chart");

        function showTab(which) {
          if (which === "hourly") {
            btnHourly.className = "tab-btn active";
            btnDaily.className = "tab-btn";
            viewArea.replaceChildren(hourlyView);
          } else {
            btnHourly.className = "tab-btn";
            btnDaily.className = "tab-btn active";
            viewArea.replaceChildren(chartView);
            mountChart(chartView, (wd, anim) => rainLines(d, { animate: anim, width: wd }) + rainKey());
          }
        }

        btnHourly.addEventListener("click", () => showTab("hourly"));
        btnDaily.addEventListener("click", () => showTab("daily"));
        showTab("hourly");
      } else {
        const chart = h("div", "chart");
        live.append(chart);
        mountChart(chart, (wd, anim) => rainLines(d, { animate: anim, width: wd }) + rainKey());
      }

      const line = h("p", "alert-line", "Checking official alerts…");
      live.append(line);
      let a;
      try { a = await getAlerts(w.state, city); } catch (e) { a = { status: "unavailable" }; }
      const s = alertSummary(a, city);
      line.className = "alert-line " + s.tone;
      line.textContent = s.text + " ";
      const more = h("a", null, "See alerts");
      more.href = "alerts.html";
      line.append(more);

      // Upgrade atmosphere if official alerts indicate severe storm/lightning/heatwave
      const alertAtmosphere = resolveWeatherAtmosphere(c, d, a);
      if (alertAtmosphere !== baseAtmosphere) {
        atmosphere.update(alertAtmosphere, cond ? cond.label : null, w.place || city);
      }

      // Live Air Quality Index & Health Advisory
      try {
        const aqi = await getAqi(city);
        if (aqi && aqi.category !== "Unavailable") {
          live.append(renderAqiCard(aqi));
        }
      } catch (_) {}
    } catch (e) {
      live.replaceChildren(h("p", "note", e.message));
    }
  }

  // quick-pick towns and "use my location"
  if (quick) {
    const hasGeo = typeof navigator !== "undefined" && navigator.geolocation;
    let locBtn = null;
    if (hasGeo) {
      locBtn = h("button", "locate"); locBtn.type = "button";
      locBtn.innerHTML = iconSvg("pin") + "<span>Use my location</span>";
      locBtn.addEventListener("click", locateMe);
      quick.append(locBtn);
    }
    QUICK_CITIES.forEach((c) => {
      const b = h("button", null, c); b.type = "button";
      b.addEventListener("click", () => { input.value = c; refresh(); });
      quick.append(b);
    });
    async function locateMe() {
      const label = locBtn.querySelector("span");
      locBtn.disabled = true; label.textContent = "Finding you…"; qnote.textContent = "";
      try {
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000, maximumAge: 600000 }));
        const { latitude, longitude } = pos.coords;
        const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const d = await r.json();
        const town = d.city || d.locality;
        if (!town) throw new Error("Couldn't work out your town. Type it in instead.");
        input.value = town;
        await refresh();
      } catch (e) {
        qnote.textContent = e && e.code === 1 ? "Location permission was denied. Type your town instead."
          : (e && e.message && !e.code ? e.message : "Couldn't get your location. Type your town instead.");
      } finally {
        locBtn.disabled = false; label.textContent = "Use my location";
      }
    }
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); refresh(); });
  refresh();
}

/* ---------------------------------------------------------------- forecast page */
async function initForecast() {
  const input = $("#city"), form = $("#fc-form");
  input.value = myCity();
  const pageAtmosphere = setupPageAtmosphere("forecast");

  async function refresh() {
    const city = input.value.trim() || "Vadodara";
    const status = $("#fc-status");
    status.textContent = "Loading the forecast…";
    $("#fc-rain").innerHTML = skeletonBars();
    $("#fc-temp").innerHTML = skeletonBars();
    try {
      const w = await getWeather(city);
      store("city", city);
      const d = w.forecast.daily, c = w.forecast.current;
      if (pageAtmosphere) {
        pageAtmosphere.updateWeather(c ? c.weather_code : null, c ? c.is_day !== 0 : true, (d && d.precipitation_probability_max) ? d.precipitation_probability_max[0] : 0);
      }
      status.textContent = `${w.place}, from ${w.source}, fetched ${w.fetched_at}${w.stale ? " (saved copy, may be outdated)" : ""}.`;

      const now = $("#fc-now");
      now.replaceChildren();
      const cond = conditionOf(c, d);
      const first = h("div");
      first.append(h("dt", null, "Temperature now"));
      const dd = h("dd", null, `${num(c.temperature_2m)}°C`);
      if (cond && cond.label) { const cs = h("span", "cond"); cs.innerHTML = iconSvg(cond.icon); cs.append(cond.label); dd.append(cs); }
      first.append(dd); now.append(first);
      [["Humidity", `${c.relative_humidity_2m}%`], ["Wind", `${num(c.wind_speed_10m)} km/h`], ["Rain in the last hour", `${num(c.precipitation)} mm`]].forEach(([k, v]) => {
        const box = h("div"); box.append(h("dt", null, k), h("dd", null, v)); now.append(box);
      });

      const fcHourly = $("#fc-hourly");
      if (fcHourly) {
        if (w.forecast.hourly) {
          fcHourly.replaceChildren(buildHourlyView(w.forecast.hourly, { light: true }));
        } else {
          fcHourly.replaceChildren(h("p", "note", "Hourly forecast is not available right now."));
        }
      }

      mountChart($("#fc-rain"), (wd, anim) => rainLines(d, { animate: anim, width: wd }) + rainKey());
      mountChart($("#fc-temp"), (wd) => tempChart(d, { width: wd }));

      const cbox = $("#fc-climate");
      if (cbox) {
        cbox.replaceChildren(h("p", "note", "Comparing with a normal year…"));
        getClimate(city).then((c) => climateLine(cbox, c))
          .catch(() => cbox.replaceChildren(h("p", "note", "The comparison with a normal year is not available right now.")));
      }

      const aqiBox = $("#fc-aqi");
      if (aqiBox) {
        aqiBox.replaceChildren(h("p", "note", "Checking live Air Quality (AQI)…"));
        getAqi(city).then((a) => {
          if (a && a.category !== "Unavailable") {
            aqiBox.replaceChildren(renderAqiCard(a));
          } else {
            aqiBox.replaceChildren(h("p", "note", "Air quality data is currently unavailable for this area."));
          }
        }).catch(() => aqiBox.replaceChildren(h("p", "note", "Could not load air quality data.")));
      }

      const body = $("#fc-table");
      body.replaceChildren();
      d.time.forEach((t, i) => {
        const tr = h("tr");
        tr.append(h("th", null, longDay(t)));
        tr.querySelector("th").scope = "row";
        tr.append(h("td", null, `${d.precipitation_probability_max[i]}%`));
        tr.append(h("td", null, `${num(d.precipitation_sum[i])} mm`));
        const cls = dayClass(d.precipitation_probability_max[i], d.precipitation_sum[i]);
        const td = h("td"); td.append(h("span", "chip " + cls.key, cls.label)); tr.append(td);
        tr.append(h("td", null, `${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°`));
        body.append(tr);
      });
    } catch (e) {
      status.textContent = e.message;
      if ($("#fc-hourly")) $("#fc-hourly").innerHTML = "";
      $("#fc-rain").innerHTML = "";
      $("#fc-temp").innerHTML = "";
    }
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); refresh(); });
  refresh();
}

/* ---------------------------------------------------------------- climate page */
async function initClimate() {
  const input = $("#city"), form = $("#cl-form");
  input.value = myCity();
  setupPageAtmosphere("climate");

  async function refresh() {
    const city = input.value.trim() || "Vadodara";
    const status = $("#cl-status"), now = $("#cl-now"), year = $("#cl-year"), latest = $("#cl-latest"), src = $("#cl-source");
    status.textContent = "Loading climate history. The first request for a town can take a few seconds.";
    now.replaceChildren(); latest.textContent = ""; src.textContent = "";
    year.innerHTML = skeletonBars();
    try {
      const c = await getClimate(city);
      store("city", city);
      status.textContent = `${c.place}. Usual means the average of ${c.period}.`;
      now.replaceChildren();
      if (c.comparison) {
        const [lab, cls] = CMP[c.comparison.key] || ["", "dry"];
        const head = h("p", "cmp-head"); head.append(h("span", "chip " + cls, lab));
        now.append(head, h("p", "cmp-text big", c.comparison.text));
      }
      const chart = h("div", "chart"); now.append(chart);
      mountChart(chart, (wd) => rangeBar(c.window, c.forecast_total_mm, { width: wd }));
      now.append(h("p", "cmp-text", tempPhrase("Daytime highs", c.forecast_tmax_mean, c.window.normal_tmax)));
      now.append(h("p", "cmp-text", tempPhrase("Night-time lows", c.forecast_tmin_mean, c.window.normal_tmin)));

      const nowIndex = new Date().getMonth();
      mountChart(year, (wd, anim) => seasonChart(c.monthly_normal_mm, c.this_year.months, { width: wd, nowIndex, animate: anim }) + seasonKey(c));
      const lm = c.latest_month;
      latest.textContent = lm
        ? `${MONTH_LONG[lm.month - 1]} so far (through day ${lm.through_day}): ${num(lm.rain_mm)} mm. Usual for the same days: ${num(lm.normal_rain_mm)} mm.`
        : "";
      src.textContent = `Averages for ${c.period} from ${c.source}. Data runs through ${c.data_through}.`;
    } catch (e) {
      status.textContent = e.message;
      year.innerHTML = "";
    }
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); refresh(); });
  refresh();
}

function showBrowserNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: "assets/icon-192.png",
          badge: "assets/icon-192.png",
          vibrate: [200, 100, 200],
          tag: "weather-alert",
        });
      });
    } else {
      new Notification(title, { body, icon: "assets/icon-192.png" });
    }
  } catch (e) {
    console.warn("Notification dispatch failed:", e);
  }
}

/* ---------------------------------------------------------------- alerts page */
async function initAlerts() {
  const city = $("#city"), st = $("#state"), out = $("#al-result"), stamp = $("#al-status"), form = $("#al-form");
  const notifyBtn = $("#btn-notify"), notifyText = $("#notify-text");
  const pageAtmosphere = setupPageAtmosphere("alerts");
  STATES.forEach((s) => st.append(new Option(s, s)));
  city.value = myCity();
  const remembered = load("state");
  if (remembered) setState(remembered);

  function updateNotifyUI() {
    if (!notifyBtn) return;
    if (!("Notification" in window)) {
      notifyBtn.hidden = true;
      return;
    }
    const subscribed = load("notify_alerts") === "1" && Notification.permission === "granted";
    if (subscribed) {
      notifyBtn.classList.add("active");
      if (notifyText) notifyText.textContent = "Subscribed (🔔 Alerts On)";
    } else {
      notifyBtn.classList.remove("active");
      if (notifyText) notifyText.textContent = "Alert Me";
    }
  }

  if (notifyBtn) {
    updateNotifyUI();
    notifyBtn.addEventListener("click", async () => {
      if (!("Notification" in window)) {
        alert("Browser notifications are not supported on this device.");
        return;
      }
      if (Notification.permission === "granted") {
        const current = load("notify_alerts") === "1";
        store("notify_alerts", current ? "0" : "1");
        updateNotifyUI();
        if (!current) {
          showBrowserNotification("WeatherGPT Alerts Active", `You will be notified of official warnings in ${st.value}.`);
        }
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          store("notify_alerts", "1");
          updateNotifyUI();
          showBrowserNotification("WeatherGPT Alerts Active", `You will be notified of official warnings in ${st.value}.`);
        }
      } else {
        alert("Notifications are blocked in your browser settings. Please enable notifications for WeatherGPT to receive alerts.");
      }
    });
  }

  function setState(s) {
    if (!s) return;
    if (![...st.options].some((o) => o.value === s)) st.append(new Option(s, s));
    st.value = s;
  }
  async function guessState() {
    const c = city.value.trim() || "Vadodara";
    try { const w = await getWeather(c); store("city", c); setState(w.state); } catch (e) { /* user can pick a state */ }
  }
  async function check() {
    const c = city.value.trim() || "Vadodara";
    out.replaceChildren(h("p", "status", "Checking official alerts…"));
    try {
      const a = await getAlerts(st.value, c);
      out.replaceChildren(buildAlerts(a, c));
      stamp.textContent = `Last checked ${timeIST()}. This page refreshes every 5 minutes.`;
      if (pageAtmosphere) {
        pageAtmosphere.setTone(a && a.alerts && a.alerts.length > 0 ? "alert" : "green");
      }

      // Trigger notification if user opted in and unexpired alerts exist
      if (load("notify_alerts") === "1" && Notification.permission === "granted" && a && a.alerts && a.alerts.length > 0) {
        const topAlert = a.alerts[0];
        const lastNotified = load("last_notified_alert");
        if (lastNotified !== topAlert.title) {
          store("last_notified_alert", topAlert.title);
          showBrowserNotification(`⚠️ Weather Alert: ${st.value}`, `${topAlert.title} (Valid until ${topAlert.valid_until})`);
        }
      }
    } catch (e) {
      out.replaceChildren(errBox(e));
      stamp.textContent = "";
    }
  }
  city.addEventListener("change", async () => { await guessState(); check(); });
  st.addEventListener("change", () => { store("state", st.value); check(); });
  form.addEventListener("submit", (e) => { e.preventDefault(); check(); });

  if (!remembered) await guessState();
  check();
  setInterval(check, 5 * 60 * 1000);
}

/* ---------------------------------------------------------------- safety page */
function initSafety() {
  setupPageAtmosphere("safety");
  const list = $("#kit"), count = $("#kit-count"), bar = $("#kit-bar");
  let done = [];
  try { done = JSON.parse(load("kit") || "[]"); } catch (e) { done = []; }
  function update() {
    const pct = Math.round((done.length / KIT.length) * 100);
    count.textContent = `Emergency kit readiness: ${done.length} of ${KIT.length} packed (${pct}%)`;
    if (bar) {
      bar.setAttribute("aria-valuenow", String(done.length));
      const fill = bar.querySelector("i");
      if (fill) fill.style.width = pct + "%";
    }
  }
  KIT.forEach((item, i) => {
    const li = h("li"), lab = h("label"), box = document.createElement("input");
    box.type = "checkbox"; box.checked = done.includes(i);
    box.addEventListener("change", () => {
      done = box.checked ? [...new Set([...done, i])] : done.filter((x) => x !== i);
      store("kit", JSON.stringify(done)); update();
    });
    lab.append(box, h("span", null, item));
    li.append(lab); list.append(li);
  });
  update();
}

function renderAgriCard(adv, container) {
  if (!container || !adv) return;
  container.replaceChildren();
  const box = h("div", "agri-box");
  const head = h("div", "agri-head");
  head.innerHTML = `<h4>🌾 ${adv.crop_name} Advisory</h4><span class="badge">${Math.round(adv.weather_summary.temp_c)}°C | ${adv.weather_summary.humidity_pct}% RH | ${num(adv.weather_summary.wind_kmh)} km/h</span>`;
  box.append(head);

  const grid = h("div", "agri-grid");

  // Spraying
  const sp = h("div", "agri-item");
  sp.innerHTML = `<span class="agri-tag" style="background:${adv.spraying.color}20; color:${adv.spraying.color}; border:1px solid ${adv.spraying.color}40;">🧪 Spraying: ${adv.spraying.badge}</span><p class="agri-desc">${adv.spraying.reason}</p>`;
  grid.append(sp);

  // Irrigation
  const ir = h("div", "agri-item");
  ir.innerHTML = `<span class="agri-tag" style="background:${adv.irrigation.color}20; color:${adv.irrigation.color}; border:1px solid ${adv.irrigation.color}40;">💧 Irrigation: ${adv.irrigation.badge}</span><p class="agri-desc">${adv.irrigation.reason}</p>`;
  grid.append(ir);

  // Disease/Pest
  const pd = h("div", "agri-item");
  pd.innerHTML = `<span class="agri-tag" style="background:${adv.pest_disease.color}20; color:${adv.pest_disease.color}; border:1px solid ${adv.pest_disease.color}40;">🐛 Disease/Pest: ${adv.pest_disease.level} Risk</span><p class="agri-desc">${adv.pest_disease.warning}</p>`;
  grid.append(pd);

  // Harvesting
  const hv = h("div", "agri-item");
  hv.innerHTML = `<span class="agri-tag" style="background:#0284c720; color:#0284c7; border:1px solid #0284c740;">🚜 Harvest: ${adv.harvesting.badge}</span><p class="agri-desc">${adv.harvesting.reason}</p>`;
  grid.append(hv);

  box.append(grid);
  container.append(box);
}

/* ---------------------------------------------------------------- assistant page */
async function initAssistant() {
  const cityEl = $("#city"), roleEl = $("#role"), cropFieldEl = $("#crop-field"), cropEl = $("#crop"), agriCardEl = $("#agri-card");
  const logEl = $("#log"), emptyEl = $("#empty"), chipsEl = $("#chips");
  const msgEl = $("#msg"), sendEl = $("#send"), micEl = $("#mic"), micStatus = $("#mic-status");
  const radios = [...document.querySelectorAll('input[name="lang"]')];
  const pageAtmosphere = setupPageAtmosphere("assistant");
  let busy = false;

  const getLang = () => (radios.find((r) => r.checked) || radios[0] || { value: "English" }).value;
  const setLang = (v) => radios.forEach((r) => { r.checked = r.value === v; });

  cityEl.value = myCity();
  roleEl.value = load("role") || "general";
  if (cropEl) cropEl.value = load("crop") || "cotton";
  setLang(load("lang") || "English");

  async function loadAgriCard() {
    if (!agriCardEl) return;
    const isFarmer = roleEl.value === "farmer";
    if (!isFarmer) {
      agriCardEl.hidden = true;
      if (cropFieldEl) cropFieldEl.hidden = true;
      return;
    }
    agriCardEl.hidden = false;
    if (cropFieldEl) cropFieldEl.hidden = false;
    const city = cityEl.value.trim() || "Vadodara";
    const crop = cropEl ? cropEl.value : "cotton";
    agriCardEl.replaceChildren(h("p", "note", "Loading agricultural advisory…"));
    try {
      const adv = await api(`/api/agri?city=${encodeURIComponent(city)}&crop=${encodeURIComponent(crop)}`);
      renderAgriCard(adv, agriCardEl);
    } catch (e) {
      agriCardEl.replaceChildren(h("p", "note", "Agri advisory unavailable right now."));
    }
  }

  function renderChips() {
    chipsEl.replaceChildren();
    const set = EXAMPLES[roleEl.value] || EXAMPLES.general;
    (set[getLang()] || set.English).forEach((q) => {
      const b = h("button", "chip-btn", q);
      b.type = "button";
      b.addEventListener("click", () => ask(q));
      chipsEl.append(b);
    });
  }
  async function railToday() {
    const t = $("#rail-today"), city = cityEl.value.trim() || "Vadodara";
    t.replaceChildren(h("p", "note", "Loading today's forecast…"));
    try {
      const w = await getWeather(city);
      store("city", city);
      t.replaceChildren();
      t.append(h("p", "note", w.place));
      t.append(h("p", "sum", todayLine(w.forecast.daily)));
      let a;
      try { a = await getAlerts(w.state, city); } catch (e) { a = { status: "unavailable" }; }
      const s = alertSummary(a, city);
      const st = h("p", "status" + (s.tone === "warn" ? " warn" : ""), s.text + " ");
      const more = h("a", null, "See alerts"); more.href = "alerts.html"; st.append(more);
      t.append(st);
    } catch (e) {
      t.replaceChildren(h("p", "note", e.message));
    }
  }

  radios.forEach((r) => r.addEventListener("change", () => { store("lang", getLang()); if (!emptyEl.hidden) renderChips(); }));
  roleEl.addEventListener("change", () => {
    store("role", roleEl.value);
    loadAgriCard();
    if (!emptyEl.hidden) renderChips();
  });
  if (cropEl) {
    cropEl.addEventListener("change", () => {
      store("crop", cropEl.value);
      loadAgriCard();
    });
  }
  cityEl.addEventListener("change", () => { railToday(); loadAgriCard(); });
  renderChips();
  railToday();
  loadAgriCard();

  function speak(text, code, btn) {
    if (!("speechSynthesis" in window)) return;
    const wasSpeaking = btn.dataset.speaking === "1";
    speechSynthesis.cancel();
    document.querySelectorAll("[data-speaking]").forEach((b) => {
      b.textContent = "🔊 Listen";
      b.removeAttribute("data-speaking");
      b.classList.remove("speaking");
    });
    if (wasSpeaking) return;

    // Clean rich markdown symbols, links, and emojis for natural pronunciation
    const cleanText = text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[*_#`~]/g, "")
      .replace(/[•–—]/g, " ")
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .trim();

    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = code;
    u.rate = 0.95; // Slightly measured rate for clearer regional articulation

    // Select the best matching regional voice available on this device
    const voices = speechSynthesis.getVoices();
    const prefix = (code || "en").split("-")[0];
    const matchVoice = voices.find((v) => v.lang === code) ||
      voices.find((v) => v.lang && v.lang.startsWith(prefix)) ||
      voices.find((v) => v.lang && v.lang.includes("IN"));
    if (matchVoice) u.voice = matchVoice;

    u.onend = u.onerror = () => {
      btn.textContent = "🔊 Listen";
      btn.removeAttribute("data-speaking");
      btn.classList.remove("speaking");
    };

    btn.textContent = "⏹️ Stop";
    btn.dataset.speaking = "1";
    btn.classList.add("speaking");
    speechSynthesis.speak(u);
  }
  async function copyText(text, btn) {
    const plain = text.replace(/\*\*/g, "");
    try {
      await navigator.clipboard.writeText(plain);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = plain; document.body.append(ta); ta.select();
      try { document.execCommand("copy"); } catch (err) { /* nothing more to try */ }
      ta.remove();
    }
    btn.textContent = "Copied";
    setTimeout(() => { btn.textContent = "Copy"; }, 1600);
  }
  function scrollDown() {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: document.body.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }
  function botHead() {
    const head = h("div", "bot-head");
    const av = h("div", "avatar");
    av.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path class="cl" d="M5 9h22"/><path class="st" d="M10 15v10M16 15v13M22 15v7"/></svg>';
    const txt = h("div"); txt.append(h("b", null, "WeatherGPT"), h("span", null, "Forecast from Open-Meteo, alerts from NDMA SACHET"));
    head.append(av, txt);
    return head;
  }

  async function ask(text) {
    const question = (text || "").trim();
    if (!question || busy) return;
    const city = cityEl.value.trim();
    if (!city) { cityEl.focus(); return; }
    busy = true; sendEl.disabled = true; sendEl.textContent = "Asking…";
    emptyEl.hidden = true;
    if (pageAtmosphere) pageAtmosphere.pulse();

    const language = getLang(), code = langCode(language);
    const turn = h("div", "turn"), row = h("div", "user-row");
    row.append(h("div", "user-msg", question));
    turn.append(row);
    const bot = h("div", "bot");
    bot.append(botHead());
    bot.append(h("p", "pending", "Checking the forecast and official alerts"));
    turn.append(bot);
    logEl.append(turn);
    msgEl.value = ""; msgEl.style.height = "auto";
    scrollDown();

    try {
      const crop = (cropEl && roleEl.value === "farmer") ? cropEl.value : "general";
      const d = await api("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, city, language, role: roleEl.value, crop }),
      }, city);
      bot.replaceChildren();
      bot.append(botHead());
      bot.append(buildAlerts(d.alerts, d.place.split(",")[0]));
      const lab = h("p", "section-title", "Explained by AI ");
      lab.append(h("span", null, `in ${language}, using only the forecast and alerts above`));
      bot.append(lab);

      if (roleEl.value === "farmer" && d.agri) {
        const agChips = h("div", "agri-chat-chips");
        agChips.innerHTML = `
          <span class="ag-chip" style="color:${d.agri.spraying.color}">🧪 Spray: ${d.agri.spraying.badge}</span>
          <span class="ag-chip" style="color:${d.agri.irrigation.color}">💧 Irrigation: ${d.agri.irrigation.badge}</span>
          <span class="ag-chip" style="color:${d.agri.pest_disease.color}">🐛 Pest: ${d.agri.pest_disease.level}</span>
          <span class="ag-chip" style="color:#0284c7">🚜 Harvest: ${d.agri.harvesting.badge}</span>
        `;
        bot.append(agChips);
      }

      const wrap = h("div", "answer-wrap"), ans = h("div", "answer");
      ans.lang = code.split("-")[0];
      ans.innerHTML = renderRich(d.answer);
      wrap.append(ans);
      wrap.append(h("p", "meta", `Weather from ${d.source}, ${d.fetched_at}, for ${d.place}.`));
      const acts = h("div", "actions");
      if ("speechSynthesis" in window) {
        const b = h("button", "linkbtn", "🔊 Listen"); b.type = "button";
        b.addEventListener("click", () => speak(d.answer, code, b));
        acts.append(b);
      }
      const cp = h("button", "linkbtn", "Copy"); cp.type = "button";
      cp.addEventListener("click", () => copyText(d.answer, cp));
      acts.append(cp);

      const wa = h("a", "btn-whatsapp");
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.innerHTML = iconSvg("whatsapp") + "<span>📲 Share on WhatsApp</span>";
      let waMsg = `🌦️ *WeatherGPT Update for ${d.place || city}*\n\n` +
        `${d.answer}\n\n`;
      if (d.alerts && d.alerts.alerts && d.alerts.alerts.length) {
        waMsg += `⚠️ *Official Alert:* ${d.alerts.alerts[0].title} (Valid until ${d.alerts.alerts[0].valid_until})\n\n`;
      }
      waMsg += `🔗 Checked on WeatherGPT: https://weather-gpt-theta.vercel.app/`;
      wa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;
      acts.append(wa);

      wrap.append(acts);

      if (d.grounding) {
        const why = h("details", "why-panel");
        const sum = h("summary", "why-summary");
        sum.innerHTML = iconSvg("shield") + "<span>Why this answer? (Data given to the AI)</span>";
        why.append(sum);

        const body = h("div", "why-body");

        // Section 1: Forecast Numbers Given
        const secNumbers = h("div", "why-section");
        secNumbers.append(h("div", "why-label", "Forecast Numbers Supplied to Model"));
        const chipWrap = h("div", "why-numbers");
        const g = d.grounding;
        if (g.current_temp != null) {
          const ch = h("span", "why-chip"); ch.innerHTML = `Temp: <b>${Math.round(g.current_temp)}°C</b>`; chipWrap.append(ch);
        }
        if (g.current_humidity != null) {
          const ch = h("span", "why-chip"); ch.innerHTML = `Humidity: <b>${g.current_humidity}%</b>`; chipWrap.append(ch);
        }
        if (g.current_wind != null) {
          const ch = h("span", "why-chip"); ch.innerHTML = `Wind: <b>${num(g.current_wind)} km/h</b>`; chipWrap.append(ch);
        }
        if (g.today_rain_prob != null) {
          const ch = h("span", "why-chip"); ch.innerHTML = `Today rain: <b>${g.today_rain_prob}%</b>`; chipWrap.append(ch);
        }
        if (g.today_rain_mm != null) {
          const ch = h("span", "why-chip"); ch.innerHTML = `Expected rain: <b>${num(g.today_rain_mm)} mm</b>`; chipWrap.append(ch);
        }
        if (g.aqi && g.aqi.pm2_5 != null) {
          const ch = h("span", "why-chip"); ch.innerHTML = `Air Quality: <b>${g.aqi.category} (PM2.5: ${Math.round(g.aqi.pm2_5)})</b>`; chipWrap.append(ch);
        }
        if (g.agri && g.agri.crop_name) {
          const ch = h("span", "why-chip"); ch.innerHTML = `Crop: <b>${g.agri.crop_name.split(" ")[0]}</b> | Spray: <b>${g.agri.spraying.badge}</b>`; chipWrap.append(ch);
        }
        secNumbers.append(chipWrap);
        body.append(secNumbers);

        // Section 2: Official Alerts Checked
        const secAlerts = h("div", "why-section");
        secAlerts.append(h("div", "why-label", "Official Government Alerts Fed"));
        const alertList = h("ul", "why-list");
        if (g.aqi && g.aqi.advisory) {
          alertList.append(h("li", null, `[Air Quality Advisory] ${g.aqi.category}: ${g.aqi.advisory}`));
        }
        if (g.agri && g.agri.spraying) {
          alertList.append(h("li", null, `[Crop Advisory - ${g.agri.crop_name}] Spray: ${g.agri.spraying.badge} (${g.agri.spraying.reason}); Pest Risk: ${g.agri.pest_disease.level} (${g.agri.pest_disease.warning})`));
        }
        if (g.alerts_checked && g.alerts_checked.items && g.alerts_checked.items.length) {
          g.alerts_checked.items.forEach((item) => {
            alertList.append(h("li", null, `[${item.mentions_city ? "Names city" : "State-level"}] ${item.title} (${item.issuer}, valid until ${item.valid_until})`));
          });
        } else {
          alertList.append(h("li", null, `NDMA SACHET feed checked for ${g.alerts_checked ? g.alerts_checked.state : "state"}: 0 active unexpired alerts.`));
        }
        secAlerts.append(alertList);
        body.append(secAlerts);

        // Section 3: Honesty Rules Enforced
        const secRules = h("div", "why-section");
        secRules.append(h("div", "why-label", "Honesty Constraints Enforced"));
        const rulesList = h("ul", "why-list");
        (g.rules || [
          "Strict grounding: numbers derived exclusively from live Open-Meteo data",
          "Official NDMA SACHET alerts displayed verbatim without AI modification",
          "Prohibition against false 'no risk' or '100% safe' claims",
          "Honest reporting of expired or unavailable alert feeds"
        ]).forEach((rule) => {
          rulesList.append(h("li", null, rule));
        });
        secRules.append(rulesList);
        body.append(secRules);

        why.append(body);
        wrap.append(why);
      }

      bot.append(wrap);
      railToday();
    } catch (e) {
      bot.replaceChildren(botHead(), errBox(e));
    } finally {
      busy = false; sendEl.disabled = false; sendEl.textContent = "Ask";
      scrollDown();
      msgEl.focus();
    }
  }

  sendEl.addEventListener("click", () => ask(msgEl.value));
  msgEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(msgEl.value); }
  });
  msgEl.addEventListener("input", () => {
    msgEl.style.height = "auto";
    msgEl.style.height = Math.min(msgEl.scrollHeight, 140) + "px";
  });

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    micEl.hidden = false;
    let rec = null;
    micEl.title = "Speak your question (Voice Input)";
    micEl.addEventListener("click", () => {
      if (rec) {
        rec.stop();
        return;
      }
      try {
        rec = new SR();
      } catch (err) {
        console.warn("SpeechRecognition init failed", err);
        return;
      }
      const activeLang = langCode(getLang());
      rec.lang = activeLang;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        micEl.setAttribute("aria-pressed", "true");
        micEl.classList.add("recording");
        micEl.setAttribute("aria-label", "Stop listening");
        msgEl.placeholder = "Listening... Speak now in your language";
        if (micStatus) micStatus.textContent = "Listening. Speak now...";
      };
      rec.onresult = (ev) => {
        let transcript = "";
        for (let i = 0; i < ev.results.length; i++) {
          transcript += ev.results[i][0].transcript;
        }
        msgEl.value = transcript;
        msgEl.dispatchEvent(new Event("input"));
      };
      rec.onend = rec.onerror = () => {
        rec = null;
        micEl.setAttribute("aria-pressed", "false");
        micEl.classList.remove("recording");
        micEl.setAttribute("aria-label", "Speak your question");
        msgEl.placeholder = "Ask about the weather or warnings";
        if (micStatus) micStatus.textContent = "";
        msgEl.focus();
      };
      rec.start();
    });
  }

  const q = new URLSearchParams(location.search).get("q");
  if (q) ask(q);
}

/* ---------------------------------------------------------------- about page */
function initAbout() {
  setupPageAtmosphere("about");
  const filterBtns = document.querySelectorAll(".eval-filter-btn");
  const searchInput = document.getElementById("evalSearch");
  const rows = document.querySelectorAll("#evalTable tbody tr[data-cat]");
  const emptyRow = document.querySelector(".eval-empty-row");

  let activeFilter = "all";
  let searchVal = "";

  function applyFilter() {
    let visibleCount = 0;
    rows.forEach(tr => {
      const cat = tr.dataset.cat || "";
      const text = (tr.textContent || "").toLowerCase();
      const matchesFilter = (activeFilter === "all") || (cat === activeFilter);
      const matchesSearch = !searchVal || text.includes(searchVal);
      const show = matchesFilter && matchesSearch;
      tr.style.display = show ? "" : "none";
      if (show) visibleCount++;
    });
    if (emptyRow) {
      emptyRow.style.display = visibleCount === 0 ? "" : "none";
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter || "all";
      applyFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchVal = (e.target.value || "").trim().toLowerCase();
      applyFilter();
    });
  }
}

/* ---------------------------------------------------------------- network & pwa */
function initNetworkStatus() {
  const banner = document.getElementById("offline-banner");
  if (!banner) return;
  function update() {
    banner.hidden = navigator.onLine;
  }
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then((reg) => {
        // SW registered
      }).catch((err) => {
        // SW registration failed (e.g. file:// protocol)
      });
    });
  }
}

/* ---------------------------------------------------------------- map page */
async function initMap() {
  setupPageAtmosphere("map");
  const mapEl = document.getElementById("weather-map");
  if (!mapEl || typeof L === "undefined") return;

  const statusEl = document.getElementById("map-status");
  const cityInput = document.getElementById("map-city");
  const btnGo = document.getElementById("btn-map-go");
  const btnLocate = document.getElementById("btn-map-locate");
  const toggleRadar = document.getElementById("toggle-radar");
  const toggleMarkers = document.getElementById("toggle-markers");

  const map = L.map("weather-map", {
    center: [21.5, 78.9],
    zoom: 5,
    minZoom: 4,
    maxZoom: 18,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  // RainViewer Live Weather Radar Overlay
  let radarLayer = null;
  async function loadRadarLayer() {
    try {
      const resp = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      const data = await resp.json();
      if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
        const latest = data.radar.past[data.radar.past.length - 1];
        const tilePath = latest.path;
        radarLayer = L.tileLayer(`https://tilecache.rainviewer.com${tilePath}/256/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.65,
          zIndex: 500,
          attribution: '&copy; <a href="https://www.rainviewer.com">RainViewer</a>',
        });
        if (!toggleRadar || toggleRadar.classList.contains("active")) {
          radarLayer.addTo(map);
        }
      }
    } catch (e) {
      console.warn("Could not load RainViewer radar layer:", e);
    }
  }
  loadRadarLayer();

  const CITIES = [
    { name: "Vadodara", state: "Gujarat", lat: 22.3072, lon: 73.1812 },
    { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714 },
    { name: "Surat", state: "Gujarat", lat: 21.1702, lon: 72.8311 },
    { name: "Rajkot", state: "Gujarat", lat: 22.3039, lon: 70.8022 },
    { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lon: 72.8777 },
    { name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567 },
    { name: "Delhi", state: "Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
    { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
    { name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639 },
    { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
    { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707 },
    { name: "Hyderabad", state: "Telangana", lat: 17.3850, lon: 78.4867 },
    { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126 },
    { name: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376 },
    { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lon: 85.8245 },
    { name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362 },
  ];

  const markerGroup = L.layerGroup().addTo(map);

  async function fetchAndRenderCity(c) {
    try {
      const [w, aqi, al] = await Promise.allSettled([
        getWeather(c.name),
        getAqi(c.name),
        getAlerts(c.state, c.name),
      ]);
      const weatherData = w.status === "fulfilled" ? w.value : null;
      const aqiData = aqi.status === "fulfilled" ? aqi.value : null;
      const alertData = al.status === "fulfilled" ? al.value : null;

      const current = weatherData ? weatherData.forecast.current : null;
      const temp = current ? Math.round(current.temperature_2m) : "--";
      const hasAlert = alertData && alertData.alerts && alertData.alerts.length > 0;
      const aqiCat = aqiData && aqiData.category ? aqiData.category : "N/A";
      const aqiCol = aqiData && aqiData.color ? aqiData.color : "#64748b";

      const iconHtml = `
        <div class="city-marker-badge ${hasAlert ? "has-alert" : ""}" title="${c.name}: ${temp}°C, AQI: ${aqiCat}">
          <span class="name">${c.name}</span>
          <span class="temp">${temp}°C</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-div-marker",
        iconSize: [64, 38],
        iconAnchor: [32, 19],
      });

      const marker = L.marker([c.lat, c.lon], { icon: customIcon });

const ALERT_DICTIONARY = [
  {
    match: /thunderstorm/i,
    hi: "बिजली और गर्जना के साथ आंधी-तूफान की चेतावनी",
    gu: "વીજળીના કડાકા-ભડાકા સાથે વાવાઝોડાની ચેતવણી",
    mr: "विजांच्या कडकडाटासह वादळी पावसाचा इशारा",
    bn: "বজ্রবিদ্যুৎ সহ ঝড়-বৃষ্টির সতর্কতা",
    ta: "இடி மின்னலுடன் கூடிய புயல் எச்சரிக்கை",
    te: "ఉరుములు మెరుపులతో కూడిన తుఫాను హెచ్చరిక",
    kn: "ಗುಡುಗು ಸಹಿತ ಬಿರುಗಾಳಿ ಮಳೆಯ ಎಚ್ಚರಿಕೆ",
  },
  {
    match: /lightning/i,
    hi: "आकाशीय बिजली गिरने का खतरा, सुरक्षित स्थान पर रहें",
    gu: "આકાશી વીજળી પડવાનું જોખમ, સુરક્ષિત સ્થળે રહેવું",
    mr: "वीज पडण्याचा धोका, सुरक्षित ठिकाणी राहा",
    bn: "বজ্রপাতের ঝুঁকি, নিরাপদ স্থানে থাকুন",
    ta: "மின்னல் தாக்கும் அபாயம், பாதுகாப்பாக இருக்கவும்",
    te: "పిడుగుపాటు ప్రమాదం, సురక్షిత ప్రాంతంలో ఉండండి",
    kn: "ಮಿಂಚಿನ ಹೊಡೆತದ ಅಪಾಯ, ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿರಿ",
  },
  {
    match: /very heavy rain/i,
    hi: "अत्यधिक भारी वर्षा का रेड अलर्ट",
    gu: "અતિ ભારે વરસાદનું રેડ એલર્ટ",
    mr: "अतिवृष्टीचा रेड अलर्ट",
    bn: "অতি ভারী বৃষ্টির লাল সতর্কতা",
    ta: "மிக கனமழை ரெட் அலர்ட்",
    te: "అత్యంత భారీ వర్షం రెడ్ అలర్ట్",
    kn: "ಅತ್ಯಂತ ಭಾರೀ ಮಳೆಯ ರೆಡ್ ಅಲರ್ಟ್",
  },
  {
    match: /heavy rain/i,
    hi: "भारी बारिश की आधिकारिक चेतावनी",
    gu: "ભારે વરસાદની સત્તાવાર ચેતવણી",
    mr: "मुसळधार पावसाचा इशारा",
    bn: "ভারী বৃষ্টির সরকারি সতর্কতা",
    ta: "கனமழை அதிகாரப்பூர்வ எச்சரிக்கை",
    te: "భారీ వర్షం అధికారిక హెచ్చరిక",
    kn: "ಭಾರೀ ಮಳೆಯ ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ",
  },
  {
    match: /squall|gusty wind/i,
    hi: "तेज आंधी और हवाएं चलने की चेतावनी",
    gu: "ઝડપી પવન અને વાવાઝોડાની ચેતવણી",
    mr: "वेगवान वारे आणि वादळाचा इशारा",
    bn: "ঝড়ো বাতাসের সতর্কতা",
    ta: "பலத்த காற்று வீசும் எச்சரிக்கை",
    te: "తీవ్ర ఈదురు గాలుల హెచ్చరిక",
    kn: "ಬಿರುಗಾಳಿ ಬೀಸುವ ಎಚ್ಚರಿಕೆ",
  },
  {
    match: /heat wave/i,
    hi: "भीषण लू (हीट वेव) का प्रकोप",
    gu: "હીટવેવ (ગરમ લૂ) નો પ્રકોપ",
    mr: "उष्णतेच्या लाटेचा (हीटवेव्ह) इशारा",
    bn: "তীব্র তাপপ্রবাহের সতর্কতা",
    ta: "கடுமையான வெப்ப அலை எச்சரிக்கை",
    te: "తీవ్ర వడగాల్పుల హెచ్చరిక",
    kn: "ತೀವ್ರ ಶಾಖದ ಅಲೆಯ ಎಚ್ಚರಿಕೆ",
  },
  {
    match: /hailstorm/i,
    hi: "ओलावृष्टि की संभावना",
    gu: "કરા પડવાની શક્યતા",
    mr: "गारपिटीची शक्यता",
    bn: "শিলাবৃষ্টির আশঙ্কা",
    ta: "ஆலங்கட்டி மழை எச்சரிக்கை",
    te: "వడగండ్ల వాన హెచ్చరిక",
    kn: "ಆಲಿಕಲ್ಲು ಮಳೆಯ ಎಚ್ಚರಿಕೆ",
  },
  {
    match: /dense fog/i,
    hi: "घना कोहरा छाए रहने की संभावना",
    gu: "ગાઢ ધુમ્મસની ચેતવણી",
    mr: "दाट धुके पडण्याची शक्यता",
    bn: "ঘন কুয়াশার সতর্কতা",
    ta: "அடர்ந்த பனிமூட்டம் எச்சரிக்கை",
    te: "దట్టమైన పొగమంచు హెచ్చరిక",
    kn: "ದಟ್ಟ ಮಂಜು ಕವಿದ ಎಚ್ಚರಿಕೆ",
  },
];

const MAP_LANGS = [
  { code: "en", label: "EN", name: "English", bcp: "en-IN" },
  { code: "hi", label: "हिन्दी", name: "Hindi", bcp: "hi-IN" },
  { code: "gu", label: "ગુજરાતી", name: "Gujarati", bcp: "gu-IN" },
  { code: "mr", label: "मराठी", name: "Marathi", bcp: "mr-IN" },
  { code: "bn", label: "বাংলা", name: "Bengali", bcp: "bn-IN" },
  { code: "ta", label: "தமிழ்", name: "Tamil", bcp: "ta-IN" },
  { code: "te", label: "తెలుగు", name: "Telugu", bcp: "te-IN" },
  { code: "kn", label: "ಕನ್ನಡ", name: "Kannada", bcp: "kn-IN" },
];

const WA_LABELS = {
  en: { area: "Area", warn: "Warning", valid: "Valid until", em: "In an emergency, call 112.", title: "WEATHER ALERT" },
  hi: { area: "क्षेत्र", warn: "चेतावनी", valid: "वैधता", em: "आपातकाल में 112 डायल करें।", title: "मौसम चेतावनी" },
  gu: { area: "વિસ્તાર", warn: "ચેતવણી", valid: "માન્યતા", em: "કટોકટીમાં 112 ડાયલ કરો.", title: "હવામાન ચેતવણી" },
  mr: { area: "विभाग / क्षेत्र", warn: "चेतावणी", valid: "वैधता", em: "आपत्कालीन परिस्थितीत 112 वर संपर्क साधा.", title: "हवामान इशारा" },
  bn: { area: "এলাকা", warn: "সতর্কতা", valid: "মেয়াদ", em: "জরুরী পরিস্থিতিতে 112 নম্বরে কল করুন।", title: "আবহাওয়া সতর্কতা" },
  ta: { area: "பகுதி", warn: "எச்சரிக்கை", valid: "செல்லுபடியாகும் நேரம்", em: "அவசரநிலைக்கு 112 அழைக்கவும்.", title: "வானிலை எச்சரிக்கை" },
  te: { area: "ప్రాంతం", warn: "హెచ్చరిక", valid: "చెల్లుబాటు", em: "అత్యవసర పరిస్థితుల్లో 112 డయల్ చేయండి.", title: "వాతావరణ హెచ్చరిక" },
  kn: { area: "ಪ್ರದೇಶ", warn: "ಎಚ್ಚರಿಕೆ", valid: "ಮಾನ್ಯತೆ", em: "ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ 112 ಗೆ ಕರೆ ಮಾಡಿ.", title: "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ" },
};

function matchAlertDict(title, lang) {
  if (!title) return null;
  for (const item of ALERT_DICTIONARY) {
    if (item.match.test(title)) {
      return item[lang] || null;
    }
  }
  return null;
}

function cleanAlertText(text) {
  if (!text) return "";
  return String(text).replace(/,([^\s])/g, ", $1").trim();
}

function createMapPopup(c, weatherData, aqiData, alertData) {
  const card = h("div", "map-popup-card");
  const current = weatherData ? weatherData.forecast.current : null;
  const temp = current ? Math.round(current.temperature_2m) : "--";
  const aqiCat = aqiData && aqiData.category ? aqiData.category : "N/A";
  const aqiCol = aqiData && aqiData.color ? aqiData.color : "#64748b";

  const head = h("h3");
  head.innerHTML = `<span>${c.name}</span> <span style="font-size:12px; font-weight:normal; color:var(--ink-soft);">${c.state}</span>`;
  card.append(head);

  const pTemp = h("p");
  pTemp.innerHTML = `🌡️ <b>Temperature:</b> ${temp}°C <span style="font-size:12px; color:var(--ink-soft);">(Feels like ${current ? Math.round(current.apparent_temperature || current.temperature_2m) : "--"}°C)</span>`;
  card.append(pTemp);

  const pHum = h("p");
  pHum.innerHTML = `💧 <b>Humidity:</b> ${current ? current.relative_humidity_2m : "--"}% &nbsp;|&nbsp; 💨 <b>Wind:</b> ${current ? num(current.wind_speed_10m) : "--"} km/h`;
  card.append(pHum);

  const pAqi = h("p");
  pAqi.innerHTML = `🍃 <b>AQI:</b> <span style="font-weight:700; color:${aqiCol};">${aqiCat}</span> <span style="font-size:12px; color:var(--ink-soft);">(PM2.5: ${aqiData && aqiData.pm2_5 ? Math.round(aqiData.pm2_5) : "--"} µg/m³)</span>`;
  card.append(pAqi);

  const hasAlert = alertData && alertData.alerts && alertData.alerts.length > 0;

  if (hasAlert) {
    const alertItem = alertData.alerts[0];
    const alertBox = h("div", "map-alert-box");

    const topRow = h("div", "map-alert-top");

    // Dynamic Severity Badge
    const titleLower = (alertItem.title || "").toLowerCase();
    let sevClass = "badge-warning";
    let sevText = "⚠️ Storm Alert";
    if (titleLower.includes("very heavy") || titleLower.includes("red alert") || titleLower.includes("cyclone") || titleLower.includes("flood")) {
      sevClass = "badge-severe";
      sevText = "🚨 Severe Warning";
    } else if (titleLower.includes("light ra") || titleLower.includes("advisory") || titleLower.includes("moderate rain")) {
      sevClass = "badge-advisory";
      sevText = "ℹ️ Weather Advisory";
    }
    const badge = h("span", `map-alert-badge ${sevClass}`, sevText);

    // Multi-Language Translation Toolbar
    const transBar = h("div", "map-trans-bar");
    const transButtons = {};
    MAP_LANGS.forEach((ml, idx) => {
      const btn = h("button", "trans-chip" + (idx === 0 ? " active" : ""), ml.label);
      btn.type = "button";
      btn.setAttribute("aria-label", `Translate alert to ${ml.name}`);
      btn.addEventListener("click", () => setAlertLang(ml.code, btn));
      transButtons[ml.code] = btn;
      transBar.append(btn);
    });

    topRow.append(badge, transBar);
    alertBox.append(topRow);

    const alertTextP = h("p", "map-alert-text", cleanAlertText(alertItem.title));
    alertBox.append(alertTextP);

    const validSpan = h("span", "map-alert-valid", `Valid until: ${alertItem.valid_until}`);
    alertBox.append(validSpan);

    card.append(alertBox);

    const transCache = { en: alertItem.title };
    let currentLangCode = "en";
    let currentAlertText = alertItem.title;

    // Attention-Grabbing WhatsApp Share Button (Compact 70% scale)
    const waAlert = h("a", "btn-whatsapp map-wa-btn");
    waAlert.target = "_blank";
    waAlert.rel = "noopener noreferrer";
    waAlert.innerHTML = iconSvg("whatsapp") + "<span>📲 WhatsApp</span>";

    function updateWaLink(text, lang) {
      const lbl = WA_LABELS[lang] || WA_LABELS.en;
      const waMsg = `🚨 *${lbl.title}*\n\n` +
        `📍 *${lbl.area}:* ${c.name}, ${c.state}\n` +
        `📢 *${lbl.warn}:* ${text}\n` +
        `⏳ *${lbl.valid}:* ${alertItem.valid_until}\n\n` +
        `📞 ${lbl.em}\n` +
        `🔗 WeatherGPT Live Map: https://weather-gpt-theta.vercel.app/map.html`;
      waAlert.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;
    }
    updateWaLink(alertItem.title, "en");

    // Audio Pronunciation (Listen to Alert)
    const btnListen = h("button", "map-util-btn");
    btnListen.type = "button";
    btnListen.innerHTML = iconSvg("speaker") + " <span>Listen</span>";
    btnListen.setAttribute("aria-label", "Listen to alert spoken aloud");

    let isSpeaking = false;
    btnListen.addEventListener("click", () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        alert("Speech synthesis is not supported on this browser.");
        return;
      }
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        btnListen.classList.remove("active");
        btnListen.innerHTML = iconSvg("speaker") + " <span>Listen</span>";
        return;
      }
      window.speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance(currentAlertText);
      const curL = MAP_LANGS.find(l => l.code === currentLangCode);
      ut.lang = curL ? curL.bcp : "en-IN";
      ut.rate = 0.95;
      ut.onend = () => {
        isSpeaking = false;
        btnListen.classList.remove("active");
        btnListen.innerHTML = iconSvg("speaker") + " <span>Listen</span>";
      };
      ut.onerror = () => {
        isSpeaking = false;
        btnListen.classList.remove("active");
        btnListen.innerHTML = iconSvg("speaker") + " <span>Listen</span>";
      };
      isSpeaking = true;
      btnListen.classList.add("active");
      btnListen.innerHTML = "<span>⏹️ Stop</span>";
      window.speechSynthesis.speak(ut);
    });

    // 1-Click Copy Alert
    const btnCopy = h("button", "map-util-btn");
    btnCopy.type = "button";
    btnCopy.innerHTML = iconSvg("copy") + " <span>Copy</span>";
    btnCopy.setAttribute("aria-label", "Copy alert text to clipboard");

    btnCopy.addEventListener("click", async () => {
      const lbl = WA_LABELS[currentLangCode] || WA_LABELS.en;
      const fullText = `🚨 ${lbl.title}: ${c.name}, ${c.state}\n` +
        `${lbl.warn}: ${currentAlertText}\n` +
        `Valid until: ${alertItem.valid_until}\n${lbl.em}`;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(fullText);
        } else {
          const ta = document.createElement("textarea");
          ta.value = fullText;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        const origHtml = btnCopy.innerHTML;
        btnCopy.innerHTML = "<span>✓ Copied</span>";
        btnCopy.style.borderColor = "#16a34a";
        btnCopy.style.color = "#16a34a";
        setTimeout(() => {
          btnCopy.innerHTML = origHtml;
          btnCopy.style.borderColor = "";
          btnCopy.style.color = "";
        }, 2000);
      } catch (err) {
        console.warn("Copy error", err);
      }
    });

    async function setAlertLang(lang, activeBtn) {
      Object.values(transButtons).forEach(b => b.classList.remove("active"));
      activeBtn.classList.add("active");
      currentLangCode = lang;

      if (lang === "en") {
        currentAlertText = transCache.en;
        alertTextP.textContent = cleanAlertText(transCache.en);
        updateWaLink(transCache.en, "en");
        return;
      }

      if (transCache[lang]) {
        currentAlertText = transCache[lang];
        alertTextP.textContent = cleanAlertText(transCache[lang]);
        updateWaLink(transCache[lang], lang);
        return;
      }

      const dictHit = matchAlertDict(alertItem.title, lang);
      if (dictHit) {
        transCache[lang] = dictHit;
        currentAlertText = dictHit;
        alertTextP.textContent = cleanAlertText(dictHit);
        updateWaLink(dictHit, lang);
        return;
      }

      alertTextP.textContent = "Translating alert…";
      const targetLang = MAP_LANGS.find(l => l.code === lang);
      const targetLangName = targetLang ? targetLang.name : "Hindi";
      try {
        const res = await api(`/api/translate?text=${encodeURIComponent(alertItem.title)}&language=${targetLangName}`);
        if (res && res.translated) {
          transCache[lang] = res.translated;
          currentAlertText = res.translated;
          alertTextP.textContent = cleanAlertText(res.translated);
          updateWaLink(res.translated, lang);
          return;
        }
      } catch (e) {
        console.warn("Translate API error:", e);
      }
      currentAlertText = alertItem.title;
      alertTextP.textContent = cleanAlertText(alertItem.title);
      updateWaLink(alertItem.title, "en");
    }

    const actionRow = h("div", "map-action-row");
    actionRow.append(waAlert, btnListen, btnCopy);

    const acts = h("div", "map-popup-actions");
    acts.append(actionRow);

    const askBtn = h("a", "map-ask-btn", `💬 Ask WeatherGPT about ${c.name}`);
    askBtn.href = `assistant.html?q=What%20is%20the%20weather%20and%20safety%20advisory%20for%20${encodeURIComponent(c.name)}%3F`;
    acts.append(askBtn);

    card.append(acts);
  } else {
    const noAlertP = h("p");
    noAlertP.style.color = "#16a34a";
    noAlertP.style.fontSize = "12.5px";
    noAlertP.style.margin = "8px 0";
    noAlertP.textContent = "✓ No unexpired SACHET alerts for this state.";
    card.append(noAlertP);

    const acts = h("div", "map-popup-actions");
    const askBtn = h("a", "map-ask-btn", `💬 Ask WeatherGPT about ${c.name}`);
    askBtn.href = `assistant.html?q=What%20is%20the%20weather%20and%20safety%20advisory%20for%20${encodeURIComponent(c.name)}%3F`;
    acts.append(askBtn);

    card.append(acts);
  }

  return card;
}

      marker.bindPopup(() => createMapPopup(c, weatherData, aqiData, alertData), {
        maxWidth: 340,
        minWidth: 260,
        autoPanPadding: [16, 16],
        className: "weather-map-popup",
      });
      markerGroup.addLayer(marker);
    } catch (e) {
      console.warn("Failed to load marker for", c.name, e);
    }
  }

  if (statusEl) statusEl.textContent = "Loading city weather markers…";
  for (const c of CITIES) {
    fetchAndRenderCity(c);
  }
  if (statusEl) statusEl.textContent = "Interactive map ready.";

  if (toggleRadar) {
    toggleRadar.addEventListener("click", () => {
      const active = toggleRadar.classList.toggle("active");
      if (radarLayer) {
        if (active) map.addLayer(radarLayer);
        else map.removeLayer(radarLayer);
      }
    });
  }

  if (toggleMarkers) {
    toggleMarkers.addEventListener("click", () => {
      const active = toggleMarkers.classList.toggle("active");
      if (active) map.addLayer(markerGroup);
      else map.removeLayer(markerGroup);
    });
  }

  async function jumpToCity(cityName) {
    if (!cityName) return;
    if (statusEl) statusEl.textContent = `Locating ${cityName}…`;
    try {
      const w = await getWeather(cityName);
      if (w && w.latitude && w.longitude) {
        map.flyTo([w.latitude, w.longitude], 10, { duration: 1.5 });
        fetchAndRenderCity({ name: w.place.split(",")[0], state: w.state || "", lat: w.latitude, lon: w.longitude });
        if (statusEl) statusEl.textContent = `Viewing ${w.place}`;
      }
    } catch (e) {
      if (statusEl) statusEl.textContent = `Could not find "${cityName}".`;
    }
  }

  if (btnGo && cityInput) {
    btnGo.addEventListener("click", () => jumpToCity(cityInput.value.trim()));
    cityInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        jumpToCity(cityInput.value.trim());
      }
    });
  }

  if (btnLocate) {
    btnLocate.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }
      if (statusEl) statusEl.textContent = "Finding your location…";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 11, { duration: 1.5 });
          if (statusEl) statusEl.textContent = "Centered on your location.";
        },
        (err) => {
          if (statusEl) statusEl.textContent = "Location permission denied.";
        }
      );
    });
  }
}

/* ---------------------------------------------------------------- boot */
function boot() {
  const menu = $(".menu"), nav = $("#nav");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
    });
  }
  initTheme();
  initNetworkStatus();
  initServiceWorker();
  const page = document.body.dataset.page;
  const inits = { home: initHome, forecast: initForecast, climate: initClimate, alerts: initAlerts, safety: initSafety, assistant: initAssistant, about: initAbout, map: initMap };
  if (inits[page]) inits[page]();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { dayClass, todayLine, alertSummary, rainLines, tempChart, renderRich, friendly, num, wmo, conditionOf, rangeBar, seasonChart, tempPhrase, resolveWeatherAtmosphere, setupPageAtmosphere };
} else {
  document.addEventListener("DOMContentLoaded", boot);
}