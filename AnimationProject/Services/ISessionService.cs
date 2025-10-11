using AnimationProject.Models.Common;

namespace AnimationProject.Services
{
    public interface ISessionService
    {
        void RemoveAllSession();
        User SetUser(User user);
        User GetUser();
           
    }
}
