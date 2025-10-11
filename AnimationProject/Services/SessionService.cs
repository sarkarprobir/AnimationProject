using AnimationProject.Models.Common;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;

namespace AnimationProject.Services
{
    public class SessionService : ISessionService
    {
        private const string _userSessionKey = "_aniboard_userKey";

        private readonly IHttpContextAccessor _httpContextAccessor;

        public SessionService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public void RemoveAllSession()
        {
            _httpContextAccessor.HttpContext.Session.Clear();
        }

        public User SetUser(User user)
        {
            try
            {
                if (user != null)
                {
                    _httpContextAccessor.HttpContext.Session.SetObject(_userSessionKey, user);

                    return user;
                }
            }
            catch (Exception e) { throw e; }
            return null;
        }

        public User GetUser()
        {
            try
            {
                var user = _httpContextAccessor.HttpContext.Session.GetObject<User>(_userSessionKey);

                return user;
            }
            catch (Exception e) { throw e; }
        }

    }
}



public static class SessionContextExtensions
{
    public static void SetObject(this ISession session, string key, object value)
    {
        session.SetString(key, JsonConvert.SerializeObject(value));
    }
    public static T GetObject<T>(this ISession session, string key)
    {
        var value = session.GetString(key);
        return value == null ? default(T) : JsonConvert.DeserializeObject<T>(value);
    }
}
