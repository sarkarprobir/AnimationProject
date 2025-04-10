using System.Text.Json;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace AnimationProject.Services
{
    public class RefreshNotifier : IRefreshNotifier
    {
        private readonly ChannelWriter<string> _writer;

        public RefreshNotifier(ChannelWriter<string> writer)
        {
            _writer = writer;
        }

        public async Task NotifyRefreshForCompanyAsync(string companyUniqueId)
        {
            // Create the payload with the action and companyId.
            var payload = JsonSerializer.Serialize(new { action = "refresh", companyUniqueId });
            await _writer.WriteAsync(payload);
        }
    }
}
