import dotenv from 'dotenv';
import connectDB from './db/index.js'; // index.js add krna tha yha error aaya tha
import {app} from './app.js';




dotenv.config({ 
    path: './.env' 
}); 

// Load environment variables from .env file

// Now we can access environment variables using process.env.VARIABLE_NAME

connectDB()
.then( () => {
    app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${process.env.PORT}`);
    });
} ) // If DB connection is successful, start the server
.catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1); 
});

export default app;



 


/*
import express from 'express'; 

//function connectDB() {}

// ; ((async () => {})) IIFE (Immediately Invoked Function Expression) for DB connection
 
const app = express(); //create an express application

( async() => {
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("ERROR", (err) => {
        console.error("ERROR", err)
        throw err
       })

       app.listen (process.env.PORT, () => {
        console.log(`App is listening on port 
            ${process.env.PORT}`);
       })

}catch(error){
    console.error("ERROR", error)
    throw err
}
})();


connectDB();
// Rest of your application code goes here

*/


/*

IIFE (Immediately Invoked Function Expression) 🚀
• Kya hai? Aisa function jo bante hi turant execute ho jata hai.

• Syntax: `(function () { ... })();`

• Kyu use kare?

  • Global scope ko ganda hone se bachane ke liye (Private variables).

  • Database connection jaise kaam turant start karne ke liye.

• Pro Tip: Function ke aage wale `()` se execution hota hai aur peeche wala `;` lagana mat bhoolna! 💡

*/