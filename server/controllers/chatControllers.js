import{ pool,executeQuery} from '../config/db.js';
import ResponseGenerator from '../utils/responsegen.js';

export const clearchat = async(req,res) => {
    const userId = req.authData.userId;
    try {
        const connection = await pool.getConnection();
        // Execute SQL query to delete messages for the given userId
        const [result] = await connection.execute('DELETE FROM messages WHERE userId = ?', [userId]);
        if (result.affectedRows > 0) {
            res.json({ message: 'Chat cleared successfully', deletedMessages: result.affectedRows });
        } else {
            res.json({ message: 'No messages found to clear' });
        }
    } catch (error) {
        console.error('Error clearing chat:', error);
        res.status(500).json({ message: 'Error clearing chat', error: error.message });
    } finally {
        connection.release();
    }
}

export const fetchMessages = async(req,res) =>{
    const userId = req.authData.userId;

  try {
    // Fetch messages from MySQL
    const sql = 'SELECT * FROM messages WHERE userId = ? ORDER BY timestamp ASC';
    const messages = await executeQuery(sql, [userId]);

    res.status(200).json(messages);
  } catch (error) {
    
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const checkAccess = async(req,res) =>{
    const userId = req.authData.userId; // Extract userId from the verified token

    try {
        // Get connection from pool
        const connection = await pool.getConnection();

        try {
          // Query to check if userId exists in bot-info table
          const botInfoSql = 'SELECT * FROM `bot-info` WHERE userId = ?';
          const [botResults] = await connection.execute(botInfoSql, [userId]);

          if (botResults.length > 0) {
            return res.status(200).json({ accessGranted: true });
          }

          const userInfoSql = 'SELECT * FROM `user-info` WHERE userId = ?';
          const [userResults] = await connection.execute(userInfoSql, [userId]);

          if (userResults.length > 0) {
            return res.status(200).json({ accessGranted: true });
          } else {
            return res.status(403).json({ accessGranted: false });
          }
        } catch (error) {
        
          console.error('Error checking user access:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        } finally {
    
          connection.release();
        }
    } catch (error) {
        console.error('Error establishing database connection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


export const chatAccess = async(req,res) =>{
    res.send('Welcome to the chat page!');
};

export const message = async(req,res)=>{
    const { sender, text, timestamp, botName } = req.body;
    const userId = req.authData.userId;

    if (!sender || !text || !timestamp || !userId || !botName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  

  try {
    const connection = await pool.getConnection();
    const sqluser = `
      INSERT INTO messages (userId, sender, text, timestamp)
      VALUES (?, ?, ?, ?)
    `;
    const valuesuser = [userId, sender, text, timestamp];

    await connection.execute(sqluser, valuesuser);
    
    // Initialize ResponseGenerator with userId
    const responseGenerator = new ResponseGenerator(userId);

    // Fetch user and bot information concurrently
    const [userDetails, companionInfo] = await Promise.all([
      responseGenerator.fetchUserInfo(),
      responseGenerator.fetchBotInfo()
    ]);

    // Generate the bot response
    const responseMessage = await responseGenerator.generateResponseSource(text);

    const sqlbot = `
      INSERT INTO messages (userId, sender, text, timestamp)
      VALUES (?, ?, ?, ?)
    `;
    const nowISO = new Date();
    const valuesbot = [userId, 'chatbot', responseMessage, nowISO];

    await connection.execute(sqlbot, valuesbot);
    connection.release();
    
    // Respond with the generated message
    res.json(responseMessage);

  } catch (error) {
    
    console.error('Error generating bot response:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};