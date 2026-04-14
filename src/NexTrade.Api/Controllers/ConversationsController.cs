using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NexTrade.Api.Hubs;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/conversations")]
[Authorize]
public class ConversationsController(
    ConversationService service,
    IHubContext<ChatHub> hub) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> List(
        [FromQuery] ConversationService.ConversationFilter filter, CancellationToken ct)
        => Ok(await service.ListAsync(filter, ct));

    [HttpGet("{uid:guid}")]
    public async Task<ActionResult> Get(Guid uid, CancellationToken ct)
    {
        var r = await service.GetAsync(uid, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpGet("{uid:guid}/messages")]
    public async Task<ActionResult> GetMessages(
        Guid uid, [FromQuery] ConversationService.MessageFilter filter, CancellationToken ct)
    {
        var r = await service.GetMessagesAsync(uid, filter, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/messages")]
    public async Task<ActionResult> Send(
        Guid uid, [FromBody] ConversationService.SendMessageRequest req, CancellationToken ct)
    {
        var r = await service.SendAsync(uid, req, ct);
        if (!r.Succeeded) return StatusCode(r.StatusCode, new { message = r.Error });

        await hub.Clients.Group($"conv:{uid}").SendAsync("messageReceived", r.Data, ct);
        return StatusCode(r.StatusCode, r.Data);
    }

    [HttpPost("{uid:guid}/read")]
    public async Task<ActionResult> Read(
        Guid uid, [FromBody] ConversationService.ReadUpToRequest req, CancellationToken ct)
    {
        var r = await service.MarkReadAsync(uid, req.MessageId, ct);
        if (!r.Succeeded) return StatusCode(r.StatusCode, new { message = r.Error });

        await hub.Clients.Group($"conv:{uid}").SendAsync("messageRead", new
        {
            conversationUid = uid,
            upToMessageId = req.MessageId,
        }, ct);
        return NoContent();
    }

    [HttpPost("find-or-create")]
    public async Task<ActionResult> FindOrCreate(
        [FromBody] ConversationService.FindOrCreateRequest req, CancellationToken ct)
    {
        var r = await service.FindOrCreateAsync(req, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
