import bcript from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

//API for register user
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Please fill all the fields" });
  }
  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User Already Exists" });
    }

    const salt = await bcript.genSalt(10);
    const hashedPassword = await bcript.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const user = new userModel(userData);
    // const user = new userModel({name,email,password:hashedPassword})
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //SENDING EMAIL
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "🎉 Welcome to Oauth-2.0 – Let’s Get Started!",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; max-width: 600px; margin: auto;">
            <h2 style="color: #007bff; text-align: center;">Welcome to Oauth-2.0, ${name}! 🎉</h2>
            <p style="font-size: 16px;">Dear ${name},</p>
            <p style="font-size: 16px;">We are thrilled to have you on board! Thank you for registering with <strong>Oauth-2.0</strong>. Our goal is to provide you with a seamless and secure authentication experience.</p>
            
            <p style="font-size: 16px;">Here are a few things you can do next:</p>
            <ul style="font-size: 16px; padding-left: 20px;">
                <li>🔑 <strong>Login</strong> and explore your account.</li>
                <li>📚 Check out our <a href="#" style="color: #007bff; text-decoration: none;">documentation</a> to get started.</li>
                <li>📩 Reach out to our support team if you have any questions.</li>
            </ul>

            <p style="font-size: 16px;">If you ever need assistance, we’re always here to help.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd;">
            
            <p style="font-size: 14px; color: #555;">Best Regards,</p>
            <p style="font-size: 14px; color: #555;"><strong>The Oauth-2.0 Team</strong></p>

            <p style="text-align: center; font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
        </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "User Created Successfully", user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//API for login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    const isMatch = await bcript.compare(password, user.password);

    if (!isMatch) {
      res.json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      success: true,
      message: "Login Successfull",
      user: user.email,
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for logout user
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ success: true, message: "Logout Successfull" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Send Verification OTP to the User's Email
const sendVerifyOtp = async (req, res) => {
  try {
    // const { userId } = req.body;
    const { userId } = req.user;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 60 * 60 * 1000; //1 hour

    await user.save();

    //SENDING EMAIL FOR OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "🔐 Your OTP Code for Secure Verification",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; max-width: 600px; margin: auto; text-align: center;">
            <h2 style="color: #007bff;">🔐 OTP Verification</h2>
            <p style="font-size: 16px;">Dear ${user.name},</p>
            <p style="font-size: 16px;">We received a request to verify your identity. Please use the OTP code below to complete the process:</p>
            
            <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 10px; border: 2px dashed #007bff; display: inline-block; margin: 10px auto;">
                ${otp}
            </div>
            
            <p style="font-size: 16px;">This OTP is valid for <strong>1 hour</strong>. Do not share it with anyone for security reasons.</p>
            
            <p style="font-size: 16px;">If you did not request this, please ignore this email or contact our support team immediately.</p>

            <hr style="border: none; border-top: 1px solid #ddd;">
            
            <p style="font-size: 14px; color: #555;">Best Regards,</p>
            <p style="font-size: 14px; color: #555;"><strong>The Oauth-2.0 Team</strong></p>

            <p style="text-align: center; font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
        </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP Sent to Register Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
    const { userId } = req.user; // Extract userId from req.user
    const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details!" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP is Expired!" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    res.json({ success: true, message: "Email Verified Successfully!" });

    //SENDING EMAIL FOR AFTER EMAIL VERIFICATION
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "✅ Email Successfully Verified – Welcome to Oauth-2.0!",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; max-width: 600px; margin: auto; text-align: center;">
                <h2 style="color: #007bff;">✅ Email Verified Successfully!</h2>
                <p style="font-size: 16px;">Dear ${user.name},</p>
                <p style="font-size: 16px;">Congratulations! Your email address has been successfully verified.</p>
    
                <p style="font-size: 16px;">You now have full access to all features of <strong>Oauth-2.0</strong>. Start exploring and enjoy a seamless authentication experience.</p>
    
                <p style="font-size: 16px;">If you ever need assistance, feel free to reach out to our support team.</p>
    
                <hr style="border: none; border-top: 1px solid #ddd;">
    
                <p style="font-size: 14px; color: #555;">Best Regards,</p>
                <p style="font-size: 14px; color: #555;"><strong>The Oauth-2.0 Team</strong></p>
    
                <p style="text-align: center; font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//check if user is authenticated or not
const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: "User is Authenticated!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//send email for password reset
const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required!" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Not Found!" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 60 * 60 * 1000; //1 hour

    await user.save();

    //SENDING EMAIL FOR OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "🔑 Password Reset OTP – Secure Verification",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; max-width: 600px; margin: auto; text-align: center;">
            <h2 style="color: #007bff;">🔑 Password Reset OTP</h2>
            <p style="font-size: 16px;">Dear ${user.name},</p>
            <p style="font-size: 16px;">We received a request to reset your password. Use the OTP below to verify your identity and proceed:</p>

            <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 10px; border: 2px dashed #007bff; display: inline-block; margin: 10px auto;">
                ${otp}
            </div>

            <p style="font-size: 16px;">This OTP is valid for <strong>1 hour</strong>. Do not share it with anyone for security reasons.</p>

            <p style="font-size: 16px;">If you did not request this, please ignore this email or contact our support team immediately.</p>

            <hr style="border: none; border-top: 1px solid #ddd;">

            <p style="font-size: 14px; color: #555;">Best Regards,</p>
            <p style="font-size: 14px; color: #555;"><strong>The Oauth-2.0 Team</strong></p>

            <p style="text-align: center; font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
        </div>
    `,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP Sent Successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Reset User Password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email,OTP and NewPassword is Required!",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Not Found!" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP is Expired!" });
    }

    const salt = await bcript.genSalt(10);
    const hashedPassword = await bcript.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    res.json({ success: true, message: "Password Reset Successfully!" });

    //SENDING EMAIL FOR AFTER PASSWORD RESET
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "✅ Your Password Has Been Successfully Reset",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; max-width: 600px; margin: auto; text-align: center;">
            <h2 style="color: #007bff;">✅ Password Reset Successful</h2>
            <p style="font-size: 16px;">Dear ${user.name},</p>
            <p style="font-size: 16px;">We want to let you know that your password has been successfully reset.</p>

            <p style="font-size: 16px;">If you made this change, you can safely ignore this email.</p>

            <p style="font-size: 16px; color: #d9534f;"><strong>Didn't request this change?</strong></p>
            <p style="font-size: 16px;">If you did not reset your password, please secure your account immediately by updating your credentials and contacting our support team.</p>

            <hr style="border: none; border-top: 1px solid #ddd;">

            <p style="font-size: 14px; color: #555;">Best Regards,</p>
            <p style="font-size: 14px; color: #555;"><strong>The Oauth-2.0 Team</strong></p>

            <p style="text-align: center; font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
        </div>
    `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
};
