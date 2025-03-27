using DocumentFormat.OpenXml.Drawing.Diagrams;

namespace AnimationProject.Models.Common
{
    public class UserToken
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public long CompanyId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public string token { get; set; }
        public string ImageFilePath { get; set; }
        public string Logo { get; set; }
        public string BusinessType { get; set; }
        public bool IsActive { get; set; }
        public int CurrencyMasterId { get; set; }
        public string CountryCode { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencySymbol { get; set; }
        public string PosCompanyId { get; set; }

        public string DateFormat { get; set; }
        public string TimeFormat { get; set; }
        public int ToolId { get; set; }
    }
}
