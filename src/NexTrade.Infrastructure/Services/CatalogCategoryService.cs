using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Infrastructure.Services;

public class CatalogCategoryService(AppDbContext db, IUnitOfWork uow)
{
    public record CategoryDto(Guid Uid, string Name, string Slug, Guid? ParentUid, int Level, int SortOrder, bool IsActive);

    public record CreateCategoryRequest(string Name, string Slug, Guid? ParentUid, int SortOrder = 0);
    public record UpdateCategoryRequest(string? Name, string? Slug, Guid? ParentUid, int? SortOrder, bool? IsActive);

    public async Task<List<CategoryDto>> GetAllAsync(CancellationToken ct)
    {
        var all = await db.CatalogCategories
            .OrderBy(c => c.Level).ThenBy(c => c.SortOrder).ThenBy(c => c.Name)
            .ToListAsync(ct);

        var idToUid = all.ToDictionary(c => c.Id, c => c.Uid);
        return all.Select(c => new CategoryDto(
            c.Uid, c.Name, c.Slug,
            c.ParentCategoryId.HasValue && idToUid.TryGetValue(c.ParentCategoryId.Value, out var p) ? p : null,
            c.Level, c.SortOrder, c.IsActive)).ToList();
    }

    public async Task<ServiceResult<CategoryDto>> CreateAsync(CreateCategoryRequest req, CancellationToken ct)
    {
        var slugTaken = await db.CatalogCategories.AnyAsync(c => c.Slug == req.Slug, ct);
        if (slugTaken)
            return ServiceResult<CategoryDto>.Fail("Slug already exists.", 409);

        CatalogCategory? parent = null;
        if (req.ParentUid is not null)
        {
            parent = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == req.ParentUid, ct);
            if (parent is null)
                return ServiceResult<CategoryDto>.Fail("Parent category not found.", 400);
        }

        var category = new CatalogCategory
        {
            Name = req.Name,
            Slug = req.Slug,
            ParentCategoryId = parent?.Id,
            Level = parent is null ? 0 : parent.Level + 1,
            SortOrder = req.SortOrder,
            IsActive = true
        };

        db.CatalogCategories.Add(category);
        await uow.SaveChangesAsync(ct);

        return ServiceResult<CategoryDto>.Created(new CategoryDto(
            category.Uid, category.Name, category.Slug, parent?.Uid, category.Level, category.SortOrder, category.IsActive));
    }

    public async Task<ServiceResult> UpdateAsync(Guid uid, UpdateCategoryRequest req, CancellationToken ct)
    {
        var category = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (category is null) return ServiceResult.Fail("Category not found.", 404);

        if (req.Name is not null) category.Name = req.Name;
        if (req.Slug is not null) category.Slug = req.Slug;
        if (req.SortOrder is not null) category.SortOrder = req.SortOrder.Value;
        if (req.IsActive is not null) category.IsActive = req.IsActive.Value;

        if (req.ParentUid is not null)
        {
            var parent = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == req.ParentUid, ct);
            if (parent is null) return ServiceResult.Fail("Parent category not found.", 400);
            category.ParentCategoryId = parent.Id;
            category.Level = parent.Level + 1;
        }

        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(Guid uid, CancellationToken ct)
    {
        var category = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (category is null) return ServiceResult.Fail("Category not found.", 404);

        var hasChildren = await db.CatalogCategories.AnyAsync(c => c.ParentCategoryId == category.Id, ct);
        if (hasChildren) return ServiceResult.Fail("Cannot delete a category that has sub-categories.", 409);

        var hasItems = await db.CatalogItems
            .IgnoreQueryFilters()
            .AnyAsync(c => c.CategoryId == category.Id, ct);
        if (hasItems) return ServiceResult.Fail("Cannot delete a category in use by catalog items.", 409);

        db.CatalogCategories.Remove(category);
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }
}
