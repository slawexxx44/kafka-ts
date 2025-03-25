import { Cluster } from '../cluster';
import { Partitioner } from '../distributors/partitioner';
import { Message } from '../types';
export type ProducerOptions = {
    allowTopicAutoCreation?: boolean;
    partitioner?: Partitioner;
};
export declare class Producer {
    private cluster;
    private options;
    private metadata;
    private producerId;
    private producerEpoch;
    private sequences;
    private partition;
    private lock;
    constructor(cluster: Cluster, options: ProducerOptions);
    send(messages: Message[], { acks }?: {
        acks?: -1 | 1;
    }): Promise<void>;
    close(): Promise<void>;
    private ensureConnected;
    private initProducerId;
    private getSequence;
    private updateSequence;
}
