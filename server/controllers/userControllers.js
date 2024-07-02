import{ pool,executeQuery} from '../config/db.js';

export const userDetailsUpdate = async(req,res) => {
    const userId = req.authData.userId;
    const { 
        userAge, 
        userGender, 
        userHobbies, 
        specialDates, 
        companyName, 
        isStudying, 
        degree, 
        favouriteTopics, 
        preferredCommunicationTimes, 
        healthWellbeingDetails, 
        institution, 
        dailyRoutinePreferences, 
        goalAspirations 
    } = req.body;

    try {
        // Get connection from pool
        const connection = await pool.getConnection();

        // SQL query to update user details
        const sqlQuery = `
            UPDATE \`user-info\` 
            SET 
                userAge = ?, 
                userGender = ?, 
                userHobbies = ?, 
                specialDates = ?, 
                companyName = ?, 
                isStudying = ?, 
                degree = ?, 
                favoriteTopics = ?, 
                preferredCommunicationTimes = ?, 
                healthWellbeingDetails = ?, 
                institution = ?, 
                dailyRoutinePreferences = ?, 
                goalsAspirations = ? 
            WHERE userId = ?
        `;

        // Execute the query with the data
        const [result] = await connection.query(sqlQuery, [
            userAge,
            userGender,
            userHobbies,
            specialDates,
            companyName,
            isStudying,
            degree,
            favouriteTopics,
            preferredCommunicationTimes,
            healthWellbeingDetails,
            institution,
            dailyRoutinePreferences,
            goalAspirations,
            userId
        ]);

        // Release the connection back to the pool
        connection.release();


        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'User details updated successfully.' });
        } else {
            res.status(404).json({ message: 'User ID not found or no changes made.' });
        }
    } catch (error) {

        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const userInfo = async(req,res) => {
    const userId = req.authData.userId;
  try {
    // Fetch messages from MySQL
    const sql = 'SELECT * FROM `user-info` WHERE userId = ?';
    const userdata = await executeQuery(sql, [userId]);
    res.status(200).json(userdata[0]);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};