// implemenrs IUserRepository

import type { IAuthorRepository } from '../../domain/repositories/IAuthorRepository';
import type { Author } from '../../domain/entities/Author';
import apiClient from '../api/apiClient';

export class AuthorRepository implements IAuthorRepository {
  async getById(id: number): Promise<Author> {
    const response = await apiClient.get(`/authors/${id}`);
    return response.data; // Includes books
  }

  async getAll(): Promise<Author[]> {
    const response = await apiClient.get('/authors');
    return response.data; // Includes books
  }

  async add(entity: Author): Promise<void> {
    await apiClient.post('/authors', entity);
  }

  async update(entity: Author): Promise<void> {
    await apiClient.put(`/authors/${entity.id}`, entity);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/authors/${id}`); // Backend sets IsDeleted = true
  }
}