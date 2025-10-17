using AutoMapper;
using Blog.Models;
using Blog.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;

namespace Blog.Controller
{
    [ApiController]
    [Route("api/blog")] // Updated route to use 'api/blog'
    public class BlogController : ControllerBase
    {
        private readonly IBlogRepository _blogRepository;
        private readonly IMapper _mapper;

        public BlogController(IBlogRepository blogRepository, IMapper mapper)
        {
            _blogRepository = blogRepository;
            _mapper = mapper;
        }

        [HttpGet]
        [AllowAnonymous] // Public endpoint - không cần auth
        public async Task<IActionResult> GetBlogs([FromQuery] BlogFilterDto? filter = null)
        {
            try
            {
                // Nếu không có filter hoặc không có search term, lấy tất cả blogs với pagination
                if (filter == null)
                {
                    filter = new BlogFilterDto(); // Sử dụng default values
                }

                var pagedResult = await _blogRepository.GetBlogsWithFilterAsync(filter);
                var blogDtos = _mapper.Map<List<BlogDto>>(pagedResult.Items);

                var result = new BlogListResponse
                {
                    Blogs = blogDtos,
                    Page = pagedResult.Page,
                    Limit = pagedResult.PageSize,
                    TotalItems = pagedResult.TotalCount,
                    TotalPages = pagedResult.TotalPages
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {ex.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }



        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetBlogById(Guid id)
        {
            try
            {
                var blog = await _blogRepository.GetBlogByIdAsync(id);
                if (blog == null)
                {
                    var errorResponse = new ApiErrorResponse
                    {
                        Message = "Error.NotFound",
                        StatusCode = 404
                    };
                    return NotFound(errorResponse);
                }

                var blogDto = _mapper.Map<BlogDto>(blog);
                return Ok(blogDto);
            }
            catch (Exception ex)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {ex.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }

        [HttpPost]
        [Authorize] // Yêu cầu authentication
        public async Task<IActionResult> AddBlog([FromBody] AddBlogRequestDto addBlogRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                    var errorResponse = new ApiErrorResponse
                    {
                        Message = $"Error.Validation: {errors}",
                        StatusCode = 400
                    };
                    return BadRequest(errorResponse);
                }

                // Lấy userId từ Claims để track ai tạo blog
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var blog = _mapper.Map<Models.Blog>(addBlogRequest);
                var createdBlog = await _blogRepository.AddBlogAsync(blog);
                var blogDto = _mapper.Map<BlogDto>(createdBlog);

                return CreatedAtAction(nameof(GetBlogById), new { id = blogDto.Id }, blogDto);
            }
            catch (Exception ex)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {ex.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }



        [HttpPut("{id:guid}")]
        [Authorize] // Yêu cầu authentication
        public async Task<IActionResult> UpdateBlog(Guid id, [FromBody] UpdateBlogRequetsDto updateBlogRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                    var errorResponse = new ApiErrorResponse
                    {
                        Message = $"Error.Validation: {errors}",
                        StatusCode = 400
                    };
                    return BadRequest(errorResponse);
                }

                var blog = _mapper.Map<Models.Blog>(updateBlogRequest);
                var updatedBlog = await _blogRepository.UpdateBlogAsync(id, blog);

                if (updatedBlog == null)
                {
                    var errorResponse = new ApiErrorResponse
                    {
                        Message = "Error.NotFound",
                        StatusCode = 404
                    };
                    return NotFound(errorResponse);
                }

                var blogDto = _mapper.Map<BlogDto>(updatedBlog);
                return Ok(blogDto);
            }
            catch (Exception ex)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {ex.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "ADMIN")] // Chỉ ADMIN mới được xóa
        public async Task<IActionResult> DeleteBlog(Guid id)
        {
            try
            {
                var result = await _blogRepository.DeleteBlogAsync(id);
                if (!result)
                {
                    var errorResponse = new ApiErrorResponse
                    {
                        Message = "Error.NotFound",
                        StatusCode = 404
                    };
                    return NotFound(errorResponse);
                }

                var successResponse = new ApiResponse
                {
                    Message = "Message.DeleteSuccessfully"
                };
                return Ok(successResponse);
            }
            catch (Exception ex)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {ex.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }
    }
}