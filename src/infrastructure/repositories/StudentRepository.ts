import type { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import type { Student } from '../../domain/entities/Student';
import apiClient from '../api/apiClient';

export class StudentRepository implements IStudentRepository {
  async getById(id: number): Promise<Student> {
    const response = await apiClient.get(`/students/${id}`);
    return response.data; 
  }

  async getAll(): Promise<Student[]> {
    const response = await apiClient.get('/students');
    return response.data; 
  }

  async add(entity: Student): Promise<void> {
    await apiClient.post('/students', entity);
  }

  async update(entity: Student): Promise<void> {
    await apiClient.put(`/students/${entity.id}`, entity);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  }
}