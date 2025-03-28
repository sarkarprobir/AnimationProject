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
    public class ResponseGetDesignBoard
    {
        public Guid DesignBoardId { get; set; }
        public string DesignBoardName { get; set; }
        public string GifImagePath { get; set; }
        public string SlideType { get; set; }
    }
}
