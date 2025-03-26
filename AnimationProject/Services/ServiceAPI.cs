using Microsoft.Extensions.Options;
using System.Net;
using System.Reflection;
using AnimationProject.Helpers;
using log4net;
using Microsoft.Extensions.Options;
using System;
using System.IO;
using System.Net;
using System.Reflection;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Collections.Generic;
using AnimationProject.Models.Common;

namespace AnimationProject.Services
{
    public class ServiceAPI : IServiceAPI
    {
        private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly AppSettings _appSettings;

        public ServiceAPI(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }
        public async Task<string> ProcessPostRequest(string endPoint, string postdata, string authorizationToken, bool bearerToken)
        {
            try
            {
                string url = endPoint;
                using var client = new WebClient();
                Uri uri = new Uri(url);
                client.Headers.Add("Content-Type:application/json");
                client.Headers.Add("Accept:application/json");
                client.Headers["Authorization"] = (bearerToken) ? "Bearer " + authorizationToken : authorizationToken;
                return await client.UploadStringTaskAsync(uri, "POST", postdata);
            }
            catch (Exception ex)
            {
                log.Info("Date : " + DateTime.UtcNow + " Error : " + ex.Message + "StackTrace : " + ex.StackTrace.ToString()
                    + " endpoint : " + endPoint + " postdata : " + postdata
                    + " Authorization : " + authorizationToken);
                throw;
            }
        }
        public async Task<string> ProcessPostRequest(string endPoint, string postdata)

        {
            try
            {
                string url = endPoint;
                using var client = new WebClient();
                Uri uri = new Uri(url);
                client.Headers.Add("Content-Type:application/json");
                client.Headers.Add("Accept:application/json");
                return await client.UploadStringTaskAsync(uri, "POST", postdata);
            }
            catch (Exception ex)
            {
                log.Info("Date : " + DateTime.UtcNow + " Error : " + ex.Message + "StackTrace : " + ex.StackTrace.ToString() + " endpoint : " + endPoint + " postdata : " + postdata);
                throw;
            }
        }
        public async Task<string> ProcessGetRequest(string endPoint)

        {
            try
            {
                string url = endPoint;
                using var client = new WebClient();
                return await client.DownloadStringTaskAsync(url);
            }
            catch (Exception ex)
            {
                log.Info("Date : " + DateTime.UtcNow + " Error : " + ex.Message + "StackTrace : " + ex.StackTrace.ToString() + " endpoint : " + endPoint);
                throw;
            }
        }

        public async Task<string> APILog(string apiName, string request, string response)
        {
            try
            {
                APILog aPILog = new APILog { APIName = apiName, Request = request, Response = response };
                var context = JsonConvert.SerializeObject(aPILog);
                var res = await ProcessPostRequest($"{_appSettings.AnimationProjectAPI}Order/APILog", context);
                var result = JsonConvert.DeserializeObject<Response<string>>(res);
            }
            catch (Exception ex)
            {
                log.Info("Date : " + DateTime.UtcNow + " Error : " + ex.Message + "StackTrace : " + ex.StackTrace.ToString());
            }
            return "";
        }

    }
    public class APILog
    {
        public string APIName { get; set; }
        public string Request { get; set; }
        public string Response { get; set; }
    }
}

