# Astra Gains - SMM Panel

A professional Social Media Marketing (SMM) Panel built with Node.js, Express, MongoDB, and integrated with CheapGainKenya API.

## Features

✅ User Authentication (Register/Login)  
✅ Wallet System with Deposit/Withdrawal  
✅ Order Management  
✅ Transaction History  
✅ CheapGainKenya API Integration  
✅ User Dashboard  
✅ Admin Panel Ready  

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/smiles343/astra-gains.git
   cd astra-gains/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:orderId` - Get order details

### Services
- `GET /api/services` - Get all available services

### User
- `GET /api/user/profile` - Get user profile

## Setup Instructions

1. Update `.env` with your API keys
2. Ensure MongoDB is running
3. Run `npm run dev`
4. Server runs on `http://localhost:5000`

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Security**: bcryptjs, Helmet
- **API Integration**: Axios

## License

MIT
