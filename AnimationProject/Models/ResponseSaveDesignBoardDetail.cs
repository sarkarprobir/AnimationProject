using System.ComponentModel.DataAnnotations;

namespace AnimationProject.Models
{
    public class ResponseSaveDesignBoardDetail
    {
        public string Response { get; set; }
        public Guid Result { get; set; }
    }
    public class ResponseSaveDesignBoardSlideDetail
    {
        public string Response { get; set; }
        public Guid Result { get; set; }
    }
    public class ResponseUpdateDesignBoardSlideDetailImagePath
    {
        public string Response { get; set; }
        public Guid Result { get; set; }
    }
    public class ResponseUpdateDesignBoardSlideDetailVideoPath
    {
        public string Response { get; set; }
        public Guid Result { get; set; }
    }
    public class ResponseUpdateDesignBoardLargeVideoPath
    {
        public string Response { get; set; }
        public Guid Result { get; set; }
    }
    public class ResponseGetDesignBoard
    {
        public Guid DesignBoardId { get; set; }
        public string DesignBoardName { get; set; }
        public string AnimationVideoPath { get; set; }
        public string SlideType { get; set; }
    }
    public class ResponseGetDesignBoardAll
    {
        public Guid DesignBoardId { get; set; }
        public string DesignBoardName { get; set; }
        public string SlideType { get; set; }
        public List<DesignBoardDetailsList> DesignBoardDetailsList { get; set; }
    }
    public class ResponseGetDesignBoardById
    {
        public Guid DesignBoardId { get; set; }
        public string DesignBoardName { get; set; }
        public string SlideType { get; set; }
        public List<DesignBoardDetailsList> DesignBoardDetailsList { get; set; }
    }
    public class ResponseGetPlayList
    {
        public string VideoPath { get; set; }
    }
    public class ResponseRefreshMinutes
    {
        public long RefreshMinutes { get; set; }
    }
    public class DesignBoardDetailsList
    {
        public Guid DesignBoardDetailsId { get; set; }
        public string SlideName { get; set; }
        public int SlideSequence { get; set; }
        public string JsonFile { get; set; }
        public string Effect { get; set; }
        public string Direction { get; set; }
        public string OutEffect { get; set; }
        public string OutDirection { get; set; }
        public string AnimationVideoPath { get; set; }
        public string AnimationImagePath { get; set; }
        public string TransitionType { get; set; }
        public string TransitionColor { get; set; }
    }
    public class ResponseSaveDesignBoardSlideDetailPublish
    {
        public string Response { get; set; }
        public Guid Result { get; set; }
        public long PublishBoardUniqueId { get; set; }
    }
    public class ResponseDesignBoardDetailsPublish
    {
        public string JsonFile { get; set; }
        public string InEffect { get; set; }
        public string InDirection { get; set; }
        public string OutEffect { get; set; }
        public string OutDirection { get; set; }
    }
}
