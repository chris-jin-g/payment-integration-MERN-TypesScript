import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinTable
} from "typeorm";

// Import Entities
import { Bill } from "./bill.entity";
import { Currency } from "./currency.entity";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Bill, sender => sender.user, { nullable: false })
  @JoinTable()
  sender: Bill;

  @ManyToOne(type => Bill, recipient => recipient.user, { nullable: false })
  @JoinTable()
  recipient: Bill;

  @CreateDateColumn()
  createdDate: Date;

  @Column("decimal", { precision: 13, scale: 2, default: 0 })
  amountMoney: number;

  @ManyToOne(type => Currency, currency => currency.id, { nullable: false })
  @JoinTable()
  currency: Currency;

  @Column()
  transferTitle: string;

  @Column()
  authorizationKey: string;

  @Column("boolean", { default: 0 })
  authorizationStatus: boolean;
}
