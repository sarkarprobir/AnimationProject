using AnimationProject.Generic;
using AnimationProject.Helpers;
using AnimationProject.Models;
using AnimationProject.Models.Common;
using AnimationProject.Services;
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


        private readonly AppSettings _appSettings;

        private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        private readonly IHttpContextAccessor _httpContextAccessor;
        private UserToken user = new UserToken();
        private ISession Session => _httpContextAccessor.HttpContext.Session;
        public CanvasController(IServiceAPI restAPI,
            ICheckSession checkSession,
            IHttpContextAccessor httpContextAccessor,
            IOptions<AppSettings> appSettings)
        {
            _restAPI = restAPI;
            _checkSession = checkSession;
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings.Value;
        }
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult VerticalIndex()
        {
            return View();
        }
        public IActionResult Account()
        {
            return View();
        }
        public IActionResult Boards()
        {
            return View();
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
                request.DesignBoardId = Guid.Parse("2900F758-5ACE-4A50-9499-2D9CB7F240CF"); //Guid.NewGuid();
                request.CustomerId = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
                request.CompanyId = Guid.Parse("F174A15A-76B7-4E19-BE4B-4E240983DE55");
                request.IsActive = true;
                request.CreatedBy = Guid.Parse("4DB56C68-0291-497B-BBCF-955609284A70");
                request.DesignBoardName = "DesignBoard-1 Edited 1";
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
        #endregion
    }
}
