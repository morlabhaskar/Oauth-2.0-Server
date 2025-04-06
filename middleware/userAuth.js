import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const {token} = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Unauthorized1 User" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(decoded.id) {
        // req.body.userId = decoded.id;
        req.user = { userId: decoded.id }; 
    }
    else{
        res.json({ success: false, message: "Unauthorized2 User" });
    }
    next();
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: "Invalid Token" });
  }
};

export default userAuth;