using AnimationProject.Models.Common;
using AnimationProject.Services;
using log4net;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Reflection;

namespace AnimationProject.Generic
{
    public class CheckSession : ICheckSession
    {
        private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        private readonly IServiceAPI _restAPI;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private ISession Session => _httpContextAccessor.HttpContext.Session;

        public CheckSession(IServiceAPI restAPI,
            IHttpContextAccessor httpContextAccessor
           )
        {
            _restAPI = restAPI;
            _httpContextAccessor = httpContextAccessor;
        }
        public bool IsSession()
        {
            var tokenCookie = _httpContextAccessor.HttpContext.Request.Cookies["CompanyUserDetail"];
            //var session = Session.Get<UserToken>("CompanyUserDetail");
            //try
            //{
            //    if (session == null)
            //    {
            //        if (tokenCookie != null && tokenCookie != "")
            //        {
            //            var data = JsonConvert.DeserializeObject<UserToken>(tokenCookie);
            //            Session.Set("CompanyUserDetail", data);
            //            return true;
            //        }
            //    }
            //    else
            //    {
            //        return true;
            //    }
            //}
            //catch (Exception ex)
            //{
            //    log.Info("Date : " + DateTime.UtcNow + " Error " + ex.Message + "StackTrace " + ex.StackTrace.ToString());
            //}
            return false;
        }
    }

    public class SessionKeepAlive
    {
        public void KeepSessionAlive()
        {
            try
            {

            }
            catch (Exception ex)
            {

            }
        }
    }
}

