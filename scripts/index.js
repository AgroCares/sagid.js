const fs = require('fs');
const crypto = require('crypto')

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

const createHash = function (input) {
    return crypto.createHash("shake256", { outputLength: 6 }) // TODO: Check the outputLength for collisons
        .update(input)
        .digest("hex");
}

const createProducerCode = function (euid) {

    // Split between country and register number
    const country = euid.slice(0, 2).toUpperCase();
    const registerCode = euid.substring(2).toUpperCase();

    // Hash the register number and add country code to beginning of the code
    const registerHash = createHash(registerCode);
    const producerCode = country + registerHash;

    return producerCode;
}


const getFirst2digits = function (number) {

    // Remove leading zeros and dots and get first 2 digits
    number = number.toString().replace(/\./g, '').replace(/^0+/, '').slice(0, 2);

    // Add following zeros if only one digit
    if (number.length === 1) {
        number = number + '0';
    }

    return number;
}

const getExponent = function (number) {

    // Get the exponent in scientific notation
    let exponent = number.toExponential().split('e')[1];

    if (exponent < 0) {
        // Set negative exponent to positive
        exponent = Math.abs(exponent)
    } else if (exponent > 9) {
        exponent = 9; // TODO: what to do now?
    } else {
        // Set positive exponet to 0
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

encodeBase58 = function (number) {

    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

    let encoded = '';
    while (number > 0) {
        const remainder = number % 58;
        number = Math.floor(number / 58);
        encoded = alphabet[remainder] + encoded;
    }

    return encoded;
}

calculateValidationCode = function (number) {

    // Use Modulo97 to calculate the validation code
    let validationCode = 98 - number * 100 % 97;

    // Add leading zeros if only one digit
    if (validationCode < 10) {
        validationCode = '0' + validationCode;
    } else {
        validationCode = validationCode.toString();
    }

    return validationCode;
}

const createSagidV1 = function (source, treatment, form, euid, nitrogen, phosphorus) {

    // Validate the input
    // TODO: Check if the input is valid

    // Get the lists
    const lists = new Lists();

    // Get version
    const version = 1;

    // Lookup ID for source
    const sourceID = lists.getSourceID(source);

    // Lookup ID for treatment
    const treatmentID = lists.getTreatmentID(treatment);

    // Lookup ID for the form
    const formID = lists.getFormID(form);

    // Create the code for nitrogen
    const nitrogenCode = createContentCode(nitrogen, 'nitrogen');

    // Create the code for phosphorus
    const phosphorusCode = createContentCode(phosphorus, 'phosphorus');

    // Concate the sagid code
    const sagidLong = `${sourceID}${treatmentID}${formID}${nitrogenCode}${phosphorusCode}`;

    // Calculate validation code using Modulo97
    const validationCode = calculateValidationCode(sagidLong);
    const sagidLongValid = sagidLong + validationCode;

    // Encode the sagid code with base58
    const sagidEncoded = encodeBase58(sagidLongValid);

    // Create the producer code
    const producerCode = createProducerCode(euid);

    // Create the sagid code
    const sagid = `${version}${producerCode}-${sagidEncoded}`;


    return sagid;
}

exports.createSagid = createSagidV1;
