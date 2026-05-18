using Microsoft.AspNetCore.Mvc;
using Web_Application.Api;
using Web_Application.Models;

namespace Web_Application.Controllers
{
    [ApiController]
    [Route("api/content")]
    public class ContentController : ControllerBase
    {
        private readonly IContentController _contentService;

        public ContentController(IContentController contentService)
        {
            _contentService = contentService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_contentService.GetAll());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(Guid id)
        {
            var result = _contentService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("search")]
        public IActionResult Search([FromQuery] string keyword)
        {
            return Ok(_contentService.Search(keyword));
        }

        [HttpPost]
        public IActionResult Add([FromBody] ContentRequest request)
        {
            _contentService.Add(request);
            return StatusCode(201);
        }

        [HttpPut("{id}")]
        public IActionResult Update(Guid id, [FromBody] ContentRequest request)
        {
            _contentService.Update(id, request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            _contentService.Delete(id);
            return NoContent();
        }
    }
}
