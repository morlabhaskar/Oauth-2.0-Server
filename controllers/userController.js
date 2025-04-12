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

//update user data
const updateUserData = async (req, res) => {
    try {
        const { userId } = req.user;
        const { name } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        await userModel.findByIdAndUpdate(userId, { name });
        const updatedUser = await userModel.findById(userId);

        res.json({ success: true, message: "User updated successfully", updatedUser });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message:error.message })
        
    }
}

export { getUserData,updateUserData };