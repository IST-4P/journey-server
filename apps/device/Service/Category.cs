using device.Model.Dto;
using device.Model.Entities;
using Grpc.Core;
using Device;

namespace device.Service
{
    public partial class DeviceGrpcService : DeviceService.DeviceServiceBase
    {
        // CATEGORY

        public override async Task<GetCategoryResponse> GetCategory(GetCategoryRequest request, ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("GetCategory called with CategoryId: {CategoryId}", request.CategoryId);

                if (!Guid.TryParse(request.CategoryId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid CategoryId"));

                var category = await _categoryRepository.GetCategoryByIdAsync(id);
                if (category is null)
                    throw new RpcException(new Status(StatusCode.NotFound, "CategoryId not found"));

                var dto = _mapper.Map<CategoryDto>(category);

                var response = new GetCategoryResponse
                {
                    Id = category.Id.ToString(),
                    Name = category.Name,
                    LogoUrl = category.LogoUrl,
                    CreatedAt = category.CreateAt.ToString("O"),
                    UpdatedAt = category.UpdateAt.ToString("O")
                };

                return response;
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<GetManyCategoriesResponse> GetManyCategories(GetManyCategoriesRequest request, ServerCallContext context)
        {
            try
            {
                var query = new DeviceQuery
                {
                    Page = request.Page,
                    PageSize = request.Limit,
                    Search = request.Search,
                    SortBy = request.SortBy,
                    SortDir = request.SortDir
                };

                var paged = await _categoryRepository.GetCategoryAsync(query);

                // Map entity -> DTO list
                var dtos = _mapper.Map<List<CategoryDto>>(paged.Items);

                var res = new GetManyCategoriesResponse
                {
                    Page = paged.Page,
                    Limit = paged.PageSize,
                    TotalItems = (int)paged.TotalCount,
                    TotalPages = paged.TotalPages
                };

                foreach (var d in dtos)
                {
                    res.Categories.Add(new ManyCategories
                    {
                        Id = d.Id.ToString(),
                        Name = d.Name,
                        LogoUrl = d.LogoUrl,
                        CreatedAt = d.CreateAt.ToString("O"),
                        UpdatedAt = d.UpdateAt.ToString("O")
                    });
                }

                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<CreateCategoryResponse> CreateCategory(CreateCategoryRequest request, ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("CreateCategory called with Name: {Name}", request.Name);

                var dto = new CreateCategoryDto
                {
                    Name = request.Name,
                    LogoUrl = request.LogoUrl
                };

                var entity = _mapper.Map<Category>(dto);
                var created = await _categoryRepository.CreateCategoryAsync(entity);
                var result = _mapper.Map<CategoryDto>(created);

                var response = new CreateCategoryResponse
                {
                    Id = result.Id.ToString(),
                    Name = result.Name,
                    LogoUrl = result.LogoUrl,
                    CreatedAt = result.CreateAt.ToString("O"),
                    UpdatedAt = result.UpdateAt.ToString("O")
                };

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<UpdateCategoryResponse> UpdateCategory(UpdateCategoryRequest request, ServerCallContext context)
        {
            try
            {
                if (!Guid.TryParse(request.CategoryId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid CategoryId"));

                var dto = new UpdateCategoryDto
                {
                    Name = request.Name,
                    LogoUrl = request.LogoUrl
                };

                var entity = _mapper.Map<Category>(dto);
                var updated = await _categoryRepository.UpdateCategoryAsync(id, entity);

                if (updated is null)
                    throw new RpcException(new Status(StatusCode.NotFound, "Category not found"));

                var result = _mapper.Map<CategoryDto>(updated);

                var response = new UpdateCategoryResponse
                {
                    Id = result.Id.ToString(),
                    Name = result.Name,
                    LogoUrl = result.LogoUrl,
                    CreatedAt = result.CreateAt.ToString("O"),
                    UpdatedAt = result.UpdateAt.ToString("O")
                };

                return response;
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating combo");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<DeleteCategoryResponse> DeleteCategory(DeleteCategoryRequest request, ServerCallContext context)
        {
            try
            {
                if (!Guid.TryParse(request.CategoryId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid CategoryId"));

                var result = await _categoryRepository.DeleteCategoryAsync(id);
                if (!result)
                    throw new RpcException(new Status(StatusCode.NotFound, "Category not found"));

                return new DeleteCategoryResponse { Message = "DeletedCategorySuccessful" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

    }

}