import { NextFunction, Request, Response, Router } from "express";
import * as HttpStatus from "http-status-codes";
import { body, validationResult } from "express-validator/check";
import { getManager } from "typeorm";
import { Decimal } from "decimal.js";

// Impoty Services
import { TransactionService } from "../services/transactions.service";
import { BillService } from "../services/bills.service";
import { UserService } from "../services/users.service";
import { CurrencyService } from "../services/currency.service";
import { SenderService } from "../services/sender.service";
import { LanguageService } from "../services/languages.service";

// Import Interfaces
import { IResponseError } from "../resources/interfaces/IResponseError.interface";

// Import Entities
import { User } from "../entities/user.entity";
import { Transaction } from "../entities/transaction.entity";
import { Bill } from "../entities/bill.entity";
import { Currency } from "../entities/currency.entity";
import { Language } from "../entities/language.entity";

var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bank"
});
con.connect(function(err) {});

const createRouter: Router = Router();

/**
 * returns create a payment (requires confirmation)
 *
 * @Method POST
 * @URL /api/transactions/create
 *
 */
createRouter
  .route("/create")
  .post(async (req: Request, res: Response, next: NextFunction) => {
      var userID=req.user.id;
      var accountBill=req.body.accountBill;
      var amount=req.body.amountMoney;
      var recipientBill=accountBill.replace(/\s/g,'');
      console.log(userID);
      console.log(accountBill);
      console.log(amount);
      console.log(recipientBill);
      
      
        con.query("SELECT * FROM bills where accountBill="+recipientBill+"", function (err, result, fields) {
          if (err) throw err;
          console.log(result);
          var receiver_funds=result[0]['availableFunds'];
          var result_receiver_funds=Number(receiver_funds)+Number(amount);
          var sql = "UPDATE bills SET availableFunds = "+result_receiver_funds+" where accountBill="+recipientBill+"";
              con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(result.affectedRows + " record(s) updated");
                return res.status(HttpStatus.OK).json({
                  success: true
                });
          });
          console.log(receiver_funds);

        });
        con.query("SELECT * FROM bills where userID="+userID+"", function (err, result, fields) {
          if (err) throw err;
          console.log(result);
          var sender_funds=result[0]['availableFunds'];
          var result_sender_funds=Number(sender_funds)-Number(amount);
          var sql = "UPDATE bills SET availableFunds = "+result_sender_funds+" where userID="+userID+"";
              con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(result.affectedRows + " record(s) updated");
          });
          console.log(sender_funds);
          
        });


      

  });
  
  

export default createRouter;
