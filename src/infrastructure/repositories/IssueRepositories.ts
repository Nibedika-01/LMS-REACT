//implements IBorrowRepository
import type { IIssueRepository } from '../../domain/repositories/IIssueRepository';
import type { Issue } from '../../domain/entities/Issue';
import apiClient from '../api/apiClient';

export class IssueRepository implements IIssueRepository {
  async getById(id: number): Promise<Issue> {
    const response = await apiClient.get(`/issues/${id}`);
    return response.data; // Includes book and student
  }

  async getAll(): Promise<Issue[]> {
    const response = await apiClient.get('/issues');
    return response.data; // Includes book and student
  }

  async add(entity: Issue): Promise<void> {
    await apiClient.post('/issues', entity);
  }

  async update(entity: Issue): Promise<void> {
    await apiClient.put(`/issues/${entity.id}`, entity);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/issues/${id}`); // Backend sets IsDeleted = true
  }

  async issueBook(bookId: number, studentId: number): Promise<Issue> {
    const response = await apiClient.post('/issues', { bookId, studentId });
    return response.data; // Includes book and student
  }
}