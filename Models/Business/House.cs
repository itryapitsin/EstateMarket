using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RealtyStore.Models.Business
{
    public class House: TypedObject
    {
        public float? HouseSquare { get; set; }

        public House()
        {
            RealtyType = RealtyType.Houses;
        }
    }
}