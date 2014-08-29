using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using RealtyStore.Models.Business;

namespace RealtyStore.Models.Requests
{
    public class AdvertFilter
    {
        public RealtyType? RealtyType { get; set; }
        public AdvertType? AdvertType { get; set; }
        public FloorFilterType? FloorFilter { get; set; }
        public FloorCountFilter? FloorCountFilter { get; set; }
        public RoomsCountType? RoomCountFilter { get; set; }
        public bool OnlyWithPhoto { get; set; }
        public double? MinCost { get; set; }
        public double? MaxCost { get; set; }
        public double FromLatitude { get; set; } 
        public double FromLongitude { get; set; }
        public double ToLatitude { get; set; }
        public double ToLongitude { get; set; }
    }
}