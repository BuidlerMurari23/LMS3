import AppError from '../utils/errorUtils.js';
import JWT from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    console.log(`recived token: ${token}`)

    if(!token || token === null){
        return next(new AppError("User doesnot exists", 400))
    }
    try {
        const userDetails = await JWT.verify(token, process.env.JWT_SECRET);
        console.log(`decodded token details: ${userDetails}`)
        req.user = userDetails;
    } catch (e) {
        return next(new AppError(e.message, 402))
    }

    next()
}



const authorizedRoles = (...roles) => async (req, res, next) => {
    const currentUserRole = req.user.role;

    if(!roles.includes(currentUserRole)){
        return next(new AppError("You are not an authorized user to excess this route", 402))
    };

    next();
}


export {
    isLoggedIn, authorizedRoles
}