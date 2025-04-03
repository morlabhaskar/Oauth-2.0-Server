import userModel from "../models/userModel.js";

const getUserData = async (req, res) => {

    try {

        const { userId } = req.user;
        // const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
        console.log(user);
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message:error.message })
        
    }

}

export { getUserData };