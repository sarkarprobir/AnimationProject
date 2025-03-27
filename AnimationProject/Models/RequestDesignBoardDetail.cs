namespace AnimationProject.Models
{
    public class RequestDesignBoardDetail
    {
        public Guid DesignBoardId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid CompanyId { get; set; }
        public string DesignBoardName { get; set; }
        public bool IsActive { get; set; }
        public Guid CreatedBy { get; set; }
    }
}
