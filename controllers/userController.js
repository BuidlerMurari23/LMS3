import User from "../models/userModel.js";
import AppError from "../utils/errorUtils.js";
import cloudinary from 'cloudinary';
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';

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
};


const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email){
        return next(new AppError("Email ID is required", 401))
    }
    const user = await User.findOne({email});
    if (!user){
        return next(new AppError("User doesnot exists", 401))
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    console.log(`resetToken: ${resetToken}`)

    const resetPasswordURL = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`
    console.log(resetPasswordURL);


    const message = `You can reset password by clicking <a href=${resetPasswordURL} target="blank">Reset Your Password</a> if the above link doesnot work then copy & paste the link in new tab ${resetPasswordURL}`;
    const subject = "Reset forgot Password"

    try {
        await sendEmail(email, message, subject);
        res.status(200).json({
            success: true,
            message: `Reset Password token has been sent to ${email} successfullly`
        })
    } catch (e) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        await user.save()
        return next(new AppError(e.message, 403))
    }
};

const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    if(!password){
        return next(new AppError("Please Enter the password to reset", 403))
    };

    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt : Date.now() }
    });

    if(!user){
        return next(new AppError("User doesnot exist. Please enter again", 403))
    };

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    res.status(201).json({
        success: true,
        message: "Password has reset successfully."
    })
};

const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword} = req.body;
    const userID = req.user.id;

    if(!oldPassword || !newPassword){
        return next(new AppError("all fields are required", 402))
    };

    const user = await User.findById(userID).select("+password");

    if(!user){
        return next(new AppError("User doesnot exists", 402))
    };

    const isPasswordValid = await user.comparePassword(oldPassword);

    if(!isPasswordValid){
        return next(new AppError(`invalid old Password: ${oldPassword}`))
    };

    user.password = newPassword;
    await user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "Password has changed successfully."
    })
};

const updateProfile = async (req, res, next) => {
        const { fullName } = req.body;
        const userID = req.user.id;

        if (!fullName){
            return next(new AppError("Please enter your desired user name", 402))
        };

        const user = await User.findById(userID);

        if(!user){
            return next(new AppError("User doesnot exists", 402))
        };

        if(fullName){
            user.fullName = fullName;
        };

        if(req.file){
            try {
               await cloudinary.v2.uploader.destroy(user.avatar.public_id);
               const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
                height: 250,
                width: 250,
                gravity: "faces",
                crop: "fill"
               });
               
               if(result){
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                // fs helps in removing the file from local host
                fs.rm(`uploads/${req.file.filename}`)
               }
            } catch (e) {
                return next(new AppError(e.message || "file not found please try again", 403))
            }
        }
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user
        })
}



export {
    register,
    login,
    getUserProfile,
    logOut,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile
}