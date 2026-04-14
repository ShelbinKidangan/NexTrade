using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Hubs;

[Authorize]
public class ChatHub(ConversationService service) : Hub
{
    private Guid TenantId => Guid.TryParse(Context.User?.FindFirst("tenant_id")?.Value, out var id) ? id : Guid.Empty;
    private long UserId => long.TryParse(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 0;

    // Client joins a conversation group
    public async Task JoinConversation(string conversationUid)
    {
        if (!Guid.TryParse(conversationUid, out var uid)) return;
        var r = await service.GetAsync(uid, Context.ConnectionAborted);
        if (!r.Succeeded) return;
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conv:{uid}");
    }

    public async Task LeaveConversation(string conversationUid)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conv:{conversationUid}");
    }

    // Server-to-server broadcast of a new message — called from ConversationsController
    // Clients listen for "messageReceived" and "messageRead" + "typing"

    public async Task Typing(string conversationUid)
    {
        await Clients.OthersInGroup($"conv:{conversationUid}")
            .SendAsync("typing", new { conversationUid, businessUid = TenantId, userId = UserId });
    }
}
