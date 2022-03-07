const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please an address']
    },
    district: {
        type: String,
        required: [true, 'Please a district']
    },
    province: {
        type: String,
        required: [true, 'Please a province']
    },
    postalcode: {
        type: String,
        required: [true, 'Please a postalcode'],
        maxlength: [5, 'Postal Code can not be more than 5 digits']
    },
    tel: {
        type: String
    },
    region: {
        type: String,
        required: [true, 'Please a region']
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Cascade delete appointments when a hospital is deleted
HospitalSchema.pre('remove', async function(next) {

    console.log(`Appointment being removed from hospital ${this._id}`);

    await this.model('Appointment').deleteMany({hospital: this._id});

    next();

});

//Reverse population with virtuals
HospitalSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'hospital',
    justOne: false
});

module.exports = mongoose.model('Hospital', HospitalSchema);