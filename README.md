# ably-graphql-demo

##To get running:

###Ably:
Visit `https://www.ably.io/` and sign up for an account
From your dashboard visit the API Streamer tab, select to be a subscriber to the Bitcoin Pricing (JPY) Product
Get the Ably API key for an app (using either the sandbox app created by default or create a new app) and get a license key with the appropriate privileges to read messages from a channel

###Server:
Navigate to server directory
Install necessary dependencies using `npm install`
Create a .env file with a single entry for API_KEY=XXXX and enter your API_KEY for an Ably app
Start the server with `npm run dev`
You can visit `http://localhost:5000/docs` to view the interactive graphql playground to interact with the graphql schema which supports a single query and subscription

###Frontend:
Navigate to frontend directory
Run `npm install` to install dependencies
Run `npm start` to run the development server
Visit `http://localhost:3000` if it doesnt automatically open up
The pricing chart should render with the last 200 recorded Bitcoin prices and will automatically update when a new price is published
