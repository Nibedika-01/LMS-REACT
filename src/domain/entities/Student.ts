import type { BaseEntity } from "./BaseEntity";
import type { Issue } from "./Issue";

export interface Student extends BaseEntity {
    name: string;
    address: string;
    contactNo: string;
    faculty: string;
    semester: string;
    issues: Issue[];
}