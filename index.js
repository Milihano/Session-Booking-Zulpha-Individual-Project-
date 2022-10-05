require('dotenv').config()
const express = require('express')
const bodyparser = require('body-parser')
const Joi = require('joi')
const app = express()
const mysql = require('mysql');
const port = 7000
app.use(bodyparser.json())
// console.log(process.env)
app.listen(port)



const connection = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : process.env.DATABASE_USER,
    port:process.env.DATABASE_PORT,
    database : process.env.DATABASE_NAME
});
  
connection.connect();


app.post('/addingtosessionbooking',(req,res)=>{
    const {firstname,othernames,email,phone,booking_date,bookingtime_range} = req.body

    const schema = Joi.object().keys({
        firstname: Joi.string().alphanum().min(3).max(30).required(),
        othernames: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        phone: Joi.string().alphanum().min(3).max(30).required(),
        date:Joi.date().required(),
        bookingtime_range:Joi.time().required()
    })



    connection.query(`SELECT * from customers where bookingtime_range='${bookingtime_range}' and booking_date= '${booking_date}'`,
    (error, results, fields) => {
        if (error) {
            console.log("here1: " , error)
            res.status(500).json( { message: 'An error occured' } )
        }
        if(results.length > 0) {
            res.status(400).json( { message: 'Sorry, A Patient Already Has An Appointment' } )
        }

        let customer_id = uuidv4()
        
        connection.query(`INSERT INTO customers (customer_id, firstname, othernames, phone, email, bookingtime_range) 
            VALUES ('${customer_id}','${firstname}', '${othernames}', '${phone}', '${email}', '${bookingtime_range}'`),
            (error, results, fields) => { 

                if (error) {
                    console.log("here2: " , error)
                    res.status(500).json( { message: 'An error occured' } )
                }
                res.status(201).json( { message: 'Appointment Secured' } )
        }
    });
          
    connection.end();






})














  
