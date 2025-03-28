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
        public string SlideType { get; set; }
    }
    public class RequestDesignBoardSlideDetail
    {
        public Guid DesignBoardDetailsId { get; set; }
        public Guid DesignBoardId { get; set; }
        public string SlideName { get; set; }
        public int SlideSequence { get; set; }
        public string JsonFile { get; set; }
        public string GifImagePath { get; set; }
        public bool IsActive { get; set; }
        public Guid CreatedBy { get; set; }

    }
    public class RequestGetDesignBoard
    {
        public Guid CustomerId { get; set; }
        public Guid CompanyId { get; set; }

    }
}
