import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

@Entity('usuario')
export class Usuario {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false })
    nome!: string;

    @Column({ nullable: false, unique: true })
    email!: string;

    @Column({ nullable: false })
    senha!: string;

    @Column({ nullable: false })
    cargo!: string;

    @Column({ nullable: false })
    trabalhando!: boolean;
}
