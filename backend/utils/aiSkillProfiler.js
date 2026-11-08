// Module 2: 100% Strict Zero-Assumption AI Skill Profiler
// Analyzes ONLY the current text/voice input. Never recycles old skills or assumes unmentioned tools/skills.

// Whole-word matching helper so "backup" NEVER matches "ac"!
const matchesPhrase = (text, phrase) => {
  const cleanPhrase = phrase.toLowerCase().trim();
  if (!cleanPhrase) return false;

  // For Urdu script characters
  if (/[^\u0000-\u007f]/.test(cleanPhrase)) {
    return text.includes(cleanPhrase);
  }

  // Strict word-boundary regex for English & Roman Urdu words
  const escaped = cleanPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(text);
};

// Check if worker explicitly said they don't know anything ("mujay kuch nhi ata", "nothing", etc.)
const isNegativeOrEmptyClaim = (text) => {
  const lower = text.toLowerCase().trim();
  const negativePatterns = [
    /kuch\s*(bhi\s*)?(nhi|nahi|nai)\s*(ata|aata|pata)/i,
    /mujhe\s*kuch\s*(nhi|nahi|nai)/i,
    /mujay\s*kuch\s*(nhi|nahi|nai)/i,
    /koi\s*(kaam|kam|skill|tajurba)\s*(nhi|nahi|nai)/i,
    /\b(nothing|no experience|no skill|no skills|dont know anything|don't know anything|none|nil)\b/i,
  ];
  return negativePatterns.some((pat) => pat.test(lower));
};

const TRADE_KNOWLEDGE_BASE = {
  'Electrical & Solar': {
    defaultOccupation: 'Electrical & Solar Technician',
    keywords: [
      'electrician', 'electrical', 'bijli', 'wiring', 'taar', 'ups', 'inverter',
      'solar', 'breaker', 'switchboard', 'socket', 'generator', 'earthing', 'short circuit', 'pankha',
      'بجلی', 'وائرنگ', 'سولر', 'انورٹر', 'الیکٹریشن', 'پنکھا', 'بریکر', 'تار'
    ],
    skillRules: [
      { skill: 'Residential & Commercial Wiring', triggers: ['wiring', 'house wiring', 'taar', 'وائرنگ', 'تار'], demand: 'Core Trade Skill' },
      { skill: 'Solar Panel & Inverter Installation', triggers: ['solar', 'solar panel', 'inverter', 'net metering', 'سولر', 'پینل', 'انورٹر'], demand: 'High Demand' },
      { skill: 'UPS & Battery Backup Setup', triggers: ['ups', 'battery', 'یو پی ایس', 'بیٹری'], demand: 'High Demand' },
      { skill: 'DB Board & Circuit Breaker Fixing', triggers: ['db board', 'breaker', 'mcb', 'fuse', 'short circuit', 'بریکر', 'شارٹ سرکٹ'], demand: 'Core Trade Skill' },
      { skill: 'Switchboard, Socket & Fan Installation', triggers: ['switch', 'switchboard', 'socket', 'holder', 'bulb', 'light', 'led', 'fan', 'pankha', 'extension', 'plug', 'سوئچ', 'لائٹ', 'پنکھا', 'بلب'], demand: 'Core Trade Skill' },
      { skill: 'Generator Changeover & ATS Wiring', triggers: ['generator', 'ats', 'changeover', 'جنریٹر'], demand: 'Growing' },
      { skill: 'Earthing & Electrical Safety Testing', triggers: ['earthing', 'grounding', 'ارتھ'], demand: 'High Demand' },
      { skill: '3-Phase Industrial Load Balancing', triggers: ['3 phase', 'three phase', 'تھری فیز'], demand: 'Growing' },
    ],
    toolRules: [
      { tool: 'Digital Multimeter', triggers: ['multimeter', 'clamp meter', 'ملٹی میٹر'] },
      { tool: 'Voltage Tester & Pliers', triggers: ['tester', 'plier', 'palas', 'ٹیسٹر', 'پلاس'] },
      { tool: 'Electric Drill Machine', triggers: ['drill', 'drill machine', 'hilti', 'ڈرل'] },
      { tool: 'Wire Stripper & Cutter', triggers: ['stripper', 'wire cutter', 'crimper', 'کٹر'] },
    ],
  },

  'Plumbing & Sanitary': {
    defaultOccupation: 'Plumber & Sanitary Technician',
    keywords: [
      'plumber', 'plumbing', 'pipe', 'paani', 'pani', 'tanki', 'tooti', 'leakage',
      'geyser', 'washroom', 'commode', 'sink', 'basin', 'sewerage', 'gatar', 'pprc', 'upvc',
      'پلمبر', 'پائپ', 'پانی', 'ٹینکی', 'ٹونٹی', 'گیزر', 'باتھ روم', 'واش روم', 'لیکج'
    ],
    skillRules: [
      { skill: 'PPRC & uPVC Pipe Fitting', triggers: ['pipe', 'pprc', 'upvc', 'pipe fitting', 'پائپ'], demand: 'Core Trade Skill' },
      { skill: 'Water Leak Detection & Repair', triggers: ['leak', 'leakage', 'seepage', 'لیک', 'لیکج'], demand: 'High Demand' },
      { skill: 'Bathroom & Sanitary Fixture Installation', triggers: ['bathroom', 'washroom', 'commode', 'sink', 'basin', 'shower', 'tap', 'tooti', 'باتھ روم', 'واش روم', 'ٹونٹی', 'سنک'], demand: 'Core Trade Skill' },
      { skill: 'Gas & Electric Geyser Installation', triggers: ['geyser', 'water heater', 'گیزر'], demand: 'High Demand' },
      { skill: 'Water Pump & Pressure Motor Setup', triggers: ['water pump', 'pressure motor', 'tanki', 'water tank', 'پمپ', 'ٹینکی'], demand: 'High Demand' },
      { skill: 'Drainage & Sewerage Line Unblocking', triggers: ['drain', 'sewerage', 'gatar', 'سیوریج', 'گٹر'], demand: 'Core Trade Skill' },
    ],
    toolRules: [
      { tool: 'PPRC Heat Welding Machine', triggers: ['pprc machine', 'pprc heater', 'welding machine', 'ہیٹر مشین'] },
      { tool: 'Pipe Wrench Set', triggers: ['wrench', 'pipe wrench', 'pana', 'رینچ', 'پانہ'] },
      { tool: 'Pressure Gauge', triggers: ['pressure gauge', 'گیج'] },
    ],
  },

  'Carpentry & Woodwork': {
    defaultOccupation: 'Carpenter & Woodwork Specialist',
    keywords: [
      'carpenter', 'carpentry', 'wood', 'lakri', 'furniture', 'darwaza', 'khirki',
      'cabinet', 'almari', 'wardrobe', 'kundi', 'plywood', 'mdf', 'tarkhan',
      'لکڑی', 'فرنیچر', 'دروازہ', 'کھڑکی', 'الماری', 'کچن', 'ترکھان', 'تالا'
    ],
    skillRules: [
      { skill: 'Custom Wardrobe & Kitchen Cabinets', triggers: ['kitchen cabinet', 'cabinet', 'almari', 'wardrobe', 'cupboard', 'mdf', 'الماری', 'کیبنٹ'], demand: 'High Demand' },
      { skill: 'Door, Window & Frame Fitting', triggers: ['door', 'darwaza', 'window', 'khirki', 'chokhat', 'دروازہ', 'کھڑکی'], demand: 'Core Trade Skill' },
      { skill: 'Smart & Mechanical Door Lock Installation', triggers: ['door lock', 'lock', 'kundi', 'latch', 'تالا', 'کنڈی'], demand: 'High Demand' },
      { skill: 'Furniture Repair & Restoration', triggers: ['furniture', 'bed', 'table', 'chair', 'sofa', 'فرنیچر', 'بیڈ', 'صوفہ'], demand: 'Core Trade Skill' },
      { skill: 'Wood Polishing & Laminate Finishing', triggers: ['wood polish', 'polish', 'deco', 'laminate', 'mica', 'پالش'], demand: 'Growing' },
    ],
    toolRules: [
      { tool: 'Electric Circular Saw (Cutter)', triggers: ['circular saw', 'wood cutter', 'aari', 'آری'] },
      { tool: 'Wood Router & Planer (Randa)', triggers: ['router', 'planer', 'randa', 'رندہ'] },
      { tool: 'Chisel & Hammer Set', triggers: ['chisel', 'hammer', 'hathora', 'ہتھوڑا'] },
    ],
  },

  'Construction & Masonry': {
    defaultOccupation: 'Mason (Raj Mistri) & Tile Specialist',
    keywords: [
      'mason', 'masonry', 'mistri', 'raj mistri', 'brick', 'eent', 'cement', 'plaster',
      'tile', 'marble', 'farsh', 'deewar', 'concrete', 'lanter',
      'مستری', 'راج', 'اینٹ', 'سیمنٹ', 'پلستر', 'ٹائل', 'ماربل', 'فرش', 'دیوار', 'لینٹر'
    ],
    skillRules: [
      { skill: 'Brickwork & Structural Masonry', triggers: ['brick', 'eent', 'deewar', 'mason', 'mistri', 'مستری', 'اینٹ', 'دیوار'], demand: 'Core Trade Skill' },
      { skill: 'Wall & Ceiling Plastering', triggers: ['plaster', 'cement', 'پلستر', 'سیمنٹ'], demand: 'Core Trade Skill' },
      { skill: 'Ceramic Tile & Marble Flooring', triggers: ['tile', 'tiles', 'marble', 'farsh', 'granite', 'ٹائل', 'ماربل', 'فرش'], demand: 'High Demand' },
      { skill: 'Concrete Slab & Foundation Work', triggers: ['concrete', 'lanter', 'slab', 'foundation', 'لینٹر', 'کنکریٹ'], demand: 'High Demand' },
      { skill: 'Roof Waterproofing & Damp Repair', triggers: ['waterproofing', 'waterproof', 'roof', 'chhat', 'چھت'], demand: 'Growing' },
    ],
    toolRules: [
      { tool: 'Tile Cutter Machine', triggers: ['tile cutter', 'ٹائل کٹر'] },
      { tool: 'Mason Trowel (Karni) & Float', triggers: ['trowel', 'karni', 'gurmala', 'کرنی', 'گرماله'] },
      { tool: 'Spirit Level & Sahul', triggers: ['spirit level', 'sahul', 'لیول', 'شاہول'] },
    ],
  },

  'AC & Appliance Repair': {
    defaultOccupation: 'AC & Home Appliance Technician',
    keywords: [
      'ac', 'air conditioner', 'inverter ac', 'split ac', 'fridge',
      'refrigerator', 'washing machine', 'microwave', 'compressor', 'hvac',
      'اے سی', 'فریج', 'واشنگ مشین', 'کمپریسر', 'کولنگ'
    ],
    skillRules: [
      { skill: 'Split & Inverter AC Installation', triggers: ['ac', 'air conditioner', 'split ac', 'inverter ac', 'اے سی', 'سپلیٹ'], demand: 'High Demand' },
      { skill: 'AC Gas Charging & Leak Testing', triggers: ['ac gas', 'gas refill', 'r410', 'r22', 'cooling', 'کولنگ'], demand: 'High Demand' },
      { skill: 'AC Master Service & Chemical Wash', triggers: ['ac service', 'chemical wash', 'blower', 'اے سی سروس'], demand: 'Core Trade Skill' },
      { skill: 'Refrigerator & Deep Freezer Repair', triggers: ['fridge', 'refrigerator', 'freezer', 'compressor', 'فریج', 'فریزر', 'کمپریسر'], demand: 'High Demand' },
      { skill: 'Automatic Washing Machine Repair', triggers: ['washing machine', 'spinner', 'dryer', 'واشنگ مشین'], demand: 'Growing' },
    ],
    toolRules: [
      { tool: 'Manifold Gas Gauge Set', triggers: ['manifold', 'gas gauge'] },
      { tool: 'Vacuum Pump', triggers: ['vacuum pump', 'ویکیوم'] },
      { tool: 'Pressure Service Washer', triggers: ['pressure washer', 'service gun', 'واشر'] },
    ],
  },

  'Painting & Renovation': {
    defaultOccupation: 'Building Painter & Finisher',
    keywords: [
      'painter', 'painting', 'paint', 'rang', 'safaidi', 'distemper', 'emulsion',
      'weather shield', 'putty', 'primer', 'wallpaper', 'texture',
      'پینٹ', 'پینٹر', 'رنگ', 'سفیدی', 'ڈسٹمپر', 'وال پٹی'
    ],
    skillRules: [
      { skill: 'Interior Plastic Emulsion & Distemper', triggers: ['paint', 'painting', 'emulsion', 'distemper', 'rang', 'safaidi', 'پینٹ', 'رنگ', 'ڈسٹمپر', 'سفیدی'], demand: 'Core Trade Skill' },
      { skill: 'Exterior Weather Shield Coating', triggers: ['weather shield', 'exterior paint', 'ویدر شیلڈ'], demand: 'High Demand' },
      { skill: 'Wall Putty, Base Prep & Primer', triggers: ['putty', 'wall putty', 'primer', 'regmar', 'پٹی', 'پرائمر', 'ریگمار'], demand: 'Core Trade Skill' },
      { skill: 'Decorative Texture & Wallpaper Fixing', triggers: ['texture', 'wallpaper', 'وال پیپر', 'ٹیکسچر'], demand: 'Growing' },
    ],
    toolRules: [
      { tool: 'Paint Roller & Brush Kit', triggers: ['roller', 'paint brush', 'برش', 'رولر'] },
      { tool: 'Putty Blade & Scraper', triggers: ['putty blade', 'patra', 'scraper', 'پترا'] },
      { tool: 'Spray Paint Gun', triggers: ['spray gun', 'سپرے'] },
    ],
  },
};

export const extractYearsFromVoiceText = (text = '') => {
  const lower = text.toLowerCase();

  const digitMatch = lower.match(/(\d+)\s*(saal|sal|year|years|yr|yrs|سال)/i);
  if (digitMatch) {
    return Math.min(Number(digitMatch[1]), 45);
  }

  const wordNumbers = {
    ek: 1, one: 1, 'ایک': 1,
    do: 2, two: 2, 'دو': 2,
    teen: 3, three: 3, 'تین': 3,
    char: 4, chaar: 4, four: 4, 'چار': 4,
    panch: 5, paanch: 5, five: 5, 'پانچ': 5,
    che: 6, chay: 6, six: 6, 'چھ': 6,
    saat: 7, seven: 7, 'سات': 7,
    aath: 8, eight: 8, 'آٹھ': 8,
    nau: 9, nine: 9, 'نو': 9,
    das: 10, ten: 10, 'دس': 10,
    bara: 12, twelve: 12, 'بارہ': 12,
    pandra: 15, fifteen: 15, 'پندرہ': 15,
    bees: 20, twenty: 20, 'بیس': 20,
  };

  for (const [word, val] of Object.entries(wordNumbers)) {
    const regex = new RegExp(`\\b${word}\\s*(saal|sal|year|years|سال)`, 'i');
    if (regex.test(lower)) return val;
  }

  return 0; // Strictly 0 if not mentioned in the input text!
};

const getProficiencyLevel = (years) => {
  const num = Number(years) || 0;
  if (num >= 5) return 'Expert';
  if (num >= 2) return 'Intermediate';
  return 'Beginner';
};

const getExperienceTier = (years) => {
  const num = Number(years) || 0;
  if (num >= 8) return 'Master Craftsman (8+ Yrs)';
  if (num >= 5) return 'Senior Specialist (5–7 Yrs)';
  if (num >= 2) return 'Skilled Tradesperson (2–4 Yrs)';
  if (num >= 1) return 'Junior Technician (1 Yr)';
  return 'Entry-Level / Years Not Stated';
};

export const runAiSkillProfiler = ({ rawExperienceText = '', isVoiceInput = false }) => {
  const cleanInput = (rawExperienceText || '').trim();

  // 1. Agar input khali hai ya worker ne likha "mujay kuch nhi ata", to sab 0 / empty return karo!
  if (!cleanInput || isNegativeOrEmptyClaim(cleanInput)) {
    return {
      isNegativeOrEmpty: true,
      hasValidMatch: false,
      detectedCategory: 'None',
      detectedOccupation: 'No Trade Identified',
      detectedYears: 0,
      skills: [],
      categorizedSkills: [],
      recommendedSkills: [],
      toolsAndEquipment: [],
      experienceTierBadge: 'Not Profiled Yet',
      aiSkillSummary: '',
      skillStrengthScore: 0,
    };
  }

  const detectedYears = extractYearsFromVoiceText(cleanInput);
  const level = getProficiencyLevel(detectedYears);
  const experienceTierBadge = getExperienceTier(detectedYears);

  const categorizedSkills = [];
  const recommendedSkills = [];
  const detectedSkillsSet = new Set();
  const detectedToolsSet = new Set();
  const categoryScoreMap = {};

  // 2. Sirf current input (`cleanInput`) ke andar whole-word triggers check karein
  for (const [catName, catData] of Object.entries(TRADE_KNOWLEDGE_BASE)) {
    let catMatches = 0;

    catData.keywords.forEach((kw) => {
      if (matchesPhrase(cleanInput, kw)) catMatches += 1;
    });

    catData.skillRules.forEach((rule) => {
      const matchedTriggers = rule.triggers.filter((tr) => matchesPhrase(cleanInput, tr));
      if (matchedTriggers.length > 0 && !detectedSkillsSet.has(rule.skill.toLowerCase())) {
        detectedSkillsSet.add(rule.skill.toLowerCase());
        catMatches += matchedTriggers.length * 2;
        const confidence = Math.min(84 + matchedTriggers.length * 5, 98);
        categorizedSkills.push({
          skillName: rule.skill,
          category: catName,
          level,
          confidenceScore: confidence,
          source: isVoiceInput ? 'AI-Voice-Extracted' : 'AI-Extracted',
        });
      }
    });

    catData.toolRules.forEach((trRule) => {
      if (trRule.triggers.some((t) => matchesPhrase(cleanInput, t))) {
        detectedToolsSet.add(trRule.tool);
        catMatches += 1;
      }
    });

    if (catMatches > 0) {
      categoryScoreMap[catName] = catMatches;
    }
  }

  // Primary Category wohi hogi jiske sabse zyada alfaaz worker ne abhi bole/likhe hain
  const sortedCategories = Object.entries(categoryScoreMap).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length === 0) {
    return {
      isNegativeOrEmpty: false,
      hasValidMatch: false,
      detectedCategory: 'None',
      detectedOccupation: 'No Trade Identified',
      detectedYears: 0,
      skills: [],
      categorizedSkills: [],
      recommendedSkills: [],
      toolsAndEquipment: [],
      experienceTierBadge: 'Not Profiled Yet',
      aiSkillSummary: '',
      skillStrengthScore: 0,
    };
  }

  const bestCategory = sortedCategories[0][0];
  const detectedOccupation = TRADE_KNOWLEDGE_BASE[bestCategory].defaultOccupation;

  // Potential / Recommended skills sirf bestCategory ki wo skills jo abhi add nahi hueen
  TRADE_KNOWLEDGE_BASE[bestCategory].skillRules.forEach((rule) => {
    if (!detectedSkillsSet.has(rule.skill.toLowerCase())) {
      recommendedSkills.push({
        skillName: rule.skill,
        category: bestCategory,
        reason: `Related skill in ${bestCategory} — click Add only if you perform this work`,
        demandLevel: rule.demand,
      });
    }
  });

  const mergedSkillNames = categorizedSkills.map((c) => c.skillName);
  const toolsAndEquipment = Array.from(detectedToolsSet);

  const yearsText =
    detectedYears > 0
      ? `Stated experience: ${detectedYears} year(s).`
      : 'Experience years not mentioned in input.';
  const skillsText =
    mergedSkillNames.length > 0
      ? `Extracted skills: ${mergedSkillNames.join(', ')}.`
      : 'No specific sub-skills mentioned yet.';
  const toolsText =
    toolsAndEquipment.length > 0
      ? ` Mentioned tools: ${toolsAndEquipment.join(', ')}.`
      : '';

  const aiSkillSummary = `Trade identified from input: ${detectedOccupation} (${bestCategory}). ${yearsText} ${skillsText}${toolsText}`;

  let skillStrengthScore = 15;
  if (detectedYears > 0) skillStrengthScore += 20;
  skillStrengthScore += Math.min(categorizedSkills.length * 15, 50);
  skillStrengthScore += Math.min(toolsAndEquipment.length * 5, 15);
  skillStrengthScore = Math.min(skillStrengthScore, 100);

  return {
    isNegativeOrEmpty: false,
    hasValidMatch: true,
    detectedCategory: bestCategory,
    detectedOccupation,
    detectedYears,
    skills: mergedSkillNames,
    categorizedSkills,
    recommendedSkills: recommendedSkills.slice(0, 5),
    toolsAndEquipment,
    experienceTierBadge,
    aiSkillSummary,
    skillStrengthScore,
  };
};
