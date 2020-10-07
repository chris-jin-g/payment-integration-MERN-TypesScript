import { NextFunction, Request, Response, Router } from "express";
import * as HttpStatus from "http-status-codes";
import { body, validationResult } from "express-validator/check";
var paypal = require('paypal-rest-sdk');
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bank"
});

con.connect(function(err) {});

const withdrawRouter: Router = Router();

var client_id = 'Aeh8fpgAvTQlTWEgv_TfW-uFgTlt9rbcukRsNLDHSQuK72np4ce7V2MG4lScsCVHhBaO8XUDLeGWv7ar';
var secret = 'EC9RMBdgyGNpeYf4HNM1CIy4aIxO0qFLv0S4xP4PxIbAPgdctkA4H9ryB7rDK4M6xcQ7fW5XdM3-tuJL';
var userID='';
var depositsAmount='';
 
withdrawRouter
  .route("/")
  .get((req: Request, res: Response, next: NextFunction) => {
    try {
    	paypal.configure({
		    'mode': 'sandbox', //sandbox or live
		    'client_id': client_id,
		    'client_secret': secret,
		    'headers' : {
		        'custom': 'header'
		    }
		});
		var sender_batch_id = Math.random().toString(36).substring(9);
	    console.log(sender_batch_id);
	    var create_payout_json = {
	        "sender_batch_header": {
	            "sender_batch_id": sender_batch_id,
	            "email_subject": "You have a payment"
	        },
	        "items": [
	            {
	                "recipient_type": "EMAIL",
	                "amount": {
	                    "value": req.query['amount'],
	                    "currency": req.query['currency']
	                },
	                "receiver": req.query['account'],
	                "note": "Thank you.",
	                "sender_item_id": "item_1"
	            }
	        ]
	    };

	    var sync_mode = 'false';
	    userID=req.query['userID'];
	    depositsAmount=req.query['amount'];

	    paypal.payout.create(create_payout_json, sync_mode, function (error, payout) {
	        if (error) {
	            console.log(error.response);
	            throw error;
	        } else {
				  con.query("SELECT * FROM bills where userID="+userID+"", function (err, result, fields) {
				    if (err) throw err;
				    var currentFunds=Number(result[0]['availableFunds']);
				    var resultFunds=currentFunds-Number(depositsAmount);

					  var sql = "UPDATE bills SET availableFunds = "+resultFunds+" where userID="+userID+"";
					  con.query(sql, function (err, result) {
					    if (err) throw err;
					    console.log(result.affectedRows + " record(s) updated");
					    res.redirect('http://localhost:3000/withdraw');
					  });

				  });
	            
	        }
	    });
    } catch (error) {
      // const err: IResponseError = {
      //   success: false,
      //   code: HttpStatus.BAD_REQUEST,
      //   error
      // };
      // next(err);
    }
  });

export default withdrawRouter;