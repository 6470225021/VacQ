const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

//@desc     Get all appointments
//@route    GET /api/v1/appointments
//@access   Public
exports.getAppointments = async (req, res, next) => {
    let query;

    if(req.user.role !== 'admin'){ //General users can see only their appointments!
        query = Appointment.find({user: req.user.id});
    } else{ //If you are an admin, you can see all appointments!
        query = Appointment.find();
    }

    //@route    GET /api/v1/hospitals/:hospitalId/appointments
    if(req.params.hospitalId){
        query = query.find({hospital: req.params.hospitalId});
    }

    try{
        //populate is here!
        const appointments = await query.populate({
        path: 'hospital',
        select: 'name province tel'
        });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Appointment"});
    }
}

//@desc     Get single appointment
//@route    GET /api/v1/appointments:id
//@access   Public
exports.getAppointment = async (req, res, next)=>{
    try{
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'hospital',
            select: 'name description tel'
        });

        if(!appointment){
            return res.status(400).json({success: false, message: `No appointment with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Appointment"});
    }
}

//@desc     Add appointment
//@route    POST /api/v1/hospitals/:hospitalId/appointments/
//@access   Private
exports.addAppointment = async (req, res, next)=>{
    try{
        req.body.hospital = req.params.hospitalId;

        const hospital = await Hospital.findById(req.params.hospitalId);

        if(!hospital){
            return res.status(404).json({success: false, message: `No hospital with the id of ${req.params.hospitalId}`});
        }

        //add user Id to req.body
        req.body.user = req.user.id;

        //Chaeck for existed appointment
        const existedAppointments = await Appointment.find({user: req.user.id});

        //If user is not an admin, they can only create 3 appointments.
        if(existedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 appointments`});
        }

        const appointment = await Appointment.create(req.body);

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch(err){
        console.log(err.stack);
        return res.status(500).json({success: false, message: "Cannot create Appointment"});
    }
}

//@desc     Update appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment = async (req, res, next) => {
    try{
        let appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success: false, message: `No appointment with the id of ${req.params.id}`});
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this appointment`});
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate({
            path: 'hospital',
            select: 'name province tel'
        });

        res.status(200).json({success: true, data: appointment});
    } catch (error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot update Appointment"});
    }
}

//@desc     Delete appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment = async (req, res, next) => {
    try{
        let appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success: false, message: `No appointment with the id of ${req.params.id}`});
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this bootcamp`});
        }

        //collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
        // await Appointment.remove();
        await Appointment.findByIdAndDelete(req.params.id);

        res.status(200).json({success: true, data: {}});
    } catch (error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot delete Appointment"});
    }
}