# Companion Chatbot (ByteBond)

## Overview

The Companion Chatbot (ByteBond) is an intelligent virtual assistant designed to interact with users in a personalized and meaningful way. It analyzes user moods, interests, hobbies, and preferences to provide a tailored conversational experience. Users can customize their chatbot's personality and set detailed information about their daily routines, health, goals, and more.

## Features

- **Personalized User Profile:**
  - **Interests and Hobbies:** User can specify their interests and hobbies.
  - **Special Dates:** Keep track of important dates.
  - **Educational and Professional Details:** Including degree, institution, and company name.
  - **Daily Routine and Preferences:** Set preferences for daily activities and communication times.
  - **Health and Wellbeing:** Details to support user’s health and wellbeing.

- **Chatbot Personalization:**
  - Customize the chatbot’s gender, country, degree, hobbies, skills, and personality.

- **Memory Capabilities:**
  - **Short-Term Memory:** Managed using Redis.
  - **Long-Term Memory:** Stored using Pinecone vector database.
  - **Persistent Storage:** All chats and user information are securely stored in a MySQL database.

- **User-Friendly Interface:**
  - Built with React to provide a smooth and intuitive user experience.
  - Features include user registration and login for secure access.

## Project Structure

Here’s a high-level overview of the project structure:

- **Frontend:**
  - Built using React, providing a dynamic and responsive user interface.

- **Backend:**
  - Node.js and Express.js for handling API requests.
  - MySQL for persistent storage of user data and conversations.
  - Redis for managing short-term memory.
  - Pinecone for long-term memory storage and retrieval.

- **Authentication:**
  - JWT-based authentication to ensure secure access to user data.

## Getting Started

To set up and run the project locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-repository/chatbot-companion.git
   cd chatbot-companion
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add necessary environment variables such as database credentials and API keys.

4. **Run the Application:**
   ```bash
   npm start
   ```

## Usage

- **Signup and Login:** Register a new account or log in with existing credentials.
- **Personalize Your Chatbot:** Set preferences and customize your chatbot.
- **Start Chatting:** Interact with the chatbot, which remembers and learns from your conversations.

## Deployment

The project is hosted at [bytebond-self.vercel.app](https://bytebond-self.vercel.app).

## Team

This project was developed by a dedicated team of three members:

- **Member 1:** [Abhishek Rawat]
- **Member 2:** [Manajigari Harshitha]
- **Member 3:** [Nishant Malhotra]

We worked together to design and build this feature-rich application. Our combined efforts and collaboration have led to this successful project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Special thanks to all the contributors and supporters of this project.
