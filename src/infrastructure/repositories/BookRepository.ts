// implements IBookRepository

import type { IBookRepository } from '../../domain/repositories/IBookRepository';
import type { Book } from '../../domain/entities/Book';
import apiClient from '../api/apiClient';

export class BookRepository implements IBookRepository {
  async getById(id: number): Promise<Book> {
    const response = await apiClient.get(`/books/${id}`);
    return response.data; // Includes author and issues
  }

  async getAll(): Promise<Book[]> {
    const response = await apiClient.get('/books');
    return response.data; // Includes author and issues
  }

  async add(entity: Book): Promise<void> {
    await apiClient.post('/books', entity);
  }

  async update(entity: Book): Promise<void> {
    await apiClient.put(`/books/${entity.id}`, entity);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/books/${id}`); // Backend sets IsDeleted = true
  }
}