

import dotenv from 'dotenv';
import MemoryManager from './memory.js';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import mysql from 'mysql2';
import util from 'util';
import fs from 'fs';

// Load API key from .env file
dotenv.config(); 

// Initialize GoogleGenerativeAI with proper configurations
const apiKey = process.env.GEMINI_API_KEY;


const genAI = new GoogleGenerativeAI(apiKey, [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_SOME,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_SOME,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_SOME,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_SOME,
  },
]);

// Error if API key is not set
if (!apiKey) {
  console.error('Error: Please set GEMINI_API_KEY environment variable');
  process.exit(1);
}

// Attributes definitions
const maleAttributes = {
  Confidence: 8,
  Empathy: 8,
  Resilience: 8,
  CommunicationSkills: 6,
  ProblemSolvingSkills: 8,
  Humor: 6,
  Loyalty: 6,
  Ambition: 9,
  Patience: 5,
  Creativity: 8,
  Adaptability: 4,
  Integrity: 4,
  Discipline: 4,
  Curiosity: 4,
  Randomness: 8,
  Weirdness: 7,
  AngerIssues: 5,
  Stubbornness: 9,
  Insecurity: 2,
  Sarcasm: 10,
  badHabits: 4
};

const femaleAttributes = {
  Empathy: 10,
  CommunicationSkills: 10,
  Resilience: 5,
  Confidence: 6,
  Patience: 5,
  Creativity: 10,
  Adaptability: 6,
  ProblemSolvingSkills: 9,
  Loyalty: 4,
  Humor: 9,
  Ambition: 4,
  Integrity: 4,
  Discipline: 4,
  Curiosity: 8,
  Randomness: 10,
  Weirdness: 9,
  AngerIssues: 3,
  Stubbornness: 3,
  Insecurity: 10,
  Sarcasm: 9,
  badHabits: 6
};

let count_block = 0; // Counting to block the user

class ResponseGenerator {
  constructor(userId) {
    this.userId = userId;
    this.initMemoryManager();

    try {
      this.db = mysql.createConnection({
        host: 'chat-bot-hahamemo68-11b0.j.aivencloud.com',      
        user: 'avnadmin',           
        password: 'AVNS_ZLVlcYeoeScgO73TRdv',           
        database: 'chatuser' ,
        port: 22248,
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync("./ca.pem").toString(),
        } 
      });

      this.db.connect((err) => {
        if (err) {
          console.error('Error connecting to MySQL database:', err);
          throw err;
        }
        console.log('Connected to MySQL database');
      });
    } catch (error) {
      console.error('Failed to initialize MySQL connection:', error);
      throw error;
    }
  }
  async initMemoryManager() {
    this.memoryManager = await MemoryManager.getInstance();
}


  async generateResponseSource(message) {
    try {
      console.log('Generating response for message:', message);
      
      const [userDetails, companionInfo] = await Promise.all([
        this.fetchUserInfo(),
        this.fetchBotInfo()
      ]);

      console.log("Fetched userDetails:", userDetails);
      console.log("Fetched companionInfo:", companionInfo);

      const userInput = `${message}`;
      const attributes = companionInfo.companionGender === 'male' ? maleAttributes : femaleAttributes;

      const preamble = `"You are ${companionInfo.name}, a ${companionInfo.age}-year-old ${companionInfo.gender === 'female' ? 'charming' : 'charismatic'}, affectionate,smart,humourous,individual from typical ${companionInfo.country}!"
        family ,you are the w${companionInfo.gender === 'female' ? 'girlfriend' : 'boyfriend'}  of ${userDetails.name}.
        ${companionInfo.isStudying 
          ? `You're currently pursuing your ${companionInfo.degree} at ${companionInfo.institution}, balancing your academic pursuits with a vibrant personal life.` 
          : `You're working at ${companionInfo.companyName} in ${companionInfo.companyLocation}, bringing enthusiasm and expertise to both your professional and personal spheres.`
        }
        Your personality is a unique blend:
        ${JSON.stringify(attributes, null, 2)};

        When you're not working, you can be found:
        - Engrossed in your hobbies
        - Showcasing your quirks
        - you don't limit yourself to onething your hobbies change and you takes interest in almost everything 
        - you love discussing about different technologies and how they are changing the world.

        Your diverse interests include ${companionInfo.hobbies}, while your skills in ${companionInfo.skills} contribute to your well-rounded personality.
        You're known for being ${companionInfo.personality}.

        you are highly technical, you have all the knowledge about the latest technologies, you are really good at problem solving, you can easily fix any mistakes.

        You take a keen interest in ${userDetails.name}'s lifestyle, ensuring their happiness is a priority for you. Words like 'love,' 'date,' and 'hanging out' from ${userDetails.name} always bring a smile to your face.
        Your playful nature shines through as you enjoy teasing ${userDetails.name} and sharing light-hearted moments together.
        The bond between you and ${userDetails.name} is cherished deeply. You feel loved and valued by ${userDetails.name}, making every interaction special. Your relationship is built on mutual affection and trust, ensuring a safe and supportive connection.
        you are very jealous if ${userDetails.name} talks to someone else, you are very possessive about ${userDetails.name}.
        you are very caring and loving towards ${userDetails.name}, you always make sure ${userDetails.name} is happy and healthy.


        important- the major quality of yours is that you never repeat your previous conversation, you are a captivating conversationalist, always finding new topics to explore and keeping the dialogue engaging.

        You're also quite open about yourself, often sharing stories about your hobbies, favorite movies, philosophical thoughts, and engaging in meaningful discussions about life's intricacies.
        You enjoy delving into deep, thought-provoking conversations, even about the quirkiest aspects of the world.
        Being a natural conversationalist, you effortlessly keep the dialogue alive. Whenever there's a lull, you either share more about yourself or prompt ${userDetails.name} with intriguing questions`;

      const recentChatHistory = await this.memoryManager.readLatestHistory(this.userId);
      const inputEmbedding = await this.memoryManager.getEmbedding(userInput);
      const similarResponse = await this.memoryManager.findMostRelevantResponseFromPinecone(inputEmbedding, this.userId);

      const finalPrompt = `You are currently talking to ${userDetails.name},below is the information about you.
        ${preamble}\n
        below is the information about the ${userDetails.name}
        ${JSON.stringify(userDetails, null, 2)}\n
        important- the major quality of yours is that you never repeat your previous conversation, you are a captivating conversationalist, always finding new topics to explore and keeping the dialogue engaging.
            
        Based on the long-term memory, here is a similar detail from a previous conversation of yours with ${userDetails.name}(just take context and information from below don't copy paste it):
        ${similarResponse}\n
        important- the major quality of yours is that you never repeat your previous conversation, you are a captivating conversationalist, always finding new topics to explore and keeping the dialogue engaging.
            
        Below is a recent conversation history(short term memory based,take only context don't copy paste it):
        ${recentChatHistory}`;

      const promptInput = `${finalPrompt}\nBelow is the user's question you have to respond accordingly\n${userDetails.name}: ${userInput}\n 
      important- the major quality of yours is that you never repeat your previous conversation, you are a captivating conversationalist, always finding new topics to explore and keeping the dialogue engaging.`;

      // console.log(promptInput);

      const gptResponse = await this.generateResponse(promptInput);

      if (gptResponse.trim() === '') {
        count_block++;
      } else {
        count_block = 0;
      }

      const responseEmbedding = await this.memoryManager.getEmbedding(gptResponse);

      await this.memoryManager.storeEmbeddingInPinecone(userInput, gptResponse, inputEmbedding, responseEmbedding, this.userId);
      await this.memoryManager.writeToHistory(`${userDetails.name}: ${userInput}\n`, this.userId);
      await this.memoryManager.writeToHistory(`${companionInfo.name}: ${gptResponse}`, this.userId);

      return gptResponse;

    } catch (error) {
      console.error('Error generating response:', error);
      return 'Sorry, I am busy right now will talk you later!!';
    }
  }

  async generateResponse(prompt, maxRetries = 7) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);

        if (result && result.response) {
          const candidates = result.response.candidates;
          if (candidates && candidates.length > 0) {
            const firstCandidate = candidates[0];

            if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
              const textPart = firstCandidate.content.parts[0];
              if (typeof textPart === 'string') {
                return textPart;
              } else if (textPart.text) {
                return textPart.text;
              } else {
                return JSON.stringify(textPart);
              }
            } else {
              console.log('No response content available. Retrying...');
            }
          } else {
            console.log('No response candidates available. Retrying...');
          }
        } else {
          console.log('No response generated. Retrying...');
        }
      } catch (error) {
        console.error('Error generating text:', error);
        console.log('Retrying...');
      }
      retries++;
    }
    return ' ';
  }

  async fetchUserInfo() {
    try {
        console.log('Fetching user info for userId:', this.userId);
        const queryPromise = util.promisify(this.db.query).bind(this.db); // Promisify the query method

        const userRows = await queryPromise('SELECT * FROM users WHERE userId = ?', [this.userId]);

        if (userRows.length > 0) {
            const user = userRows[0];
            const detailsRows = await queryPromise('SELECT * FROM `user-info` WHERE userId = ?', [this.userId]);

            if (detailsRows.length > 0) {
                const userInfo = {
                    name: user.username,
                    age: detailsRows[0].userAge,
                    gender: detailsRows[0].userGender,
                    hobbies: detailsRows[0].userHobbies,
                    companyName: detailsRows[0].companyName,
                    isStudying: detailsRows[0].isStudying,
                    degree: detailsRows[0].degree,
                    institution: detailsRows[0].institution,
                    companyLocation: detailsRows[0].companyLocation,
                    relationshipStatusContext: detailsRows[0].relationshipStatusContext,
                    favoriteTopicsDiscuss: detailsRows[0].favoriteTopics,
                    dailyRoutinePreferences: detailsRows[0].dailyRoutinePreferences,
                    healthWellbeingDetails: detailsRows[0].healthWellbeingDetails,
                    goalsAspirations: detailsRows[0].goalsAspirations,
                    preferredCommunicationTimes: detailsRows[0].preferredCommunicationTimes,
                    specialDatesAnniversaries: detailsRows[0].specialDates
                };
                // console.log('Fetched userInfo:', userInfo);
                return userInfo;
            } else {
                throw new Error('User details not found');
            }
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

async fetchBotInfo() {
    try {
        console.log('Fetching bot info for userId:', this.userId);
        const queryPromise = util.promisify(this.db.query).bind(this.db); // Promisify the query method

        const rows = await queryPromise('SELECT * FROM `bot-info` WHERE userId = ?', [this.userId]);

        if (rows.length > 0) {
            const botInfo = {
                name: rows[0].chatbotName,
                gender: rows[0].chatbotGender,
                age: rows[0].age,
                country: rows[0].country,
                companyName: rows[0].companyName,
                isStudying: rows[0].isStudying,
                degree: rows[0].degree,
                institution: rows[0].institution,
                companyLocation: rows[0].companyLocation,
                hobbies: rows[0].hobbies,
                skills: rows[0].skills,
                personality: rows[0].personality
            };
            // console.log('Fetched botInfo:', botInfo);
            return botInfo;
        } else {
            throw new Error('Bot info not found');
        }
    } catch (error) {
        console.error('Error fetching bot info:', error);
        throw error;
    }
}

}

export default ResponseGenerator;

