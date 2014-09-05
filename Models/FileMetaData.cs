using System;
using Newtonsoft.Json;
using RealtyStore.Models.Business;

namespace RealtyStore.Models
{
    public class FileMetaData
    {
        [JsonIgnore]
        public int Id { get; set; }

        public string Filename { get; set; }

        [JsonIgnore]
        public virtual Advert Advert { get; set; }

        [JsonIgnore]
        public Guid AdvertId { get; set; }
    }
}