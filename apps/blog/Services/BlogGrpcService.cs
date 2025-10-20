using AutoMapper;
using Blog.Repository;
using Grpc.Core;

namespace Blog.Services
{
    public class BlogGrpcService : global::Blog.BlogService.BlogServiceBase
    {
        private readonly IBlogRepository _blogRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<BlogGrpcService> _logger;

        public BlogGrpcService(
            IBlogRepository blogRepository, 
            IMapper mapper,
            ILogger<BlogGrpcService> logger)
        {
            _blogRepository = blogRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public override async Task<GetBlogResponse> GetBlog(
            GetBlogRequest request, 
            ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("GetBlog called with blogId: {BlogId}", request.BlogId);

                if (!Guid.TryParse(request.BlogId, out var blogId))
                {
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Error.InvalidBlogId"));
                }

                var blog = await _blogRepository.GetBlogByIdAsync(blogId);
                if (blog == null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Error.BlogNotFound"));
                }

                return new GetBlogResponse
                {
                    Id = blog.Id.ToString(),
                    Title = blog.Title,
                    Content = blog.Content,
                    Type = blog.Region, // Mapping Region to Type based on proto
                    Region = blog.Region,
                    Thumbnail = blog.Thumbnail,
                    CreatedAt = blog.CreateAt.ToString("O"),
                    UpdatedAt = blog.UpdateAt.ToString("O")
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting blog: {BlogId}", request.BlogId);
                throw new RpcException(new Status(StatusCode.Internal, $"Internal error: {ex.Message}"));
            }
        }

        public override async Task<GetManyBlogsResponse> GetManyBlogs(
            GetManyBlogsRequest request, 
            ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("GetManyBlogs called with page: {Page}, limit: {Limit}", 
                    request.Page, request.Limit);

                var filter = new Models.BlogFilterDto
                {
                    Page = request.Page > 0 ? request.Page : 1,
                    PageSize = request.Limit > 0 ? request.Limit : 10
                };

                var pagedResult = await _blogRepository.GetBlogsWithFilterAsync(filter);

                var response = new GetManyBlogsResponse
                {
                    Page = pagedResult.Page,
                    Limit = pagedResult.PageSize,
                    TotalItems = pagedResult.TotalCount,
                    TotalPages = pagedResult.TotalPages
                };

                foreach (var blog in pagedResult.Items)
                {
                    response.Blogs.Add(new GetManyBlogs
                    {
                        Id = blog.Id.ToString(),
                        Title = blog.Title,
                        Type = blog.Region,
                        Region = blog.Region,
                        Thumbnail = blog.Thumbnail,
                        CreatedAt = blog.CreateAt.ToString("O"),
                        UpdatedAt = blog.UpdateAt.ToString("O")
                    });
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting many blogs");
                throw new RpcException(new Status(StatusCode.Internal, $"Internal error: {ex.Message}"));
            }
        }

        public override async Task<GetBlogResponse> CreateBlog(
            CreateBlogRequest request, 
            ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("CreateBlog called with title: {Title}", request.Title);

                var blog = new Models.Blog
                {
                    Title = request.Title,
                    Type = request.Type,
                    Content = request.Content,
                    Region = request.Region,
                    Thumbnail = request.Thumbnail
                };

                var createdBlog = await _blogRepository.AddBlogAsync(blog);

                return new GetBlogResponse
                {
                    Id = createdBlog.Id.ToString(),
                    Title = createdBlog.Title,
                    Content = createdBlog.Content,
                    Type = createdBlog.Region,
                    Region = createdBlog.Region,
                    Thumbnail = createdBlog.Thumbnail,
                    CreatedAt = createdBlog.CreateAt.ToString("O"),
                    UpdatedAt = createdBlog.UpdateAt.ToString("O")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating blog");
                throw new RpcException(new Status(StatusCode.Internal, $"Internal error: {ex.Message}"));
            }
        }

        public override async Task<GetBlogResponse> UpdateBlog(
            UpdateBlogRequest request, 
            ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("UpdateBlog called with blogId: {BlogId}", request.BlogId);

                if (!Guid.TryParse(request.BlogId, out var blogId))
                {
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Error.InvalidBlogId"));
                }

                var existingBlog = await _blogRepository.GetBlogByIdAsync(blogId);
                if (existingBlog == null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Error.BlogNotFound"));
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(request.Title))
                    existingBlog.Title = request.Title;
                
                if (!string.IsNullOrEmpty(request.Content))
                    existingBlog.Content = request.Content;
                
                if (!string.IsNullOrEmpty(request.Region))
                    existingBlog.Region = request.Region;
                
                if (!string.IsNullOrEmpty(request.Thumbnail))
                    existingBlog.Thumbnail = request.Thumbnail;

                var updatedBlog = await _blogRepository.UpdateBlogAsync(blogId, existingBlog);

                if (updatedBlog == null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Error.BlogNotFound"));
                }

                return new GetBlogResponse
                {
                    Id = updatedBlog.Id.ToString(),
                    Title = updatedBlog.Title,
                    Content = updatedBlog.Content,
                    Type = updatedBlog.Region,
                    Region = updatedBlog.Region,
                    Thumbnail = updatedBlog.Thumbnail,
                    CreatedAt = updatedBlog.CreateAt.ToString("O"),
                    UpdatedAt = updatedBlog.UpdateAt.ToString("O")
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating blog: {BlogId}", request.BlogId);
                throw new RpcException(new Status(StatusCode.Internal, $"Internal error: {ex.Message}"));
            }
        }

        public override async Task<DeleteBlogResponse> DeleteBlog(
            DeleteBlogRequest request, 
            ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("DeleteBlog called with blogId: {BlogId}", request.BlogId);

                if (!Guid.TryParse(request.BlogId, out var blogId))
                {
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Error.InvalidBlogId"));
                }

                var result = await _blogRepository.DeleteBlogAsync(blogId);
                if (!result)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Error.BlogNotFound"));
                }

                return new DeleteBlogResponse
                {
                    Message = "Blog deleted successfully"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting blog: {BlogId}", request.BlogId);
                throw new RpcException(new Status(StatusCode.Internal, $"Internal error: {ex.Message}"));
            }
        }
    }
}
