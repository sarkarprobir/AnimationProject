namespace AnimationProject.Services
{
    public interface IServiceAPI
    {
        Task<string> ProcessPostRequest(string url, string postdata, string authorizationToken, bool bearerToken = true);
        Task<string> ProcessPostRequest(string url, string postdata);
        Task<string> ProcessGetRequest(string url);
        Task<string> APILog(string apiName, string request, string response);
    }
}
