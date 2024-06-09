## Moveo Remote Coding Web Application

### Project Description
This project is a task received from Moveo to create an online coding web application. The application allows a mentor (Tom) to share a piece of JavaScript code with a student (Josh) and observe real-time code changes made by the student. The application consists of a Lobby page where users can select a code block and a Code Block page where the mentor and student can interact with the code.

### Features
**Lobby Page**
- Displays the title "Choose code block".
- Lists at least 4 code blocks with titles.
- Clicking on a code block title navigates to the corresponding Code Block page.

**Code Block Page**
- The first user to open the page is designated as the mentor.
- Subsequent users are designated as students.
- The mentor sees the code block in read-only mode.
- The student can edit the code block.
- Real-time code updates are displayed using WebSockets.
- Code syntax is highlighted using Highlight.js.

### Project Structure
**Backend**
- Built with Node.js and Express.
- Manages WebSocket connections using Socket.io.
- Connects to MongoDB for storing code blocks.
- Deployed on Railway.app.

**Frontend**
- Built with React.
- Uses React Router for navigation between pages.
- Displays and highlights code using the react-highlight library.
- Communicates with the backend using Socket.io-client.
- Deployed on Vercel.

### Technologies Used
**Backend:** Node.js, Express, Socket.io, MongoDB, Railway.app
**Frontend:** React, React Router, Highlight.js, Socket.io-client, Vercel
