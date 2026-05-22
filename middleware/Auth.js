var jwt = require('jsonwebtoken')
function verifytoken(req, res, next) {
    const token = req.cookies.authToken;
    console.log(token)
    if (!token) {
        return res.status(401).json({ code: 0, msg: "Unauthorized User" })
    }
    try {
        console.log("running")
        const decoded = jwt.verify(token, process.env.JSECRETKEY)
        // { id: '69d5ebda2d1e6330ec6dd105', role: 'admin', iat: 1776231042, exp: 1776234642}
        console.log("decoded:", decoded)

        req.user = decoded // Attach decoded user data to request {id,role:usertype}

        // ⏱️ Time calculation
        const currentTime = Date.now()
        const expiryTime = decoded.exp * 1000
        const timeLeft = expiryTime - currentTime

        // ⏳ If less than 10 minutes left → refresh token
        const isRemember = decoded.remember === true
        // refresh conditions
        const shouldRefresh =
            (isRemember && timeLeft < 24 * 60 * 60 * 1000) // refresh early for long sessions
            || (!isRemember && timeLeft < 10 * 60 * 1000) // short session refresh
        if (shouldRefresh) {
            console.log("Refreshing token...")
            const newToken = jwt.sign(
                {
                    id: decoded.id,
                    username: decoded.username,
                    usertype: decoded.usertype,
                    remember: decoded.remember
                },
                process.env.JSECRETKEY,
                { expiresIn: "1h" }
            )
            const cookie = {
                httpOnly: true,
                // secure: false,
                // sameSite: "lax"
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
            }
            if (isRemember) {
                cookie.maxAge = 7 * 24 * 60 * 60 * 1000
             }
            //   else {
            //     cookie.maxAge = 60 * 60 * 1000
            // }
            res.cookie("authToken", newToken, cookie)
        }
        next()
    }
    catch (error) {
        // 👉 ADD THIS CONSOLE.LOG
        console.log("JWT Verification Error:", error.message);
        
        res.status(401).json({ 
            success: false, 
            msg: "Invalid Token",
            error: error.message // 👉 Send the real error to the frontend too
        })
    }
}
const verifyAdmin = (req, res, next) => {
    console.log("checking admin")
    if (!req.user || req.user.usertype !== "admin") {
        return res.status(403).json({ message: "Access Denied: Admins only" })
    }
    else {
        next()
    }
}
const authenticateEmailRequest = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  // Compare the incoming token against the secret key in your .env
  if (authHeader !== `Bearer ${process.env.MICROSERVICE_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized. Invalid microservice key.' })
  }
  
  next()
}
module.exports = { verifytoken, verifyAdmin, authenticateEmailRequest}