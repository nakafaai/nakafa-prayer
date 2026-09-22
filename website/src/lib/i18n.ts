import type { CalculationMethodId, MadhabId, PrayerId } from './prayer'

export const LANGUAGE_IDS = ['en', 'id'] as const

export type LanguageId = (typeof LANGUAGE_IDS)[number]

/** Prayer names exactly as the macOS app localizes them. */
export const PRAYER_NAMES: Record<LanguageId, Record<PrayerId, string>> = {
  en: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
  id: { fajr: 'Subuh', dhuhr: 'Zuhur', asr: 'Asar', maghrib: 'Magrib', isha: 'Isya' },
}

/** Calculation method names exactly as the macOS app localizes them. */
export const METHOD_NAMES: Record<LanguageId, Record<CalculationMethodId, string>> = {
  en: {
    muslimWorldLeague: 'Muslim World League',
    egyptian: 'Egyptian Survey',
    karachi: 'Karachi',
    ummAlQura: 'Umm al-Qura',
    dubai: 'Dubai',
    moonsightingCommittee: 'Moonsighting Committee',
    northAmerica: 'North America',
    kuwait: 'Kuwait',
    qatar: 'Qatar',
    singapore: 'Singapore, Malaysia, Indonesia',
    tehran: 'Tehran',
    turkey: 'Turkey',
  },
  id: {
    muslimWorldLeague: 'Liga Muslim Dunia',
    egyptian: 'Survei Mesir',
    karachi: 'Karachi',
    ummAlQura: 'Umm al-Qura',
    dubai: 'Dubai',
    moonsightingCommittee: 'Komite Pengamatan Bulan',
    northAmerica: 'Amerika Utara',
    kuwait: 'Kuwait',
    qatar: 'Qatar',
    singapore: 'Singapura, Malaysia, Indonesia',
    tehran: 'Teheran',
    turkey: 'Turki',
  },
}

/** Asr school names exactly as the macOS app localizes them. */
export const MADHAB_NAMES: Record<LanguageId, Record<MadhabId, string>> = {
  en: { shafi: 'Shafi', hanafi: 'Hanafi' },
  id: { shafi: 'Syafii', hanafi: 'Hanafi' },
}

export type Messages = {
  brand: string
  tagline: string
  prayerTimesFor: string
  nextPrayer: string
  currentPrayer: string
  inProgress: string
  todaySchedule: string
  weekSchedule: string
  today: string
  tomorrow: string
  statusPassed: string
  statusCurrent: string
  statusNext: string
  now: string
  remaining: string
  gregorianDate: string
  hijriDate: string
  dayColumn: string
  switchToDark: string
  switchToLight: string
  qibla: string
  qiblaHint: string
  location: string
  locationDevice: string
  locationCity: string
  locationApproximate: string
  locationApproximateHint: string
  unavailableTitle: string
  unavailableBody: string
  coordinates: string
  timeZone: string
  calculationMethod: string
  asrSchool: string
  calculation: string
  display: string
  settings: string
  settingsTitle: string
  settingsHint: string
  language: string
  appearance: string
  themeSystem: string
  themeLight: string
  themeDark: string
  timeFormat: string
  timeFormatSystem: string
  timeFormat12: string
  timeFormat24: string
  changeLocation: string
  useMyLocation: string
  useMyLocationHint: string
  locating: string
  locationDenied: string
  locationUnavailable: string
  locationUnsupported: string
  searchCity: string
  searchCityPlaceholder: string
  searchCityHint: string
  popularCities: string
  loadingCities: string
  showingMatches: string
  noCityResults: string
  manualCoordinates: string
  manualCoordinatesHint: string
  latitude: string
  longitude: string
  applyCoordinates: string
  invalidCoordinates: string
  close: string
  hoursShort: string
  minutesShort: string
  secondsShort: string
  privacyTitle: string
  privacyBody: string
  appTitle: string
  appBody: string
  appCta: string
  footerNote: string
  sourceCta: string
}

export const MESSAGES: Record<LanguageId, Messages> = {
  en: {
    brand: 'Nakafa Prayer',
    tagline: 'Prayer times, calculated on your device',
    prayerTimesFor: 'Prayer times in',
    nextPrayer: 'Next prayer',
    currentPrayer: 'Current prayer',
    inProgress: 'Time since',
    todaySchedule: 'Today',
    weekSchedule: 'Next seven days',
    today: 'Today',
    tomorrow: 'Tomorrow',
    statusPassed: 'Passed',
    statusCurrent: 'Now',
    statusNext: 'Next',
    now: 'Now',
    remaining: 'Remaining',
    gregorianDate: 'Date',
    hijriDate: 'Hijri',
    dayColumn: 'Day',
    switchToDark: 'Switch to dark theme',
    switchToLight: 'Switch to light theme',
    qibla: 'Qibla',
    qiblaHint: 'Direction from true north',
    location: 'Location',
    locationDevice: 'This device',
    locationCity: 'City',
    locationApproximate: 'Approximate',
    locationApproximateHint:
      'Times use this time zone. Set your exact location for precise times.',
    unavailableTitle: 'Prayer times are unavailable here',
    unavailableBody:
      'The sun does not reach the angles this method needs at this latitude on these dates. Pick another location or another calculation method.',
    coordinates: 'Coordinates',
    timeZone: 'Time zone',
    calculationMethod: 'Calculation method',
    asrSchool: 'Asr school',
    calculation: 'Calculation',
    display: 'Display',
    settings: 'Settings',
    settingsTitle: 'Settings',
    settingsHint: 'Everything is stored on this device only.',
    language: 'Language',
    appearance: 'Appearance',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    timeFormat: 'Time format',
    timeFormatSystem: 'System',
    timeFormat12: '12-hour',
    timeFormat24: '24-hour',
    changeLocation: 'Change location',
    useMyLocation: 'Use my location',
    useMyLocationHint: 'Your coordinates stay in this browser.',
    locating: 'Locating',
    locationDenied: 'Location access was denied. Pick a city instead.',
    locationUnavailable: 'Your location is unavailable right now. Pick a city instead.',
    locationUnsupported: 'This browser cannot share a location. Pick a city instead.',
    searchCity: 'City',
    searchCityPlaceholder: 'Search any city in the world',
    searchCityHint: 'Any city, in any country.',
    popularCities: 'Popular cities',
    loadingCities: 'Loading cities',
    showingMatches: 'Showing {shown} of {total} matches',
    noCityResults: 'No city matches that search. Enter its coordinates below instead.',
    manualCoordinates: 'Manual coordinates',
    manualCoordinatesHint: 'Decimal degrees, for example 52.52 and 13.405.',
    latitude: 'Latitude',
    longitude: 'Longitude',
    applyCoordinates: 'Apply coordinates',
    invalidCoordinates: 'Enter a latitude from -90 to 90 and a longitude from -180 to 180.',
    close: 'Close',
    hoursShort: 'h',
    minutesShort: 'min',
    secondsShort: 's',
    privacyTitle: 'Your location stays here',
    privacyBody:
      'Every prayer time is calculated inside this page. No coordinates are sent to a server, and the site has no account, no cookies for tracking and no analytics.',
    appTitle: 'Want reminders too?',
    appBody:
      'Nakafa Prayer is a menu bar app for macOS that keeps seven days of local notifications and an optional Focus Mode.',
    appCta: 'Get the macOS app',
    footerNote: 'Built by Nakafa. Prayer times calculated with adhan.',
    sourceCta: 'View the source',
  },
  id: {
    brand: 'Nakafa Prayer',
    tagline: 'Waktu sholat, dihitung di perangkatmu',
    prayerTimesFor: 'Waktu sholat di',
    nextPrayer: 'Sholat berikutnya',
    currentPrayer: 'Sholat saat ini',
    inProgress: 'Sudah berlalu',
    todaySchedule: 'Hari ini',
    weekSchedule: 'Tujuh hari ke depan',
    today: 'Hari ini',
    tomorrow: 'Besok',
    statusPassed: 'Lewat',
    statusCurrent: 'Sekarang',
    statusNext: 'Berikutnya',
    now: 'Sekarang',
    remaining: 'Sisa waktu',
    gregorianDate: 'Tanggal',
    hijriDate: 'Hijriah',
    dayColumn: 'Hari',
    switchToDark: 'Ganti ke tema gelap',
    switchToLight: 'Ganti ke tema terang',
    qibla: 'Kiblat',
    qiblaHint: 'Arah dari utara sebenarnya',
    location: 'Lokasi',
    locationDevice: 'Perangkat ini',
    locationCity: 'Kota',
    locationApproximate: 'Perkiraan',
    locationApproximateHint:
      'Waktu mengikuti zona waktu ini. Atur lokasi tepatmu untuk waktu yang presisi.',
    unavailableTitle: 'Waktu sholat tidak tersedia di sini',
    unavailableBody:
      'Matahari tidak mencapai sudut yang dibutuhkan metode ini pada lintang dan tanggal tersebut. Pilih lokasi atau metode perhitungan lain.',
    coordinates: 'Koordinat',
    timeZone: 'Zona waktu',
    calculationMethod: 'Metode perhitungan',
    asrSchool: 'Mazhab Asar',
    calculation: 'Perhitungan',
    display: 'Tampilan',
    settings: 'Pengaturan',
    settingsTitle: 'Pengaturan',
    settingsHint: 'Semua disimpan hanya di perangkat ini.',
    language: 'Bahasa',
    appearance: 'Tampilan',
    themeSystem: 'Sistem',
    themeLight: 'Terang',
    themeDark: 'Gelap',
    timeFormat: 'Format waktu',
    timeFormatSystem: 'Sistem',
    timeFormat12: '12 jam',
    timeFormat24: '24 jam',
    changeLocation: 'Ubah lokasi',
    useMyLocation: 'Pakai lokasiku',
    useMyLocationHint: 'Koordinatmu tetap di peramban ini.',
    locating: 'Mencari lokasi',
    locationDenied: 'Akses lokasi ditolak. Pilih kota saja.',
    locationUnavailable: 'Lokasi tidak tersedia saat ini. Pilih kota saja.',
    locationUnsupported: 'Peramban ini tidak bisa membagikan lokasi. Pilih kota saja.',
    searchCity: 'Kota',
    searchCityPlaceholder: 'Cari kota mana pun di dunia',
    searchCityHint: 'Kota apa pun, di negara mana pun.',
    popularCities: 'Kota populer',
    loadingCities: 'Memuat kota',
    showingMatches: 'Menampilkan {shown} dari {total} hasil',
    noCityResults: 'Tidak ada kota yang cocok. Masukkan koordinatnya di bawah.',
    manualCoordinates: 'Koordinat manual',
    manualCoordinatesHint: 'Derajat desimal, misalnya 52,52 dan 13,405.',
    latitude: 'Lintang',
    longitude: 'Bujur',
    applyCoordinates: 'Terapkan koordinat',
    invalidCoordinates: 'Masukkan lintang -90 sampai 90 dan bujur -180 sampai 180.',
    close: 'Tutup',
    hoursShort: 'j',
    minutesShort: 'mnt',
    secondsShort: 'dtk',
    privacyTitle: 'Lokasimu tetap di sini',
    privacyBody:
      'Semua waktu sholat dihitung di dalam halaman ini. Tidak ada koordinat yang dikirim ke server, dan situs ini tanpa akun, tanpa cookie pelacak, dan tanpa analitik.',
    appTitle: 'Mau pengingat juga?',
    appBody:
      'Nakafa Prayer adalah aplikasi menu bar macOS yang menyimpan notifikasi lokal tujuh hari dan Focus Mode opsional.',
    appCta: 'Unduh aplikasi macOS',
    footerNote: 'Dibuat oleh Nakafa. Waktu sholat dihitung dengan adhan.',
    sourceCta: 'Lihat kode sumber',
  },
}

/** Fills `{name}` placeholders in a message. */
export function formatMessage(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
