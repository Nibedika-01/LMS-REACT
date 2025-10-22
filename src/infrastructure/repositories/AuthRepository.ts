//implements IAuthRepositories

import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import type { User } from "../../domain/entities/User";
import apiClient from "../api/apiClient";

export class AuthRepository implements IAuthRepository {
    async login(username: string, password: string): Promise<{user: User, token: string}> {
        const response = await apiClient.post('/login', { username, password });
        return response.data;
    }

    async getById(id: number): Promise<User> {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    }

    async getAll(): Promise<User[]> {
        const response = await apiClient.get('/users');
        return response.data;
    }

    async add(entity: User): Promise<void>{
        await apiClient.post('/users', entity); 
    }

    async update(entity: User): Promise<void>{
        await apiClient.put(`/users/${entity.id}`, entity); 
    }

    async delete(id: number): Promise<void>{
        await apiClient.delete(`/users/${id}`); 
    }
}