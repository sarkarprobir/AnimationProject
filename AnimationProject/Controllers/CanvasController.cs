using Microsoft.AspNetCore.Mvc;

namespace AnimationProject.Controllers
{
    public class CanvasController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult VerticalIndex()
        {
            return View();
        }
    }
}
