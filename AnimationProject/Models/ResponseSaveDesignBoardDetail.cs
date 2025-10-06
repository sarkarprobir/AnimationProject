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
        public string DesignBoardURL { get; set; }
        public string CreatedAtStr { get; set; }
        public string updatedAtStr { get; set; }
        public string expirationStr { get; set; }
        public string LargeVideoPath { get; set; }
        public int BoardCategoryId { get; set; }
        public List<DesignBoardDetailsList> DesignBoardDetailsList { get; set; }
        public List<GetAllBoardCategory> GetAllBoardCategory { get; set; }
    }
    public class ResponseGetDesignBoardById
    {
        public Guid DesignBoardId { get; set; }
        public string DesignBoardName { get; set; }
        public string SlideType { get; set; }
        public List<DesignBoardDetailsList> DesignBoardDetailsList { get; set; }
        public string DesignBoardURL { get; set; }
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
    public class ResponseGetElimentDetails
    {
        public int ElementId { get; set; }
        public int CategoryId { get; set; }
        public int CompanyUniqueId { get; set; }
        public string ElementName { get; set; }
        public int ImageSize { get; set; }
        public string ImageName { get; set; }
        public string ImageNameThumb { get; set; }
        public int ImageW { get; set; }
        public int ImageH { get; set; }
        public int TotalPages { get; set; }
    }
    public sealed class ElementListResult
    {
        public List<ResponseGetElimentDetails> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
    }
    public class ResponseSaveElementDetails
    {
        public string Response { get; set; }
        public int Result { get; set; }
    }
    public class ResponseDeleteElement
    {
        public string Response { get; set; }
        public int Result { get; set; }
    }
    public class ResponseGetAllBoardCategory
    {
        public int BoardCategoryId { get; set; }
        public string BoardCategory { get; set; }
    }
    public class GetAllBoardCategory
    {
        public int BoardCategoryId { get; set; }
        public string BoardCategory { get; set; }
    }
    public class ResponseSetBoardCategory
    {
        public string Response { get; set; }
        public int Result { get; set; }
    }
}
