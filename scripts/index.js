const fs = require('fs');

const Lists = class {

    constructor() {
        this.forms = JSON.parse(fs.readFileSync('./data/forms.json', 'utf8'));
        this.sources = JSON.parse(fs.readFileSync('./data/sources.json', 'utf8'));
        this.treatments = JSON.parse(fs.readFileSync('./data/treatments.json', 'utf8'));
        this.content = JSON.parse(fs.readFileSync('./data/content.json', 'utf8'));
    }

    getFormID(form) {
        return this.forms.find(f => f.form === form).id;
    }

    getSourceID(source) {
        return this.sources.find(s => s.source === source).id;
    }

    getTreatmentID(treatment) {
        return this.treatments.find(t => t.treatment === treatment).id;
    }

    getContentID(content) {
        return this.content.find(c => c.content === content).id;
    }

}

const getFirst2digits = function (number) {
    
    number = number.toString().replace(/\./g, '').replace(/^0+/, '').slice(0, 2);

    if (number.length === 1) {
        number = number + '0';
    }

    return number;
}

const getExponent = function (number) {

    let exponent = number.toExponential().split('e')[1];

    if (exponent < 0) {
        exponent = Math.abs(exponent)
    } else {
        exponent = 0;
    }

    return exponent
}

createContentCode = function (value, content) {

    // Get the lists
    const lists = new Lists();

    // Lookup ID for the content
    const contentID = lists.getContentID(content);

    // Get the first 2 digits of the value
    const contentDigits = getFirst2digits(value);

    // Get the exponent
    const contentExponent = getExponent(value);

    // Create the code
    const contentCode = `${contentID}${contentDigits}${contentExponent}`;

    return contentCode;
}

const createSagidV1 = function (source, treatment, form, nitrogen, phosphorus) {

    // Validate the input

    // Get the lists
    const lists = new Lists();

    // Lookup ID for source
    const sourceID = lists.getSourceID(source);

    // Lookup ID for treatment
    const treatmentID = lists.getTreatmentID(treatment);

    // Lookup ID for the form
    const formID = lists.getFormID(form);

    // Create the code for nitrogen
    const nitrogenCode = createContentCode(nitrogen, 'nitrogen');
    console.log(nitrogenCode);

    // Create the code for phosphorus
    const phosphorusCode = createContentCode(phosphorus, 'phosphorus');
    console.log(phosphorusCode);

    // Concate the sagid code
    const sagid = `${sourceID}${treatmentID}${formID}${nitrogenCode}${phosphorusCode}`;

    // Encode the sagid code with base58


    return sagid;
}

exports.createSagid = createSagidV1;
