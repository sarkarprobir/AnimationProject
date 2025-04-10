namespace AnimationProject.Services
{
    public interface IRefreshNotifier
    {
        Task NotifyRefreshForCompanyAsync(string companyId);
    }
}
