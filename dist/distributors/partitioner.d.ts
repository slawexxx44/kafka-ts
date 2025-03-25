import { Metadata } from '../metadata';
import { Message } from '../types';
export type Partition = (message: Message) => number;
export type Partitioner = (context: {
    metadata: Metadata;
}) => Partition;
export declare const defaultPartitioner: Partitioner;
