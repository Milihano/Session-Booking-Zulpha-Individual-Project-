require('dotenv').config()
const express = require('express')
const bodyparser = require('body-parser')
const Joi = require('joi')
const app = express()
const mysql = require('mysql2');
const port = 7000
const { v4: uuidv4 } = require('uuid');
app.use(bodyparser.json())
// console.log(process.env)
app.listen(port, ()=>{
    console.log(`Now Listening On ${port}`) 
})



const connection = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : process.env.DATABASE_USER,
    port:process.env.DATABASE_PORT,
    database : process.env.DATABASE_NAME,
    port: process.env.APP_PORT
});
  
connection.connect();


app.post('/addingtosessionbooking',(req,res)=>{
    const {firstname,othernames,email,phone,booking_date,bookingtime_range} = req.body

    const schema = Joi.object({
        firstname: Joi.string().min(3).max(30).required(),
        othernames: Joi.string().min(3).max(30).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        phone: Joi.string().min(3).max(30).required(),
        date:Joi.string().required(),
        bookingtime_range:Joi.string().required()
    })


try {
    const{error, value}= schema.validate(req.body)
    console.log("The Error:", error)
    
    if (error) {
        throw new Error ("Bad request")
    }



    connection.query(`SELECT * from customers where bookingtime_range='${bookingtime_range}' and bookingdate= '${booking_date}'`,
    (error, results, fields) => {
        if (error) {
            console.log("here1: " , error)
            throw new Error("An Error Occured")
        }
        if(results.length > 0) {
            throw new Error("Sorry, A Patient Already Has An Appointment")
        }

        let customer_id = uuidv4()
        
        connection.query(`INSERT INTO customers (customer_id, firstname, othernames, phone, email, bookingtime_range) 
            VALUES ('${customer_id}','${firstname}', '${othernames}', '${phone}', '${email}', '${bookingtime_range}'`),
            (error, results, fields) => { 

                if (error) {
                    console.log("here2: " , error)
                    throw new Error ("Bad Requesttttt")
                }

                if (results) {
                    res.status(201).json( { message: 'Appointment Secured', data: results } )  
                }       
        }
    });

    
} catch (error) {
    console.log("i got here", error)
    res.status(400).send({
        status:false,
        message: error.message || "Hello Sir E No Dey Work"
    })
}
          
    connection.end();






})














  
