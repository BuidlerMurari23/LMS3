import { Schema, model } from "mongoose";
import JWT from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "User Name is required"],
        minLength: [3, "User Name must be atleast of 3 Characters"],
        maxLength: [50, "User Name must be less than 50 Characters"],
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "Email ID is required"],
        unique: [true, "Email ID already exists. Please try with other Email ID."],
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Please enter the password."],
        minLength: [8, "Password must be of atleast 8 Characters."],
        select: false
    },
    role: {
        type: String,
        enum: ["USER","ADMIN"],
        default: "USER"
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription: {
        id: String,
        status: String
    }
},{
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods = {
    jwtTokenGenerator: async function () {
        return await JWT.sign(
            {id: this._id, email: this.email, subscription: this.subscription, role: this.role},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRY},
        )
    },

    comparePassword: async function (plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password)
    }
}

const User = model("USER", userSchema);

export default User;
