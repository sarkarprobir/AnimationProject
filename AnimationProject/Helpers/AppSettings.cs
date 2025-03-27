namespace AnimationProject.Helpers
{
    public class AppSettings
    {
        public string BaseUrl { get; set; }
        public string JSVersion { get; set; } = $"{DateTime.Now.Year}.{DateTime.Now.Month}.{DateTime.Now.Day}.{new Random().Next(1, 99999)}";
        public string AnimationProjectAPI { get; set; }
        public string KeyGSTIN { get; set; }
        public string IosVersionID { get; set; }
        public string AndroidVersionID { get; set; }
    }
}
