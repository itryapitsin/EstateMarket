using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RealtyStore.Models.Business
{
    public class Room: Apartment
    {
        public Room()
        {
            RealtyType = RealtyType.Room;
        }
    }
}