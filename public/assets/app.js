"use strict";
/* WeatherGPT frontend: shared helpers plus one init function per page. */

// Hosted (Vercel): the API lives on the same site under /api. Local development: the page is served on
// port 5500 (or opened as a file) and the backend runs on port 8000.
const LOCAL_DEV = typeof location !== "undefined" &&
  (location.protocol === "file:" || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port === "5500"));
// config.js can set window.WEATHERGPT_API to point a static host (such as GitHub Pages) at a backend elsewhere.
const CONFIGURED_API = (typeof window !== "undefined" && window.WEATHERGPT_API) ? String(window.WEATHERGPT_API).replace(/\/+$/, "") : "";
const API = CONFIGURED_API || (LOCAL_DEV ? "http://127.0.0.1:8000" : "");

const LANGS = [["English", "en-IN"], ["Hindi", "hi-IN"], ["Gujarati", "gu-IN"], ["Marathi", "mr-IN"], ["Bengali", "bn-IN"], ["Tamil", "ta-IN"]];
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
    waAlert.innerHTML = iconSvg("whatsapp") + "<span>Share on WhatsApp</span>";
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

/* ---------------------------------------------------------------- home */
async function initHome() {
  const input = $("#city"), form = $("#home-form"), live = $("#live"), quick = $("#quick"), qnote = $("#quick-note");
  input.value = myCity();

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

/* ---------------------------------------------------------------- alerts page */
async function initAlerts() {
  const city = $("#city"), st = $("#state"), out = $("#al-result"), stamp = $("#al-status"), form = $("#al-form");
  STATES.forEach((s) => st.append(new Option(s, s)));
  city.value = myCity();
  const remembered = load("state");
  if (remembered) setState(remembered);

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

/* ---------------------------------------------------------------- assistant page */
async function initAssistant() {
  const cityEl = $("#city"), roleEl = $("#role");
  const logEl = $("#log"), emptyEl = $("#empty"), chipsEl = $("#chips");
  const msgEl = $("#msg"), sendEl = $("#send"), micEl = $("#mic"), micStatus = $("#mic-status");
  const radios = [...document.querySelectorAll('input[name="lang"]')];
  let busy = false;

  const getLang = () => (radios.find((r) => r.checked) || radios[0] || { value: "English" }).value;
  const setLang = (v) => radios.forEach((r) => { r.checked = r.value === v; });

  cityEl.value = myCity();
  roleEl.value = load("role") || "general";
  setLang(load("lang") || "English");

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
  roleEl.addEventListener("change", () => { store("role", roleEl.value); if (!emptyEl.hidden) renderChips(); });
  cityEl.addEventListener("change", () => railToday());
  renderChips();
  railToday();

  function speak(text, code, btn) {
    if (!("speechSynthesis" in window)) return;
    const wasSpeaking = btn.dataset.speaking === "1";
    speechSynthesis.cancel();
    document.querySelectorAll("[data-speaking]").forEach((b) => { b.textContent = "Listen"; b.removeAttribute("data-speaking"); });
    if (wasSpeaking) return;
    const u = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, "").replace(/\*\*/g, ""));
    u.lang = code;
    u.onend = u.onerror = () => { btn.textContent = "Listen"; btn.removeAttribute("data-speaking"); };
    btn.textContent = "Stop"; btn.dataset.speaking = "1";
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
      const d = await api("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, city, language, role: roleEl.value }),
      }, city);
      bot.replaceChildren();
      bot.append(botHead());
      bot.append(buildAlerts(d.alerts, d.place.split(",")[0]));
      const lab = h("p", "section-title", "Explained by AI ");
      lab.append(h("span", null, `in ${language}, using only the forecast and alerts above`));
      bot.append(lab);
      const wrap = h("div", "answer-wrap"), ans = h("div", "answer");
      ans.lang = code.split("-")[0];
      ans.innerHTML = renderRich(d.answer);
      wrap.append(ans);
      wrap.append(h("p", "meta", `Weather from ${d.source}, ${d.fetched_at}, for ${d.place}.`));
      const acts = h("div", "actions");
      if ("speechSynthesis" in window) {
        const b = h("button", "linkbtn", "Listen"); b.type = "button";
        b.addEventListener("click", () => speak(d.answer, code, b));
        acts.append(b);
      }
      const cp = h("button", "linkbtn", "Copy"); cp.type = "button";
      cp.addEventListener("click", () => copyText(d.answer, cp));
      acts.append(cp);

      const wa = h("a", "linkbtn btn-whatsapp");
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.innerHTML = iconSvg("whatsapp") + "<span>Share on WhatsApp</span>";
      let waMsg = `🌦️ *WeatherGPT Update for ${d.place || city}*\n\n` +
        `${d.answer}\n\n`;
      if (d.alerts && d.alerts.alerts && d.alerts.alerts.length) {
        waMsg += `⚠️ *Official Alert:* ${d.alerts.alerts[0].title} (Valid until ${d.alerts.alerts[0].valid_until})\n\n`;
      }
      waMsg += `🔗 Checked on WeatherGPT (Smart India Hackathon 2026)`;
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
        secNumbers.append(chipWrap);
        body.append(secNumbers);

        // Section 2: Official Alerts Checked
        const secAlerts = h("div", "why-section");
        secAlerts.append(h("div", "why-label", "Official Government Alerts Fed"));
        const alertList = h("ul", "why-list");
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
    micEl.addEventListener("click", () => {
      if (rec) { rec.stop(); return; }
      rec = new SR();
      rec.lang = langCode(getLang());
      rec.interimResults = false;
      rec.onstart = () => {
        micEl.setAttribute("aria-pressed", "true"); micEl.setAttribute("aria-label", "Stop listening");
        if (micStatus) micStatus.textContent = "Listening. Speak your question.";
      };
      rec.onresult = (ev) => { msgEl.value = ev.results[0][0].transcript; msgEl.dispatchEvent(new Event("input")); msgEl.focus(); };
      rec.onend = rec.onerror = () => {
        rec = null; micEl.setAttribute("aria-pressed", "false"); micEl.setAttribute("aria-label", "Speak your question");
        if (micStatus) micStatus.textContent = "";
      };
      rec.start();
    });
  }

  const q = new URLSearchParams(location.search).get("q");
  if (q) ask(q);
}

/* ---------------------------------------------------------------- about page */
function initAbout() {
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
  const inits = { home: initHome, forecast: initForecast, climate: initClimate, alerts: initAlerts, safety: initSafety, assistant: initAssistant, about: initAbout };
  if (inits[page]) inits[page]();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { dayClass, todayLine, alertSummary, rainLines, tempChart, renderRich, friendly, num, wmo, conditionOf, rangeBar, seasonChart, tempPhrase };
} else {
  document.addEventListener("DOMContentLoaded", boot);
}