const otpService = require('../services/otp-service');
const hashService = require('../services/hash-service');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const Userdto = require('../dtos/user-dtos');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('30593915275-v57qg0fnb45hn5f9divrtg1mbh290p5h.apps.googleusercontent.com');

class AuthController {
    async sendOtpEmail(req, res) {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'email field is required!' });
        }

        const otp = await otpService.generateOtp();

        const ttl = 1000 * 60 * 3; // 3 min
        const expires = Date.now() + ttl;
        const data = `${email}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        // send OTP
        try {
            await otpService.sendByEmail(email, otp);
            res.json({
                hash: `${hash}.${expires}`,
                email,
                otp,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'message sending failed' });
        }
    }
    async verifyOtp(req, res) {
        const { otp, hash, email, password } = req.body;
        if (!otp || !hash || !email || !password) {
            return res.status(400).json({ message: 'All fields are required!' });
        }
    
        const [hashedOtp, expires] = hash.split('.');
        if (Date.now() > +expires) {
            return res.status(400).json({ message: 'OTP expired!' });
        }
    
        const data = `${email}.${otp}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp, data);
        if (!isValid) {
            return res.status(400).json({ isValid: false, message: 'Invalid OTP' });
        }
    
        try {
            // Create a new user with hashed password
            const user = await userService.createUser({ email, password });
            
            const { accessToken, refreshToken } = tokenService.generateTokens({
                _id: user._id,
                activated: false,
            });
    
            await tokenService.storeRefreshToken(refreshToken, user._id);
    
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });
    
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });
    
            const userdto = new Userdto(user);
            res.json({ user: userdto, auth: true, isValid: true });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'DB error' });
        }
    }
    async refresh(req, res) {
        // Get refresh token from cookie
        const { refreshToken: refreshTokenFromCookie } = req.cookies;
        if (!refreshTokenFromCookie) {
            return res.status(401).json({ message: 'No token provided' });
        }
    
        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token haa' });
        }
    
        // Check if the token is in the database
        try {
            const token = await tokenService.findRefreshtoken(userData._id, refreshTokenFromCookie);
            if (!token) {
                return res.status(401).json({ message: 'Invalid token naa' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }
    
        // Check if the user is valid
        const user = await userService.findUser({ _id: userData._id });
        if (!user) {
            return res.status(404).json({ message: 'Invalid user' });
        }
    
        // Generate new tokens
        const { accessToken, refreshToken } = tokenService.generateTokens({ _id: userData._id });
    
        // Update refresh token in the database
        try {
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }
    
        // Set cookies for the new tokens
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });
    
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });
    
        const userDto = new Userdto(user);
        res.json({ user: userDto, auth: true });
    }

    // Backend - loginEmail
    async loginEmail(req, res) {
        const { email, password } = req.body;
      
        try {
          let user = await userService.findUser({ email: email });
      
          // If the user does not exist, create a new user
          if (!user) {
            return res.status(201).json({
              auth: false,
              requiresOtp: true, // Indicates OTP verification is required
            });
          }
      
          // If user exists, verify the password
          const isPasswordValid = await userService.findPassword(email, password);
      
          if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' });
          }
      
          const { accessToken, refreshToken } = tokenService.generateTokens({
            _id: user._id,
          });
      
          await tokenService.storeRefreshToken(refreshToken, user._id);
      
          res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
          });
      
          res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
          });
      
          const userDto = new Userdto(user);
          res.json({ user: userDto, auth: true, requiresOtp: false }); // No OTP required
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
      


async googleLogin(req, res) {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '30593915275-v57qg0fnb45hn5f9divrtg1mbh290p5h.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        const { sub, email, name } = payload;

        let user = await userService.findUser({ email });

        if (!user) {
            const randomPassword = hashService.generateRandomPassword(20);
            user = await userService.createUser({ googleId: sub, email, name, password: randomPassword });
            const { accessToken, refreshToken } = tokenService.generateTokens({ _id: user._id });

            await tokenService.storeRefreshToken(refreshToken, user._id);

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });

            const userDto = new Userdto(user);
            return res.status(201).json({ user: userDto, auth: true, message: 'User created and logged in' });
        } else {
            const { accessToken, refreshToken } = tokenService.generateTokens({ _id: user._id });

            await tokenService.storeRefreshToken(refreshToken, user._id);

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });

            const userDto = new Userdto(user);
            return res.status(200).json({ user: userDto, auth: true, message: 'User logged in' });
        }
    } catch (error) {
        console.error('Google login failed:', error);
        res.status(401).json({ message: 'Google login failed' });
    }
}
    // logout 

    async logout(req,res){
        // delete refresh token from db
        const {refreshToken} = req.cookies;
        await tokenService.removeToken(refreshToken);
        // delete cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json({user:null,auth:false});
    }
}

module.exports = new AuthController();