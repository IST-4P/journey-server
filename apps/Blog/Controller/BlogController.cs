using AutoMapper;
using Blog.Models;
using Blog.Repository;
using Microsoft.AspNetCore.Mvc;

namespace Blog.Controller
{
    [ApiController]
    [Route("api/[controller]")]
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
        public async Task<IActionResult> GetBlogs([FromQuery] BlogFilterDto? filter = null)
        {
            try
            {
                if (filter == null)
                {
                    var blogs = await _blogRepository.GetBlogsAsync();
                    var blogDtos = _mapper.Map<List<BlogDto>>(blogs);
                    return Ok(blogDtos);
                }
                else
                {
                    var pagedResult = await _blogRepository.GetBlogsWithFilterAsync(filter);
                    var blogDtos = _mapper.Map<List<BlogDto>>(pagedResult.Items);

                    var result = new PagedResult<BlogDto>
                    {
                        Items = blogDtos,
                        TotalCount = pagedResult.TotalCount,
                        Page = pagedResult.Page,
                        PageSize = pagedResult.PageSize
                    };

                    return Ok(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchBlogs([FromQuery] BlogFilterDto filter)
        {
            try
            {
                var pagedResult = await _blogRepository.GetBlogsWithFilterAsync(filter);
                var blogDtos = _mapper.Map<List<BlogDto>>(pagedResult.Items);

                var result = new PagedResult<BlogDto>
                {
                    Items = blogDtos,
                    TotalCount = pagedResult.TotalCount,
                    Page = pagedResult.Page,
                    PageSize = pagedResult.PageSize
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
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
                    return NotFound($"Blog with ID {id} not found");
                }

                var blogDto = _mapper.Map<BlogDto>(blog);
                return Ok(blogDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddBlog([FromBody] AddBlogRequestDto addBlogRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var blog = _mapper.Map<Models.Blog>(addBlogRequest);
                var createdBlog = await _blogRepository.AddBlogAsync(blog);
                var blogDto = _mapper.Map<BlogDto>(createdBlog);

                return CreatedAtAction(nameof(GetBlogById), new { id = blogDto.Id }, blogDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("html")]
        public async Task<IActionResult> AddBlogWithHtml([FromForm] string title, [FromForm] string content, [FromForm] string region, [FromForm] string thumbnail)
        {
            try
            {
                var addBlogRequest = new AddBlogRequestDto
                {
                    Title = title,
                    Content = content,
                    Region = region,
                    Thumbnail = thumbnail
                };

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var blog = _mapper.Map<Models.Blog>(addBlogRequest);
                var createdBlog = await _blogRepository.AddBlogAsync(blog);
                var blogDto = _mapper.Map<BlogDto>(createdBlog);

                return CreatedAtAction(nameof(GetBlogById), new { id = blogDto.Id }, blogDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateBlog(Guid id, [FromBody] UpdateBlogRequetsDto updateBlogRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var blog = _mapper.Map<Models.Blog>(updateBlogRequest);
                var updatedBlog = await _blogRepository.UpdateBlogAsync(id, blog);

                if (updatedBlog == null)
                {
                    return NotFound($"Blog with ID {id} not found");
                }

                var blogDto = _mapper.Map<BlogDto>(updatedBlog);
                return Ok(blogDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteBlog(Guid id)
        {
            try
            {
                var result = await _blogRepository.DeleteBlogAsync(id);
                if (!result)
                {
                    return NotFound($"Blog with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}