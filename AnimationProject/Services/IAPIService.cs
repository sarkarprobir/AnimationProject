namespace AnimationProject.Services
{
    public interface IAPIService
    {
        Task<T?> GetAsync<T>(string endpoint, Dictionary<string, string?>? queryParams = null);
        Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest data);
    }
}
