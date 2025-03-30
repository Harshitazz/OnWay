// // components/OrderConfirmationEmail.jsx
// import React from 'react';
// import { Html, Head, Preview, Body, Container, Heading, Text, Link, } from '@react-email/components';

// const Email = ({ order }) => {
//   return (
//     <Html>
//       <Head />
//       <Preview>Your order confirmation</Preview>
//       <Body style={main}>
//         <Container style={container}>
//           <Heading style={heading}>Thank you for your order!</Heading>
//           <Text style={paragraph}>
//             Hi aman
//             {/* {order.customerName} */}
//             , we’re getting your order ready to be shipped. We will notify you when it has been
//             sent.
//           </Text>
//           <Heading style={subheading}>Order Summary</Heading>
//           {/* <List>
//             {order.items.map((item, index) => (
//               <ListItem key={index}>
//                 {item.quantity} x {item.name} - ${item.price}
//               </ListItem>
//             ))}
//           </List> */}
//           {/* <Text style={paragraph}>
//             Total: ${order.total}
//           </Text> */}
//           <Text style={paragraph}>
//             If you have any questions, please contact our support team at{' '}
//             <Link href="mailto:support@example.com">support@example.com</Link>.
//           </Text>
//         </Container>
//       </Body>
//     </Html>
//   );
// };

// const main = {
//   backgroundColor: '#f6f6f6',
//   fontFamily: 'Arial, sans-serif',
// };

// const container = {
//   backgroundColor: '#ffffff',
//   margin: '0 auto',
//   padding: '20px',
//   borderRadius: '5px',
//   maxWidth: '600px',
//   boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
// };

// const heading = {
//   fontSize: '24px',
//   fontWeight: 'bold',
//   marginBottom: '20px',
// };

// const subheading = {
//   fontSize: '18px',
//   fontWeight: 'bold',
//   marginBottom: '10px',
// };

// const paragraph = {
//   fontSize: '16px',
//   lineHeight: '1.5',
//   marginBottom: '20px',
// };

// export default Email;



// components/Email.jsx


// components/Email.jsx
const Email = () => `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f6f6;
        }
        .container {
          background-color: #ffffff;
          margin: 0 auto;
          padding: 20px;
          border-radius: 5px;
          max-width: 600px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .heading {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .paragraph {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="heading">Thank you for your order!</div>
        <div class="paragraph">Hi there, we’re getting your order ready to be shipped. We will notify you when it has been sent.</div>
        <div class="paragraph">Total: $XX.XX</div>
        <div class="paragraph">If you have any questions, please contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</div>
      </div>
    </body>
  </html>
`;

export default Email;
