const fs = require('fs');
const crypto = require('crypto')

/**
 * List the SAGID codes for forms, sources, treatments and contents
 */

const Lists = class {

    constructor() {
        this.forms = JSON.parse(fs.readFileSync('./data/forms.json', 'utf8'));
        this.sources = JSON.parse(fs.readFileSync('./data/sources.json', 'utf8'));
        this.treatments = JSON.parse(fs.readFileSync('./data/treatments.json', 'utf8'));
        this.content = JSON.parse(fs.readFileSync('./data/content.json', 'utf8'));
    }

    /**
     * Get the ID of the form
     * 
     * @param {string} form Form for which to get the ID
     * @returns {number}
     */
    getFormID(form) {
        return this.forms.find(f => f.form === form).id;
    }


    /**
     * Get the ID of the source
     * 
     * @param {string} source Source for which to get the ID
     * @returns {number}
     */
    getSourceID(source) {
        return this.sources.find(s => s.source === source).id;
    }

    /**
     * Get the ID of the treatment
     * 
     * @param {string} treatment Treatment for which to get the ID
     * @returns {number}
     */
    getTreatmentID(treatment) {
        return this.treatments.find(t => t.treatment === treatment).id;
    }

    /**
     * Get the ID of the content
     *  
     * @param {string} content Content for which to get the ID
     * @returns {number}
     */
    getContentID(content) {
        return this.content.find(c => c.content === content).id;
    }

}

const createHash = function (input) {
    return crypto.createHash("shake256", { outputLength: 6 }) // TODO: Check the outputLength for collisons
        .update(input)
        .digest("hex");
}

const createProducerCode = function (euid, country) {

    let producerCode = '';
    if (euid !== null) {
        // Split between country and register number
        const country = euid.slice(0, 2).toUpperCase();
        const registerCode = euid.substring(2).toUpperCase();

        // Hash the register number and add country code to beginning of the code
        const registerHash = createHash(registerCode);
        producerCode = country + registerHash;
    } else if (country !== null) {
        producerCode = country;
    }

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

const getScientificExponent = function (number) {

    // Get the exponent in scientific notation
    let exponent = number.toExponential().split('e')[1];

    if (exponent < 0) {
        // Set negative exponent to positive
        exponent = Math.abs(exponent)
    } else if (exponent > 9) {
        exponent = 9; // TODO: what to do now?
    } else {
        // Set positive exponent to 0
        exponent = 0;
    }

    return exponent
}

createContentCode = function (value, content) {

    let contentCode = '';
    if (value !== null) {

        // Get the lists
        const lists = new Lists();

        // Lookup ID for the content
        const contentID = lists.getContentID(content);

        // Get the first 2 digits of the value
        const contentDigits = getFirst2digits(value);

        // Get the exponent
        const contentExponent = getScientificExponent(value);

        // Create the code
        contentCode = `${contentID}${contentDigits}${contentExponent}`;
    }

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

/**
 * Create a SAGID to identify a product
 * 
 * @param {string} source Source of the product. See the list of sources in the data folder
 * @param {string} treatment Treatment of the product. See the list of treatments in the data folder
 * @param {string} form Form of the product. See the list of treatments in the data folder
 * @param {string} euid EUropean Unique company IDentifier of the producer
 * @param {string} country Country of the producer (overwritten when euid is set)
 * @param {number} nitrogen Total nitrogen (N) content of product in %
 * @param {number} phosphorus Phosphate (P2O5) content of product in %
 * @param {number} potassium Potassium (K2O) content of product in %
 * @param {number} effective_organic_matter Effective organic matter content of product in %
 * @param {number} sulphur Sulphur (SO3) content of product in %
 * @param {number} magnesium Magnesium (MgO) content of product in %
 * @param {number} calcium Calcium (CaO) content of product in %
 * @param {number} sodium Sodium (Na2O) content of product in %
 * @param {number} chlorine Chlorine (Cl) content of product in %
 * @param {number} boron Boron (B) content of product in %
 * @param {number} copper Copper (Cu) content of product in %
 * @param {number} iron Iron (Fe) content of product in %
 * @param {number} manganese Manganese (Mn) content of product in %
 * @param {number} molybdenum Molibdenum (Mo) content of product in %
 * @param {number} zinc Zin (Zn) content of product in %
 * @param {number} selenium Selenium (Se) content of product in %
 * @param {number} cobalt Cobalt (Co) content of product in %
 * @param {number} silicon Silicon (Si) content of product in %
 * @returns {string} The SAGID of the product
 */

const createSagidV1 = function (source, treatment, form, euid = null, country = null,
    nitrogen = null, phosphorus = null, potassium = null, effective_organic_matter = null,
    sulphur = null, magnesium = null, calcium = null, sodium= null, 
    chlorine = null, boron = null, copper = null,
    iron = null, manganese= null, molybdenum = null, zinc = null, 
    selenium = null, cobalt = null, silicon = null) {

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

    // Create the code for potassium
    const potassiumCode = createContentCode(potassium, 'potassium');

    // Create the code for effective organic matter
    const effectiveOrganicMatterCode = createContentCode(effective_organic_matter, 'effective organic matter');

    // Create the code for sulphur
    const sulphurCode = createContentCode(sulphur, 'sulphur');

    // Create the code for magnesium
    const magnesiumCode = createContentCode(magnesium, 'magnesium');

    // Create the code for calcium
    const calciumCode = createContentCode(calcium, 'calcium');

    // Create the code for sodium
    const sodiumCode = createContentCode(sodium, 'sodium');

    // Create the code for chlorine
    const chlorineCode = createContentCode(chlorine, 'chlorine');

    // Create the code for boron
    const boronCode = createContentCode(boron, 'boron');

    // Create the code for copper
    const copperCode = createContentCode(copper, 'copper');

    // Create the code for iron
    const ironCode = createContentCode(iron, 'iron');

    // Create the code for manganese
    const manganeseCode = createContentCode(manganese, 'manganese');

    // Create the code for zinc
    const zincCode = createContentCode(zinc, 'zinc');

    // Create the code for molybdenum
    const molybdenumCode = createContentCode(molybdenum, 'molybdenum');

    // Create the code for selenium
    const seleniumCode = createContentCode(selenium, 'selenium');

    // Create the code for cobalt
    const cobaltCode = createContentCode(cobalt, 'cobalt');

    // Create the code for silicon
    const siliconCode = createContentCode(silicon, 'silicon');

    // Concate the sagid code
    const sagidLong = `${sourceID}${treatmentID}${formID}${nitrogenCode}${phosphorusCode}${potassiumCode}${effectiveOrganicMatterCode}${sulphurCode}${magnesiumCode}${calciumCode}${sodiumCode}${chlorineCode}${boronCode}${copperCode}${ironCode}${manganeseCode}${molybdenumCode}${zincCode}${seleniumCode}${cobaltCode}${siliconCode}`;

    // Calculate validation code using Modulo97
    const validationCode = calculateValidationCode(sagidLong);
    const sagidLongValid = sagidLong + validationCode;

    // Encode the sagid code with base58
    const sagidEncoded = encodeBase58(sagidLongValid);

    // Create the producer code
    const producerCode = createProducerCode(euid, country);

    // Create the sagid code
    const sagid = `${version}${producerCode}-${sagidEncoded}`;


    return sagid;
}

const verifySagidV1 = function (sagid) {

    // Validate the input

    // Verify the sagid

}

const decodeSagidV1 = function (sagid) {

    // Validate the input

    // Get the version

    // Decode the sagid

}


exports.createSagid = createSagidV1;
exports.verifySagid = verifySagidV1;
exports.decodeSagid = decodeSagidV1;
