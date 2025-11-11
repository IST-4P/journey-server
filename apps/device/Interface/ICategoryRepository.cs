using device.Model.Entities;
using device.Model.Dto;

namespace device.Interface
{
    public interface ICategoryRepository
    {
        Task<PagedResult<Category>> GetCategoryAsync(DeviceQuery query);
        Task<Category?> GetCategoryByIdAsync(Guid id);
        Task<Category> CreateCategoryAsync(Category category);
        Task<Category?> UpdateCategoryAsync(Guid id, Category category);
        Task<bool> DeleteCategoryAsync(Guid id);
    }
}