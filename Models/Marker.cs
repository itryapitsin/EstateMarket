using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RealtyStore.Models
{
    public class Marker
    {
        public string Id { get; set; }
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        public string Title { get; set; }
        public DateTime CreatedTime { get; set; }
    }
}