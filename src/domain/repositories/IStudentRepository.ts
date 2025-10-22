import type { IRepository } from "./IRepository";
import type { Student } from "../entities/Student";

export interface IStudentRepository extends IRepository<Student> {}