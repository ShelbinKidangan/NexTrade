using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Infrastructure.Services;

public class SavedSuppliersService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant)
{
    public record SavedSupplierDto(
        Guid Uid, Guid SupplierUid, string SupplierName, bool SupplierVerified,
        string? SupplierLogo, string? SupplierCountry,
        Guid? ListUid, string? ListName, string? Notes, DateTime CreatedAt);

    public record SupplierListDto(Guid Uid, string Name, string? Description, int SupplierCount, DateTime CreatedAt);

    public record SaveSupplierRequest(Guid SupplierUid, Guid? ListUid, string? Notes);
    public record UpdateSavedSupplierRequest(Guid? ListUid, string? Notes);
    public record CreateListRequest(string Name, string? Description);
    public record UpdateListRequest(string? Name, string? Description);

    // --- Suppliers ---
    public async Task<List<SavedSupplierDto>> ListAsync(Guid? listUid, CancellationToken ct)
    {
        var query = db.SavedSuppliers
            .Include(s => s.SupplierList)
            .AsQueryable();

        if (listUid is not null)
            query = query.Where(s => s.SupplierList != null && s.SupplierList.Uid == listUid);

        var saved = await query.OrderByDescending(s => s.CreatedAt).ToListAsync(ct);
        var supplierUids = saved.Select(s => s.SupplierBusinessUid).Distinct().ToList();

        var suppliers = await db.Businesses
            .IgnoreQueryFilters()
            .Where(b => supplierUids.Contains(b.Uid))
            .Include(b => b.Profile)
            .Select(b => new { b.Uid, b.Name, b.IsVerified, Logo = b.Profile != null ? b.Profile.Logo : null,
                Country = b.Profile != null ? b.Profile.CountryCode : null })
            .ToListAsync(ct);
        var map = suppliers.ToDictionary(s => s.Uid);

        return saved.Select(s =>
        {
            map.TryGetValue(s.SupplierBusinessUid, out var b);
            return new SavedSupplierDto(
                s.Uid, s.SupplierBusinessUid, b?.Name ?? "Unknown", b?.IsVerified ?? false,
                b?.Logo, b?.Country,
                s.SupplierList?.Uid, s.SupplierList?.Name, s.Notes, s.CreatedAt);
        }).ToList();
    }

    public async Task<ServiceResult<SavedSupplierDto>> SaveAsync(SaveSupplierRequest req, CancellationToken ct)
    {
        if (req.SupplierUid == tenant.TenantId)
            return ServiceResult<SavedSupplierDto>.Fail("Cannot save your own business.", 400);

        var supplier = await db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Profile)
            .FirstOrDefaultAsync(b => b.Uid == req.SupplierUid, ct);
        if (supplier is null)
            return ServiceResult<SavedSupplierDto>.Fail("Supplier not found.", 404);

        var existing = await db.SavedSuppliers
            .FirstOrDefaultAsync(s => s.SupplierBusinessUid == req.SupplierUid, ct);
        if (existing is not null)
            return ServiceResult<SavedSupplierDto>.Fail("Supplier already saved.", 409);

        SupplierList? list = null;
        if (req.ListUid is not null)
        {
            list = await db.SupplierLists.FirstOrDefaultAsync(l => l.Uid == req.ListUid, ct);
            if (list is null)
                return ServiceResult<SavedSupplierDto>.Fail("List not found.", 400);
        }

        var saved = new SavedSupplier
        {
            SupplierBusinessUid = req.SupplierUid,
            SupplierListId = list?.Id,
            Notes = req.Notes
        };
        db.SavedSuppliers.Add(saved);
        await uow.SaveChangesAsync(ct);

        return ServiceResult<SavedSupplierDto>.Created(new SavedSupplierDto(
            saved.Uid, supplier.Uid, supplier.Name, supplier.IsVerified,
            supplier.Profile?.Logo, supplier.Profile?.CountryCode,
            list?.Uid, list?.Name, saved.Notes, saved.CreatedAt));
    }

    public async Task<ServiceResult> UpdateAsync(Guid uid, UpdateSavedSupplierRequest req, CancellationToken ct)
    {
        var saved = await db.SavedSuppliers.FirstOrDefaultAsync(s => s.Uid == uid, ct);
        if (saved is null) return ServiceResult.Fail("Saved supplier not found.", 404);

        if (req.Notes is not null) saved.Notes = req.Notes;
        if (req.ListUid is not null)
        {
            var list = await db.SupplierLists.FirstOrDefaultAsync(l => l.Uid == req.ListUid, ct);
            if (list is null) return ServiceResult.Fail("List not found.", 400);
            saved.SupplierListId = list.Id;
        }

        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> RemoveAsync(Guid uid, CancellationToken ct)
    {
        var saved = await db.SavedSuppliers.FirstOrDefaultAsync(s => s.Uid == uid, ct);
        if (saved is null) return ServiceResult.Fail("Saved supplier not found.", 404);

        db.SavedSuppliers.Remove(saved);
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    // --- Lists ---
    public async Task<List<SupplierListDto>> GetListsAsync(CancellationToken ct)
    {
        var lists = await db.SupplierLists
            .OrderBy(l => l.Name)
            .Select(l => new SupplierListDto(l.Uid, l.Name, l.Description, l.Suppliers.Count, l.CreatedAt))
            .ToListAsync(ct);
        return lists;
    }

    public async Task<ServiceResult<SupplierListDto>> CreateListAsync(CreateListRequest req, CancellationToken ct)
    {
        var exists = await db.SupplierLists.AnyAsync(l => l.Name == req.Name, ct);
        if (exists)
            return ServiceResult<SupplierListDto>.Fail("A list with that name already exists.", 409);

        var list = new SupplierList { Name = req.Name, Description = req.Description };
        db.SupplierLists.Add(list);
        await uow.SaveChangesAsync(ct);

        return ServiceResult<SupplierListDto>.Created(new SupplierListDto(list.Uid, list.Name, list.Description, 0, list.CreatedAt));
    }

    public async Task<ServiceResult> UpdateListAsync(Guid uid, UpdateListRequest req, CancellationToken ct)
    {
        var list = await db.SupplierLists.FirstOrDefaultAsync(l => l.Uid == uid, ct);
        if (list is null) return ServiceResult.Fail("List not found.", 404);

        if (req.Name is not null) list.Name = req.Name;
        if (req.Description is not null) list.Description = req.Description;

        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteListAsync(Guid uid, CancellationToken ct)
    {
        var list = await db.SupplierLists
            .Include(l => l.Suppliers)
            .FirstOrDefaultAsync(l => l.Uid == uid, ct);
        if (list is null) return ServiceResult.Fail("List not found.", 404);

        foreach (var s in list.Suppliers)
            s.SupplierListId = null;

        db.SupplierLists.Remove(list);
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }
}
