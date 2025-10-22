import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/entities/User';

export class SignUpUseCase {
    private authRepository: IAuthRepository;
    
    constructor(authRepository: IAuthRepository) {
        this.authRepository = authRepository;
    }
    
    async execute(fullName: string, password: string): Promise<{user: User; token: string}> {
        return this.authRepository.login(fullName, password);
    }
}