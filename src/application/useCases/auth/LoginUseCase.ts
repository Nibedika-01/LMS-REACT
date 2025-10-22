//use cases that inject repositories
//calls IAuthRepositories for login

import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/entities/User';

export class LoginUseCase {
    private authRepository: IAuthRepository;

    constructor(authRepository: IAuthRepository) {
        this.authRepository = authRepository;
    }
    async execute(username: string, password: string): Promise<{user: User; token: string}> {
        return this.authRepository.login(username, password);
    }
}