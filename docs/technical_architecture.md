# Technical Architecture

This section provides a clear and straightforward overview of the technical setup and architecture of the **BuildMyRide** system, answering the key operational and technical questions.

### Core System Architecture Answers

* **System Type (Custom-built vs. COTS)**: BuildMyRide is a **custom-built** system. It has been developed from scratch specifically for interactive vehicle customization and live AR previews, rather than using commercial off-the-shelf (COTS) software.
* **System Processing & Operations**: The system is responsible for **online, real-time interactive processing**. It processes live camera feeds and inputs immediately. Structurally, it focuses on **transaction processing** (managing user logins, creating configurations, and saving design states) rather than analytical reporting.
* **Major Application Components**:
  * **Next.js Web Frontend**: The user interface where users view dashboards, access the customization garage, and use the camera view.
  * **3D Customization Studio**: Uses Three.js to render 3D car chassis models and attachments (spoilers, wheels, bumpers) in the browser.
  * **AR Preview Subsystem**: Accesses the user's camera, runs the YOLOv8 AI model directly in the browser to locate cars, and overlays transparent 3D parts on top of the real vehicle.
  * **Express.js API Backend**: A Node.js server that manages routing, user registration/login, database queries, and session management.
* **Data Collected & Managed**: The system collects and manages user account details (emails, passwords), the vehicle parts catalog (3D model URLs, compatibility status, categories), custom garage designs, and saved AR previews (including base64 photos of the configurations and lists of applied parts).
* **Application Architecture**: It follows a **Three-Tier (Layered Client-Server) Architecture**:
  * **Presentation Layer**: Next.js SPA (Single Page Application) running in the user's browser.
  * **Application Logic Layer**: Express.js API server handling the business logic.
  * **Data Storage Layer**: MongoDB database storing application state and asset files.
* **Programming Languages**: The entire system is built using **JavaScript** (specifically React/JSX on the frontend and Node.js on the backend).
* **Supported Hardware Platforms**: The client-side runs on standard consumer hardware, including **Desktop PCs, tablets, and smartphones (iOS/Android)** that have camera access. The server-side runs on standard cloud-based virtual servers.
* **Database Platform**: The system uses **MongoDB** (a NoSQL document database) managed via Mongoose ODM to store all data.
* **End-User Interface**: The system has a **web browser-based user interface** optimized for both desktop and mobile screens. It is not a thick client/installed application.
* **Network Architecture**: The system operates over the **Internet** using secure HTTPS protocols for API requests and WebGL/WebRTC media capture APIs for the camera.
* **System Hosting**: The application is deployed in a **cloud environment**. Typically, the Next.js frontend is hosted on Vercel, the Express.js server runs on Render or AWS, and the database is hosted on MongoDB Atlas.

---

### Application Components, Data Components, and Interfacing Systems

* **Application Components**: Next.js user interface, Three.js 3D renderer, YOLOv8 object detection module (runs in-browser using ONNX Runtime Web), and Express.js REST API.
* **Data Components**: MongoDB collections including `Users` (user accounts), `Parts` (3D models and metadata), `Designs` (saved virtual garage builds), and `ArPreviews` (saved AR screenshots and part configurations).
* **Interfacing Systems**: The system interfaces with the browser's hardware media APIs (camera feed), ONNX Runtime Web for local AI execution, and external Cloud Storage/CDNs to deliver 3D assets (`.glb` files) efficiently.

---

### Component Collaboration and Interaction

When a user interacts with the system, the components collaborate as follows:
1. The user opens the web browser and requests the AR page.
2. The browser launches the device camera and fetches the list of available customization parts from the Express API backend.
3. The backend retrieves the parts catalog from the MongoDB database and sends it back to the client as JSON.
4. As the camera feeds frames, the local YOLOv8 AI model tracks the real vehicle and outputs bounding box coordinates.
5. When the user clicks on a part (such as a spoiler), the 3D loader downloads the `.glb` file from cloud storage and places it over the tracked car coordinates.
6. When the user saves, the system captures a combined snapshot of the camera feed and 3D overlay, uploading this base64 image along with the parts configuration list to the backend database.

---

### Relevant Design Patterns

* **Model-View-Controller (MVC) Pattern**: Used on the backend to separate database queries (Models), routing endpoints (Controllers), and the client user interface (View).
* **React Hooks Pattern**: Encapsulates camera handling (`useCamera`) and AI detection (`useYoloDetection`) into separate files, keeping the UI components clean and readable.
* **Singleton / Promise Caching Pattern**: Used to initialize ONNX Runtime Web exactly once across the application, preventing browser crashes from multiple initialization attempts.
* **Synchronization Lock Pattern**: Regulates the single-threaded AI inference process so that frames are skipped if the engine is busy, preventing the browser from freezing.
* **Axios Interceptor Pattern**: Automatically attaches the user's JWT login token to every outgoing API request, ensuring secure data fetching.

---

### Tools and Technologies Used

* **Frontend**: Next.js, React, Material UI (MUI), Tailwind CSS, Three.js, ONNX Runtime Web, Redux Toolkit, Axios.
* **Backend**: Node.js, Express.js, JWT, Bcryptjs.
* **Database & Storage**: MongoDB, Mongoose, Cloud Object Storage (for 3D models).
* **AI Model**: Ultralytics YOLOv8 (specifically `yolov8n` optimized for browsers).
