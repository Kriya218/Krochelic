![Krochelic logo](https://github.com/user-attachments/assets/d2b73130-672a-45d8-980c-ebbb019c91ef)

# Krochelic
A website for craft lovers to share their creations and interact with other creators.

## Table of contents
- [Introduction](#Introduction)
- [Test Accounts](#Test-Accounts)
- [System Architecture](#System-Architecture)
- [Database Schema](#Database-Schema)
- [Technical Highlights](#Technical-Highlights)
- [Features](#Features)
- [Tech Stack](#Tech-Stack)
- [Installation](#Installation)
  - [Prerequisities](#Prerequisities)
  - [Execution Setup](#Execution-Setup)
## Introduction
Krochelic is a web app that allows craft lovers to share their creations and interact with other creators.
## Test Accounts
- Test Account1
```
Email: user1@example.com
Password: 12345678
```
- Test Account2
```
Email: user2@example.com
Password: 12345678
```
## System Architecture
- **Domain & Routing:** AWS Route 53 for DNS management
- **Server & Deployment:** Deployed on AWS EC2 with Nginx as a reverse proxy
- **Backend Framework:** Node.js + Express for handling API requests and business logic
- **Database:** Sequelize ORM with AWS RDS (MySQL) for database management
- **Real-time Notification:** Socket.IO for instant user notifications
- **File Storage:** AWS S3 for storing user-uploaded images
![Krochelic_SCD](https://github.com/user-attachments/assets/4b9e7530-824c-4c31-a32f-b5e8ae05b18a)

## Database Schema
![Krochelic_ERD](https://github.com/user-attachments/assets/964f63f8-1c65-4986-b19a-93302b2d8028)

## Technical Highlights
- MVC Design Pattern
- RESTful APIs
- Real-time notification with Socket.IO 
- Nginx SSL Certificate

## Features
- Sign In & Sign out
    - Create account with email
    - Google OAuth sign in
- View following users’ and popular posts
- Get notice from subscribe user’s new posts
- Get post’s liked and comments notice
- Posts CRUD
- Interaction
    - Like & comments to post
    - Follow & subscribe users
- Change user name & avatar photo

## Tech Stack
**Client:** Handlebars / Socket.IO / JavaScript
**Server:** Node.js / Express / Nginx / Socket.IO / Multer
**Database:** MySQL
**AWS Services:** Elastic Beanstalk / Route 53 / EC2 / RDS / S3

## Screenshots
### Feeds Page
![feeds](https://github.com/user-attachments/assets/d122790d-45ce-4457-9197-b14f59bd5bd3)
### Personal Profile
![profile](https://github.com/user-attachments/assets/96b1b410-0b67-4b0d-b0c1-cfd3afb88eec)
### Post
![post](https://github.com/user-attachments/assets/60551203-d118-4926-86fb-fc8927c10935)
### Sign In
![sign in](https://github.com/user-attachments/assets/64984fae-7eda-48fb-839b-b3779fa86d20)
### Notice
![notice](https://github.com/user-attachments/assets/b1145838-121d-4a3a-bae0-a15f3c0b1723)


## Installation
### Prerequisities
- Node.js v18.20.3
- MySQL v8.0.37
- Nginx v1.26.2
- Docker v27.3.1
- Docker Compose v2.29.2

### Execution Setup
**1. Clone the repository**
```
git clone https://github.com/Kriya218/Krochelic.git
cd krochelic
```
**2. Setup environment variables**
- Copy the provided `.env.example` file to create a new `.env` file

  ```
  cp .env.example .env
  ```
  
- Open the `.env` file and fill in the required values
  ```
  SESSION_SECRET=your-session-secret
  GOOGLE_CLIENT_ID=your-google-client-id
  GOOGLE_CLIENT_SECRET=your-google-client-secret
  GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
  DB_PASSWORD=your-database-password
  MYSQL_ROOT_PASSWORD=your-mysql-root-password  
  ```
  
  Variables Explanation :
  - `SESSION_SECRET`: A secret key for session encryption.
  - `GOOGLE_CLIENT_ID`: Client ID for Google OAuth.
  - `GOOGLE_CLIENT_SECRET`: Client secret for Google OAuth.
  - `GOOGLE_CALLBACK_URL`: The callback URL used in Google OAuth setup.
  - `DB_PASSWORD`: your-database-password.
  - `MYSQL_ROOT_PASSWORD`: The MySQL root user's password.

**3. Run Docker containers**
```
docker-compose up --build -d
```
