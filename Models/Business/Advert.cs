using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace RealtyStore.Models.Business
{
    public abstract class Advert
    {
        public Guid Id { get; set; }

        public RealtyType RealtyType { get; set; }

        public AdvertType AdvertType { get; set; }

        [JsonIgnore]
        public DateTime CreatedTime { get; set; }

        [JsonIgnore]
        public ICollection<FileMetaData> FilesMetaData { get; set; }

        public IEnumerable<String> Photos
        {
            get { return FilesMetaData.Select(GetPhotoUrl); }
        }

        public float Cost { get; set; }

        public float Square { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        [JsonIgnore]
        public bool IsActive { get; set; }

        [JsonIgnore]
        public string ContactPhone { get; set; }

        public string Description { get; set; }

        public string GetPhotoUrl(FileMetaData fileMetaData)
        {
            return String.Format("/images/adverts/{0}/{1}?width=570&height=352", Id, fileMetaData.Filename);
        }
    }
}