using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RealtyStore.Models.Business
{
    public class Apartment: TypedObject
    {
        public RoomsCountType? Rooms { get; set; }

        public int? Floor { get; set; }

        public int? FloorCount { get; set; }

        public Apartment()
        {
            RealtyType = RealtyType.Apartments;
        }
    }
}