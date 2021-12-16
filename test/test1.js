const sagid = require('../scripts/index');

const source = 'cattle';
const treatment = 'none';
const form = 'slurry';
const nitrogen = 0.027;
const phosphorus = 5;
const potassium = 0.1;
const effective_organic_matter = 4.1;
const sulphur = null;
const magnesium = null;
const calcium = null;

const euid = 'NLNHR.76719235';

const sagidCode = sagid.createSagid(source, treatment, form, euid, nitrogen, phosphorus , potassium, effective_organic_matter, sulphur, magnesium, calcium);
console.log(sagidCode);