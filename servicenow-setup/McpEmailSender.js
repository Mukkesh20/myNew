/**
 * ServiceNow Script Include to send emails directly from the platform
 * You'll need to create this in your ServiceNow instance to enable direct email sending
 */

var McpEmailSender = Class.create();
McpEmailSender.prototype = {
  initialize: function() {
    this.name = "McpEmailSender";
  },
  
  /**
   * Send an email using ServiceNow's native email capabilities
   * This bypasses notification rules and sends email directly
   */
  sendEmail: function(to, subject, body, from) {
    try {
      var email = new GlideEmail();
      email.setTo(to);
      email.setSubject(subject);
      email.setBody(body);
      
      if (from && from.length > 0) {
        email.setFrom(from);
      }
      
      var result = email.send();
      
      return {
        success: result,
        message: "Email sent via GlideEmail",
        to: to,
        subject: subject
      };
    } catch (ex) {
      var errorMsg = ex.getMessage ? ex.getMessage() : ex.toString();
      return {
        success: false,
        error: errorMsg,
        message: "Failed to send email"
      };
    }
  },
  
  type: 'McpEmailSender'
};
