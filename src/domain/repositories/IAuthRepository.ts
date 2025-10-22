//login logout api calls

import type { IRepository } from "./IRepository";
import type { User } from "../entities/User";

export interface IAuthRepository extends IRepository<User> {
    login(username: string, password: string): Promise<{user: User, token: string}>;
}