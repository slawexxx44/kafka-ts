import { Assignment } from '../api/sync-group';
import { Metadata } from '../metadata';
export declare class ConsumerMetadata extends Metadata {
    private assignment;
    getAssignment(): Assignment;
    setAssignment(newAssignment: Assignment): void;
}
