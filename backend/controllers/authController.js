const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require('../lib/passport');

const Signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for:", email);
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid password" });

    console.log("User authenticated successfully:", user._id);
    
    generateToken(user._id, res);

    console.log("Token generated and cookie set");

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
};

const Logout = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
      path: '/',
      maxAge: 0
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkAuth = async (req, res) => {
  try {
    // Get the token from cookies
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Return user data
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log("Error in check auth controller", error.message);
    res.status(401).json({ message: "Token verification failed" });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Error in get profile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  // Fix cookie settings
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true, // Always use secure in production
    sameSite: 'none', // Critical for cross-domain cookies
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
});

const googleCallback = async (req, res, next) => {
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'https://vanni-test-frontend.vercel.app'}/login?error=auth_failed`
  }, (err, userObj) => {
    if (err || !userObj || !userObj.token) {
      console.error('Google auth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL || 'https://vanni-test-frontend.vercel.app'}/login?error=auth_failed`);
    }

    try {
      
      // Use the same cookie settings as in generateToken
      res.cookie('jwt', userObj.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Pass along user info in the URL for emergency fallback
      const userInfo = encodeURIComponent(JSON.stringify({
        id: userObj.user._id,
        name: userObj.user.name,
        email: userObj.user.email
      }));
      
      const redirectUrl = `${process.env.FRONTEND_URL || 'https://vanni-test-frontend.vercel.app'}/chat?auth=google&user=${userInfo}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'https://vanni-test.vercel.app'}/login?error=auth_failed`);
    }
  })(req, res, next);
};

module.exports = { 
  Signup, 
  Login, 
  Logout, 
  checkAuth, 
  getProfile, 
  googleAuth,
  googleCallback 
};