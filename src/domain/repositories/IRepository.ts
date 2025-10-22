import type { BaseEntity } from "../entities/BaseEntity";

export interface IRepository<T extends BaseEntity> {
    getById(id: number): Promise<T>;
    getAll(): Promise<T[]>;
    add(entity: T): Promise<void>;
    update(entity: T): Promise<void>;
    delete(id: number): Promise<void>;
}