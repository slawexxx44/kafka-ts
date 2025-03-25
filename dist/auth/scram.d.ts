import { SASLProvider } from '../broker';
export declare const saslScramSha256: ({ username, password }: {
    username: string;
    password: string;
}) => SASLProvider;
export declare const saslScramSha512: ({ username, password }: {
    username: string;
    password: string;
}) => SASLProvider;
