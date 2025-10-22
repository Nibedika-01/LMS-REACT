//borrowing related apis

import type { IRepository } from "./IRepository";
import type { Issue } from '../entities/Issue';

export interface IIssueRepository extends IRepository<Issue> {
  issueBook(bookId: number, studentId: number): Promise<Issue>;
}