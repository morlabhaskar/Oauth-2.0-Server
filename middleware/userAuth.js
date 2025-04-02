import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const {token} = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Unauthorized User" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(decoded.id) {
        req.body.userId = decoded.id;
    }
    else{
        res.json({ success: false, message: "Unauthorized User" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: "Invalid Token" });
  }
};

export default userAuth;