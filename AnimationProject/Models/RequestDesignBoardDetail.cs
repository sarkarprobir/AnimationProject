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
        public bool IsActive { get; set; }
        public Guid CreatedBy { get; set; }
        public string Effect { get; set; }
        public string Direction { get; set; }
        public string OutEffect { get; set; }
        public string OutDirection { get; set; }
        public string AnimationVideoPath { get; set; }
        public string AnimationImagePath { get; set; }
        public string TransitionType { get; set; }
        public string TransitionColor { get; set; }

    }
    public class RequestDesignBoardDetailsImagePath
    {
        public Guid DesignBoardDetailsId { get; set; }
        public string ImagePath { get; set; }
    }
    public class RequestDesignBoardDetailsVideoPath
    {
        public Guid DesignBoardDetailsId { get; set; }
        public string VideoPath { get; set; }
    }
    public class RequestDesignBoardLargeVideoPath
    {
        public Guid DesignBoardId { get; set; }
        public string VideoPath { get; set; }
    }
    public class RequestTriggerAutorefresh
    {
        public long CompanyUniqueId { get; set; }
    }
    public class RequestGetDesignBoard
    {
        public Guid CustomerId { get; set; }
        public Guid CompanyId { get; set; }

    }
    public class RequestGetDesignBoardById
    {
        public Guid DesignBoardId { get; set; }

    }
    public class RequestGetPlayList
    {
        public string PlayDate { get; set; }
        public string PlayStartTime { get; set; }
        public string PlayEndTime { get; set; }
        public long CompanyUniqueId { get; set; }
        public string ScreenType { get; set; }
        public int ScreenNo { get; set; }

    }
    public class ScreenRefreshInterval
    {
        public long CompanyUniqueId { get; set; }
        public int ScreenNo { get; set; }
    }
    public class RequestDesignBoardSlideDetailForDelete
    {
        public Guid DesignBoardDetailsId { get; set; }
        public bool IsActive { get; set; }
        public Guid UpdatedBy { get; set; }
    }
    public class RequestDesignBoardSlideDetailForDuplicate
    {
        public Guid DesignBoardDetailsId { get; set; }
        public Guid UpdatedBy { get; set; }
    }
}
