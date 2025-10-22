import type { BaseEntity } from "./BaseEntity";
import type {Book} from "./Book";

export interface Author extends BaseEntity {
    authorName: string;
    books: Book[];
}