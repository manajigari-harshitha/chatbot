import{ pool,executeQuery} from '../config/db.js';


export const saveDetails = async(req,res) => {
    const userId = req.authData.userId;
    const { chatbotName, chatbotGender,chatbotAge, chatbotCountry,chatbotIsStudying,chatbotDegree,chatbotCompany, userAge, userGender, userInterests, userIsStudying,userDegree,userCompany, specialDates } = req.body;

    try {
      // Get connection from pool
      const connection = await pool.getConnection();

      try {
        // Begin transaction
        await connection.beginTransaction();

        // Query to insert/update bot-info
        const botInfoSql = `
          INSERT INTO \`bot-info\` (userId, chatbotName, chatbotGender, age, country, isStudying, degree, companyName)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE chatbotName = VALUES(chatbotName), chatbotGender = VALUES(chatbotGender), age= VALUES(age), country = VALUES(country), isStudying = VALUES(isStudying), degree = VALUES(degree), companyName = VALUES(companyName)  
        `;
        await connection.execute(botInfoSql, [userId, chatbotName, chatbotGender, chatbotAge, chatbotCountry, chatbotIsStudying, chatbotDegree, chatbotCompany]);

        
        // Query to insert/update user-info
        const userInfoSql = `
          INSERT INTO \`user-info\` (userId, userAge, userGender, userHobbies, isStudying , degree, companyName, specialDates)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE userAge = VALUES(userAge), userGender = VALUES(userGender),
                                  userHobbies = VALUES(userHobbies), isStudying = VALUES(isStudying), degree= VALUES(degree) , companyName= VALUES(companyName),specialDates = VALUES(specialDates)
        `;
        await connection.execute(userInfoSql, [userId, userAge, userGender, userInterests, userIsStudying, userDegree, userCompany, specialDates]);

        // Commit transaction
        await connection.commit();

        // Release connection back to the pool
        connection.release();

        // Send success response
        res.status(200).json({ message: 'Details saved successfully' });
      } catch (error) {
        // Rollback transaction if any error occurs
        await connection.rollback();
        
        console.error('Error saving details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } finally {
        // Release connection back to the pool in all cases
        connection.release();
      }
    } catch (error) {

      console.error('Error establishing database connection:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};


export const botInfo = async(req,res) => {
    const userId = req.authData.userId;
  try {
    // Fetch messages from MySQL
    const sql = 'SELECT * FROM `bot-info` WHERE userId = ?';
    const botdata = await executeQuery(sql, [userId]);

    const bot = botdata[0];
    const base64Image = bot.image ? Buffer.from(bot.image).toString('base64') : null;

    // Construct response object including image if available
    const response = {
        ...bot,
        image: base64Image,
    };

    res.status(200).json(response);
  } catch (error) {
   
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const botDetailsUpdate = async(req, res) => {
    const userId = req.authData.userId;
    const { botName, botGender, chatbotAge,chatbotDegree,chatbotIsStudying,chatbotCompany,chatbotCountry, hobbies,skills,Personality,Institution } = req.body;
    const botImage = req.file;
    try {
      // Get connection from pool
      const connection = await pool.getConnection();
      
       const imageBuffer = botImage ? botImage.buffer : null;
      // SQL query to update bot info
      const sqlQuery = 'UPDATE `bot-info` SET chatbotName = ?, chatbotGender = ?,age =?,country =?,companyName =?,isStudying =?,degree =?,institution= ?,hobbies =?,skills =?,personality =?, image = ? WHERE userId = ?';


      // Execute the query with the data
      const [result] = await connection.query(sqlQuery, [
        botName,
        botGender,
        chatbotAge,
        chatbotCountry,
        chatbotCompany,
        chatbotIsStudying,
        chatbotDegree, 
        Institution,
        hobbies,
        skills,
        Personality,
        imageBuffer, 
        userId
      ]);

      // Release the connection back to the pool
      connection.release();

      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Bot details updated successfully.' });
      } else {
        res.status(404).json({ message: 'User ID not found or no changes made.' });
      }
    } catch (error) {
    
      console.error('Error updating bot details:', error);
      res.status(500).json({ message: 'Server Error' });
    }
};  

export const botName = async(req,res)=>{
  const userId = req.authData.userId;

  try {
    // Get connection from pool
    const connection = await pool.getConnection();

    try {
      const sql = 'SELECT * FROM `bot-info` WHERE userId = ?';
      const [results] = await connection.execute(sql, [userId]);

      if (results.length > 0) {
        const botName = results[0].chatbotName;
        const botImage = results[0].image;
        const base64Image = botImage ? Buffer.from(botImage).toString('base64') : null;
        res.status(200).json({botName, base64Image});
      } else {
        res.status(404).json({ error: 'Bot name not found for the user' });
      }
    } catch (error) {
      
      console.error('Error fetching bot name:', error);
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