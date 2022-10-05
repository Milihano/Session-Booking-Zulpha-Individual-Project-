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

    const schema = Joi.object({
        firstname: Joi.string().min(3).max(30).required(),
        othernames: Joi.string().min(3).max(30).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        phone: Joi.string().min(3).max(30).required(),
    })

    const{error, value}= schema.validate(req.body)
    if (error != undefined) {
        res.status(400).send({
            status:false,
            message: error.detail[0].message
        })
    }



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














  
