//implements IAuthRepositories

import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import type { User } from "../../domain/entities/User";
import apiClient from "../api/apiClient";

export class AuthRepository implements IAuthRepository {
    async login(username: string, password: string): Promise<{ user: User; token: string }> {
        const response = await apiClient.get('/Users');
        const users: User[] = response.data;

        const user = users.find(
            (u: any) =>
            (u.username?.toLowerCase() === username.toLowerCase() ||
            u.fullName?.toLowerCase() === username.toLowerCase()) &&
            u.password === password
        );
        if (!user) {
            throw new Error('Invalid username or password');
        }
        return { user, token: "dummy-jwt-token"}
    }

    async signup(fullName: string, password: string): Promise<{ user: User; token: string }> {
        const newUser: Partial<User> = {
            username: fullName,
            password,
            isDeleted: false,
            createdAt: new Date().toISOString()
        };
        const response = await apiClient.post('/Users', newUser);
        const createdUser= response.data;
        return { user: createdUser, token: "dummy-jwt-token"
        }
    }

    async getById(id: number): Promise<User> {
        const response = await apiClient.get(`/Users/${id}`);
        return response.data;
    }

    async getAll(): Promise<User[]> {
        const response = await apiClient.get('/Users');
        return response.data;
    }

    async add(entity: User): Promise<void> {
        await apiClient.post('/Users', entity);
    }

    async update(entity: User): Promise<void> {
        await apiClient.put(`/Users/${entity.id}`, entity);
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/Users/${id}`);
    }
}