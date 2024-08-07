import {Entity,Column, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Admin {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username:string;

    @Column()
    password:string;

    @Column()
    role: string;
}