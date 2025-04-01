# Poalim Flex - Backend

## Project Overview
Poalim Flex is a flexible mortgage repayment system that allows customers to temporarily reduce their monthly mortgage payments during financially tight periods and redistribute the difference over the remaining loan period.

## Purpose
The backend provides a comprehensive system for managing flexible mortgage payments, including:
- User authentication and profile management
- Mortgage CRUD operations
- Flexible payment reduction calculations
- Smart notification system
- AI-powered financial analytics

## Tech Stack
- **Backend Framework**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Key Features
- Dynamic Repayment System
- Smart Financial Stress Detection
- Automatic Payment Distribution
- Configurable Flex Usage Limits
- Personalized Notifications

## System Components
- **Authentication**: User registration, login, and profile management
- **Mortgage Management**: CRUD operations for mortgage details
- **Flex System**: Core functionality for calculating payment reductions
- **Notification System**: Intelligent offer notifications
- **Analytics**: AI-based financial stress prediction

## Prerequisites
- Node.js (v14 or later)
- MongoDB
- npm or Yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nirshar1977/poalim-flex.git
```

2. Navigate to the project directory:
```bash
cd poalim-flex
```

3. Install dependencies:
```bash
npm install
```

4. Set up environment variables:
Create a `.env` file with the following variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Server port (default: 3000)

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Testing
A comprehensive Postman collection is available for testing the API. Testing workflow:
1. Start with Health Check
2. Register/Login to get authentication token
3. Create test mortgage data
4. Test Flex reduction endpoints
5. Check notifications and analytics

## Project Structure
```
poalim-flex/
│
├── middleware/
├── models/
├── routes/
├── utils/
├── server.js
└── package.json
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Limitations and Future Improvements
- Expand language support
- Enhance AI financial stress detection
- Add more comprehensive reporting features

## License
[Specify your license]

## Contact
Your Name - your.email@example.com

Project Link: [https://github.com/nirshar1977/poalim-flex](https://github.com/nirshar1977/poalim-flex)
