using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NexTrade.Core.Interfaces;

namespace NexTrade.Infrastructure.Services;

public class SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendAsync(string to, string subject, string body, CancellationToken ct = default)
    {
        var host = configuration["Email:Smtp:Host"] ?? "localhost";
        var port = int.TryParse(configuration["Email:Smtp:Port"], out var p) ? p : 1025;
        var from = configuration["Email:FromAddress"] ?? "noreply@nextrade.io";
        var user = configuration["Email:Smtp:Username"];
        var pass = configuration["Email:Smtp:Password"];

        using var client = new SmtpClient(host, port);
        if (!string.IsNullOrEmpty(user))
            client.Credentials = new NetworkCredential(user, pass);

        using var message = new MailMessage(from, to, subject, body) { IsBodyHtml = true };

        try
        {
            await client.SendMailAsync(message, ct);
            logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {To}", to);
        }
    }
}
