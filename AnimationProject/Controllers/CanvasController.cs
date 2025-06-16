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


        private readonly AppSettings _appSettings;

        private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        private readonly IHttpContextAccessor _httpContextAccessor;
        private UserToken user = new UserToken();
        private ISession Session => _httpContextAccessor.HttpContext.Session;
        public CanvasController(IServiceAPI restAPI,
            ICheckSession checkSession,
            IHttpContextAccessor httpContextAccessor,
            IOptions<AppSettings> appSettings,
            IRefreshNotifier refreshNotifier)
        {
            _restAPI = restAPI;
            _checkSession = checkSession;
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings.Value;
            _refreshNotifier = refreshNotifier;
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
        
        public IActionResult Account()
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
        public IActionResult Login()
        {
            return View();
        }
        public IActionResult Home()
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
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseSaveDesignBoardDetail>();
            try
            {
                request.DesignBoardId = Guid.Parse(request.DesignBoardId.ToString()); //Guid.NewGuid();
                request.CustomerId = Guid.Parse(request.CustomerId.ToString());
                request.CompanyId = Guid.Parse(request.CompanyId.ToString());
                request.IsActive = true;
                request.CreatedBy = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
                
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
                request.CreatedBy = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
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
            ////if (!_checkSession.IsSession()) return Ok("login");
            //var response = new Response<ResponseGetDesignBoardById>();
            //try
            //{
            //    var getDesignBoard = await _restAPI.ProcessPostRequest($"{_appSettings.AnimationProjectAPI}DesignBoard/GetDesignBoardDetailsById", JsonConvert.SerializeObject(request), user.token);
            //    response = JsonConvert.DeserializeObject<Response<ResponseGetDesignBoardById>>(getDesignBoard);
            //    return Json(response.Data);
            //}
            //catch (Exception ex)
            //{
            //    log.Info("***GetDesignBoardDetailsById*** Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
            //    return Json("NO");
            //}
            var response = new Response<List<ResponseGetDesignBoardAll>>();
            RequestGetDesignBoard request = new RequestGetDesignBoard();
            try
            {
                request.CustomerId = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
                request.CompanyId = Guid.Parse("F174A15A-76B7-4E19-BE4B-4E240983DE55");
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
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseSaveDesignBoardSlideDetail>();
            try
            {
                request.IsActive = false;
                request.UpdatedBy = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
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
            //if (!_checkSession.IsSession()) return Ok("login");
            var response = new Response<ResponseSaveDesignBoardSlideDetail>();
            try
            {
                request.UpdatedBy = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
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
        #endregion
    }
}
