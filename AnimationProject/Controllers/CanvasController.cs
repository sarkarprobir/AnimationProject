using AnimationProject.Generic;
using AnimationProject.Helpers;
using AnimationProject.Models;
using AnimationProject.Models.Common;
using AnimationProject.Services;
using DocumentFormat.OpenXml.EMMA;
using DocumentFormat.OpenXml.Office2016.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using log4net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;


namespace AnimationProject.Controllers
{
   
    public class CanvasController : Controller
    {
        private readonly IServiceAPI _restAPI;
        private readonly ICheckSession _checkSession;
        private readonly IRefreshNotifier _refreshNotifier;
        private readonly ISessionService _sessionService;

        private readonly AppSettings _appSettings;

        private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        private readonly IHttpContextAccessor _httpContextAccessor;
        private UserToken user = new UserToken();
        private ISession Session => _httpContextAccessor.HttpContext.Session;
        public CanvasController(IServiceAPI restAPI,
            ICheckSession checkSession,
            IHttpContextAccessor httpContextAccessor,
            IOptions<AppSettings> appSettings,
            IRefreshNotifier refreshNotifier,ISessionService sessionService)
        {
            _restAPI = restAPI;
            _checkSession = checkSession;
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings.Value;
            _refreshNotifier = refreshNotifier;
            _sessionService = sessionService;
        }
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult VerticalIndex()
        {
            return View();
        }
        public IActionResult HorizontalIndex()
        {
            return View();
        }
        
        
        public IActionResult Schedular()
        {
            return View();
        }
        public IActionResult VScreen1()
        {
            return View();
        }
        //public IActionResult Login()
        //{
        //    return View();
        //}
        public IActionResult Home()
        {
            return View();
        }
        public IActionResult Landing()
        {
            return View();
        }
        public IActionResult Templates()
        {
            return View();
        }
        public IActionResult Pricing()
        {
            return View();
        }
        public IActionResult Signup()
        {
            return View();
        }
        public IActionResult ForgotPassword()
        {
            return View();
        }
        public IActionResult Contactus()
        {
            return View();
        }
        public IActionResult About()
        {
            return View();
        }

        public IActionResult Billing()
        {
            return View();
        }
        public IActionResult FAQ()
        {
            return View();
        }
        [HttpPost]
        public IActionResult CreateHeaderSectionhtml()
        {
            return PartialView("_PartialHeaderSection");
        }
        [HttpPost]
        public IActionResult CreateHeaderSectionHorizontalhtml()
        {
            return PartialView("_PartialHeaderSection");
        }
        [HttpPost]
        public IActionResult CreateBackgroundSectionhtml()
        {
            return PartialView("_PartialBackgroundSection");
        }
        [HttpPost]
        public IActionResult CreateBackgroundHorizontalSectionhtml()
        {
            return PartialView("_PartialBackgroundSection");
        }
        [HttpPost]
        public IActionResult CreateLayoutModalSectionhtml()
        {
            return PartialView("_PartialLayoutSection");
        }
        [HttpPost]
        public IActionResult CreateLeftSectionhtml()
        {
            ViewBag.Orientation = "Vertical";
            return PartialView("_PartialLeftSection");
        }
        [HttpPost]
        public IActionResult CreateLeftSectionHorizontalhtml()
        {
            ViewBag.Orientation = "Horizontal";
            return PartialView("_PartialLeftSection");
        }
        
        [HttpPost]
        public IActionResult CreateRightSectionhtml()
        {
            return PartialView("_PartialRightSection");
        }
        [HttpPost]
        public IActionResult CreateRightSectionHorizontalhtml()
        {
            return PartialView("_PartialRightSection");
        }
        public IActionResult Screen(int companyId, int projectId)
        {
            ViewBag.CompanyId = companyId;
            ViewBag.ProjectId = projectId;
            return View();
        }

        public async Task<IActionResult> BoardsNew()
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<List<ResponseGetDesignBoard>>();
            RequestGetDesignBoard request = new RequestGetDesignBoard();
            try
            {
                request.CustomerId = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
                request.CompanyId = Guid.Parse("F174A15A-76B7-4E19-BE4B-4E240983DE55");
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetDesignBoard", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<List<ResponseGetDesignBoard>>>(saveDesignSlideBoard);
                return View("Boards", response.Data);
            }
            catch (Exception ex)
            {
                log.Info("****** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return View();
            }
           
        }
        [HttpPost]
        public async Task<IActionResult> GetCompanyDetails(RequestTestModel companysetting)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            ResponseList<ResponseTestModel> result = new ResponseList<ResponseTestModel>();
            try
            {
                companysetting.CompanyId = 12;
                companysetting.Name = "SBOED";
                companysetting.ShortName = "jjs";
                var testDtl = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}Test/AddTest", JsonConvert.SerializeObject(companysetting), user.token);
                result = JsonConvert.DeserializeObject<ResponseList<ResponseTestModel>>(testDtl);
                return Ok("NO");
            }
            catch (Exception ex)
            {
                result.Message = "Something Went Wrong";
                result.Status = false;
                log.Info("***GetCompanyDetails*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Ok("NO");
            }

        }
        #region Save DesignBoard and DesignBoardDetails
        [HttpPost]
        public async Task<IActionResult> SaveUpdateDesignBoard(RequestDesignBoardDetail request)
        {
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseSaveDesignBoardDetail>();
            try
            {
                request.DesignBoardId = Guid.Parse(request.DesignBoardId.ToString()); //Guid.NewGuid();
                request.CustomerId = Guid.Parse(user.CustomerId);
                request.CompanyId = Guid.Parse(user.CompanyId);
                request.IsActive = true;
                request.CreatedBy = Guid.Parse(user.CustomerId);
                
                var saveDesignBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/SaveUpdateDesignBoard", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseSaveDesignBoardDetail>>(saveDesignBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***SaveUpdateDesignBoard*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> SaveUpdateDesignSlideBoard(RequestDesignBoardSlideDetail request)
        {
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseSaveDesignBoardSlideDetail>();
            try
            {
                if(request.AnimationImagePath==null)
                {
                    request.AnimationImagePath = "";
                }
                if (request.AnimationVideoPath == null)
                {
                    request.AnimationVideoPath = "";
                }

                request.DesignBoardDetailsId = Guid.Parse(request.DesignBoardDetailsId.ToString());
                request.DesignBoardId = Guid.Parse(request.DesignBoardId.ToString()); 
                request.IsActive = true;
                request.CreatedBy = Guid.Parse(user.CustomerId);
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/SaveUpdateDesignSlideBoard", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseSaveDesignBoardSlideDetail>>(saveDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***SaveUpdateDesignSlideBoard*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> GetDesignBoardDetails(RequestGetDesignBoard request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<List<ResponseGetDesignBoard>>();
            try
            {
                request.CustomerId = Guid.Parse(request.CustomerId.ToString());
                request.CompanyId = Guid.Parse(request.CompanyId.ToString());
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetDesignBoard", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<List<ResponseGetDesignBoard>>>(saveDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***SaveUpdateDesignSlideBoard*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> GetDesignBoardDetailsById(RequestGetDesignBoardById request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseGetDesignBoardById>();
            try
            {
                var getDesignBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetDesignBoardDetailsById", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseGetDesignBoardById>>(getDesignBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***GetDesignBoardDetailsById*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
       
        public async Task<IActionResult> Boards()
        {
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            var response = new Response<List<ResponseGetDesignBoardAll>>();
            RequestGetDesignBoard request = new RequestGetDesignBoard();
            try
            {
                request.CustomerId = Guid.Parse(user.CustomerId);
                request.CompanyId = Guid.Parse(user.CompanyId);
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetDesignBoardDetailsAll", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<List<ResponseGetDesignBoardAll>>>(saveDesignSlideBoard);
                return View("Boards", response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***GetDesignBoardDetailsAll*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return View("Boards", null);
            }
        }
        [HttpPost]
        public async Task<IActionResult> UpdateDesignDesignBoardDetailsImagePath(RequestDesignBoardDetailsImagePath request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseUpdateDesignBoardSlideDetailImagePath>();
            try
            {
                request.DesignBoardDetailsId = Guid.Parse(request.DesignBoardDetailsId.ToString());
                var updateDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/UpdateDesignDesignBoardDetailsImagePath", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseUpdateDesignBoardSlideDetailImagePath>>(updateDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***UpdateDesignDesignBoardDetailsImagePath*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> UpdateDesignDesignBoardDetailsVideoPath(RequestDesignBoardDetailsVideoPath request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseUpdateDesignBoardSlideDetailVideoPath>();
            try
            {
                request.DesignBoardDetailsId = Guid.Parse(request.DesignBoardDetailsId.ToString());
                var updateDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/UpdateDesignDesignBoardDetailsVideoPath", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseUpdateDesignBoardSlideDetailVideoPath>>(updateDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***UpdateDesignDesignBoardDetailsVideoPath*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> UpdateDesignBoardLargeVideoPath(RequestDesignBoardLargeVideoPath request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseUpdateDesignBoardLargeVideoPath>();
            try
            {
                request.DesignBoardId = Guid.Parse(request.DesignBoardId.ToString());
                var updateDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/UpdateDesignBoardLargeVideoPath", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseUpdateDesignBoardLargeVideoPath>>(updateDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***UpdateDesignBoardLargeVideoPath*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> TriggerAutorefresh(RequestTriggerAutorefresh request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            try
            {
                //
                await Task.Delay(2000);
                request.CompanyUniqueId = 1;//pass it from session
                await _refreshNotifier.NotifyRefreshForCompanyAsync(request.CompanyUniqueId.ToString());
                return Json("");
            }
            catch (Exception ex)
            {
                log.Info("***UpdateDesignBoardLargeVideoPath*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> LoadPlaylist(RequestGetPlayList request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<List<ResponseGetPlayList>>();
            try
            {
                if(request !=null && request.CompanyUniqueId==0)
                {
                    return Json("NO");
                }
                request.Type = "Direct";
                var getDesignBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetLoadPlaylist", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<List<ResponseGetPlayList>>>(getDesignBoard);
                return Json(response.Data[0].VideoPath);
            }
            catch (Exception ex)
            {
                log.Info("***LoadPlaylist*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> GetScreenRefreshInterval(ScreenRefreshInterval request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseRefreshMinutes>();
            try
            {
                if (request != null && request.CompanyUniqueId == 0)
                {
                    return Json("NO");
                }
                var getDesignBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetScreenRefreshInterval", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseRefreshMinutes>>(getDesignBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***GetScreenRefreshInterval*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> DeleteDesignSlideBoard(RequestDesignBoardSlideDetailForDelete request)
        {
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseSaveDesignBoardSlideDetail>();
            try
            {
                request.IsActive = false;
                request.UpdatedBy = Guid.Parse(user.CustomerId);
                var deleteDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/DeleteDesignSlideBoard", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseSaveDesignBoardSlideDetail>>(deleteDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***DeleteDesignSlideBoard*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> DuplicateDesignSlideBoard(RequestDesignBoardSlideDetailForDuplicate request)
        {
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseSaveDesignBoardSlideDetail>();
            try
            {
                request.UpdatedBy = Guid.Parse(user.CustomerId);
                var DuplicateDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/DuplicateDesignSlideBoard", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseSaveDesignBoardSlideDetail>>(DuplicateDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***DuplicateDesignSlideBoard*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> PublishDesignSlideBoard(RequestDesignBoardSlideDetailForPublish request)
        {
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseSaveDesignBoardSlideDetailPublish>();
            try
            {
                // request.DesignBoardId = Guid.Parse("3664686F-7007-401A-850C-24916D63BD7A");
                request.CustomerId = Guid.Parse(user.CustomerId);
                request.CompanyId = Guid.Parse(user.CompanyId);
                request.CreatedBy = Guid.Parse(user.CustomerId);
                request.CompanyUniqueId = user.CompanyUniqueId;
                var PublishDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/PublishDesignSlideBoard", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseSaveDesignBoardSlideDetailPublish>>(PublishDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***PublishDesignSlideBoard*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> GetAllElement(RequestGetEliment request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<List<ResponseGetElimentDetails>>();
            try
            {
                request.CompanyUniqueId = 0;
                if (request.searchKeyword == null)
                {
                    request.searchKeyword = "";
                }
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetElement", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<List<ResponseGetElimentDetails>>>(saveDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***GetAllElement*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> GetAllElementNew(RequestGetEliment request)
        {
            //if (!_checkSession.IsSession()) return Ok("login");
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            var response = new Response<ElementListResult>();
            try
            {
                request.CompanyUniqueId = Convert.ToInt32(user.CompanyUniqueId);
                if (request.searchKeyword == null)
                {
                    request.searchKeyword = "";
                }
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetElementNew", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ElementListResult>>(saveDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***GetAllElementNew*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        public async Task<IActionResult> GetAllTemplates()
        {
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            var response = new Response<List<ResponseGetDesignBoardAll>>();
            RequestGetDesignBoard request = new RequestGetDesignBoard();
            try
            {
                request.CustomerId = Guid.Parse(user.CustomerId);
                request.CompanyId = Guid.Parse(user.CompanyId);
                //request.CustomerId = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
                //request.CompanyId = Guid.Parse("F174A15A-76B7-4E19-BE4B-4E240983DE55");
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetAllTemplates", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<List<ResponseGetDesignBoardAll>>>(saveDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***GetAllTemplates*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }
        }
        public async Task<IActionResult> GetTemplatesForHomePage(RequestGetDesignBoard request)
        {
            //var user = _sessionService.GetUser();
            //if (user == null)
            //{
            //    return RedirectToAction("Login", "Home");
            //}
            var response = new Response<List<ResponseGetDesignBoardAll>>();
            try
            {
                //request.CustomerId = Guid.Parse(user.CustomerId);
                //request.CompanyId = Guid.Parse(user.CompanyId);
                request.CustomerId = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
                request.CompanyId = Guid.Parse("F174A15A-76B7-4E19-BE4B-4E240983DE55");
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/TemplatesForHomePage", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<List<ResponseGetDesignBoardAll>>>(saveDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***GetTemplatesForHomePage*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }
        }
        public async Task<IActionResult> GetTemplatesForTemplatePage(RequestGetDesignBoard request)
        {
            //var user = _sessionService.GetUser();
            //if (user == null)
            //{
            //    return RedirectToAction("Login", "Home");
            //}
            var response = new Response<List<ResponseGetDesignBoardAll>>();
          
            try
            {
                //request.CustomerId = Guid.Parse(user.CustomerId);
                //request.CompanyId = Guid.Parse(user.CompanyId);
                request.CustomerId = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
                request.CompanyId = Guid.Parse("F174A15A-76B7-4E19-BE4B-4E240983DE55");
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/TemplatesForTemplatePage", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<List<ResponseGetDesignBoardAll>>>(saveDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***GetTemplatesForTemplatePage*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }
        }
        //[HttpPost]
        //public async Task<IActionResult> ElementInsertFromFrontend(RequestElementDetails request)
        //{
        //    //if (!_checkSession.IsSession()) return Ok("login");
        //    var response = new Response<ResponseSaveElementDetails>();
        //    try
        //    {

        //        request.CategoryId = 5;
        //        request.CompanyUniqueId = 4;
        //        //ElementName,ImageSize,ImageName,ImageNameThumb,[ImageW],[ImageH]
        //        request.Status = 1;
        //        var saveElement = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/ElementInsertFromFrontend", JsonConvert.SerializeObject(request), user.token);
        //        response = JsonConvert.DeserializeObject<Response<ResponseSaveElementDetails>>(saveElement);
        //        return Json(response.Data);
        //    }
        //    catch (Exception ex)
        //    {
        //        log.Info("***ElementInsertFromFrontend*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
        //        return Json("NO");
        //    }

        //}
        [HttpPost]
        public async Task<IActionResult> DeleteElementFromFrontEnd(RequestElementDetailForDelete request)
        {
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseDeleteElement>();
            try
            {
                request.IsActive = false;
                request.UpdatedBy = Guid.Parse(user.CustomerId);
                var deleteElementById = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/DeleteElementFromFrontEndById", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseDeleteElement>>(deleteElementById);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***DeleteElementFromFrontEnd*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        [HttpPost]
        public async Task<IActionResult> SetBoardCategory(RequestSetBoardCategory request)
        {
            var user = _sessionService.GetUser();
            if (user == null)
            {
                return RedirectToAction("Login", "Home");
            }
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseSetBoardCategory>();
            try
            {
                //
                request.UpdatedBy = Guid.Parse(user.CustomerId);
                var setBoardCategory = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/SetBoardCategory", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<ResponseSetBoardCategory>>(setBoardCategory);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***SetBoardCategory*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }

        }
        public async Task<IActionResult> GetAllBoardCategory()
        {
            var response = new Response<List<ResponseGetAllBoardCategory>>();
            RequestAllBoardCategory request = new RequestAllBoardCategory();
            try
            {
                request.SearchKeyword = "";
                var saveDesignSlideBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetAllBoardCategory", JsonConvert.SerializeObject(request), user.token);
                response = JsonConvert.DeserializeObject<Response<List<ResponseGetAllBoardCategory>>>(saveDesignSlideBoard);
                return Json(response.Data);
            }
            catch (Exception ex)
            {
                log.Info("***GetAllBoardCategory*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
                return Json("NO");
            }
        }
        #endregion
    }
}
