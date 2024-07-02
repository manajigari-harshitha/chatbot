import pool from '../config/db.js';

export const checkChatAccess = async (req, res, next) => {
  const userId = req.authData.userId;

  try {
    const connection = await pool.getConnection();
    try {
      const botInfoSql = 'SELECT * FROM `bot-info` WHERE userId = ?';
      const [botResults] = await connection.execute(botInfoSql, [userId]);

      if (botResults.length > 0) {
        next();
        return;
      }

      const userInfoSql = 'SELECT * FROM `user-info` WHERE userId = ?';
      const [userResults] = await connection.execute(userInfoSql, [userId]);

      if (userResults.length > 0) {
        next();
        return;
      }

      res.status(403).json({ message: 'Access to chat page is forbidden' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error checking chat access:', error);
    res.status(500).send('Error checking chat access');
  }
};
