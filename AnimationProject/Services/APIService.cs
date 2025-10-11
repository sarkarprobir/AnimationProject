using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AnimationProject.Helpers;
using DocumentFormat.OpenXml.Wordprocessing;


namespace AnimationProject.Services
{
    public class APIService : IAPIService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<APIService> _logger;

        public APIService(HttpClient httpClient, ILogger<APIService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }
        private string BuildQueryString(Dictionary<string, string?> parameters)
        {
            if (parameters == null || parameters.Count == 0)
                return string.Empty;

            var query = string.Join("&", parameters
                .Where(p => !string.IsNullOrWhiteSpace(p.Value))
                .Select(p => $"{Uri.EscapeDataString(p.Key)}={Uri.EscapeDataString(p.Value!)}"));

            return $"?{query}";
        }

        public async Task<T?> GetAsync<T>(string endpoint, Dictionary<string, string?>? queryParams = null)
        {
            try
            {

                var url = AppSettings.apiBaseurl + endpoint + BuildQueryString(queryParams ?? new());
                var response = await _httpClient.GetAsync(url);

                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync();
                return await response.Content.ReadFromJsonAsync<T>(new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"GET failed: {endpoint}");
                return default;
            }
        }

        public async Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest data)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync(AppSettings.apiBaseurl + endpoint, data);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<TResponse>(new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return result;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"HTTP error during POST to {endpoint}");
                return default;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error during POST to {endpoint}");
                return default;
            }
        }

    }
}
