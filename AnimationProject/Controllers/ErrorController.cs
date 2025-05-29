using Microsoft.AspNetCore.Mvc;

namespace AnimationProject.Controllers
{
    [Route("Error/{statusCode}")]
    public class ErrorController : Controller
    {
        [HttpGet]
        public IActionResult Index(int statusCode)
        {
           
            if (statusCode == 404) return View("NotFound");    
                                                              
            return View("Generic");                        
        }
    }
}
