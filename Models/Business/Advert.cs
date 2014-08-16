using System;
using System.Collections.Generic;

namespace RealtyStore.Models.Business
{
    public class Advert
    {
        public int Id { get; set; }

        public RealtyType RealtyType { get; set; }

        public AdvertType AdvertType { get; set; }

        public DateTime CreatedTime { get; set; }

        public ICollection<FileMetaData> FilesMetaData { get; set; }

        public float Cost { get; set; }

        public double Latitude { get; set; }

        public double Longtitude { get; set; }
    }
}