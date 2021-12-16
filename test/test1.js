const sagid = require('../scripts/index');

const source = 'cattle';
const treatment = 'none';
const form = 'slurry';
const nitrogen = 0.027;
const phosphorus = 5;
const euid = 'NLNHR.76719235';

const sagidCode = sagid.createSagid(source, treatment, form, euid, nitrogen, phosphorus);
console.log(sagidCode);