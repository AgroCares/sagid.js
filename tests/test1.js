const sagid = require('../scripts/index');

const source = 'cattle';
const treatment = 'none';
const form = 'slurry';
const nitrogen = 27;
const phosphate = 5;

const sagidCode = sagid.createSagid(source, treatment, form, nitrogen, phosphate);
console.log(sagidCode);