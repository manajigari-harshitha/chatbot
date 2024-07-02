import bcrypt from 'bcryptjs';
import otpGenerator from 'otp-generator';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../config/nodemailer.js';
import { generateToken } from '../config/jwt.js';
import pool from '../config/db.js';

const saltRounds = 10;
let tempUserDetails = {};
let userData = {};

export const signup = async (req, res) => {
    const { username,fullName, email, password, phoneNumber } = req.body;
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
    const userId = uuidv4();
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phoneNumber = ?',
      [email, phoneNumber]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email or phone number already exists' });
    }
    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store temporarily in memory
    tempUserDetails = { userId, username,fullName, email, password: hashedPassword, phoneNumber, otp };
    // Send OTP to email
    const subject = 'Your ByteBond OTP Verification Code';
    const message = `
    Dear User,

    Welcome to ByteBond!

    To complete your registration and verify your email address, please use the following One-Time Password (OTP):

    ${otp}

    If you did not request to reset your password, please ignore this email. If you have any concerns or need further assistance, feel free to contact our support team at jmimp45@gmail.com.

    Thank you for being a valued member of ByteBond!

    Best regards,

    ByteBond Team
    `;
    try {
      await sendEmail(email, subject, message);
      console.log(`Sending OTP ${otp} to ${email}`);
      res.status(200).send('OTP sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        res.status(500).send('Error sending OTP email');
    }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (tempUserDetails.email === email && tempUserDetails.otp === otp) {
    const { userId, username, fullName, password, phoneNumber } = tempUserDetails;

    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      const sql = 'INSERT INTO users (userId, username, fullName, email, password, phoneNumber) VALUES (?, ?, ?, ?, ?, ?)';
      const values = [userId, username, fullName, email, password, phoneNumber];
      await connection.execute(sql, values);

      await connection.commit();

      const token = generateToken({ userId, username, fullName, email });
      tempUserDetails = {};
      res.status(200).json({ message: 'User registered successfully', token });
    } catch (error) {
      console.error('Error storing user:', error);
      res.status(500).send('Error storing user');
    }
  } else {
    res.status(400).send('Invalid OTP');
  }
};

export const login = async (req, res) => {
    const { usernameOrEmail, password } = req.body;
  
    try {
      // Get connection from pool
      const connection = await pool.getConnection();
  
      try {
        // Query to find user by username or email
        const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
        const [results] = await connection.execute(sql, [usernameOrEmail, usernameOrEmail]);
  
        if (results.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        // User found, compare passwords using bcrypt
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Incorrect password' });
        }
  
        const token = generateToken({ userId: user.userId, username: user.username, fullName: user.fullName, email: user.email });
  
        // Check if userId exists in bot-info and user-info tables
        const botInfoSql = 'SELECT * FROM `bot-info` WHERE userId = ?';
        const userInfoSql = 'SELECT * FROM `user-info` WHERE userId = ?';
  
        const [botResults] = await connection.execute(botInfoSql, [user.userId]);
        const [userResults] = await connection.execute(userInfoSql, [user.userId]);
  
        // Determine navigation based on results
        if (botResults.length === 0 && userResults.length === 0) {
          // Neither in bot-info nor user-info
          return res.status(200).json({ message: 'Login successful', token, navigate: '/chatbot-details' });
        } else {
          // Found in bot-info or user-info
          return res.status(200).json({ message: 'Login successful', token, navigate: '/chat' });
        }
      } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } finally {
        // Release connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Error establishing database connection:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  export const logout = async (req, res) =>{
    try {
        const token = req.token; // The JWT token from the request header
        console.log(`User logged out. Token: ${token}`);

        // Respond with a success message
        res.status(200).json({ message: 'Logged out successfully' });
      } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
  };

  export const sendOtp = async(req,res) =>{
    const {email} = req.body;
  const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

    
    try {
      const  subject = 'Reset Your ByteBond Password';
      const  messageforgot = `
      Dear User,

      We received a request to reset your password for your ByteBond account. To proceed with resetting your password, please use the following One-Time Password (OTP):

      ${otp}
      If you did not request to reset your password, please ignore this email. If you have any concerns or need further assistance, feel free to contact our support team at jmimp45@gmail.com.

      Thank you for being a valued member of ByteBond!

      Best regards,

      ByteBond Team
      `;
      await sendEmail(email, subject, messageforgot);
      userData[email] = { otp, password: null };
      console.log(`Sending OTP ${otp} to ${email}`);
      res.status(200).send('OTP sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        res.status(500).send('Error sending OTP email');
    }
  };
 
  export const verifyOtpForgot = async(req,res) => {
    const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
  }
  
  const user = userData[email];
  
  if (user && user.otp === otp) {
      try {
          const connection = await pool.getConnection();

          try {
             
              const hashedPassword = await bcrypt.hash(password, saltRounds); 

              const query = 'UPDATE users SET password = ? WHERE email = ?';
              const [results] = await connection.execute(query, [hashedPassword, email]);

              if (results.affectedRows > 0) {
                  // Respond with success message if the update was successful
                  res.status(200).json({ message: 'Password updated successfully' });
              } else {
                  // Respond with an error if no rows were affected
                  res.status(400).json({ message: 'Failed to update password. User not found.' });
              }
          } finally {
              
              connection.release();
          }
      } catch (error) {
          console.error('Database error:', error);
          res.status(500).json({ message: 'Server Error' });
      }
    } else {
      res.status(400).json({ message: 'Invalid OTP or email' });
    }
  };