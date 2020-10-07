import { NextFunction, Request, Response, Router } from "express";
import * as HttpStatus from "http-status-codes";
import { param, validationResult } from "express-validator/check";
import { Decimal } from "decimal.js";

// Import Services
import { AdditionalService } from "../services/additionals.service";
import { BillService } from "../services/bills.service";
import { UserService } from "../services/users.service";
import { CryptoCurrencyService } from "../services/cryptocurrency.service";

// Import Interfaces
import { IResponseError } from "../resources/interfaces/IResponseError.interface";

// Import Entities
import { User } from "../entities/user.entity";
import { Additional } from "../entities/additional.entity";
import { Bill } from "../entities/bill.entity";
import { CryptoCurrency } from "../entities/cryptocurrency.entity";

const billsRouter: Router = Router();

/**
 * Returns basic data about the user
 *
 * @Method GET
 * @URL /api/bills
 *
 */
billsRouter
  .route("/")

  .get(async (req: Request, res: Response, next: NextFunction) => {
    const billService = new BillService();
    const additionalService = new AdditionalService();
    const userService = new UserService();
    const cryptoCurrencyService = new CryptoCurrencyService();

    try {
      const user: User = await userService.getById(req.user.id);
      const bill: Bill = await billService.getByUser(user);
      const additional: Additional = await additionalService.getByUser(user);
      const cryptoCurrency: CryptoCurrency = await cryptoCurrencyService.getById(req.user.id);

      if (user && bill && additional) {
        res.status(HttpStatus.OK).json({
          accountBill: bill.accountBill,
          availableFunds: bill.availableFunds,
          crptFunds: cryptoCurrency.total,
          currency: {
            id: bill.currency.id,
            name: bill.currency.name
          },
          additionals: {
            accountBalanceHistory: additional.accountBalanceHistory,
            incomingTransfersSum: additional.incomingTransfersSum,
            outgoingTransfersSum: additional.outgoingTransfersSum
          }
        });
      }
    } catch (error) {
      const err: IResponseError = {
        success: false,
        code: HttpStatus.BAD_REQUEST,
        error
      };
      next(err);
    }
  });

/**
 * Checks whether the account bill already exists
 *
 * @Method GET
 * @URL /api/bills/:accountBill/isAccountBill
 *
 */
billsRouter
  .route("/:accountBill/isAccountBill")

  .get(
    [
      param("accountBill")
        .exists()
        .isNumeric()
        .isLength({ min: 26, max: 26 })
    ],

    async (req: Request, res: Response, next: NextFunction) => {
      const billService = new BillService();
      const userService = new UserService();
      const validationErrors = validationResult(req);
      const accountBill: string = req.params.accountBill;

      if (!validationErrors.isEmpty()) {
        const err: IResponseError = {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          error: validationErrors.array()
        };
        return next(err);
      }

      try {
        const user: User = await userService.getById(req.user.id);
        const bills = await billService.getUsersByAccountBill(
          accountBill,
          user
        );

        if (bills.length)
          return res.status(HttpStatus.OK).json({
            isAccountBill: true,
            recipientId: bills[0].user_id,
            recipientName: bills[0].user_name,
            recipientSurname: bills[0].user_surname
          });

        res.status(HttpStatus.OK).json({
          isAccountBill: false
        });
      } catch (error) {
        const err: IResponseError = {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          error
        };
        next(err);
      }
    }
  );

/**
 * Checks whether the account bill already exists
 *
 * @Method GET
 * @URL /api/bills/:amountMoney/isAmountMoney
 *
 */
billsRouter
  .route("/:amountMoney/:currencyType/isAmountMoney")

  .get(
    [
      param("amountMoney")
        .exists()
        .isNumeric()
    ],

    async (req: Request, res: Response, next: NextFunction) => {
      const billService = new BillService();
      const userService = new UserService();
      const validationErrors = validationResult(req);
      const amountMoney: number = Number(req.params.amountMoney);
      const currencyType: number = Number(req.params.currencyType);

      if (!validationErrors.isEmpty()) {
        const err: IResponseError = {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          error: validationErrors.array()
        };
        return next(err);
      }

      try {
        if(currencyType==24){
          const user: User = await userService.getById(req.user.id);
          const isAmountMoney: boolean = await billService.isAmountMoney(
            new Decimal(amountMoney),
            user
          );
          return res.status(HttpStatus.OK).json({
            isAmountMoney
          });
        }else{
          const user: User = await userService.getById(req.user.id);
          const isAmountMoney: boolean = await billService.isAmountMoney(
            new Decimal(amountMoney),
            user
          );
          return res.status(HttpStatus.OK).json({
            isAmountMoney
          });
        }
        
      } catch (error) {
        const err: IResponseError = {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          error
        };
        next(err);
      }
    }
  );

export default billsRouter;
