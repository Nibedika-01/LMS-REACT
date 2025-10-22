import type { IRepository } from "./IRepository";
import type { Author } from "../entities/Author";

export interface IAuthorRepository extends IRepository<Author> {}