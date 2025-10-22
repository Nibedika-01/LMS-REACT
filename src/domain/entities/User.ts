import type { BaseEntity } from "./BaseEntity";

export interface User extends BaseEntity {
    username: string;
    password: string;
    createdAt: string;
}