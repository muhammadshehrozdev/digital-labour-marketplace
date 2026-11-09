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
    categories: CATEGORIES.map(({ id, label, occupation, iscoCode }) => ({ id, label, occupation, iscoCode })),
    skills: SKILLS.map(({ id, name, category }) => ({ id, name, category })),
    availability: [...AVAILABILITY],
  };
}
