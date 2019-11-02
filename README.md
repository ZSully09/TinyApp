# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt V2.0.0
- body-parser
- cookie-session

## Dev Dependencies

- Nodemon
- Chai
- Mocha

## Getting Started

- Install all dependencies (using the `npm install` command).
- Install Nodemon dev dependency using `npm install --save-dev nodemon`
- Update start script to `./node_modules/.bin/nodemon -L express_server.js`
- Run the development web server using the `npm start` command.
- Install Mocha and Chai dev dependencies using `npm install mocha chai --save-dev`
- Update test script to `./node_modules/mocha/bin/mocha`
- While the server is not running, use `npm test` to ensure the provided tests are passing