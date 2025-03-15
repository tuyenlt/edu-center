# Edu Center

A Node.js-based project using Express and MongoDB.

## Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/)

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd edu-center
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and configure the necessary environment variables:
   ```sh
   # Example .env file
   JWT_SECRET=your-secret-key
   JWT_EXPIRED_IN=...
   ```

## Running the Project

### Start the application

#### Production Mode:
```sh
npm start
```

#### Development Mode (with auto-reload):
```sh
npm run dev
```

## License
This project is licensed under the ISC License.

