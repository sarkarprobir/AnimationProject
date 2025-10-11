using AnimationProject.Helpers;
using AnimationProject.Models;
using AnimationProject.Models.Common;
using AnimationProject.Services;
using log4net;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Dynamic;
using System.Reflection;

namespace AnimationProject.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IAPIService _apiService;
    private readonly ISessionService _sessionService;
    private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
    public HomeController(ILogger<HomeController> logger, IAPIService apiService, ISessionService sessionService)
    {
        _logger = logger;
        _apiService = apiService;
        _sessionService = sessionService;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new Models.ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    #region User
    public IActionResult Login()
    {
        dynamic dyLogin = new ExpandoObject();
        dyLogin.adminPersonUserID = Request.Cookies["_aniboard_UserID"];
        dyLogin.adminPersonUserPassword = Request.Cookies["_aniboard_UserPassword"];
        dyLogin.errMsg = "";
        return View(dyLogin);
    }
    [HttpPost]
    public async Task<IActionResult> Login(string emailInput, string passwordInput, bool remember_me)
    {
        dynamic dyLogin = new ExpandoObject();
        try
        {
            if (string.IsNullOrEmpty(emailInput) || string.IsNullOrEmpty(passwordInput))
            {
                return Json(0);
            }
            string logincookies = string.Empty;
            string loginip = string.Empty;
            CookieOptions option = new CookieOptions();

            dyLogin.UserID = "";
            dyLogin.UserPassword = "";
            dyLogin.errMsg = "";
            if (remember_me == true)
            {
                var random = new Random();
                logincookies = random.Next().ToString() + Convert.ToString(DateTime.Now.ToString("yyyyMMddHHmmss"));
                option.Expires = DateTime.Now.AddDays(180);
                Response.Cookies.Append("_aniboard_loginKey", logincookies, option);
                Response.Cookies.Append("_aniboard_UserID", emailInput, option);
                Response.Cookies.Append("_aniboard_UserPassword", passwordInput, option);
            }
            else
            {
                Response.Cookies.Delete("_aniboard_loginKey");
                Response.Cookies.Delete("_aniboard_UserID");
                Response.Cookies.Delete("_aniboard_UserPassword");
            }
            string remoteIpAddress = HttpContext.Connection.RemoteIpAddress.ToString();
            Encrypt en = new Encrypt();
            string md5Password = Encrypt.Encode(passwordInput.Trim());
            User user = new User();

            // calling api
            var queryParams = new Dictionary<string, string?>();

            if (!string.IsNullOrEmpty(emailInput))
                queryParams["userEmail"] = emailInput;

            if (!string.IsNullOrEmpty(passwordInput))
                queryParams["userPassword"] = passwordInput;

            var users = await _apiService.GetAsync<ApiResponse<List<User>>>("Backoffice/UserGet", queryParams);

            if (users != null)
            {
                if (users.Status == true && users.Data.Count > 0)
                {
                    user = users.Data[0];
                    if (!string.IsNullOrEmpty(user.CustomerId))
                    {
                        _sessionService.SetUser(user);
                        return Redirect("/Canvas/VerticalIndex?openModal=true");
                    }
                }
                else
                {
                    dyLogin.errMsg = "User / Password incorrect";
                    return View(dyLogin);
                }
            }
            else
            {
                dyLogin.errMsg = "User / Password incorrect";
                return View(dyLogin);
            }

        }
        catch (Exception ex)
        {
            log.Info("****** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
            dyLogin.errMsg = ex.Message;
            return View(dyLogin);
        }
        return Json(1);
    }

    #endregion

    #region UserAccount
    public IActionResult Account()
    {
        var user=_sessionService.GetUser();
        if (user == null)
        {
            return RedirectToAction("Login", "Home");
        }
        return View(user);

    }
    #endregion
}
