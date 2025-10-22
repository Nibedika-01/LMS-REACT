import type { BaseEntity } from "./BaseEntity";
import type { Book} from "./Book";
import type { Student } from "./Student";

export interface Issue extends BaseEntity {
    bookId: number;
    bookTitle: string | null;
    studentName: string | null;
    book: Book;
    studentId: string;
    student: Student;
    issueDate: string | null;
    returnDate: string | null;
}