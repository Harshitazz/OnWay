# OnWay

OnWay is a feature-rich e-commerce application built using Flask for the backend and Next.js with Tailwind CSS for the frontend. It offers functionalities like debouncing, infinite scrolling, semantic search, and personalized recommendations. It also integrates secure authentication and payment methods for a seamless shopping experience.

## Features
- **Debouncing for Improved Search Performance**
- **Infinite Scroll for a Smooth Browsing Experience**
- **Semantic Search Using S-BERT** (Search by name, category, etc.)
- **Personalized Product Recommendations Based on Cart Items**
- **Secure Authentication Using Clerk**
- **Fully Functional Shopping Cart and Checkout with Payment Integration**

## Tech Stack
- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Flask
- **Database**: MongoDB + kaggle dataset 
- **Authentication**: Clerk
- **Machine Learning**: S-BERT for semantic search
- **Payment Integration**: Paypal

## Getting Started

### Prerequisites
Ensure you have the following installed on your system:
- Python (v3.8 or later)
- Node.js (v16 or later)
- npm or yarn
- MongoDB

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Harshitazz/OnWay.git
   cd OnWay
   ```

2. Install frontend dependencies:
   ```sh
   cd onway-frontend
   npm install
   ```
   or
   ```sh
   yarn install
   ```

3. Install backend dependencies:
   ```sh
   cd ../onway-flask
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory and add the necessary credentials:
   ```sh
   SECRET_KEY=<your-secret-key>
   DATABASE_URL=<your-database-url>
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   ```

5. Run the backend server:
   ```sh
   python app.py
   ```

6. Run the frontend development server:
   ```sh
   cd ../frontend
   npm run dev
   ```
   or
   ```sh
   yarn dev
   ```

7. Open the application in your browser at:
   ```
   http://localhost:3000
   ```




Enjoy using OnWay! 🚀

