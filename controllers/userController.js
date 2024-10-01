import User from "../models/userModel.js";
import AppError from "../utils/errorUtils.js";
import cloudinary from 'cloudinary';
import fs from "fs/promises";

const cookieOption = {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true
}


const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password){
        return next( new AppError("All field is needed to filled", 501));
    };

    const userExists = await User.findOne({email});

    if (userExists){
        return next( new AppError("User exists with the provider Email ID. Please enter other Email ID."))
    };

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: "https://plus.unsplash.com/premium_photo-1672115680958-54438df0ab82?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bW91bnRhaW5zfGVufDB8fDB8fHww"
        }
    });

    if (!user){
        return next(new AppError("User Registration failed. Please retry again!!"))
    }

    if (req.file){
        try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "lms3",
            height: 250,
            weight: 250,
            gravity: "faces",
            crop: "fill"
        })

        if (result){
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;

            // to remove the uploaded image file from the local host
            fs.rm(`uploads/${req.file.filename}`)
        }
        } catch (e) {
            return next(new AppError(e.message, 401))
        };
    };
    await user.save();
        user.password = undefined;

        const token = await user.jwtTokenGenerator();

        // console.log(token)

        res.cookie("token", token, cookieOption)


        res.status(200).json({
            success: true,
            message: "Registration happened successfully",
            user
        })

};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

    if (!email || !password){
        return next(new AppError("All fields are required", 501))
    };

    const user = await User.findOne({email}).select("+password");

    if (!user || !(await user.comparePassword(password))){
        return next(new AppError("OPPS !! Email id or password is not matching !!"))
    };

    const token = await user.jwtTokenGenerator();
    user.password = undefined;
    console.log(`token: ${token}`);

    res.status(200).json({
        success: true,
        message: "You logged in successfully",
        user
    })

    } catch (e) {
        return next(new AppError(e.message, 401))
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        const userID = req.user.id;

        const user = await User.findById(userID);

    res.status(200).json({
        success: true,
        message: "featching the user profile data",
        user
    })
    } catch (e) {
        return next(new AppError(e.message, 402))
    }
};

const logOut = async (req, res, next) => {
    res.cookie("token", null, cookieOption);

    res.status(201).json({
        success: true,
        message: "you logged out successfully"
    })

}



export {
    register,
    login,
    getUserProfile,
    logOut
}