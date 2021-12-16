const fs  = require('fs');

const Lists = class {

    constructor() {
        this.forms = JSON.parse(fs.readFileSync('./data/forms.json', 'utf8'));
        this.sources = JSON.parse(fs.readFileSync('./data/sources.json', 'utf8'));
        this.treatments = JSON.parse(fs.readFileSync('./data/treatments.json', 'utf8'));
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

}

const createSagidV1 = function(source, treatment, form, nitrogen, phosphate) {

    // Validate the input

    // Get the lists
    const lists = new Lists();

    // Lookup ID for source
    const sourceID = lists.getSourceID(source);

    // Lookup ID for treatment
    const treatmentID = lists.getTreatmentID(treatment);
    
    // Lookup ID for the form
    const formID = lists.getFormID(form);

    
    // Concate the sagid code
    const sagid = `${sourceID}${treatmentID}${formID}`;

    return sagid;
}

exports.createSagid = createSagidV1;
