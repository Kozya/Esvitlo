const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const markerSchema = new Schema({
    anyLight:{
        type:Boolean,
        required:true,
    },
    lat:{
        type:Number,
        required:true,
    },
    lng:{
        type:Number,
        required:true,
    },
    date:{
        type:String,
        required:true,
    }
   
});

const Marker = mongoose.model('Marker',markerSchema);

module.exports = Marker;
