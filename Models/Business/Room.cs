using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RealtyStore.Models.Business
{
    public class Room: Advert
    {
        public int? RoomCount { get; set; }

        public int? Floor { get; set; }

        public int? FloorCount { get; set; }
    }
}