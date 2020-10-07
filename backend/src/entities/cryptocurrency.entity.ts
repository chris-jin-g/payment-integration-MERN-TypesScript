import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from "typeorm";

@Entity("cryptocurrency")
export class CryptoCurrency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userid: number;

  @Column()
  currencytypestr: string;

  @Column()
  currencytype: number;

  @Column()
  address: string;

  @Column("decimal",{ precision: 13, scale: 8, default: 0 })
  received: number;

  @Column("decimal",{ precision: 13, scale: 8, default: 0 })
  send: number;

  @Column("decimal",{ precision: 13, scale: 8, default: 0 })
  transferadd: number;

  @Column("decimal",{ precision: 13, scale: 8, default: 0 })
  transferminus: number;

  @Column("decimal",{ precision: 13, scale: 8, default: 0 })
  total: number;

}
