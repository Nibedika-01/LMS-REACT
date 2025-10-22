import type { BaseEntity } from "./BaseEntity";
import type { Issue } from "./Issue";
import type { Author } from "./Author";

export interface Book extends BaseEntity {
    title: string;
    authorId: number;
    author: Author;
    genre: string;
    publisher: string;
    publicationDate: string | null;
    issues: Issue[];
}