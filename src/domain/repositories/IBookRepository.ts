//book ko crud api calls

import type { IRepository } from "./IRepository";
import type { Book } from "../entities/Book";

export interface IBookRepository extends IRepository<Book> {}