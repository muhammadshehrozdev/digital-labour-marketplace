// ONE source of truth for trade categories and skills (audit M1-16, M2-14).
// The frontend reads it from GET /api/meta/taxonomy; the backend validates against it,
// and the rule-based skill extractor (services/skillExtractor) matches its terms.
//
// Version 1 (Batch 1, 9 Nov 2026). Category list approved by the team for Phase 4 with one
// change (decision D-012): "Cleaning & Shifting" is split — cleaning belongs to Domestic Work,
// and moving is its own category "Moving & Loading". Skills come from the old profiler's rules
// (the team's earlier work) plus domestic work and moving; the team reviews them with real data.
//
// Ids are stable slugs: labels may change later without breaking saved data.
// iscoCode (ISCO-08) stays null until checked against the official ILO list (rule in C5).
//
// Terms per skill (matched as whole tokens or whole token sequences, never substrings):
//   strong: clear trade words. One is enough.
//   weak:   everyday words that are also trade words ("fan", "tap", "table"). A weak term
//           counts only if a strong term of the SAME category is in the text (fixes M2-6).
// Write terms in lower case; Urdu terms in Urdu script. normalize.js is applied to them too.

export const TAXONOMY_VERSION = '2026-11-09-v1';

export const CATEGORIES = Object.freeze([
  { id: 'electrical_solar', label: 'Electrical & Solar', occupation: 'Electrician', iscoCode: null },
  { id: 'plumbing_sanitary', label: 'Plumbing & Sanitary', occupation: 'Plumber', iscoCode: null },
  { id: 'construction_masonry', label: 'Construction & Masonry', occupation: 'Mason', iscoCode: null },
  { id: 'carpentry_woodwork', label: 'Carpentry & Woodwork', occupation: 'Carpenter', iscoCode: null },
  { id: 'painting_renovation', label: 'Painting & Renovation', occupation: 'Painter', iscoCode: null },
  { id: 'ac_appliance_repair', label: 'AC & Appliance Repair', occupation: 'AC technician', iscoCode: null },
  { id: 'home_maintenance', label: 'Home Maintenance', occupation: 'Handyman', iscoCode: null },
  { id: 'domestic_work', label: 'Domestic Work', occupation: 'Domestic worker', iscoCode: null },
  { id: 'moving_loading', label: 'Moving & Loading', occupation: 'Mover and loader', iscoCode: null },
]);

const skill = (id, category, name, strong, weak = []) => ({ id, category, name, strong, weak });

export const SKILLS = Object.freeze([
  // ---------------- Electrical & Solar
  skill('elec_general', 'electrical_solar', 'General electrical work',
    ['electrician', 'electrical', 'bijli ka kaam', 'bijli ka mistri', 'بجلی', 'الیکٹریشن', 'الیکٹریکل'], ['bijli']),
  skill('elec_wiring', 'electrical_solar', 'House wiring',
    ['wiring', 'house wiring', 'wire fitting', 'وائرنگ'], ['wire', 'taar', 'تار']),
  skill('elec_solar', 'electrical_solar', 'Solar panel installation',
    ['solar', 'solar panel', 'solar system', 'net metering', 'سولر'], ['inverter', 'panel', 'انورٹر', 'پینل']),
  skill('elec_ups', 'electrical_solar', 'UPS and battery setup',
    ['ups installation', 'ups wiring', 'یو پی ایس'], ['ups', 'battery', 'بیٹری']),
  skill('elec_db', 'electrical_solar', 'DB board and breakers',
    ['db board', 'distribution board', 'breaker', 'mcb', 'circuit breaker', 'short circuit', 'بریکر', 'شارٹ سرکٹ'], ['fuse']),
  skill('elec_fittings', 'electrical_solar', 'Switches, sockets, lights and fans',
    ['switchboard', 'switch board', 'ceiling fan', 'fan fitting', 'light fitting', 'pankha', 'پنکھا', 'سوئچ بورڈ'],
    ['switch', 'socket', 'light', 'fan', 'bulb', 'led', 'holder', 'plug', 'لائٹ', 'بلب', 'سوئچ']),
  skill('elec_generator', 'electrical_solar', 'Generator changeover',
    ['generator', 'changeover', 'جنریٹر']),
  skill('elec_earthing', 'electrical_solar', 'Earthing and safety testing',
    ['earthing', 'grounding', 'ارتھنگ']),
  skill('elec_3phase', 'electrical_solar', 'Three-phase wiring',
    ['3 phase', 'three phase', 'تھری فیز']),

  // ---------------- Plumbing & Sanitary
  skill('plumb_general', 'plumbing_sanitary', 'General plumbing work',
    ['plumber', 'plumbing', 'پلمبر', 'پلمبنگ']),
  skill('plumb_pipe', 'plumbing_sanitary', 'PPRC and uPVC pipe fitting',
    ['pprc', 'upvc', 'pipe fitting', 'pipe line', 'pipeline', 'پائپ فٹنگ'], ['pipe', 'پائپ']),
  skill('plumb_leak', 'plumbing_sanitary', 'Water leak repair',
    ['leakage', 'seepage', 'leak repair', 'لیکج'], ['leak', 'لیک']),
  skill('plumb_fixtures', 'plumbing_sanitary', 'Bathroom and sanitary fittings',
    ['commode', 'wash basin', 'sanitary', 'sanitary fitting', 'tooti', 'ٹونٹی', 'کموڈ'],
    ['tap', 'sink', 'basin', 'shower', 'bathroom', 'washroom', 'باتھ روم', 'واش روم', 'سنک']),
  skill('plumb_geyser', 'plumbing_sanitary', 'Geyser installation',
    ['geyser', 'water heater', 'گیزر']),
  skill('plumb_pump', 'plumbing_sanitary', 'Water pump and tank',
    ['water pump', 'pressure motor', 'motor fitting', 'water tank', 'tanki', 'ٹینکی', 'واٹر پمپ'], ['pump', 'motor', 'پمپ', 'موٹر']),
  skill('plumb_drain', 'plumbing_sanitary', 'Drain and sewerage unblocking',
    ['sewerage', 'gatar', 'drain cleaning', 'drain blockage', 'سیوریج', 'گٹر'], ['drain', 'نالی']),

  // ---------------- Construction & Masonry
  skill('mason_general', 'construction_masonry', 'General masonry work',
    ['mason', 'masonry', 'raj mistri', 'راج مستری'], ['mistri', 'مستری']),
  skill('mason_brick', 'construction_masonry', 'Brickwork',
    ['brickwork', 'brick work', 'eent', 'chinai', 'اینٹ', 'چنائی'], ['brick', 'wall', 'deewar', 'دیوار']),
  skill('mason_plaster', 'construction_masonry', 'Wall and ceiling plaster',
    ['plaster', 'plastering', 'پلستر'], ['cement', 'سیمنٹ']),
  skill('mason_tile', 'construction_masonry', 'Tile and marble flooring',
    ['tile', 'tiling', 'tile fixing', 'marble', 'granite', 'ٹائل', 'ماربل'], ['farsh', 'floor', 'فرش']),
  skill('mason_concrete', 'construction_masonry', 'Concrete, roof slab and foundation',
    ['concrete', 'lanter', 'lintel', 'roof slab', 'کنکریٹ', 'لینٹر'], ['slab', 'foundation']),
  skill('mason_waterproof', 'construction_masonry', 'Roof waterproofing',
    ['waterproofing', 'roof waterproofing', 'damp proofing'], ['roof', 'chhat', 'چھت']),

  // ---------------- Carpentry & Woodwork
  skill('carp_general', 'carpentry_woodwork', 'General carpentry work',
    ['carpenter', 'carpentry', 'tarkhan', 'woodwork', 'wood work', 'ترکھان', 'کارپینٹر'], ['wood', 'lakri', 'لکڑی']),
  skill('carp_cabinets', 'carpentry_woodwork', 'Wardrobes and kitchen cabinets',
    ['kitchen cabinet', 'cabinet', 'wardrobe', 'almari', 'cupboard', 'mdf', 'plywood', 'الماری']),
  skill('carp_doors', 'carpentry_woodwork', 'Door and window fitting',
    ['door fitting', 'window fitting', 'door frame', 'chokhat', 'چوکھٹ'], ['door', 'window', 'darwaza', 'khirki', 'دروازہ', 'کھڑکی']),
  skill('carp_locks', 'carpentry_woodwork', 'Door locks and latches',
    ['door lock', 'lock fitting', 'kundi', 'latch', 'کنڈی'], ['lock', 'تالا']),
  skill('carp_furniture', 'carpentry_woodwork', 'Furniture making and repair',
    ['furniture', 'furniture repair', 'فرنیچر'], ['bed', 'table', 'chair', 'sofa', 'بیڈ', 'میز', 'کرسی', 'صوفہ']),
  skill('carp_polish', 'carpentry_woodwork', 'Wood polish and laminate',
    ['wood polish', 'laminate', 'mica'], ['polish', 'پالش']),

  // ---------------- Painting & Renovation
  skill('paint_general', 'painting_renovation', 'General painting work',
    ['painter', 'painting', 'rang saaz', 'پینٹر', 'پینٹنگ', 'رنگ ساز']),
  skill('paint_interior', 'painting_renovation', 'Interior emulsion and distemper',
    ['paint', 'emulsion', 'distemper', 'safaidi', 'wall paint', 'سفیدی', 'ڈسٹمپر', 'پینٹ'], ['rang', 'رنگ']),
  skill('paint_exterior', 'painting_renovation', 'Exterior weather coating',
    ['weather shield', 'weathershield', 'exterior paint', 'ویدر شیلڈ']),
  skill('paint_putty', 'painting_renovation', 'Wall putty and primer',
    ['putty', 'wall putty', 'primer', 'regmar', 'وال پٹی', 'پرائمر', 'ریگمار'], ['پٹی']),
  skill('paint_texture', 'painting_renovation', 'Texture and wallpaper',
    ['texture', 'wallpaper', 'وال پیپر', 'ٹیکسچر']),

  // ---------------- AC & Appliance Repair
  skill('ac_general', 'ac_appliance_repair', 'AC repair (general)',
    ['ac', 'ac technician', 'ac mechanic', 'hvac', 'refrigeration', 'اے سی']),
  skill('ac_install', 'ac_appliance_repair', 'Split and inverter AC installation',
    ['ac installation', 'ac fitting', 'split ac', 'inverter ac', 'air conditioner', 'سپلٹ']),
  skill('ac_gas', 'ac_appliance_repair', 'AC gas charging',
    ['gas charging', 'ac gas', 'gas refill', 'gas filling', 'r22', 'r410'], ['cooling', 'کولنگ', 'گیس']),
  skill('ac_service', 'ac_appliance_repair', 'AC service and chemical wash',
    ['ac service', 'ac servicing', 'chemical wash', 'اے سی سروس'], ['service', 'blower']),
  skill('ac_fridge', 'ac_appliance_repair', 'Fridge and freezer repair',
    ['fridge', 'refrigerator', 'freezer', 'deep freezer', 'compressor', 'فریج', 'فریزر', 'کمپریسر']),
  skill('ac_washing', 'ac_appliance_repair', 'Washing machine repair',
    ['washing machine', 'واشنگ مشین'], ['spinner', 'dryer']),

  // ---------------- Home Maintenance
  skill('home_general', 'home_maintenance', 'General home repairs',
    ['handyman', 'home repair', 'house repair', 'marammat', 'مرمت'], ['repair', 'fix', 'fixing']),
  skill('home_fixtures', 'home_maintenance', 'Curtain rods, shelves and wall fixtures',
    ['curtain rod', 'shelf fitting', 'wall shelf', 'parday ki rod', 'پردے کی راڈ'], ['shelf', 'curtain', 'drill']),

  // ---------------- Domestic Work (includes cleaning, D-012)
  skill('dom_general', 'domestic_work', 'Domestic work (general)',
    ['maid', 'domestic worker', 'house maid', 'kaam wali', 'gharelu kaam', 'گھریلو کام'], ['maasi', 'masi', 'ماسی']),
  skill('dom_cleaning', 'domestic_work', 'House cleaning',
    ['house cleaning', 'ghar ki safai', 'safai', 'jharu pocha', 'jharu', 'pocha', 'صفائی', 'جھاڑو', 'پوچا'], ['cleaning', 'clean']),
  skill('dom_cooking', 'domestic_work', 'Cooking',
    ['cook', 'cooking', 'khana banana', 'khana pakana', 'bawarchi', 'chef', 'کھانا پکانا', 'کھانا بنانا', 'باورچی'], ['khana', 'کھانا']),
  skill('dom_laundry', 'domestic_work', 'Washing and ironing clothes',
    ['laundry', 'ironing', 'istri', 'kapray dhona', 'kapre dhona', 'کپڑے دھونا', 'استری']),
  skill('dom_childcare', 'domestic_work', 'Child care',
    ['babysitting', 'babysitter', 'child care', 'childcare', 'nanny', 'bachon ki dekh bhaal'], ['bachon', 'bache']),
  skill('dom_eldercare', 'domestic_work', 'Elder and patient care',
    ['elder care', 'patient care', 'buzurgon ki dekh bhaal', 'مریض کی دیکھ بھال']),

  // ---------------- Moving & Loading (D-012)
  skill('move_shifting', 'moving_loading', 'House shifting',
    ['house shifting', 'ghar shifting', 'shifting', 'movers', 'samaan shifting', 'شفٹنگ'], ['move', 'moving']),
  skill('move_loading', 'moving_loading', 'Loading and unloading',
    ['loading', 'unloading', 'palledari', 'لوڈنگ'], ['samaan', 'سامان']),
  skill('move_packing', 'moving_loading', 'Packing goods for moving',
    ['packing', 'furniture packing', 'پیکنگ'], ['boxes']),
]);

// Display names in Urdu and Roman Urdu (Batch 3, D-019). Draft translations, to be checked by a
// team member who reads Urdu (docs/i18n/REVIEW.md). Only the names shown on screen: the matching
// terms above are unchanged, so extraction results and TAXONOMY_VERSION do not change.
// Categories: [label, occupation]. Skills: name.
export const DISPLAY_NAMES = Object.freeze({
  categories: {
    electrical_solar: { ur: ['بجلی اور سولر', 'الیکٹریشن'], 'ur-Latn': ['Bijli aur Solar', 'Electrician'] },
    plumbing_sanitary: { ur: ['پلمبنگ اور سینیٹری', 'پلمبر'], 'ur-Latn': ['Plumbing aur Sanitary', 'Plumber'] },
    construction_masonry: { ur: ['تعمیر اور مستری کا کام', 'راج مستری'], 'ur-Latn': ['Tameer aur Mistri ka kaam', 'Raj mistri'] },
    carpentry_woodwork: { ur: ['کارپینٹری اور لکڑی کا کام', 'کارپینٹر (ترکھان)'], 'ur-Latn': ['Carpentry aur Lakri ka kaam', 'Carpenter (tarkhan)'] },
    painting_renovation: { ur: ['رنگ و روغن اور مرمت', 'پینٹر'], 'ur-Latn': ['Rang o Rogan aur Marammat', 'Painter'] },
    ac_appliance_repair: { ur: ['اے سی اور گھریلو مشینوں کی مرمت', 'اے سی ٹیکنیشن'], 'ur-Latn': ['AC aur Gharelu Machinon ki Marammat', 'AC technician'] },
    home_maintenance: { ur: ['گھر کی مرمت', 'مرمت کا کاریگر'], 'ur-Latn': ['Ghar ki Marammat', 'Marammat ka karigar'] },
    domestic_work: { ur: ['گھریلو کام', 'گھریلو ملازم'], 'ur-Latn': ['Gharelu Kaam', 'Gharelu mulazim'] },
    moving_loading: { ur: ['شفٹنگ اور لوڈنگ', 'شفٹنگ اور لوڈنگ کا مزدور'], 'ur-Latn': ['Shifting aur Loading', 'Shifting aur loading mazdoor'] },
  },
  skills: {
    elec_general: { ur: 'بجلی کا عام کام', 'ur-Latn': 'Bijli ka aam kaam' },
    elec_wiring: { ur: 'گھر کی وائرنگ', 'ur-Latn': 'Ghar ki wiring' },
    elec_solar: { ur: 'سولر پینل لگانا', 'ur-Latn': 'Solar panel lagana' },
    elec_ups: { ur: 'یو پی ایس اور بیٹری لگانا', 'ur-Latn': 'UPS aur battery lagana' },
    elec_db: { ur: 'ڈی بی بورڈ اور بریکر', 'ur-Latn': 'DB board aur breaker' },
    elec_fittings: { ur: 'سوئچ، ساکٹ، لائٹ اور پنکھے', 'ur-Latn': 'Switch, socket, light aur pankhay' },
    elec_generator: { ur: 'جنریٹر چینج اوور', 'ur-Latn': 'Generator changeover' },
    elec_earthing: { ur: 'ارتھنگ اور حفاظتی جانچ', 'ur-Latn': 'Earthing aur hifazati jaanch' },
    elec_3phase: { ur: 'تھری فیز وائرنگ', 'ur-Latn': 'Three phase wiring' },
    plumb_general: { ur: 'پلمبنگ کا عام کام', 'ur-Latn': 'Plumbing ka aam kaam' },
    plumb_pipe: { ur: 'پی پی آر سی اور یو پی وی سی پائپ فٹنگ', 'ur-Latn': 'PPRC aur uPVC pipe fitting' },
    plumb_leak: { ur: 'پانی کی لیکج ٹھیک کرنا', 'ur-Latn': 'Paani ki leakage theek karna' },
    plumb_fixtures: { ur: 'باتھ روم اور سینیٹری فٹنگ', 'ur-Latn': 'Bathroom aur sanitary fitting' },
    plumb_geyser: { ur: 'گیزر لگانا', 'ur-Latn': 'Geyser lagana' },
    plumb_pump: { ur: 'واٹر پمپ اور ٹینکی', 'ur-Latn': 'Water pump aur tanki' },
    plumb_drain: { ur: 'نالی اور گٹر کھولنا', 'ur-Latn': 'Naali aur gutter kholna' },
    mason_general: { ur: 'مستری کا عام کام', 'ur-Latn': 'Mistri ka aam kaam' },
    mason_brick: { ur: 'اینٹوں کی چنائی', 'ur-Latn': 'Eenton ki chinai' },
    mason_plaster: { ur: 'دیوار اور چھت کا پلستر', 'ur-Latn': 'Deewar aur chhat ka plaster' },
    mason_tile: { ur: 'ٹائل اور ماربل کا فرش', 'ur-Latn': 'Tile aur marble ka farsh' },
    mason_concrete: { ur: 'کنکریٹ، لینٹر اور بنیاد', 'ur-Latn': 'Concrete, lanter aur buniyaad' },
    mason_waterproof: { ur: 'چھت کی واٹر پروفنگ', 'ur-Latn': 'Chhat ki waterproofing' },
    carp_general: { ur: 'لکڑی کا عام کام', 'ur-Latn': 'Lakri ka aam kaam' },
    carp_cabinets: { ur: 'الماریاں اور کچن کیبنٹ', 'ur-Latn': 'Almariyan aur kitchen cabinet' },
    carp_doors: { ur: 'دروازے اور کھڑکیاں لگانا', 'ur-Latn': 'Darwazay aur khirkiyan lagana' },
    carp_locks: { ur: 'دروازوں کے تالے اور کنڈیاں', 'ur-Latn': 'Darwazon ke taalay aur kundiyan' },
    carp_furniture: { ur: 'فرنیچر بنانا اور مرمت', 'ur-Latn': 'Furniture banana aur marammat' },
    carp_polish: { ur: 'لکڑی کی پالش اور لیمینیٹ', 'ur-Latn': 'Lakri ki polish aur laminate' },
    paint_general: { ur: 'پینٹ کا عام کام', 'ur-Latn': 'Paint ka aam kaam' },
    paint_interior: { ur: 'اندر کا ایملشن اور ڈسٹمپر', 'ur-Latn': 'Andar ka emulsion aur distemper' },
    paint_exterior: { ur: 'باہر کی ویدر کوٹنگ', 'ur-Latn': 'Bahar ki weather coating' },
    paint_putty: { ur: 'وال پٹی اور پرائمر', 'ur-Latn': 'Wall putty aur primer' },
    paint_texture: { ur: 'ٹیکسچر اور وال پیپر', 'ur-Latn': 'Texture aur wallpaper' },
    ac_general: { ur: 'اے سی کی مرمت (عام)', 'ur-Latn': 'AC ki marammat (aam)' },
    ac_install: { ur: 'سپلٹ اور انورٹر اے سی لگانا', 'ur-Latn': 'Split aur inverter AC lagana' },
    ac_gas: { ur: 'اے سی میں گیس بھرنا', 'ur-Latn': 'AC mein gas bharna' },
    ac_service: { ur: 'اے سی سروس اور کیمیکل واش', 'ur-Latn': 'AC service aur chemical wash' },
    ac_fridge: { ur: 'فریج اور فریزر کی مرمت', 'ur-Latn': 'Fridge aur freezer ki marammat' },
    ac_washing: { ur: 'واشنگ مشین کی مرمت', 'ur-Latn': 'Washing machine ki marammat' },
    home_general: { ur: 'گھر کی عام مرمت', 'ur-Latn': 'Ghar ki aam marammat' },
    home_fixtures: { ur: 'پردے کی راڈ، شیلف اور دیوار کی فٹنگ', 'ur-Latn': 'Parday ki rod, shelf aur deewar ki fitting' },
    dom_general: { ur: 'گھریلو کام (عام)', 'ur-Latn': 'Gharelu kaam (aam)' },
    dom_cleaning: { ur: 'گھر کی صفائی', 'ur-Latn': 'Ghar ki safai' },
    dom_cooking: { ur: 'کھانا پکانا', 'ur-Latn': 'Khana pakana' },
    dom_laundry: { ur: 'کپڑے دھونا اور استری', 'ur-Latn': 'Kapray dhona aur istri' },
    dom_childcare: { ur: 'بچوں کی دیکھ بھال', 'ur-Latn': 'Bachon ki dekh bhaal' },
    dom_eldercare: { ur: 'بزرگوں اور مریضوں کی دیکھ بھال', 'ur-Latn': 'Buzurgon aur mareezon ki dekh bhaal' },
    move_shifting: { ur: 'گھر کی شفٹنگ', 'ur-Latn': 'Ghar ki shifting' },
    move_loading: { ur: 'سامان چڑھانا اور اتارنا', 'ur-Latn': 'Saamaan charhana aur utaarna' },
    move_packing: { ur: 'شفٹنگ کے لیے سامان کی پیکنگ', 'ur-Latn': 'Shifting ke liye saamaan ki packing' },
  },
});

const categoryNames = (id) => {
  const names = DISPLAY_NAMES.categories[id] ?? {};
  return Object.fromEntries(Object.entries(names).map(([lang, [label, occupation]]) => [lang, { label, occupation }]));
};

export const CATEGORY_IDS = Object.freeze(CATEGORIES.map((c) => c.id));
export const SKILL_IDS = Object.freeze(SKILLS.map((s) => s.id));
export const AVAILABILITY = Object.freeze(['Available', 'Busy', 'Offline']);

// Old values -> current ids. Old data stored labels; Phase 3 briefly used "cleaning_shifting".
// "Cleaning & Shifting" goes to Domestic Work (D-012); the migration counts these for a manual check.
const CATEGORY_ALIASES = Object.freeze({
  cleaning_shifting: 'domestic_work',
  'cleaning & shifting': 'domestic_work',
});

export function categoryIdFrom(value) {
  if (typeof value !== 'string') return null;
  if (CATEGORY_IDS.includes(value)) return value;
  const key = value.trim().toLowerCase();
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];
  const byLabel = CATEGORIES.find((c) => c.label.toLowerCase() === key);
  return byLabel ? byLabel.id : null;
}

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? null;
export const skillById = (id) => SKILLS.find((s) => s.id === id) ?? null;

// What GET /api/meta/taxonomy sends (no matching terms: the client does not need them).
export function publicTaxonomy() {
  return {
    version: TAXONOMY_VERSION,
    // i18n: the same names in Urdu and Roman Urdu (English stays in label / occupation / name).
    categories: CATEGORIES.map(({ id, label, occupation, iscoCode }) => ({ id, label, occupation, iscoCode, i18n: categoryNames(id) })),
    skills: SKILLS.map(({ id, name, category }) => ({ id, name, category, i18n: { ...DISPLAY_NAMES.skills[id] } })),
    availability: [...AVAILABILITY],
  };
}
