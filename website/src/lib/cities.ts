/** Countries offered in the location picker, named in both site languages. */
export const COUNTRIES = {
  ID: { en: 'Indonesia', id: 'Indonesia' },
  MY: { en: 'Malaysia', id: 'Malaysia' },
  SG: { en: 'Singapore', id: 'Singapura' },
  BN: { en: 'Brunei', id: 'Brunei' },
  SA: { en: 'Saudi Arabia', id: 'Arab Saudi' },
  AE: { en: 'United Arab Emirates', id: 'Uni Emirat Arab' },
  QA: { en: 'Qatar', id: 'Qatar' },
  KW: { en: 'Kuwait', id: 'Kuwait' },
  TR: { en: 'Turkey', id: 'Turki' },
  IR: { en: 'Iran', id: 'Iran' },
  JO: { en: 'Jordan', id: 'Yordania' },
  LB: { en: 'Lebanon', id: 'Lebanon' },
  EG: { en: 'Egypt', id: 'Mesir' },
  MA: { en: 'Morocco', id: 'Maroko' },
  DZ: { en: 'Algeria', id: 'Aljazair' },
  TN: { en: 'Tunisia', id: 'Tunisia' },
  SD: { en: 'Sudan', id: 'Sudan' },
  NG: { en: 'Nigeria', id: 'Nigeria' },
  KE: { en: 'Kenya', id: 'Kenya' },
  ZA: { en: 'South Africa', id: 'Afrika Selatan' },
  PK: { en: 'Pakistan', id: 'Pakistan' },
  IN: { en: 'India', id: 'India' },
  BD: { en: 'Bangladesh', id: 'Bangladesh' },
  LK: { en: 'Sri Lanka', id: 'Sri Lanka' },
  GB: { en: 'United Kingdom', id: 'Inggris' },
  FR: { en: 'France', id: 'Prancis' },
  DE: { en: 'Germany', id: 'Jerman' },
  NL: { en: 'Netherlands', id: 'Belanda' },
  BE: { en: 'Belgium', id: 'Belgia' },
  ES: { en: 'Spain', id: 'Spanyol' },
  IT: { en: 'Italy', id: 'Italia' },
  SE: { en: 'Sweden', id: 'Swedia' },
  AT: { en: 'Austria', id: 'Austria' },
  CH: { en: 'Switzerland', id: 'Swiss' },
  RU: { en: 'Russia', id: 'Rusia' },
  BA: { en: 'Bosnia and Herzegovina', id: 'Bosnia dan Herzegovina' },
  AL: { en: 'Albania', id: 'Albania' },
  US: { en: 'United States', id: 'Amerika Serikat' },
  CA: { en: 'Canada', id: 'Kanada' },
  BR: { en: 'Brazil', id: 'Brasil' },
  JP: { en: 'Japan', id: 'Jepang' },
  KR: { en: 'South Korea', id: 'Korea Selatan' },
  AU: { en: 'Australia', id: 'Australia' },
} as const

export type CountryCode = keyof typeof COUNTRIES

export type City = {
  id: string
  name: string
  country: CountryCode
  latitude: number
  longitude: number
  timeZone: string
}

/** City whose clock is the neutral fallback when no time zone matches. */
export const FALLBACK_CITY_ID = 'makkah'

export const CITIES: City[] = [
  { id: 'jakarta', name: 'Jakarta', country: 'ID', latitude: -6.2088, longitude: 106.8456, timeZone: 'Asia/Jakarta' },
  { id: 'surabaya', name: 'Surabaya', country: 'ID', latitude: -7.2575, longitude: 112.7521, timeZone: 'Asia/Jakarta' },
  { id: 'bandung', name: 'Bandung', country: 'ID', latitude: -6.9175, longitude: 107.6191, timeZone: 'Asia/Jakarta' },
  { id: 'medan', name: 'Medan', country: 'ID', latitude: 3.5952, longitude: 98.6722, timeZone: 'Asia/Jakarta' },
  { id: 'semarang', name: 'Semarang', country: 'ID', latitude: -6.9667, longitude: 110.4167, timeZone: 'Asia/Jakarta' },
  { id: 'yogyakarta', name: 'Yogyakarta', country: 'ID', latitude: -7.7956, longitude: 110.3695, timeZone: 'Asia/Jakarta' },
  { id: 'palembang', name: 'Palembang', country: 'ID', latitude: -2.9761, longitude: 104.7754, timeZone: 'Asia/Jakarta' },
  { id: 'makassar', name: 'Makassar', country: 'ID', latitude: -5.1477, longitude: 119.4327, timeZone: 'Asia/Makassar' },
  { id: 'balikpapan', name: 'Balikpapan', country: 'ID', latitude: -1.2379, longitude: 116.8529, timeZone: 'Asia/Makassar' },
  { id: 'denpasar', name: 'Denpasar', country: 'ID', latitude: -8.6705, longitude: 115.2126, timeZone: 'Asia/Makassar' },
  { id: 'jayapura', name: 'Jayapura', country: 'ID', latitude: -2.5916, longitude: 140.669, timeZone: 'Asia/Jayapura' },
  { id: 'kuala-lumpur', name: 'Kuala Lumpur', country: 'MY', latitude: 3.139, longitude: 101.6869, timeZone: 'Asia/Kuala_Lumpur' },
  { id: 'singapore', name: 'Singapore', country: 'SG', latitude: 1.3521, longitude: 103.8198, timeZone: 'Asia/Singapore' },
  { id: 'bandar-seri-begawan', name: 'Bandar Seri Begawan', country: 'BN', latitude: 4.9031, longitude: 114.9398, timeZone: 'Asia/Brunei' },
  { id: 'makkah', name: 'Makkah', country: 'SA', latitude: 21.4225, longitude: 39.8262, timeZone: 'Asia/Riyadh' },
  { id: 'madinah', name: 'Madinah', country: 'SA', latitude: 24.5247, longitude: 39.5692, timeZone: 'Asia/Riyadh' },
  { id: 'riyadh', name: 'Riyadh', country: 'SA', latitude: 24.7136, longitude: 46.6753, timeZone: 'Asia/Riyadh' },
  { id: 'jeddah', name: 'Jeddah', country: 'SA', latitude: 21.4858, longitude: 39.1925, timeZone: 'Asia/Riyadh' },
  { id: 'dubai', name: 'Dubai', country: 'AE', latitude: 25.2048, longitude: 55.2708, timeZone: 'Asia/Dubai' },
  { id: 'abu-dhabi', name: 'Abu Dhabi', country: 'AE', latitude: 24.4539, longitude: 54.3773, timeZone: 'Asia/Dubai' },
  { id: 'doha', name: 'Doha', country: 'QA', latitude: 25.2854, longitude: 51.531, timeZone: 'Asia/Qatar' },
  { id: 'kuwait-city', name: 'Kuwait City', country: 'KW', latitude: 29.3759, longitude: 47.9774, timeZone: 'Asia/Kuwait' },
  { id: 'istanbul', name: 'Istanbul', country: 'TR', latitude: 41.0082, longitude: 28.9784, timeZone: 'Europe/Istanbul' },
  { id: 'ankara', name: 'Ankara', country: 'TR', latitude: 39.9334, longitude: 32.8597, timeZone: 'Europe/Istanbul' },
  { id: 'tehran', name: 'Tehran', country: 'IR', latitude: 35.6892, longitude: 51.389, timeZone: 'Asia/Tehran' },
  { id: 'amman', name: 'Amman', country: 'JO', latitude: 31.9539, longitude: 35.9106, timeZone: 'Asia/Amman' },
  { id: 'beirut', name: 'Beirut', country: 'LB', latitude: 33.8938, longitude: 35.5018, timeZone: 'Asia/Beirut' },
  { id: 'cairo', name: 'Cairo', country: 'EG', latitude: 30.0444, longitude: 31.2357, timeZone: 'Africa/Cairo' },
  { id: 'casablanca', name: 'Casablanca', country: 'MA', latitude: 33.5731, longitude: -7.5898, timeZone: 'Africa/Casablanca' },
  { id: 'rabat', name: 'Rabat', country: 'MA', latitude: 34.0209, longitude: -6.8416, timeZone: 'Africa/Casablanca' },
  { id: 'algiers', name: 'Algiers', country: 'DZ', latitude: 36.7538, longitude: 3.0588, timeZone: 'Africa/Algiers' },
  { id: 'tunis', name: 'Tunis', country: 'TN', latitude: 36.8065, longitude: 10.1815, timeZone: 'Africa/Tunis' },
  { id: 'khartoum', name: 'Khartoum', country: 'SD', latitude: 15.5007, longitude: 32.5599, timeZone: 'Africa/Khartoum' },
  { id: 'lagos', name: 'Lagos', country: 'NG', latitude: 6.5244, longitude: 3.3792, timeZone: 'Africa/Lagos' },
  { id: 'kano', name: 'Kano', country: 'NG', latitude: 12.0022, longitude: 8.592, timeZone: 'Africa/Lagos' },
  { id: 'nairobi', name: 'Nairobi', country: 'KE', latitude: -1.2921, longitude: 36.8219, timeZone: 'Africa/Nairobi' },
  { id: 'johannesburg', name: 'Johannesburg', country: 'ZA', latitude: -26.2041, longitude: 28.0473, timeZone: 'Africa/Johannesburg' },
  { id: 'cape-town', name: 'Cape Town', country: 'ZA', latitude: -33.9249, longitude: 18.4241, timeZone: 'Africa/Johannesburg' },
  { id: 'karachi', name: 'Karachi', country: 'PK', latitude: 24.8607, longitude: 67.0011, timeZone: 'Asia/Karachi' },
  { id: 'lahore', name: 'Lahore', country: 'PK', latitude: 31.5204, longitude: 74.3587, timeZone: 'Asia/Karachi' },
  { id: 'islamabad', name: 'Islamabad', country: 'PK', latitude: 33.6844, longitude: 73.0479, timeZone: 'Asia/Karachi' },
  { id: 'delhi', name: 'Delhi', country: 'IN', latitude: 28.6139, longitude: 77.209, timeZone: 'Asia/Kolkata' },
  { id: 'mumbai', name: 'Mumbai', country: 'IN', latitude: 19.076, longitude: 72.8777, timeZone: 'Asia/Kolkata' },
  { id: 'hyderabad', name: 'Hyderabad', country: 'IN', latitude: 17.385, longitude: 78.4867, timeZone: 'Asia/Kolkata' },
  { id: 'kolkata', name: 'Kolkata', country: 'IN', latitude: 22.5726, longitude: 88.3639, timeZone: 'Asia/Kolkata' },
  { id: 'dhaka', name: 'Dhaka', country: 'BD', latitude: 23.8103, longitude: 90.4125, timeZone: 'Asia/Dhaka' },
  { id: 'colombo', name: 'Colombo', country: 'LK', latitude: 6.9271, longitude: 79.8612, timeZone: 'Asia/Colombo' },
  { id: 'london', name: 'London', country: 'GB', latitude: 51.5074, longitude: -0.1278, timeZone: 'Europe/London' },
  { id: 'birmingham', name: 'Birmingham', country: 'GB', latitude: 52.4862, longitude: -1.8904, timeZone: 'Europe/London' },
  { id: 'paris', name: 'Paris', country: 'FR', latitude: 48.8566, longitude: 2.3522, timeZone: 'Europe/Paris' },
  { id: 'marseille', name: 'Marseille', country: 'FR', latitude: 43.2965, longitude: 5.3698, timeZone: 'Europe/Paris' },
  { id: 'berlin', name: 'Berlin', country: 'DE', latitude: 52.52, longitude: 13.405, timeZone: 'Europe/Berlin' },
  { id: 'frankfurt', name: 'Frankfurt', country: 'DE', latitude: 50.1109, longitude: 8.6821, timeZone: 'Europe/Berlin' },
  { id: 'munich', name: 'Munich', country: 'DE', latitude: 48.1351, longitude: 11.582, timeZone: 'Europe/Berlin' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'NL', latitude: 52.3676, longitude: 4.9041, timeZone: 'Europe/Amsterdam' },
  { id: 'brussels', name: 'Brussels', country: 'BE', latitude: 50.8503, longitude: 4.3517, timeZone: 'Europe/Brussels' },
  { id: 'madrid', name: 'Madrid', country: 'ES', latitude: 40.4168, longitude: -3.7038, timeZone: 'Europe/Madrid' },
  { id: 'milan', name: 'Milan', country: 'IT', latitude: 45.4642, longitude: 9.19, timeZone: 'Europe/Rome' },
  { id: 'rome', name: 'Rome', country: 'IT', latitude: 41.9028, longitude: 12.4964, timeZone: 'Europe/Rome' },
  { id: 'stockholm', name: 'Stockholm', country: 'SE', latitude: 59.3293, longitude: 18.0686, timeZone: 'Europe/Stockholm' },
  { id: 'vienna', name: 'Vienna', country: 'AT', latitude: 48.2082, longitude: 16.3738, timeZone: 'Europe/Vienna' },
  { id: 'zurich', name: 'Zurich', country: 'CH', latitude: 47.3769, longitude: 8.5417, timeZone: 'Europe/Zurich' },
  { id: 'moscow', name: 'Moscow', country: 'RU', latitude: 55.7558, longitude: 37.6173, timeZone: 'Europe/Moscow' },
  { id: 'kazan', name: 'Kazan', country: 'RU', latitude: 55.8304, longitude: 49.0661, timeZone: 'Europe/Moscow' },
  { id: 'sarajevo', name: 'Sarajevo', country: 'BA', latitude: 43.8563, longitude: 18.4131, timeZone: 'Europe/Sarajevo' },
  { id: 'tirana', name: 'Tirana', country: 'AL', latitude: 41.3275, longitude: 19.8187, timeZone: 'Europe/Tirane' },
  { id: 'new-york', name: 'New York', country: 'US', latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' },
  { id: 'chicago', name: 'Chicago', country: 'US', latitude: 41.8781, longitude: -87.6298, timeZone: 'America/Chicago' },
  { id: 'houston', name: 'Houston', country: 'US', latitude: 29.7604, longitude: -95.3698, timeZone: 'America/Chicago' },
  { id: 'detroit', name: 'Detroit', country: 'US', latitude: 42.3314, longitude: -83.0458, timeZone: 'America/Detroit' },
  { id: 'los-angeles', name: 'Los Angeles', country: 'US', latitude: 34.0522, longitude: -118.2437, timeZone: 'America/Los_Angeles' },
  { id: 'toronto', name: 'Toronto', country: 'CA', latitude: 43.6532, longitude: -79.3832, timeZone: 'America/Toronto' },
  { id: 'sao-paulo', name: 'Sao Paulo', country: 'BR', latitude: -23.5505, longitude: -46.6333, timeZone: 'America/Sao_Paulo' },
  { id: 'tokyo', name: 'Tokyo', country: 'JP', latitude: 35.6762, longitude: 139.6503, timeZone: 'Asia/Tokyo' },
  { id: 'seoul', name: 'Seoul', country: 'KR', latitude: 37.5665, longitude: 126.978, timeZone: 'Asia/Seoul' },
  { id: 'sydney', name: 'Sydney', country: 'AU', latitude: -33.8688, longitude: 151.2093, timeZone: 'Australia/Sydney' },
  { id: 'melbourne', name: 'Melbourne', country: 'AU', latitude: -37.8136, longitude: 144.9631, timeZone: 'Australia/Melbourne' },
  { id: 'perth', name: 'Perth', country: 'AU', latitude: -31.9505, longitude: 115.8605, timeZone: 'Australia/Perth' },
]

export function findCity(id: string | undefined): City | undefined {
  return id ? CITIES.find((city) => city.id === id) : undefined
}

/**
 * Picks the default location for a device time zone.
 *
 * An exact clock match wins. Otherwise a city sharing the same current UTC
 * offset keeps the displayed times on the right clock, and the site asks for a
 * precise location.
 */
export function defaultCityForTimeZone(timeZone: string): City {
  const exact = CITIES.find((city) => city.timeZone === timeZone)
  if (exact) {
    return exact
  }

  const now = new Date()
  const offset = utcOffsetMinutes(timeZone, now)
  const sameOffset = CITIES.find((city) => utcOffsetMinutes(city.timeZone, now) === offset)

  return sameOffset ?? findCity(FALLBACK_CITY_ID) ?? CITIES[0]
}

/** Offset from UTC in minutes for a time zone at a given instant. */
export function utcOffsetMinutes(timeZone: string, instant: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = formatter.formatToParts(instant)
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0')
  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour'),
    read('minute'),
    read('second'),
  )

  return Math.round((asUtc - instant.getTime()) / 60000)
}

/**
 * Nearest listed city to a point, within `maxDistanceKm`.
 *
 * Used to adopt the right clock when someone types coordinates by hand.
 */
export function nearestCity(
  latitude: number,
  longitude: number,
  maxDistanceKm = 500,
): City | undefined {
  let nearest: City | undefined
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const city of CITIES) {
    const distance = haversineKm(latitude, longitude, city.latitude, city.longitude)
    if (distance < nearestDistance) {
      nearest = city
      nearestDistance = distance
    }
  }

  return nearestDistance <= maxDistanceKm ? nearest : undefined
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusKm = 6371
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2

  return 2 * earthRadiusKm * Math.asin(Math.min(Math.sqrt(a), 1))
}

/** Display name for a city, localized by country name. */
export function cityLabel(city: City, language: 'en' | 'id'): string {
  return `${city.name}, ${COUNTRIES[city.country][language]}`
}
