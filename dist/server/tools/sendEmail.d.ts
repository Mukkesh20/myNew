import { McpContext } from '@/types/mcp';
interface SendEmailParams {
    to: string;
    subject: string;
    body: string;
    from?: string;
}
export declare function sendEmail(ctx: McpContext, params: SendEmailParams): Promise<any>;
declare const _default: {
    name: string;
    description: string;
    parameters: {
        type: string[];
        properties: {
            to: {
                type: string;
                description: string;
            };
            subject: {
                type: string;
                description: string;
            };
            body: {
                type: string;
                description: string;
            };
            from: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: typeof sendEmail;
};
export default _default;
//# sourceMappingURL=sendEmail.d.ts.map