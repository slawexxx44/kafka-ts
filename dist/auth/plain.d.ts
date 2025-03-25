import { SASLProvider } from "../broker";
export declare const saslPlain: ({ username, password }: {
    username: string;
    password: string;
}) => SASLProvider;
