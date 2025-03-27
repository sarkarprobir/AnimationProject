using Newtonsoft.Json;
using System.Collections.Generic;
namespace AnimationProject.Models.Common
{
    public class Response<T>
    {
        [JsonProperty("status")]
        public bool Status { get; set; }
        [JsonProperty("message")]
        public string Message { get; set; }
        [JsonProperty("data")]
        public T Data { get; set; }
    }
    public class ResponseList<T>
    {
        [JsonProperty("status")]
        public bool Status { get; set; }
        [JsonProperty("message")]
        public string Message { get; set; }
        [JsonProperty("data")]
        public List<T> Data { get; set; }
    }
    public class ResponseStatus
    {
        [JsonProperty("status")]
        public bool Status { get; set; }
        [JsonProperty("message")]
        public string Message { get; set; }
    }

    public class Response<T1, T2>
    {
        [JsonProperty("status")]
        public bool Status { get; set; }
        [JsonProperty("message")]
        public string Message { get; set; }
        [JsonProperty("data")]
        public T1 Data1 { get; set; }
        public T2 Data2 { get; set; }
    }
    public class ResponseUrl
    {
        public string Url { get; set; }
    }
}
