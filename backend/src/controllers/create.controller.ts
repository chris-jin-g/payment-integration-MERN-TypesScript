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


import { CryptoCurrencyService } from "../services/cryptocurrency.service";
import { CryptoCurrency } from "../entities/cryptocurrency.entity";
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
      var currencyType = req.body.currencyType;
      var recipientId = req.body.recipientId;
      console.log(userID);
      console.log(accountBill);
      console.log(amount);
      console.log(recipientBill);
      
        if(currencyType == 24){
          const cryptocurrencyService = new CryptoCurrencyService();
          const senderCryptoCurrency: CryptoCurrency = await cryptocurrencyService.getById(userID);
          const sender_rec =  senderCryptoCurrency['received'];
          const sender_send = senderCryptoCurrency['send'];
          const sender_tr_add = senderCryptoCurrency['transferadd'];
          const sender_tr_min = senderCryptoCurrency['transferminus'];
          const sender_total = senderCryptoCurrency['total'];
          const sender_new_min = (amount*100000000 + sender_tr_min*100000000)/100000000;
          const sender_new_total = Number((sender_total*100000000-amount*100000000)/100000000);
          cryptocurrencyService.updateMoney( userID, sender_rec, sender_send, sender_tr_add, sender_new_min, sender_new_total );
          
          const receiverCryptoCurrency: CryptoCurrency = await cryptocurrencyService.getById(recipientId);
          const receiver_rec =  receiverCryptoCurrency['received'];
          const receiver_send = receiverCryptoCurrency['send'];
          const receiver_tr_add = receiverCryptoCurrency['transferadd'];
          const receiver_tr_min = receiverCryptoCurrency['transferminus'];
          const receiver_total = receiverCryptoCurrency['total'];
          const receiver_new_add = (amount*100000000 + receiver_tr_add*100000000)/100000000;
          const receiver_new_total = Number((receiver_total*100000000+amount*100000000)/100000000);
          cryptocurrencyService.updateMoney( recipientId, receiver_rec, receiver_send, receiver_new_add, receiver_tr_min, receiver_new_total );
					return res.status(HttpStatus.OK).json({
            success: true
          });

        }else{
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
        }
  });
export default createRouter;
