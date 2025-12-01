# CS312-Project
1. Start the Backend First

Before doing anything on the frontend, the backend server must be running.

In VS Code:

cd backend
node server.js


If everything is working, you should see:

Server running on port 5000

2. Make Sure You Have a Test User

If you haven’t created a user yet, send this request using Thunder Client / Postman:

POST

http://localhost:5000/auth/signup


JSON Body:

{
  "name": "TestUser",
  "email": "testuser@example.com",
  "password": "password123"
}


You should get:

Signup successful


Now you can sign in.

3. Test Sign-In

POST

http://localhost:5000/auth/signin


JSON Body:

{
  "email": "testuser@example.com",
  "password": "password123"
}


You should get back a JWT token.
This confirms login is working.

4. While the backend is running pull up web browser and put:

http://localhost:5000/audio/dreams.mp3

into the url, an audio file should start playing.
(could not use actual song for obvious reasons for now)


5. Start the Frontend (React + Vite)

The frontend lives in the frontend folder and is a Vite + React app.

From the project root:

cd frontend
npm install      # only needed the first time
npm run dev


Vite will start a dev server, usually at:

http://localhost:5173/


Open that URL in your browser to see the UI.