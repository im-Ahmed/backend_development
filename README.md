# 🎥 Video Sharing Platform (Backend)

A full-featured backend API for a **video sharing platform** similar to YouTube.  
This project is built using **Node.js**, **Express**, and **MongoDB**, with support for authentication, video uploads, subscriptions, likes, and channel statistics.

---

## 🚀 Features

- **User Authentication**
  - Register, Login, Logout
  - JWT-based authentication (Access & Refresh tokens)
  - Password update & token refresh

- **Video Management**
  - Upload videos (Cloudinary integration for file storage)
  - Update video details
  - Delete videos
  - Track views

- **Likes System**
  - Like/Unlike videos
  - Get all liked videos for a user
  - Total likes per channel (aggregated)

- **Subscriptions**
  - Subscribe/Unsubscribe to channels
  - Get channel subscriber count
  - Get total subscriptions for a user

- **Channel Statistics**
  - Total videos uploaded
  - Total subscribers
  - Total video views (across channel)
  - Total likes (across channel)

- **Other Features**
  - Secure API error handling
  - Modular route structure
  - Middleware for authentication & error handling

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Token)
- **File Storage:** Cloudinary (for video uploads)
- **Utilities:** Multer, Bcrypt, Prettierr

---

# Project Structure

controllers/
├── comment.controller.js
├── dashboard.controller.js
├── healthcheck.controller.js
├── like.controller.js
├── playlist.controller.js
├── subscription.controller.js
├── tweet.controller.js
├── user.controller.js
└── video.controller.js

db/

└── index.js

middlewares/
├── auth.middleware.js
└── multer.middleware.js

models/
├── comment.model.js
├── like.model.js
├── playlist.model.js
├── subscription.model.js
├── tweet.model.js
├── user.model.js
└── video.model.js

routes/
├── comment.routes.js
├── dashboard.routes.js
├── healthcheck.routes.js
├── like.routes.js
├── playlist.routes.js
├── subscription.routes.js
├── tweet.routes.js
├── user.routes.js
└── video.routes.js

utils/
├── ApiError.js
├── ApiResponse.js
├── asyncHandler.js
├── cloudinary_file_remove.js
└── cloudinary_file_uploading.js

app.js
constants.js
index.js
.env
.env.keys
.gitignore
.prettierignore
.prettierrc
package-lock.json
package.json
README.md

---

## 📌 API Endpoints

### Auth & Users

| Method | Endpoint                          | Description         |
| ------ | --------------------------------- | ------------------- |
| POST   | `/api/v1/users/register`          | Register new user   |
| POST   | `/api/v1/users/login`             | Login user          |
| POST   | `/api/v1/users/logout`            | Logout user         |
| GET    | `/api/v1/users/current-user`      | get current user    |
| GET    | `/api/v1/users/history`           | get watch history   |
| GET    | `/api/v1/users/channel/:username` | get channel profile |
| PATCH  | `/api/v1/users/update-password`   | Update password     |
| PATCH  | `/api/v1/users/update-account`    | Update account      |
| PATCH  | `/api/v1/users/update-avatar`     | Update avatar       |
| PATCH  | `/api/v1/users/update-coverImage` | Update cover image  |
| POST   | `/api/v1/users/refresh-token`     | Refresh tokens      |

---

### Videos

| Method | Endpoint                                 | Description               |
| ------ | ---------------------------------------- | ------------------------- |
| POST   | `/api/v1/videos/`                        | Upload new video          |
| POST   | `/api/v1/videos/:videoId/views`          | Increment view count      |
| GET    | `/api/v1/videos/:videoId`                | Get video by ID           |
| GET    | `/api/v1/videos/`                        | Get all videos of channel |
| PATCH  | `/api/v1/videos/:videoId`                | Update video details      |
| PATCH  | `/api/v1/videos/toggle/publish/:videoId` | toggle publish status     |
| DELETE | `/api/v1/videos/:id`                     | Delete video              |

---

### Playlist

| Method | Endpoint                                       | Description                |
| ------ | ---------------------------------------------- | -------------------------- |
| POST   | `/api/v1/playlist/`                            | Create a playlist          |
| GET    | `/api/v1/playlist/user/:userId`                | Get user's playlist        |
| GET    | `/api/v1/playlist/:playlistId`                 | Get playlist by ID         |
| PATCH  | `/api/v1/playlist/add/:videoId/:playlistId`    | Add video to playlist      |
| PATCH  | `/api/v1/playlist/remove/:videoId/:playlistId` | Remove video from playlist |
| PATCH  | `/api/v1/playlist/:playlistId`                 | Update playlist details    |
| DELETE | `/api/v1/playlist/:playlistId`                 | Delete playlist            |

---

### Likes

| Method | Endpoint                            | Description           |
| ------ | ----------------------------------- | --------------------- |
| POST   | `/api/v1/likes/toggle/v/:videoId`   | Like/Unlike a video   |
| POST   | `/api/v1/likes/toggle/c/:commentId` | Like/Unlike a comment |
| POST   | `/api/v1/likes/toggle/t/:tweetId`   | Like/Unlike a tweet   |
| GET    | `/api/v1/likes/videos`              | Get liked videos      |

---

### Comments

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| POST   | `/api/v1/comments/:videoId`     | Add comment on video      |
| GET    | `/api/v1/comments/:videoId`     | Get all comments on video |
| PATCH  | `/api/v1/comments/c/:commentId` | Update comment            |
| DELETE | `/api/v1/comments/c/:commentId` | Delete comment            |

---

### Tweets

| Method | Endpoint                      | Description         |
| ------ | ----------------------------- | ------------------- |
| POST   | `/api/v1/tweets/`             | Add tweet           |
| GET    | `/api/v1/tweets/user/:userId` | Get all user tweets |
| PATCH  | `/api/v1/tweets/:tweetId`     | Update tweet        |
| DELETE | `/api/v1/tweets/:tweetId`     | Delete tweet        |

---

### Subscriptions

| Method | Endpoint                                   | Description                   |
| ------ | ------------------------------------------ | ----------------------------- |
| POST   | `/api/v1/subscriptions/channel/:channelId` | Subscribe/Unsubscribe channel |
| GET    | `/api/v1/subscriptions/channel/:channelId` | Get subscribers of a channel  |
| GET    | `/api/v1/subscriptions/user/:subscriberId` | Get subscribered channel      |

---

### Dashboard

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| GET    | `/api/v1/dashboard/videos` | Get channel's all videos |
| GET    | `/api/v1/dashboard/stats`  | Get channel stats        |

---

### Server check

| Method | Endpoint              | Description  |
| ------ | --------------------- | ------------ |
| GET    | `/api/v1/healthcheck` | Check server |

---
