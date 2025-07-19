/**
 * ServiceNow Scripted REST API for Email Sending
 * Create this in your ServiceNow instance under System Web Services > Scripted REST APIs
 * 
 * API Name: MCP Email API
 * API ID: mcp_email_api
 * 
 * After creating the API, add a new Resource with:
 * - HTTP method: POST
 * - Name: send_email
 * - Relative path: /send
 * - Then paste the script below into the Script field
 */

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    // Get the request body
    var requestBody = request.body.data;
    if (!requestBody) {
        return response.setError('No request body provided');
    }
    
    // Extract parameters
    var to = requestBody.to || '';
    var subject = requestBody.subject || 'Email from MCP Server';
    var body = requestBody.body || '';
    var from = requestBody.from || '';
    
    // Validate required fields
    if (!to) {
        return response.setError('Recipient email address is required');
    }
    
    if (!body) {
        return response.setError('Email body is required');
    }
    
    // Use the McpEmailSender script include
    var sender = new McpEmailSender();
    var result = sender.sendEmail(to, subject, body, from);
    
    // Return the result
    if (result.success) {
        return response.setBody({
            status: 'success',
            message: result.message,
            details: {
                to: to,
                subject: subject
            }
        });
    } else {
        return response.setError(result.error || 'Failed to send email');
    }
})(request, response);
