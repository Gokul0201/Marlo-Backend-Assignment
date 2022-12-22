const mongoose = require('mongoose');
const validator = require('validator');

var userSchema = new mongoose.Schema({
    name:{type:'string',required:true},
    dob:{type:'string'},
    email:{
        type:'string',
        required:true,
        lowercase:true,
        unique: true,
        validate:(value)=>{
            return validator.isEmail(value)
        }
    },
    mobile:{type:'string',required:true,unique: true},
    password:{type:'string',required:true},
    occupation:{type:'string'},
    company:{type:'string'},
    createdAt:{type:Date,default:Date.now}
})






const UserDetails = mongoose.model('users',userSchema);
module.exports={UserDetails}