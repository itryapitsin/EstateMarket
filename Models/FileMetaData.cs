namespace RealtyStore.Models
{
    public class FileMetaData
    {
        public int Id { get; set; }

        public string Filename { get; set; }

        public string UserId { get; set; }

        public virtual ApplicationUser User { get; set; }

        public FileMetaDataType Type { get; set; }

        public string HostName { get; set; }
    }
}