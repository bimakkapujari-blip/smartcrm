# SmartCRM – Customer Relationship Management System

## 1. Project Overview

SmartCRM is a web-based Customer Relationship Management (CRM) application developed to help businesses manage customer details, monitor orders, and prepare customer follow-up messages in one place.

The project includes a web frontend and a REST API backend. It currently uses demo customer and order data to demonstrate the main CRM features.

## 2. Key Features

- **Customer Management:** View customer details and add new customers.
- **Customer Search:** Find customers using the available search feature.
- **Order Management:** View orders and update order statuses.
- **Dashboard:** Display customer, order, pending-order, and sales information.
- **Customer Follow-up Assistance:** Generate rule-based suggestions for customer communication.
- **REST API:** Retrieve customer and order data through backend endpoints.
- **Web Deployment:** Access the frontend and backend through their deployed URLs.

## 3. Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **API:** REST API
- **Frontend Hosting:** GitHub Pages
- **Backend Hosting:** Vercel
- **Browser Storage:** localStorage for frontend changes

## 4. Live Project Links

- **Frontend:** https://bimakkapujari-blip.github.io/smartcrm/
- **Backend:** https://smartcrm-silk.vercel.app/

## 5. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check backend availability |
| GET | `/api/woocommerce/status` | Check WooCommerce integration status |
| GET | `/api/woocommerce/customers` | Retrieve customer data |
| GET | `/api/woocommerce/orders` | Retrieve order data |

## 6. How the Project Works

1. The user opens the SmartCRM web application.
2. The dashboard displays customer and order information.
3. The frontend requests customer and order data from the backend API.
4. Users can explore customers, search records, and manage order statuses.
5. The application provides rule-based follow-up suggestions to support customer communication.

## 7. Current Implementation and Limitations

- The application currently uses demo data because a live WooCommerce store has not been connected.
- Customer additions and order-status changes made in the frontend are stored in the browser and are not synchronized with WooCommerce.
- Follow-up suggestions are rule-based and do not use a trained AI model.
- Automated unit and end-to-end tests still need to be implemented and verified.

## 8. Future Enhancements

- Connect the application to a real WooCommerce store.
- Add a database for persistent customer and order records.
- Synchronize updates with the backend.
- Add user authentication and role-based access.
- Improve customer follow-up recommendations.
- Implement automated unit and end-to-end testing.

## 9. Conclusion

SmartCRM demonstrates the development and deployment of a web-based CRM prototype using frontend technologies, a Node.js and Express backend, and REST API communication. The project provides a foundation for further development into a more complete customer and order management system.
